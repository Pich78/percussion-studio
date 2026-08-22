/**
 * tests/e2e/desktop.spec.js
 *
 * Desktop editor tests: page load, grid render, play/stop state,
 * static-playhead position invariants, screenshot.
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

test('static playhead parks in the paused measure across re-renders', async ({ page }) => {
    // Eni So has 2 measures per section — pausing beyond measure 0 is possible.
    // Go straight to desktop.html: index.html's mode redirect drops ?rhythm=.
    await page.goto('/desktop.html?rhythm=' + encodeURIComponent('Batà/Eni So/eni_so'));
    await expect(page.locator('#grid-container')).toBeVisible();

    // Expose the live playback object (same module instance the app uses).
    await page.evaluate(() =>
        import('/js/store.js').then(({ playback }) => { window.__pb = playback; })
    );

    const play = page.locator('[data-action="toggle-play"]:visible').first();
    await play.click();

    // Wait until the playhead demonstrably advanced into the 2nd measure.
    await page.waitForFunction(() => window.__pb.currentMeasureIndex >= 1, null, { timeout: 20000 });
    const pausedMeasure = await page.evaluate(() => window.__pb.currentMeasureIndex);
    expect(pausedMeasure).toBeGreaterThanOrEqual(1);

    // Pause (position is preserved by design) and force a full re-render
    // via a real user action — the static playhead must be redrawn where
    // it was parked, not snapped back to measure 0.
    await play.click();
    await page.locator('[data-action="toggle-count-in"]:visible').first().click();

    await page.waitForSelector('.playhead-indicator');
    const drawnMeasure = await page.evaluate(() => {
        const el = document.querySelector('.measure-container .playhead-indicator');
        return el ? parseInt(el.closest('.measure-container').dataset.measureIndex, 10) : null;
    });

    const expectedMeasure = await page.evaluate(() => window.__pb.currentMeasureIndex);
    expect(drawnMeasure).toBe(expectedMeasure);
});
