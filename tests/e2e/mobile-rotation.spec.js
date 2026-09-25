/**
 * tests/e2e/mobile-rotation.spec.js
 *
 * Rotation regression (PWA full-screen projects): the visible header must
 * survive portrait → landscape → portrait, the shell must keep filling the
 * viewport, the document must stay unscrolled and orientation-scoped
 * popovers must close (js/ui/mobileViewport.js).
 *
 * Chromium cannot emulate iOS's stale env(safe-area-inset-*) after rotation;
 * this pins the app-side invariant. Final verification on a real iPhone in
 * PWA mode remains mandatory (docs/testing.md).
 */

const { test, expect } = require('@playwright/test');
const { IPHONE_16_SAFE_AREAS, applySafeAreaOverride } = require('./helpers/safeArea');
const { rotateTo } = require('./helpers/rotation');

const portraitHeader = (page) => page.locator('div[class*="portrait:flex"] header:visible').first();
const landscapeHeader = (page) => page.locator('#dual-mode-landscape-header:visible').first();

const startPortrait = async (page) => {
    // Normalize the starting orientation regardless of the hosting project.
    await page.setViewportSize({ width: 393, height: 852 });
    await applySafeAreaOverride(page, IPHONE_16_SAFE_AREAS.portrait);
    await page.goto('/mobile.html');
    await expect(page.locator('[data-action="toggle-play"]:visible').first()).toBeVisible();
};

test('header survives portrait → landscape → portrait; popovers close; shell stays pinned', async ({ page }) => {
    await startPortrait(page);

    await expect(portraitHeader(page)).toBeVisible();
    await expect(page.locator('[data-action="toggle-menu"]:visible').first()).toBeVisible();

    // Open the portrait section popover so rotation-closing can be pinned.
    await page.locator('[data-action="dual-mode-toggle-popover"][data-popover-id="prac-section"]:visible').first().click();
    await expect(page.locator('[data-action="dual-mode-close-popover"]:visible').first()).toBeVisible();

    await rotateTo(page, 'landscape');
    await expect(landscapeHeader(page)).toBeVisible();
    await expect(page.locator('[data-action="toggle-menu"]:visible').first()).toBeVisible();
    await expect(page.locator('[data-action="dual-mode-close-popover"]:visible')).toHaveCount(0);

    await rotateTo(page, 'portrait');
    await expect(portraitHeader(page)).toBeVisible();
    await expect(page.locator('[data-action="toggle-menu"]:visible').first()).toBeVisible();

    const shell = await page.evaluate(() => {
        const rootRect = document.getElementById('root').getBoundingClientRect();
        return {
            scrollY: window.scrollY,
            rootTop: Math.round(rootRect.top),
            rootH: Math.round(rootRect.height),
            innerHeight: window.innerHeight,
        };
    });
    expect(shell.scrollY).toBe(0);
    expect(shell.rootTop).toBe(0);
    expect(Math.abs(shell.rootH - shell.innerHeight)).toBeLessThanOrEqual(1);
});

test('rhythm browser opened from the header survives a rotation', async ({ page }) => {
    await startPortrait(page);

    await page.locator('header [data-action="load-rhythm"]:visible').first().click();
    await expect(page.getByRole('heading', { name: 'Load Rhythm' })).toBeVisible();

    await rotateTo(page, 'landscape');
    await expect(page.getByRole('heading', { name: 'Load Rhythm' })).toBeVisible();

    await rotateTo(page, 'portrait');
    await expect(page.getByRole('heading', { name: 'Load Rhythm' })).toBeVisible();
    await expect(page.locator('[data-action="back-to-menu"]:visible')).toHaveCount(0);
});
