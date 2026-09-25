/**
 * tests/e2e/helpers/rotation.js
 *
 * Rotation helper for mobile specs: resizes the viewport, re-applies the
 * orientation-specific safe-area override and pauses briefly so the browser
 * settles the CSS layout. Rotation performs no JS re-renders (grid sizing is
 * CSS-driven — see js/ui/mobileViewport.js), so this is a small layout
 * settle, not a render wait.
 */

const { IPHONE_16_SAFE_AREAS, applySafeAreaOverride } = require('./safeArea');

const VIEWPORTS = {
    portrait: { width: 393, height: 852 },
    landscape: { width: 852, height: 393 },
};

// Brief layout settle after the viewport resize (no renders to wait for).
const SETTLE_MS = 200;

async function rotateTo(page, orientation) {
    await page.setViewportSize(VIEWPORTS[orientation]);
    await applySafeAreaOverride(page, IPHONE_16_SAFE_AREAS[orientation]);
    await page.waitForTimeout(SETTLE_MS);
}

module.exports = { rotateTo, VIEWPORTS, SETTLE_MS };
