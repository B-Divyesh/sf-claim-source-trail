use axum::{
    body::Body,
    extract::State,
    http::{header, HeaderValue, Request, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::Serialize;
use sqlx::SqlitePool;
use std::path::PathBuf;
use tower_governor::{
    governor::GovernorConfigBuilder, key_extractor::GlobalKeyExtractor, GovernorLayer,
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

pub async fn migrate(pool: &SqlitePool) -> Result<(), sqlx::Error> {
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
    let is_asset = request.uri().path().starts_with("/assets/");
    let mut response = next.run(request).await;
    let value = if is_asset {
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
        .per_second(1)
        .burst_size(40)
        .key_extractor(GlobalKeyExtractor)
        .finish()
        .expect("valid page-view rate limit");
    let api = Router::new()
        .route("/api/page-view", post(page_view))
        .layer(GovernorLayer::new(page_view_limit));
    let spa = ServeDir::new(&dist_dir).fallback(ServeFile::new(dist_dir.join("index.html")));
    Router::new()
        .route("/health", get(health))
        .merge(api)
        .fallback_service(spa)
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
    }

    #[tokio::test]
    async fn page_view_increments_only_aggregate_day() {
        let (app, pool) = test_app().await;
        for _ in 0..2 {
            let response = app
                .clone()
                .oneshot(
                    Request::builder()
                        .method("POST")
                        .uri("/api/page-view")
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
    async fn api_rejects_wrong_method() {
        let (app, _) = test_app().await;
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/api/page-view")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::METHOD_NOT_ALLOWED);
    }

    #[tokio::test]
    async fn spa_routes_return_index_with_success_status() {
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
        let response = app(pool, directory.path().to_path_buf())
            .oneshot(
                Request::builder()
                    .uri("/privacy")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
