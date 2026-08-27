use claim_source_trail::{app, migrate};
use sqlx::{sqlite::SqliteConnectOptions, SqlitePool};
use std::{env, path::PathBuf, str::FromStr};
use tokio::net::TcpListener;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .json()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info,tower_http=info")),
        )
        .init();

    let port = env::var("PORT")
        .unwrap_or_else(|_| "8080".into())
        .parse::<u16>()?;
    let database_url =
        env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://data/claim-source-trail.db".into());
    if let Some(path) = database_url
        .strip_prefix("sqlite://")
        .and_then(|path| PathBuf::from(path).parent().map(PathBuf::from))
    {
        std::fs::create_dir_all(path)?;
    }
    let options = SqliteConnectOptions::from_str(&database_url)?.create_if_missing(true);
    let pool = SqlitePool::connect_with(options).await?;
    migrate(&pool).await?;

    let dist_dir = env::var("DIST_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("dist"));
    let listener = TcpListener::bind(("0.0.0.0", port)).await?;
    tracing::info!(port, "claim-source-trail listening");
    axum::serve(listener, app(pool, dist_dir))
        .with_graceful_shutdown(shutdown_signal())
        .await?;
    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("install Ctrl+C handler")
    };
    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("install signal handler")
            .recv()
            .await;
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();
    tokio::select! { _ = ctrl_c => {}, _ = terminate => {} }
}
