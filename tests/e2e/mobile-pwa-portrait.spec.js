/**
 * tests/e2e/mobile-pwa-portrait.spec.js
 *
 * PWA (standalone) portrait on iPhone 16: full-screen viewport 393x852 with
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

test('safe-area insets are applied and content stays clear of island/home indicator', async ({ page }) => {
    await applySafeAreaOverride(page, IPHONE_16_SAFE_AREAS.portrait);
    await page.goto('/mobile.html');

    const play = page.locator('[data-action="toggle-play"]:visible').first();
    await expect(play).toBeVisible();

    // The app reads env() into --safe-area-* at render time; the CDP
    // override must have reached those variables.
    await expect.poll(() => readCssVar(page, '--safe-area-top')).toBe(59);
    await expect.poll(() => readCssVar(page, '--safe-area-bottom')).toBe(34);

    // The portrait play bar pads bottom with env(safe-area-inset-bottom)+2.5rem
    // (34+40 = 74px) and the root pads top with env(safe-area-inset-top) (59px).
    await expectInsetPadding(page, 70, 'paddingBottom');
    await expectInsetPadding(page, 50, 'paddingTop');

    await play.click();
    await expect(play).toHaveClass(/bg-amber-500/);
    await page.screenshot({ path: 'test-results/mobile-pwa-portrait-playing.png', fullPage: true });
});