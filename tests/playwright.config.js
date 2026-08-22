/**
 * tests/playwright.config.js
 *
 * E2E test configuration for Percussion Studio.
 * Node.js is used ONLY inside tests/ to run these browser tests (see docs/testing.md).
 *
 * Projects (6):
 *  - desktop:                  chromium, 1280x800 (desktop editor).
 *  - mobile-portrait:          iPhone 16, Safari-like 393x659.
 *  - mobile-landscape:         iPhone 16, Safari-like 734x343.
 *  - mobile-landscape-playhead: iPhone 16, Safari-like 734x343 — playback
 *                              loop regression (transport stream contract).
 *  - mobile-pwa-portrait:      iPhone 16, full-screen 393x852 (PWA "more screen") +
 *                              Dynamic Island safe-area insets via CDP.
 *  - mobile-pwa-landscape:     iPhone 16, full-screen 852x393 (PWA "more screen") +
 *                              Dynamic Island safe-area insets via CDP.
 */

const { defineConfig } = require('@playwright/test');

// Custom iPhone 16 device (Playwright 1.60 has no iPhone 16 descriptor).
// Physical CSS size: 393x852 @3x. Safari's visible web viewport is smaller
// (portrait 659, landscape 734x343); PWA standalone gets the full physical size.
const IPHONE_16 = {
    defaultBrowserType: 'chromium',
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
};

module.exports = defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: 'http://localhost:8000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'desktop',
            use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } },
            testMatch: /desktop\.spec\.js/,
        },
        {
            name: 'mobile-portrait',
            use: { ...IPHONE_16, viewport: { width: 393, height: 659 } },
            testMatch: /mobile-(portrait|wheel-picker)\.spec\.js/,
        },
        {
            name: 'mobile-landscape',
            use: { ...IPHONE_16, viewport: { width: 734, height: 343 } },
            testMatch: /mobile-(landscape|wheel-picker)\.spec\.js/,
        },
        {
            name: 'mobile-landscape-playhead',
            use: { ...IPHONE_16, viewport: { width: 734, height: 343 } },
            testMatch: /playhead-loop\.spec\.js/,
        },
        {
            name: 'mobile-pwa-portrait',
            use: { ...IPHONE_16, viewport: { width: 393, height: 852 } },
            testMatch: /mobile-pwa-portrait\.spec\.js/,
        },
        {
            name: 'mobile-pwa-landscape',
            use: { ...IPHONE_16, viewport: { width: 852, height: 393 } },
            testMatch: /mobile-pwa-landscape\.spec\.js/,
        },
    ],
    webServer: {
        // The test runner starts/stops the TEST-ONLY server (tests/test_launch_local.py);
        // the app's launch_local.py is untouched by tests.
        command: 'python3 tests/test_launch_local.py',
        url: 'http://localhost:8000',
        reuseExistingServer: true,
        timeout: 60000,
        cwd: '..',
    },
});
