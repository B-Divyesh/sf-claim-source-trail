import { defineConfig, devices } from '@playwright/test';

const externalBaseUrl = process.env.BASE_URL;
const localBaseUrl = 'http://127.0.0.1:8080';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  reporter: 'line',
  use: {
    baseURL: externalBaseUrl || localBaseUrl,
    trace: 'retain-on-failure'
  },
  webServer: externalBaseUrl ? undefined : {
    command: 'npm run test:server',
    url: `${localBaseUrl}/health`,
    reuseExistingServer: false,
    // A clean worker has neither npm nor Rust build artifacts. The first exact
    // claim command must be allowed to compile the release binary once.
    timeout: 600_000
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ]
});
