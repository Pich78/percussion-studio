/**
 * tests/e2e/mobile-wheel-picker.spec.js
 *
 * Dual-mode custom wheel picker (repetitions + tempo acceleration). Shared
 * by the mobile-portrait and mobile-landscape projects — the dual-mode view
 * keeps both orientation layouts in the DOM, so every locator is filtered
 * by :visible and state assertions go to the canonical section fields.
 *
 * Covers: tap-to-center + Done commit, slow-drag with hold (no flick),
 * Cancel discarding the draft, skip mode, and the acceleration wheel.
 */

const { test, expect } = require('@playwright/test');

const openSectionModal = async (page) => {
    const chip = page.locator(
        '[data-action="dual-mode-toggle-popover"][data-popover-id="prac-section"]:visible'
    ).first();
    await expect(chip).toBeVisible();
    await chip.click();
};

const sectionState = async (page) => page.evaluate(async () => {
    const { state } = await import('/js/store.js');
    const s = state.toque.sections.find(x => x.id === state.activeSectionId);
    return {
        repetitions: s.repetitions || 1,
        playMode: s.playMode,
        skip: !!s.skip,
        tempoAcceleration: s.tempoAcceleration || 0,
        pickerOpen: !!state.uiState.dualModeWheelPicker,
    };
});

const doneButton = (page) => page.locator('[data-action="dual-mode-wheel-done"]:visible').first();
const cancelButton = (page) => page.locator('button[data-action="dual-mode-wheel-cancel"]:visible').first();
const visibleWheel = (page) => page.locator('.group\\/wheel:visible');

test('reps wheel: tap-to-center then Done commits and updates the chip', async ({ page }) => {
    await page.goto('/mobile.html');
    await openSectionModal(page);

    await page.locator('[data-action="dual-mode-open-reps-picker"]:visible').first().click();
    const wheel = visibleWheel(page);
    await expect(wheel).toBeVisible();

    // Default rhythm section starts at 1 repetition (idx 3); tap a visible
    // neighbor two steps up (idx 5 → "3").
    await page.locator('.wheel-item[data-idx="5"]:visible').click();
    await expect(wheel).toHaveAttribute('data-index', '5', { timeout: 2000 });

    await doneButton(page).click();
    const s = await sectionState(page);
    expect(s.repetitions).toBe(3);
    expect(s.playMode).toBe('loop');
    expect(s.pickerOpen).toBe(false);
    await expect(page.locator('[data-action="dual-mode-open-reps-picker"]:visible').first()).toHaveText('3');
});

test('reps wheel: slow drag with hold settles without flick', async ({ page }) => {
    await page.goto('/mobile.html');
    await openSectionModal(page);

    await page.locator('[data-action="dual-mode-open-reps-picker"]:visible').first().click();
    const wheel = visibleWheel(page);
    await expect(wheel).toBeVisible();

    const box = await wheel.boundingBox();
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    // Drag up exactly 2 items (84px at 42px/item), then hold still — the
    // hold must kill the release velocity so the wheel settles in place.
    for (let i = 1; i <= 6; i++) {
        await page.mouse.move(cx, cy - i * 14);
        await page.waitForTimeout(20);
    }
    await page.waitForTimeout(200);
    await page.mouse.up();
    await expect(wheel).toHaveAttribute('data-index', '5', { timeout: 2000 });

    await doneButton(page).click();
    const s = await sectionState(page);
    expect(s.repetitions).toBe(3);
});

test('reps wheel: Cancel discards the draft', async ({ page }) => {
    await page.goto('/mobile.html');
    await openSectionModal(page);

    await page.locator('[data-action="dual-mode-open-reps-picker"]:visible').first().click();
    const wheel = visibleWheel(page);
    await expect(wheel).toBeVisible();

    await page.locator('.wheel-item[data-idx="5"]:visible').click();
    await expect(wheel).toHaveAttribute('data-index', '5', { timeout: 2000 });

    await cancelButton(page).click();
    const s = await sectionState(page);
    expect(s.repetitions).toBe(1);
    expect(s.pickerOpen).toBe(false);
});

test('reps wheel: special value "disabled" sets skip mode', async ({ page }) => {
    await page.goto('/mobile.html');
    await openSectionModal(page);

    await page.locator('[data-action="dual-mode-open-reps-picker"]:visible').first().click();
    const wheel = visibleWheel(page);
    await expect(wheel).toBeVisible();

    // From idx 3 ("1"), "disabled" (idx 1) is a visible neighbor.
    await page.locator('.wheel-item[data-idx="1"]:visible').click();
    await expect(wheel).toHaveAttribute('data-index', '1', { timeout: 2000 });

    await doneButton(page).click();
    const s = await sectionState(page);
    expect(s.skip).toBe(true);
    expect(s.playMode).toBe('loop');
});

test('accel wheel: disabled for 1-rep sections, commits once reps > 1', async ({ page }) => {
    await page.goto('/mobile.html');
    await openSectionModal(page);

    // Acceleration is meaningless for a 1-repetition loop: chip disabled.
    await expect(page.locator('.accel-trigger:visible').first()).toBeDisabled();

    // Set reps to 3 via the reps wheel (tap idx 5).
    await page.locator('[data-action="dual-mode-open-reps-picker"]:visible').first().click();
    const wheel = visibleWheel(page);
    await page.locator('.wheel-item[data-idx="5"]:visible').click();
    await expect(wheel).toHaveAttribute('data-index', '5', { timeout: 2000 });
    await doneButton(page).click();

    // Accel chip is now enabled; open it and tap +0.1 (idx 101).
    const accelChip = page.locator('[data-action="dual-mode-open-accel-picker"]:visible').first();
    await expect(accelChip).toBeVisible();
    await accelChip.click();
    await expect(wheel).toBeVisible();
    await page.locator('.wheel-item[data-idx="101"]:visible').click();
    await expect(wheel).toHaveAttribute('data-index', '101', { timeout: 2000 });
    await doneButton(page).click();

    const s = await sectionState(page);
    expect(s.tempoAcceleration).toBeCloseTo(0.1, 5);
    await expect(page.locator('.accel-trigger:visible').first()).toContainText('+0.1%');
});
