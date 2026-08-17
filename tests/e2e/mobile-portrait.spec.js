/**
 * tests/e2e/mobile-portrait.spec.js
 *
 * Mobile portrait (iPhone 16, Safari-like 393x659) smoke test:
 * portrait control surface toggles play/stop.
 */

const { test, expect } = require('@playwright/test');

test('portrait shows control surface and toggles play', async ({ page }) => {
    await page.goto('/mobile.html');

    const play = page.locator('[data-action="toggle-play"]:visible').first();
    await expect(play).toBeVisible();
    await expect(play).toHaveText(/Play/);

    await play.click();
    await expect(play).toHaveClass(/bg-amber-500/);
    await page.screenshot({ path: 'test-results/mobile-portrait-playing.png', fullPage: true });

    const stop = page.locator('[data-action="stop"]:visible').first();
    await stop.click();
    await expect(play).toHaveClass(/bg-indigo-600/);
});