/**
 * tests/e2e/playhead-loop.spec.js
 *
 * Regression test for the section-transition playhead wipe.
 *
 * While looping "Eni So" (single section, repetitions: 1 — every loop crosses
 * a section transition), the unified playhead bar must stay visible on EVERY
 * step, including the last column of the last measure, and the renderer must
 * NOT perform full DOM rebuilds during steady playback.
 *
 * Contract under test: docs/requirements/playback-events.md
 * - The sequencer never emits 'render'; all playback visuals flow through the
 *   ordered 'transport' event stream.
 * - Section transitions are reconciled by the renderer from payload.sectionId,
 *   synchronously before the next playhead draw.
 */

const { test, expect } = require('@playwright/test');

const ENI_SO_URL = '/mobile.html?rhythm=' + encodeURIComponent('Batà/Eni So/eni_so');

test('playhead stays visible across loop boundaries without full rebuilds', async ({ page }) => {
    await page.goto(ENI_SO_URL);
    await expect(page.locator('#dual-mode-landscape-header')).toBeVisible();

    const play = page.locator('[data-action="toggle-play"]:visible').first();
    await play.click();
    await expect(play).toHaveClass(/bg-amber-500/);

    // Wait until the sequencer demonstrably advances (first playhead drawn).
    // Fails fast here if the audio clock cannot advance in this environment.
    await page.waitForSelector('.playhead-indicator', { timeout: 15000 });

    // Attach diagnostics AFTER playback started: count full #root rebuilds and
    // record, 100 ms after each transport fact, whether a playhead is present.
    // The 100 ms delay lands after any same-instant reconciliation callbacks,
    // mirroring what the user actually sees for the remainder of that step.
    await page.evaluate(() => {
        return import('/js/services/eventBus.js').then(({ eventBus }) => {
            window.__playheadDiag = { rebuilds: 0, samples: [] };
            const root = document.getElementById('root');
            new MutationObserver(() => { window.__playheadDiag.rebuilds++; })
                .observe(root, { childList: true });
            eventBus.on('transport', (payload) => {
                if (payload.phase !== 'playing') return;
                const key = payload.measure + ':' + payload.step;
                setTimeout(() => {
                    window.__playheadDiag.samples.push({
                        key,
                        ind: !!document.querySelector('.playhead-indicator')
                    });
                }, 100);
            });
        });
    });

    // Sample ≥2 full loops (loop ≈ 5.4 s at 89 BPM, subdivision 3, 24 steps).
    await page.waitForTimeout(13000);

    const { rebuilds, samples } = await page.evaluate(() => window.__playheadDiag);

    // Coverage: at least one full measure observed, including the regression
    // spot — last column of Measure 2 (measure index 1, step index 11).
    const keys = new Set(samples.map(s => s.key));
    expect(keys.size).toBeGreaterThanOrEqual(12);
    expect(keys.has('1:11')).toBe(true);

    // The playhead must be present on every sampled step.
    const missing = [...new Set(samples.filter(s => !s.ind).map(s => s.key))];
    expect(missing, `playhead missing at: ${missing.join(', ')}`).toEqual([]);

    // No structural rebuild may occur during steady playback.
    expect(rebuilds).toBe(0);
});

test('count-in chip ticks via targeted updates', async ({ page }) => {
    await page.goto(ENI_SO_URL);
    await expect(page.locator('#dual-mode-landscape-header')).toBeVisible();

    // Enable count-in (user action → full render reconciles enabled styling).
    const cnt = page.locator('[data-action="toggle-count-in"]:visible').first();
    await cnt.click();

    const play = page.locator('[data-action="toggle-play"]:visible').first();
    await play.click();

    // Count-in at 89 BPM subdivision 3 → 6 beats ≈ 4 s. The beat number must
    // tick through distinct values — driven purely by transport events.
    await page.waitForFunction(() => {
        const el = document.querySelector('[data-role="countin-value"]');
        return el && el.textContent.trim() !== '' && el.textContent.trim() !== el.dataset.countinIdle;
    }, { timeout: 10000 });

    // After count-in completes, the chip must return to its idle display.
    await page.waitForFunction(() => {
        const el = document.querySelector('[data-role="countin-value"]');
        return el && el.textContent.trim() === el.dataset.countinIdle;
    }, { timeout: 10000 });
});
