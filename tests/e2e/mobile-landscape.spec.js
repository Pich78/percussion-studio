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

test('symbol icons keep the CSS cell-size thresholds', async ({ page }) => {
    // 16 steps at the Safari-like 734px landscape viewport => ~33.7px cells,
    // which must take the 24px icon branch (>=28 and <36) exactly as the
    // former JS mapping did. The size comes from a @container rule on the
    // symbol wrapper; no re-render or measurement is involved.
    await page.goto('/mobile.html?rhythm=' + encodeURIComponent('Batà/Olokun/olokun_-_llamada_y_base'));
    await expect(page.locator('#dual-mode-landscape-header')).toBeVisible({ timeout: 15000 });

    const sample = await page.evaluate(() => {
        const img = document.querySelector('[data-role="tubs-cell"] img');
        if (!img) return null;
        const cell = img.closest('[data-role="tubs-cell"]');
        return {
            cell: cell.getBoundingClientRect().width,
            icon: img.getBoundingClientRect().width
        };
    });
    expect(sample).not.toBeNull();
    expect(sample.cell).toBeGreaterThanOrEqual(28);
    expect(sample.cell).toBeLessThan(36);
    expect(sample.icon).toBe(24);
});

test('swipe on the landscape header navigates to the next section', async ({ page }) => {
    await page.goto('/mobile.html?rhythm=' + encodeURIComponent('Batà/Olokun/olokun_-_llamada_-_base_-_1_conversacion'));

    const header = page.locator('#dual-mode-landscape-header');
    await expect(header).toBeVisible({ timeout: 15000 });

    const activeSectionId = () => page.evaluate(async () => {
        const { state } = await import('/js/store.js');
        return state.activeSectionId;
    });
    const before = await activeSectionId();

    // Positive control for the header-scoped swipe: a leftward gesture that
    // starts on the header must still advance to the next section.
    await page.evaluate(() => {
        const el = document.getElementById('dual-mode-landscape-header');
        const rect = el.getBoundingClientRect();
        const y = rect.top + rect.height / 2;
        const makeTouch = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
        const startX = rect.right - 20;
        const endX = rect.left + 20;
        el.dispatchEvent(new TouchEvent('touchstart', {
            bubbles: true, cancelable: true,
            touches: [makeTouch(startX)], changedTouches: [makeTouch(startX)]
        }));
        el.dispatchEvent(new TouchEvent('touchend', {
            bubbles: true, cancelable: true,
            touches: [], changedTouches: [makeTouch(endX)]
        }));
    });

    await expect.poll(activeSectionId).not.toBe(before);
});
