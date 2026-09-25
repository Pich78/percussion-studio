/**
 * tests/e2e/helpers/rotation.js
 *
 * Rotation helper for mobile specs: resizes the viewport, re-applies the
 * orientation-specific safe-area override and waits for the app's settle
 * re-renders (js/ui/mobileViewport.js renders at ~350ms and ~650ms).
 */

const { IPHONE_16_SAFE_AREAS, applySafeAreaOverride } = require('./safeArea');

const VIEWPORTS = {
    portrait: { width: 393, height: 852 },
    landscape: { width: 852, height: 393 },
};

// Longer than the app's final settle render (650ms).
const SETTLE_MS = 900;

async function rotateTo(page, orientation) {
    await page.setViewportSize(VIEWPORTS[orientation]);
    await applySafeAreaOverride(page, IPHONE_16_SAFE_AREAS[orientation]);
    await page.waitForTimeout(SETTLE_MS);
}

module.exports = { rotateTo, VIEWPORTS, SETTLE_MS };
