FROM node:22-alpine AS frontend
WORKDIR /app
ARG BUILD_SHA=dev
ENV VITE_BUILD_SHA=$BUILD_SHA
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src
COPY public ./public
RUN npm run build:frontend

FROM rust:1-alpine AS backend
RUN apk add --no-cache musl-dev pkgconfig openssl-dev
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
COPY src ./src
COPY migrations ./migrations
ARG BUILD_SHA=dev
ENV BUILD_SHA=$BUILD_SHA
RUN cargo build --release

FROM alpine:3.22
RUN apk add --no-cache ca-certificates && addgroup -S app && adduser -S -G app app
WORKDIR /app
COPY --from=backend /app/target/release/claim-source-trail /usr/local/bin/claim-source-trail
COPY --from=frontend /app/dist ./dist
RUN mkdir -p /data && chown -R app:app /data
USER app
EXPOSE 8080
ENTRYPOINT ["claim-source-trail"]
