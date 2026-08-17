/**
 * tests/e2e/helpers/safeArea.js
 *
 * Simulates iPhone safe-area insets (Dynamic Island / home indicator) so the
 * PWA layout can be tested. Uses the Chromium CDP command
 * Emulation.setSafeAreaInsetsOverride, which makes env(safe-area-inset-*)
 * return simulated values (covers both the app's --safe-area-* variables and
 * raw env() usages). Falls back to overriding the --safe-area-* CSS variables
 * if the CDP command is unavailable.
 */

const { expect } = require('@playwright/test');

// Approximate iPhone 16 insets in CSS pixels (fine-tunable).
const IPHONE_16_SAFE_AREAS = {
    portrait: { top: 59, bottom: 34 },
    landscape: { left: 59, right: 59 },
};

async function applySafeAreaOverride(page, insets) {
    try {
        const session = await page.context().newCDPSession(page);
        await session.send('Emulation.setSafeAreaInsetsOverride', { insets });
    } catch (error) {
        console.warn(
            '[SafeArea] CDP override unavailable, falling back to CSS variables:',
            error.message
        );
        await page.context().addInitScript(
            ({ value }) => {
                const style = document.createElement('style');
                style.textContent = `:root {
                    --safe-area-top: ${value.top ?? 0}px;
                    --safe-area-bottom: ${value.bottom ?? 0}px;
                    --safe-area-left: ${value.left ?? 0}px;
                    --safe-area-right: ${value.right ?? 0}px;
                }`;
                document.head.appendChild(style);
            },
            { value: insets }
        );
    }
}

async function readCssVar(page, name) {
    return page.evaluate((prop) => {
        const style = getComputedStyle(document.documentElement);
        return parseInt(style.getPropertyValue(prop) || '0', 10) || 0;
    }, name);
}

// Walks up from the visible play button and asserts an ancestor whose computed
// padding on `paddingSide` is >= min px (i.e. the safe-area inset was applied).
async function expectInsetPadding(page, min, paddingSide) {
    const found = await page
        .locator('[data-action="toggle-play"]:visible')
        .first()
        .evaluate(
            (btn, { side, minPx }) => {
                let el = btn;
                while (el) {
                    const style = getComputedStyle(el);
                    const value = parseFloat(style[side]) || 0;
                    if (value >= minPx) return { found: true, value };
                    el = el.parentElement;
                }
                return { found: false, value: 0 };
            },
            { side: paddingSide, minPx: min }
        );
    expect(found.found, `expected an ancestor with ${paddingSide} >= ${min}px`).toBeTruthy();
}

module.exports = {
    IPHONE_16_SAFE_AREAS,
    applySafeAreaOverride,
    readCssVar,
    expectInsetPadding,
};
