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

test('rhythm browser expands non-Batà folders in Dual Mode', async ({ page }) => {
    await page.goto('/mobile.html');

    await page.locator('[data-action="toggle-menu"]:visible').first().click();
    await page.locator('[data-action="load-rhythm"]:visible').first().click();
    await expect(page.getByRole('heading', { name: 'Load Rhythm' })).toBeVisible();

    // Dual Mode renders the modal outside #grid-container, so expanding a
    // folder must repaint the modal itself. Regression: it emitted
    // grid-refresh, a no-op there, leaving the folder visibly dead.
    await page.locator('[data-action="toggle-folder"][data-folder-path="Clave"]:visible').first().click();

    await expect(
        page.locator('[data-action="select-rhythm-confirm"][data-rhythm-id="Clave/2-3_son_clave"]:visible').first()
    ).toBeVisible();
});

test('rhythm browser back buttons return to menu and Batà list', async ({ page }) => {
    await page.goto('/mobile.html');

    // Load Rhythm → back arrow returns to the hamburger menu.
    await page.locator('[data-action="toggle-menu"]:visible').first().click();
    await page.locator('[data-action="load-rhythm"]:visible').first().click();
    await page.locator('[data-action="back-to-menu"]:visible').first().click();
    await expect(page.locator('[data-action="load-rhythm"]:visible').first()).toBeVisible();

    // Load Rhythm → Batà → back arrow returns to the folder list.
    await page.locator('[data-action="load-rhythm"]:visible').first().click();
    await page.locator('[data-action="toggle-folder"]:visible', { hasText: 'Batà' }).first().click();
    await page.locator('[data-action="back-to-rhythm-list"]:visible').first().click();
    await expect(page.getByRole('heading', { name: 'Load Rhythm' })).toBeVisible();
});

test('Batà Explorer filters stay reachable in portrait', async ({ page }) => {
    await page.goto('/mobile.html');

    await page.locator('[data-action="toggle-menu"]:visible').first().click();
    await page.locator('[data-action="load-rhythm"]:visible').first().click();
    await page.locator('[data-action="toggle-folder"]:visible', { hasText: 'Batà' }).first().click();

    // The explorer back arrow must not push the filter controls (or the
    // close button) past the right edge of the portrait header.
    const orisha = page.locator('[data-action="toggle-filter-dropdown"][data-dropdown-id="orisha"]:visible').first();
    const type = page.locator('[data-action="toggle-filter-dropdown"][data-dropdown-id="type"]:visible').first();
    const close = page.locator('[data-action="close-bata-explorer"]:visible').first();

    await expect(orisha).toBeInViewport();
    await expect(type).toBeInViewport();
    await expect(close).toBeInViewport();

    // And they must actually open their option lists.
    await orisha.click();
    await expect(page.locator('[data-action="toggle-orisha-filter"]:visible').first()).toBeVisible();
    await orisha.click();
    await type.click();
    await expect(page.locator('[data-action="toggle-type-filter"]:visible').first()).toBeVisible();
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