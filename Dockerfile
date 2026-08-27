FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src
COPY public ./public
RUN npm run build:frontend

FROM rust:1.88-alpine AS backend
RUN apk add --no-cache musl-dev pkgconfig openssl-dev
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
COPY src ./src
COPY migrations ./migrations
ARG BUILD_SHA=unknown
ENV BUILD_SHA=$BUILD_SHA
RUN cargo build --release

FROM alpine:3.22
RUN apk add --no-cache ca-certificates && addgroup -S app && adduser -S -G app app
WORKDIR /app
COPY --from=backend /app/target/release/claim-source-trail /usr/local/bin/claim-source-trail
COPY --from=frontend /app/dist ./dist
RUN mkdir -p /app/data && chown -R app:app /app/data
USER app
ENV PORT=8080 DATABASE_URL=sqlite:///app/data/claim-source-trail.db DIST_DIR=/app/dist RUST_LOG=info
EXPOSE 8080
ENTRYPOINT ["claim-source-trail"]
