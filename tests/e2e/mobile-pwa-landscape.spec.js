/**
 * tests/e2e/mobile-pwa-landscape.spec.js
 *
 * PWA (standalone) landscape on iPhone 16: full-screen viewport 852x393 with
 * Dynamic Island / home-indicator safe-area insets injected via CDP.
 * Final safe-area verification still happens on a real iPhone (see docs/testing.md).
 */

const { test, expect } = require('@playwright/test');
const {
    IPHONE_16_SAFE_AREAS,
    applySafeAreaOverride,
    readCssVar,
    expectInsetPadding,
} = require('./helpers/safeArea');

test('left/right safe-area insets are applied around the grid', async ({ page }) => {
    await applySafeAreaOverride(page, IPHONE_16_SAFE_AREAS.landscape);
    await page.goto('/mobile.html');

    await expect(page.locator('#dual-mode-landscape-header')).toBeVisible();

    // The dual-mode root pads left/right with var(--safe-area-left/right).
    await expect.poll(() => readCssVar(page, '--safe-area-left')).toBe(59);
    await expect.poll(() => readCssVar(page, '--safe-area-right')).toBe(59);

    await expectInsetPadding(page, 50, 'paddingLeft');

    const play = page.locator('[data-action="toggle-play"]:visible').first();
    await play.click();
    await expect(play).toHaveClass(/bg-amber-500/);
    await page.screenshot({ path: 'test-results/mobile-pwa-landscape-playing.png', fullPage: true });
});