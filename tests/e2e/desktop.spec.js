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

test('header rhythm name opens the browser in one step', async ({ page }) => {
    await page.goto('/desktop.html?rhythm=' + encodeURIComponent('Clave/2-3_son_clave'));
    await expect(page.locator('#grid-container')).toBeVisible();

    // The header rhythm name is the direct switcher trigger.
    const trigger = page.locator('header [data-action="load-rhythm"]').first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    await expect(page.getByRole('heading', { name: 'Load Rhythm' })).toBeVisible();

    // The current rhythm's folder is pre-expanded, so its entry is visible
    // without expanding Clave first.
    await expect(
        page.locator('[data-action="select-rhythm-confirm"][data-rhythm-id="Clave/2-3_son_clave"]:visible').first()
    ).toBeVisible();
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

test('pie timing input keeps focus and persists while typing', async ({ page }) => {
    await page.goto('/desktop.html');
    await expect(page.locator('#grid-container')).toBeVisible({ timeout: 15000 });

    await page.locator('[data-action="toggle-menu"]').first().click();
    await page.locator('[data-action="open-editing-options"]').first().click();

    // The hover-timing field is only interactive in Hover trigger mode.
    await page.locator('input[data-action="update-pie-trigger"][value="hover"]').check();

    const hoverMs = page.locator('#pie-hover-ms');
    await expect(hoverMs).toBeEnabled();
    await hoverMs.click();
    await hoverMs.press('Control+a');
    await page.keyboard.type('500');

    // Regression: each keystroke used to emit a full render that replaced the
    // input and dropped focus, so only the first digit survived.
    await expect(hoverMs).toHaveValue('500');
    await expect(hoverMs).toBeFocused();

    // Blur commits to state; the value survives a close/reopen round-trip.
    await hoverMs.press('Tab');
    const stored = await page.evaluate(async () => {
        const { state } = await import('/js/store.js');
        return state.uiState.pieMenu.hoverTimeMs;
    });
    expect(stored).toBe(500);

    await page.locator('[data-action="close-modal"]').first().click();
    await page.locator('[data-action="toggle-menu"]').first().click();
    await page.locator('[data-action="open-editing-options"]').first().click();
    await expect(page.locator('#pie-hover-ms')).toHaveValue('500');
});

test('instrument modal keeps its scroll position on selection', async ({ page }) => {
    // Short window so the modal columns overflow (max-h: 60vh) and scroll.
    await page.setViewportSize({ width: 1280, height: 400 });
    await page.goto('/desktop.html');
    await expect(page.locator('#grid-container')).toBeVisible({ timeout: 15000 });

    await page.locator('[data-action="open-add-modal"]').first().click();
    await expect(page.locator('#instrument-modal-scroll')).toBeVisible();

    // CLV has 8 packs; select one so the preview list adds height too.
    await page.locator('[data-action="select-instrument"][data-instrument="CLV"]').first().click();
    await page.locator('[data-action="select-sound-pack"][data-pack="sg.clave"]').first().click();

    const before = await page.evaluate(() => {
        const el = document.getElementById('instrument-modal-scroll');
        const max = el.scrollHeight - el.clientHeight;
        el.scrollTop = Math.min(24, max);
        return { scrollTop: el.scrollTop, max };
    });
    expect(before.max).toBeGreaterThan(0);
    expect(before.scrollTop).toBeGreaterThan(0);

    // Selecting another pack rebuilds the modal; scroll must survive (the
    // renderer only preserves #tubs-scroll-container by default).
    await page.locator('[data-action="select-sound-pack"][data-pack="cp.columbia"]').first().click();

    await expect.poll(async () => page.evaluate(() => {
        const el = document.getElementById('instrument-modal-scroll');
        return el ? el.scrollTop : -1;
    })).toBe(before.scrollTop);
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

test('disabling and re-enabling a section keeps its play mode', async ({ page }) => {
    await page.goto('/desktop.html');
    await expect(page.locator('#grid-container')).toBeVisible({ timeout: 15000 });

    // Set the active section to Play Forever.
    await page.locator('[data-action="toggle-play-mode-dropdown"]').first().click();
    await page.locator('[data-action="select-play-mode"][data-value="adlib"]').first().click();

    const activePlayMode = () => page.evaluate(async () => {
        const { state } = await import('/js/store.js');
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        return section.playMode;
    });
    expect(await activePlayMode()).toBe('adlib');

    // Disable then re-enable from the timeline toggle.
    const enabledToggle = page.locator('[data-action="toggle-section-enabled"]').first();
    await enabledToggle.click();
    await enabledToggle.click();

    // Regression: the old toggle wrote playMode='skip' on disable and 'loop'
    // on enable, silently losing Play Forever/Play Once.
    expect(await activePlayMode()).toBe('adlib');
});

test('toggling BPM override updates the timeline tempo badge immediately', async ({ page }) => {
    await page.goto('/desktop.html');
    await expect(page.locator('#grid-container')).toBeVisible();

    // The timeline renders one tempo badge per section, tagged by title.
    const countTitles = () => page.evaluate(() => ({
        custom: document.querySelectorAll('[title="Custom Tempo"]').length,
        global: document.querySelectorAll('[title="Global Tempo"]').length
    }));

    const before = await countTitles();
    const activeIsCustom = await page.evaluate(async () => {
        const { state } = await import('/js/store.js');
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        return section.bpm !== undefined;
    });

    await page.locator('[data-action="toggle-bpm-override"]').first().click();

    // Only the ACTIVE section flips; its badge must update immediately —
    // no waiting for an unrelated full render.
    const after = await countTitles();
    if (activeIsCustom) {
        expect(after.custom).toBe(before.custom - 1);
        expect(after.global).toBe(before.global + 1);
    } else {
        expect(after.custom).toBe(before.custom + 1);
        expect(after.global).toBe(before.global - 1);
    }
});
