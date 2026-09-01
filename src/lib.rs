use axum::{
    body::Body,
    extract::{ConnectInfo, State},
    http::{header, HeaderName, HeaderValue, Request, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::Serialize;
use sqlx::SqlitePool;
use std::{
    net::{IpAddr, SocketAddr},
    path::PathBuf,
};
use tower_governor::{
    governor::GovernorConfigBuilder, key_extractor::KeyExtractor, GovernorError, GovernorLayer,
};
use tower_http::{
    services::{ServeDir, ServeFile},
    set_header::SetResponseHeaderLayer,
    trace::TraceLayer,
};

#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
}

#[derive(Serialize)]
struct Health {
    status: &'static str,
    build: &'static str,
}

#[derive(Clone, Copy, Debug)]
struct ForwardedClientIp;

impl KeyExtractor for ForwardedClientIp {
    type Key = IpAddr;

    fn extract<T>(&self, request: &Request<T>) -> Result<Self::Key, GovernorError> {
        request
            .headers()
            .get("x-forwarded-for")
            .and_then(|value| value.to_str().ok())
            .and_then(|value| value.split(',').next())
            .and_then(|value| value.trim().parse::<IpAddr>().ok())
            .or_else(|| {
                request
                    .extensions()
                    .get::<ConnectInfo<SocketAddr>>()
                    .map(|address| address.ip())
            })
            .ok_or(GovernorError::UnableToExtractKey)
    }
}

pub async fn migrate(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    let has_page_views: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'page_views'",
    )
    .fetch_one(pool)
    .await?;
    if has_page_views > 0 {
        return Ok(());
    }
    sqlx::query(include_str!("../migrations/0001_page_views.sql"))
        .execute(pool)
        .await?;
    Ok(())
}

async fn health() -> Json<Health> {
    Json(Health {
        status: "ok",
        build: option_env!("BUILD_SHA").unwrap_or("development"),
    })
}

