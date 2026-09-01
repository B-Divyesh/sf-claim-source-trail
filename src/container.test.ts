import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('container release contract', () => {
  it('builds a non-root runtime that serves the app and health route on port 8080 @claim:container-runtime', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf8');
    const server = readFileSync('src/lib.rs', 'utf8');
    expect(dockerfile).toMatch(/FROM alpine:[^\n]+[\s\S]*adduser -S -G app app/);
    expect(dockerfile).toMatch(/\nUSER app\n/);
    expect(dockerfile).toMatch(/\nEXPOSE 8080\n/);
    expect(dockerfile).toContain('ENTRYPOINT ["claim-source-trail"]');
    expect(server).toContain('.route("/health", get(health))');
    expect(server).toContain('.route_service("/", ServeFile::new(dist_dir.join("index.html")))');
  });
});
