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
const { rotateTo, VIEWPORTS } = require('./helpers/rotation');

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

test('rotation performs no full renders', async ({ page }) => {
    await startPortrait(page);

    // Let the boot renders (initial load + mobile rAF re-render) finish.
    await page.waitForTimeout(150);
    await page.evaluate(() => {
        window.__rootMutations = 0;
        new MutationObserver(() => { window.__rootMutations++; })
            .observe(document.getElementById('root'), { childList: true });
    });

    await rotateTo(page, 'landscape');
    await rotateTo(page, 'portrait');

    // Grid sizing is CSS-driven: an orientation flip must not rebuild #root.
    expect(await page.evaluate(() => window.__rootMutations)).toBe(0);
});

test('grid cell size is CSS-driven and survives rotation without a rebuild', async ({ page }) => {
    // 16 steps on an unclamped iPhone 16 PWA landscape width: the exact
    // formula result is observable, unlike clamped 40px configurations.
    await page.setViewportSize({ ...VIEWPORTS.portrait });
    await applySafeAreaOverride(page, IPHONE_16_SAFE_AREAS.portrait);
    await page.goto('/mobile.html?rhythm=' + encodeURIComponent('Batà/Olokun/olokun_-_llamada_y_base'));
    await expect(page.locator('[data-action="toggle-play"]:visible').first()).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(150);

    await rotateTo(page, 'landscape');

    const readGrid = () => page.evaluate(() => {
        const cell = document.querySelector('[data-role="tubs-cell"]');
        const steps = document.querySelectorAll('[data-step-marker][data-measure-index="0"]').length;
        return { cellWidth: cell ? cell.getBoundingClientRect().width : null, steps };
    });
    const first = await readGrid();
    expect(first.steps).toBe(16);

    const safe = IPHONE_16_SAFE_AREAS.landscape.left + IPHONE_16_SAFE_AREAS.landscape.right;
    const expectedCell = (VIEWPORTS.landscape.width - safe - 195) / first.steps;
    expect(Math.abs(first.cellWidth - expectedCell)).toBeLessThan(1.5);

    await page.evaluate(() => {
        window.__rootMutations = 0;
        new MutationObserver(() => { window.__rootMutations++; })
            .observe(document.getElementById('root'), { childList: true });
    });

    await rotateTo(page, 'portrait');
    await rotateTo(page, 'landscape');

    const second = await readGrid();
    expect(await page.evaluate(() => window.__rootMutations)).toBe(0);
    expect(Math.abs(second.cellWidth - expectedCell)).toBeLessThan(1.5);
});

test('orientation popovers do not reappear when rotating back', async ({ page }) => {
    await startPortrait(page);
    await rotateTo(page, 'landscape');

    // Open a landscape chip popover.
    await page.locator('[data-action="dual-mode-toggle-popover"][data-popover-id="prac-bpm"]:visible').first().click();
    await expect(page.locator('[data-action="dual-mode-close-popover"]:visible').first()).toBeVisible();

    // Rotating away drops the popover (state + targeted DOM removal).
    await rotateTo(page, 'portrait');
    await expect(page.locator('[data-action="dual-mode-close-popover"]:visible')).toHaveCount(0);

    // Rotate straight back with no settle wait: the stale subtree must be gone,
    // not lingering until some later render.
    await page.setViewportSize({ ...VIEWPORTS.landscape });
    await applySafeAreaOverride(page, IPHONE_16_SAFE_AREAS.landscape);
    await expect(page.locator('[data-action="dual-mode-close-popover"]:visible')).toHaveCount(0);
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