async fn page_view(State(state): State<AppState>) -> impl IntoResponse {
    match sqlx::query(
        "INSERT INTO page_views(day, count) VALUES(date('now'), 1) \
         ON CONFLICT(day) DO UPDATE SET count = count + 1",
    )
    .execute(&state.db)
    .await
    {
        Ok(_) => StatusCode::NO_CONTENT,
        Err(error) => {
            tracing::error!(error = %error, "page count update failed");
            StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}

async fn cache_policy(request: Request<Body>, next: Next) -> Response {
    let path = request.uri().path();
    let is_versioned_static = path.starts_with("/assets/") || path.starts_with("/fonts/");
    let mut response = next.run(request).await;
    let value = if is_versioned_static {
        HeaderValue::from_static("public, max-age=31536000, immutable")
    } else {
        HeaderValue::from_static("no-cache")
    };
    response.headers_mut().insert(header::CACHE_CONTROL, value);
    response
}

pub fn app(pool: SqlitePool, dist_dir: PathBuf) -> Router {
    let state = AppState { db: pool };
    let page_view_limit = GovernorConfigBuilder::default()
        // A page view is intentionally bodyless and anonymous. Keep it well
        // below an abuse-friendly rate while allowing a shared campus or test
        // browser cohort to load the product without spuriously dropping a
        // first visit.
        .per_second(20)
        .burst_size(40)
        .key_extractor(ForwardedClientIp)
        .finish()
        .expect("valid page-view rate limit");
    let api = Router::new()
        .route("/api/page-view", post(page_view))
        .layer(GovernorLayer::new(page_view_limit));
    let static_files =
        ServeDir::new(&dist_dir).not_found_service(ServeFile::new(dist_dir.join("404.html")));
    Router::new()
        .route("/health", get(health))
        .merge(api)
        .route_service("/", ServeFile::new(dist_dir.join("index.html")))
        .route_service("/privacy", ServeFile::new(dist_dir.join("index.html")))
        .route_service("/terms", ServeFile::new(dist_dir.join("index.html")))
        .fallback_service(static_files)
        .layer(middleware::from_fn(cache_policy))
        .layer(SetResponseHeaderLayer::if_not_present(
            header::X_CONTENT_TYPE_OPTIONS,
            HeaderValue::from_static("nosniff"),
        ))
        .layer(SetResponseHeaderLayer::if_not_present(
            header::X_FRAME_OPTIONS,
            HeaderValue::from_static("DENY"),
        ))
        .layer(SetResponseHeaderLayer::if_not_present(
            header::REFERRER_POLICY,
            HeaderValue::from_static("strict-origin-when-cross-origin"),
        ))
        .layer(SetResponseHeaderLayer::if_not_present(
            header::STRICT_TRANSPORT_SECURITY,
            HeaderValue::from_static("max-age=31536000; includeSubDomains"),
        ))
        .layer(SetResponseHeaderLayer::if_not_present(
            HeaderName::from_static("permissions-policy"),
            HeaderValue::from_static(
                "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
            ),
        ))
        .layer(SetResponseHeaderLayer::if_not_present(
            header::CONTENT_SECURITY_POLICY,
            HeaderValue::from_static("default-src 'self'; connect-src 'self' https://api.sociobot.in; img-src 'self' data:; style-src 'self'; font-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' https://api.sociobot.in"),
        ))
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::Request;
    use sqlx::sqlite::SqlitePoolOptions;
    use tower::ServiceExt;

    async fn test_app() -> (Router, SqlitePool) {
        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        migrate(&pool).await.unwrap();
        (app(pool.clone(), PathBuf::from("dist")), pool)
    }

    #[tokio::test]
    async fn migration_skips_existing_schema_for_rolling_revisions() {
        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        migrate(&pool).await.unwrap();
        migrate(&pool).await.unwrap();
        let tables: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'page_views'",
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        assert_eq!(tables, 1);
    }

    #[tokio::test]
    async fn health_reports_build() {
        let (app, _) = test_app().await;
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/health")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.headers()[header::X_CONTENT_TYPE_OPTIONS],
            "nosniff"
        );
        assert_eq!(
            response.headers()[header::STRICT_TRANSPORT_SECURITY],
            "max-age=31536000; includeSubDomains"
        );
        assert_eq!(
            response.headers()["permissions-policy"],
            "camera=(), geolocation=(), microphone=(), payment=(), usb=()"
        );
    }

    #[tokio::test]
    async fn claim_anonymous_page_count_stores_only_day_and_count() {
        let (app, pool) = test_app().await;
        for _ in 0..2 {
            let response = app
                .clone()
                .oneshot(
                    Request::builder()
                        .method("POST")
                        .uri("/api/page-view")
                        .header("x-forwarded-for", "203.0.113.10")
                        .body(Body::empty())
                        .unwrap(),
                )
                .await
                .unwrap();
            assert_eq!(response.status(), StatusCode::NO_CONTENT);
        }
        let count: i64 = sqlx::query_scalar("SELECT count FROM page_views LIMIT 1")
            .fetch_one(&pool)
            .await
            .unwrap();
        assert_eq!(count, 2);
        let columns: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM pragma_table_info('page_views')")
                .fetch_one(&pool)
                .await
                .unwrap();
        assert_eq!(columns, 2);
    }

    #[tokio::test]
    async fn claim_page_count_rate_limit_uses_first_forwarded_ip_and_returns_retry_after() {
        let (app, _) = test_app().await;

        for _ in 0..40 {
            let response = app
                .clone()
                .oneshot(
                    Request::builder()
                        .method("POST")
                        .uri("/api/page-view")
                        .header("x-forwarded-for", "203.0.113.20, 10.0.0.1")
                        .body(Body::empty())
                        .unwrap(),
                )
                .await
                .unwrap();
            assert_eq!(response.status(), StatusCode::NO_CONTENT);
        }

        let limited = app
            .clone()
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/api/page-view")
                    .header("x-forwarded-for", "203.0.113.20, 10.0.0.2")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(limited.status(), StatusCode::TOO_MANY_REQUESTS);
        assert!(limited.headers().contains_key(header::RETRY_AFTER));

        let separate_client = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/api/page-view")
                    .header("x-forwarded-for", "203.0.113.21, 10.0.0.1")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(separate_client.status(), StatusCode::NO_CONTENT);
    }

    #[tokio::test]
    async fn api_rejects_wrong_method() {
        let (app, _) = test_app().await;
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/api/page-view")
                    .header("x-forwarded-for", "203.0.113.30")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::METHOD_NOT_ALLOWED);
    }

    #[tokio::test]
    async fn known_spa_routes_return_index_and_unknown_routes_use_designed_404() {
        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        migrate(&pool).await.unwrap();
        let directory = tempfile::tempdir().unwrap();
        std::fs::write(
            directory.path().join("index.html"),
            "<!doctype html><title>App</title>",
        )
        .unwrap();
        std::fs::write(
            directory.path().join("404.html"),
            "<!doctype html><title>Not found</title><h1>Page not found</h1>",
        )
        .unwrap();
        let router = app(pool, directory.path().to_path_buf());
        let response = router
            .clone()
            .oneshot(
                Request::builder()
                    .uri("/privacy")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);

        let response = router
            .oneshot(
                Request::builder()
                    .uri("/definitely-not-a-route")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn static_fonts_are_immutable_cached() {
        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        migrate(&pool).await.unwrap();
        let directory = tempfile::tempdir().unwrap();
        std::fs::create_dir(directory.path().join("fonts")).unwrap();
        std::fs::write(directory.path().join("fonts/atkinson-400.woff2"), "font").unwrap();
        let response = app(pool, directory.path().to_path_buf())
            .oneshot(
                Request::builder()
                    .uri("/fonts/atkinson-400.woff2?v=1")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.headers()[header::CACHE_CONTROL],
            "public, max-age=31536000, immutable"
        );
    }
}
