/**
 * tests/e2e/mobile-portrait.spec.js
 *
 * Mobile portrait (iPhone 16, Safari-like 393x659) smoke tests:
 * portrait control surface toggles play/stop; section modal random-reps
 * toggle writes the canonical field consumed by sequencer and templates.
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

test('random-reps toggle writes canonical randomRepetitions field', async ({ page }) => {
    await page.goto('/mobile.html');

    // Open the portrait section modal (stopped → editable).
    const sectionChip = page.locator(
        '[data-action="dual-mode-toggle-popover"][data-popover-id="prac-section"]:visible'
    ).first();
    await expect(sectionChip).toBeVisible();
    await sectionChip.click();

    // Toggle random repetitions on the first listed section.
    const dice = page.locator('[data-action="dual-mode-toggle-random"]:visible').first();
    await expect(dice).toBeVisible();
    await dice.click();

    // The write must land on the field the sequencer and all templates read
    // (randomRepetitions) — not on an orphan key nothing consumes.
    const sectionState = await page.evaluate(async () => {
        const { state } = await import('/js/store.js');
        const s = state.toque.sections.find(x => x.id === state.activeSectionId);
        return {
            randomRepetitions: !!s.randomRepetitions,
            hasOrphanKey: Object.prototype.hasOwnProperty.call(s, 'random')
        };
    });
    expect(sectionState.randomRepetitions).toBe(true);
    expect(sectionState.hasOrphanKey).toBe(false);

    // Template surfaces bound to the same field must reflect it.
    await expect(page.locator('#dual-mode-rep-count-portrait')).toContainText('🎲');
});