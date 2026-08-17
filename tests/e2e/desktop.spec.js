/**
 * tests/e2e/desktop.spec.js
 *
 * Desktop editor smoke tests: page load, grid render, play/stop state, screenshot.
 */

const { test, expect } = require('@playwright/test');

test('desktop grid renders and play/stop toggles state', async ({ page }) => {
    await page.goto('/?mode=desktop');

    await expect(page.locator('#grid-container')).toBeVisible();

    const play = page.locator('[data-action="toggle-play"]:visible').first();
    await expect(play).toBeVisible();

    await play.click();
    await expect(play).toHaveClass(/bg-amber-500/);
    await page.screenshot({ path: 'test-results/desktop-playing.png', fullPage: true });

    const stop = page.locator('[data-action="stop"]:visible').first();
    await stop.click();
    await expect(play).toHaveClass(/bg-green-600/);
});
