/**
 * tests/playwright.config.latency.js
 *
 * Standalone config for the audio latency profiling test.
 */

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './e2e',
    testMatch: /audio-latency\.spec\.js/,
    fullyParallel: false,
    retries: 0,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:8000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        viewport: { width: 1280, height: 800 },
    },
    projects: [
        {
            name: 'desktop-latency',
            use: { browserName: 'chromium' },
        },
    ],
    webServer: {
        command: 'python3 tests/test_launch_local.py',
        url: 'http://localhost:8000',
        reuseExistingServer: true,
        timeout: 60000,
        cwd: '..',
    },
});
