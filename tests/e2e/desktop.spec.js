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

test('creating a new rhythm clears any active solo', async ({ page }) => {
    await page.goto('/desktop.html');
    await expect(page.locator('#grid-container')).toBeVisible();

    // Seed a solo through its canonical write path (the action).
    const soloState = await page.evaluate(async () => {
        const { state } = await import('/js/store.js');
        const { actions } = await import('/js/actions/index.js');
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        const track = section.measures[0].tracks[0];
        actions.toggleTrackSolo(0, track.instrument);
        return state.soloTrack;
    });
    expect(soloState).toBe(0);

    // New Rhythm lives behind the hamburger menu; its flow uses confirm().
    page.on('dialog', d => d.accept());
    await page.locator('[data-action="toggle-menu"]').first().click();
    await page.locator('[data-action="new-rhythm"]').first().click();

    const soloAfter = await page.evaluate(async () => {
        const { state } = await import('/js/store.js');
        return state.soloTrack;
    });
    expect(soloAfter).toBeNull();
});

test('removing tracks reconciles soloTrack', async ({ page }) => {
    await page.goto('/desktop.html');
    await expect(page.locator('#grid-container')).toBeVisible();
    page.on('dialog', d => d.accept());

    const trackCount = await page.evaluate(async () => {
        const { state } = await import('/js/store.js');
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        return section.measures[0].tracks.length;
    });
    expect(trackCount).toBeGreaterThanOrEqual(2);

    // Case 1: soloing the LAST track, then removing the FIRST one shifts
    // the solo down by one — it must keep pointing at the same instrument.
    await page.evaluate(async (idx) => {
        const { state } = await import('/js/store.js');
        const { actions } = await import('/js/actions/index.js');
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        actions.toggleTrackSolo(idx, section.measures[0].tracks[idx].instrument);
    }, trackCount - 1);

    await page.locator('[data-action="remove-track"][data-track-index="0"]').first().click();

    const shifted = await page.evaluate(async () => {
        const { state } = await import('/js/store.js');
        return state.soloTrack;
    });
    expect(shifted).toBe(trackCount - 2);

    // Case 2: removing the currently-soloed track clears the solo entirely.
    const lastIndex = trackCount - 2;
    await page.evaluate(async (idx) => {
        const { state } = await import('/js/store.js');
        const { actions } = await import('/js/actions/index.js');
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        actions.toggleTrackSolo(idx, section.measures[0].tracks[idx].instrument);
    }, lastIndex);

    await page.locator(`[data-action="remove-track"][data-track-index="${lastIndex}"]`).first().click();

    const cleared = await page.evaluate(async () => {
        const { state } = await import('/js/store.js');
        return state.soloTrack;
    });
    expect(cleared).toBeNull();
});
