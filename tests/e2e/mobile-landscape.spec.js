/**
 * tests/e2e/mobile-landscape.spec.js
 *
 * Mobile landscape (iPhone 16, Safari-like 734x343) smoke test:
 * read-only grid toggles play/stop.
 */

const { test, expect } = require('@playwright/test');

test('landscape shows read-only grid and toggles play', async ({ page }) => {
    await page.goto('/mobile.html');

    await expect(page.locator('#dual-mode-landscape-header')).toBeVisible();

    const play = page.locator('[data-action="toggle-play"]:visible').first();
    await expect(play).toBeVisible();

    await play.click();
    await expect(play).toHaveClass(/bg-amber-500/);
    await page.screenshot({ path: 'test-results/mobile-landscape-playing.png', fullPage: true });

    const stop = page.locator('[data-action="stop"]:visible').first();
    await stop.click();
    await expect(play).toHaveClass(/bg-indigo-600/);
});

test('landscape header rhythm name opens the browser in one step', async ({ page }) => {
    await page.goto('/mobile.html');

    const trigger = page.locator('#dual-mode-landscape-header [data-action="load-rhythm"]:visible').first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    await expect(page.getByRole('heading', { name: 'Load Rhythm' })).toBeVisible();
    await expect(page.locator('[data-action="back-to-menu"]:visible')).toHaveCount(0);
});
