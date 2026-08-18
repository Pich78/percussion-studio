/**
 * tests/e2e/audio-latency.spec.js
 *
 * Profiles sound-loading latency across all relevant code paths in the
 * Percussion Studio app. Measures:
 *   1. previewSound() latency (clicking packs / preview chips in the modal)
 *   2. loadSoundPack() latency (confirming instrument selection → addTrack)
 *   3. Network fetch time for .wav files (via Playwright route interception)
 *   4. AudioContext.decodeAudioData() time (via post-load prototype patch)
 *   5. Cache-hit vs cold-fetch delta
 *
 * Generates a structured report at the end of the run.
 */

const { test, expect } = require('@playwright/test');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Inject timing hooks into the page AFTER it loads.
 * Uses page.evaluate() so it runs in the page's own context,
 * guaranteeing access to the same AudioContext and fetch.
 */
async function injectTimingHooks(page) {
    await page.evaluate(() => {
        // Prevent double-injection
        if (window.__timingHooksActive) return;
        window.__timingHooksActive = true;

        window.__audioTimings = [];

        // ── fetch() patch ──────────────────────────────────────────────
        const _origFetch = window.fetch.bind(window);
        window.fetch = async function patchedFetch(...args) {
            const url = typeof args[0] === 'string' ? args[0] : args[0]?.url ?? '';
            const entry = { type: 'fetch', url, start: performance.now(), end: 0, duration: 0, ok: false };
            try {
                const resp = await _origFetch(...args);
                entry.ok = resp.ok;
                entry.end = performance.now();
                entry.duration = entry.end - entry.start;
                return resp;
            } catch (err) {
                entry.end = performance.now();
                entry.duration = entry.end - entry.start;
                entry.error = err.message;
                throw err;
            } finally {
                // Read from window.__audioTimings dynamically (clearTimings replaces the array)
                if (url.endsWith('.wav') && window.__audioTimings) {
                    window.__audioTimings.push(entry);
                }
            }
        };

        // ── AudioContext.decodeAudioData() patch ───────────────────────
        const _origDecode = AudioContext.prototype.decodeAudioData;
        AudioContext.prototype.decodeAudioData = function patchedDecode(arrayBuffer, ...rest) {
            const entry = { type: 'decode', start: performance.now(), end: 0, duration: 0, inputBytes: arrayBuffer.byteLength };
            const p = _origDecode.call(this, arrayBuffer, ...rest);
            return p.then(result => {
                entry.end = performance.now();
                entry.duration = entry.end - entry.start;
                // Read from window.__audioTimings dynamically
                if (window.__audioTimings) window.__audioTimings.push(entry);
                return result;
            });
        };

        console.log('[AudioLatency] Timing hooks injected successfully');
    });
}

/**
 * Clear the timing log between phases.
 */
async function clearTimings(page) {
    await page.evaluate(() => { window.__audioTimings = []; });
}

/**
 * Collect timing data from the page.
 */
async function collectTimings(page) {
    return await page.evaluate(() => {
        const T = window.__audioTimings || [];
        return {
            fetches: T.filter(e => e.type === 'fetch' && e.url.includes('.wav')),
            decodes: T.filter(e => e.type === 'decode'),
            totalCount: T.length,
        };
    });
}

/**
 * Get Performance Resource Timing data for .wav files.
 */
async function getWavResourceTimings(page) {
    return await page.evaluate(() => {
        return performance.getEntriesByType('resource')
            .filter(r => r.name.includes('.wav'))
            .map(r => ({
                name: r.name.split('/').pop(),
                fullName: r.name,
                duration: r.duration,
                transferSize: r.transferSize,
                encodedBodySize: r.encodedBodySize,
                responseStart: r.responseStart,
                requestStart: r.requestStart,
            }));
    });
}


// ── Test ─────────────────────────────────────────────────────────────────────

test('profile audio loading latency', async ({ page }) => {
    // 1) Navigate to desktop
    await page.goto('/?mode=desktop');
    await expect(page.locator('#grid-container')).toBeVisible({ timeout: 15000 });

    // 2) Unlock AudioContext – play then stop
    const play = page.locator('[data-action="toggle-play"]:visible').first();
    await expect(play).toBeVisible();
    await play.click();
    await page.waitForTimeout(500);
    const stop = page.locator('[data-action="stop"]:visible').first();
    await stop.click();
    await page.waitForTimeout(200);

    // 3) Inject timing hooks AFTER page load (in page context)
    await injectTimingHooks(page);

    // ── Phase 1: Modal preview latency (cold) ────────────────────────────
    console.log('\n=== Phase 1: Modal preview — cold fetch ===');

    await page.click('[data-action="open-add-modal"]');
    await page.waitForSelector('[data-action="select-instrument"]', { timeout: 5000 });

    // Select CLV
    await page.click('[data-action="select-instrument"][data-instrument="CLV"]');
    await page.waitForTimeout(300);

    await clearTimings(page);

    // Click through all 8 clave packs as fast as possible
    const clavePacks = [
        'cp.columbia', 'cp.conga', 'cp.guaguanco', 'sg.clave',
        'sg.cuba', 'sg.ebo', 'sg.lp', 'sg.traditional'
    ];

    for (const pack of clavePacks) {
        await page.click(`[data-action="select-sound-pack"][data-pack="${pack}"]`);
        await page.waitForTimeout(600);
    }

    const claveColdTimings = await collectTimings(page);
    console.log(`[CLV] Cold fetches: ${claveColdTimings.fetches.length}, decodes: ${claveColdTimings.decodes.length}`);

    // ── Phase 2: Modal preview latency (cached) ──────────────────────────
    console.log('\n=== Phase 2: Modal preview — cache hit ===');
    await clearTimings(page);

    for (const pack of clavePacks) {
        await page.click(`[data-action="select-sound-pack"][data-pack="${pack}"]`);
        await page.waitForTimeout(300);
    }

    const claveCachedTimings = await collectTimings(page);
    console.log(`[CLV] Cache-hit fetches: ${claveCachedTimings.fetches.length}, decodes: ${claveCachedTimings.decodes.length}`);

    // ── Phase 3: Bata drum preview latency (cold) ────────────────────────
    console.log('\n=== Phase 3: Bata drum preview — cold fetch ===');
    await clearTimings(page);

    await page.click('[data-action="select-instrument"][data-instrument="IYA"]');
    await page.waitForTimeout(300);

    const iyaPacks = ['cp.chaworo', 'cp', 'basic'];
    for (const pack of iyaPacks) {
        await page.click(`[data-action="select-sound-pack"][data-pack="${pack}"]`);
        await page.waitForTimeout(800);
    }

    const iyaColdTimings = await collectTimings(page);
    console.log(`[IYA] Cold fetches: ${iyaColdTimings.fetches.length}, decodes: ${iyaColdTimings.decodes.length}`);

    // ── Phase 4: Confirm instrument → addTrack latency ───────────────────
    console.log('\n=== Phase 4: addTrack latency (confirm selection) ===');
    await clearTimings(page);

    // Switch to OKO (not yet loaded), first pack, then confirm
    await page.click('[data-action="select-instrument"][data-instrument="OKO"]');
    await page.waitForTimeout(300);
    await page.click('[data-action="select-sound-pack"][data-pack="cp.chaworo"]');
    await page.waitForTimeout(400);

    const confirmStart = await page.evaluate(() => performance.now());
    await page.click('[data-action="confirm-instrument-selection"]');
    await page.waitForFunction(() => !document.querySelector('[data-action="confirm-instrument-selection"]'), { timeout: 8000 });
    await page.waitForTimeout(500);
    const confirmEnd = await page.evaluate(() => performance.now());

    const addTrackTimings = await collectTimings(page);
    console.log(`[OKO] addTrack fetches: ${addTrackTimings.fetches.length}, decodes: ${addTrackTimings.decodes.length}`);

    // ── Phase 5: Performance Resource Timing inventory ───────────────────
    const resourceTimings = await getWavResourceTimings(page);

    // ── Build Report ─────────────────────────────────────────────────────
    const report = buildReport({
        claveColdTimings,
        claveCachedTimings,
        iyaColdTimings,
        addTrackTimings,
        resourceTimings,
        confirmWallMs: confirmEnd - confirmStart,
    });

    console.log(report);

    // Save to file
    const fs = require('fs');
    const path = require('path');
    const outDir = path.resolve(__dirname, '..', 'test-results');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'audio-latency-report.txt'), report);
    console.log(`\n[AudioLatency] Report saved to test-results/audio-latency-report.txt`);
});


// ── Report builder ───────────────────────────────────────────────────────────

function buildReport({ claveColdTimings, claveCachedTimings, iyaColdTimings, addTrackTimings, resourceTimings, confirmWallMs }) {
    const lines = [];
    const hr = '═'.repeat(80);
    const hr2 = '─'.repeat(80);

    lines.push(hr);
    lines.push('  AUDIO LOADING LATENCY REPORT — Percussion Studio');
    lines.push(hr);
    lines.push('');

    // ── Table helper ─────────────────────────────────────────────────────
    const table = (headers, rows) => {
        if (rows.length === 0) { lines.push('  (no data)'); return; }
        const widths = headers.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i]).length)));
        const pad = (s, w) => String(s).padEnd(w);
        lines.push(headers.map((h, i) => pad(h, widths[i])).join('  '));
        lines.push(widths.map(w => '─'.repeat(w)).join('  '));
        rows.forEach(r => lines.push(r.map((c, i) => pad(c, widths[i])).join('  ')));
    };

    // ── Section 1: Clave cold fetches ────────────────────────────────────
    lines.push('1. CLAVE (CLV) — Cold preview (first fetch per pack)');
    lines.push(hr2);
    const claveColdRows = claveColdTimings.fetches.map((f, i) => {
        const decode = claveColdTimings.decodes[i];
        return [
            f.url.split('/').pop(),
            f.duration.toFixed(1),
            decode ? decode.duration.toFixed(1) : '—',
            decode ? (f.duration + decode.duration).toFixed(1) : f.duration.toFixed(1),
        ];
    });
    table(['File', 'Fetch (ms)', 'Decode (ms)', 'Total (ms)'], claveColdRows);
    if (claveColdRows.length > 0) {
        const totals = claveColdRows.map(r => parseFloat(r[3]));
        lines.push('');
        lines.push(`  Average total: ${(totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1)} ms  |  Max: ${Math.max(...totals).toFixed(1)} ms`);
    }
    lines.push('');

    // ── Section 2: Clave cached ──────────────────────────────────────────
    lines.push('2. CLAVE (CLV) — Cached preview (second pass, in-memory hit)');
    lines.push(hr2);
    if (claveCachedTimings.fetches.length === 0 && claveCachedTimings.decodes.length === 0) {
        lines.push('  All previews served from memory — zero fetches, zero decodes.');
    } else {
        const cachedRows = claveCachedTimings.fetches.map((f, i) => {
            const decode = claveCachedTimings.decodes[i];
            return [f.url.split('/').pop(), f.duration.toFixed(1), decode ? decode.duration.toFixed(1) : '—'];
        });
        table(['File', 'Fetch (ms)', 'Decode (ms)'], cachedRows);
    }
    lines.push('');

    // ── Section 3: Bata drums cold ───────────────────────────────────────
    lines.push('3. IYA (Bata drum) — Cold preview');
    lines.push(hr2);
    const iyaColdRows = iyaColdTimings.fetches.map((f, i) => {
        const decode = iyaColdTimings.decodes[i];
        const resEntry = resourceTimings.find(r => r.fullName.includes(f.url.split('/').pop()));
        const sizeKB = resEntry ? (resEntry.transferSize / 1024).toFixed(0) + 'KB' : '?';
        return [
            f.url.split('/').pop(),
            sizeKB,
            f.duration.toFixed(1),
            decode ? decode.duration.toFixed(1) : '—',
            decode ? (f.duration + decode.duration).toFixed(1) : f.duration.toFixed(1),
        ];
    });
    table(['File', 'Size', 'Fetch (ms)', 'Decode (ms)', 'Total (ms)'], iyaColdRows);
    if (iyaColdRows.length > 0) {
        const totals = iyaColdRows.map(r => parseFloat(r[4]));
        lines.push('');
        lines.push(`  Average total: ${(totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1)} ms  |  Max: ${Math.max(...totals).toFixed(1)} ms`);
    }
    lines.push('');

    // ── Section 4: addTrack ──────────────────────────────────────────────
    lines.push('4. OKO — addTrack (confirm → load → grid-ready)');
    lines.push(hr2);
    lines.push(`  Wall-clock time (confirm click → modal closed): ${confirmWallMs.toFixed(1)} ms`);
    lines.push(`  fetch() calls for .wav: ${addTrackTimings.fetches.length}`);
    lines.push(`  decodeAudioData() calls: ${addTrackTimings.decodes.length}`);
    if (addTrackTimings.fetches.length > 0) {
        lines.push('');
        addTrackTimings.fetches.forEach((f, i) => {
            const decode = addTrackTimings.decodes[i];
            lines.push(`    ${f.url.split('/').pop()}  fetch=${f.duration.toFixed(1)}ms  decode=${decode ? decode.duration.toFixed(1) + 'ms' : '—'}`);
        });
        const totalFetch = addTrackTimings.fetches.reduce((s, f) => s + f.duration, 0);
        const totalDecode = addTrackTimings.decodes.reduce((s, d) => s + d.duration, 0);
        lines.push('');
        lines.push(`  Total fetch: ${totalFetch.toFixed(1)}ms  |  Total decode: ${totalDecode.toFixed(1)}ms  |  Combined: ${(totalFetch + totalDecode).toFixed(1)}ms`);
    }
    lines.push('');

    // ── Section 5: Performance Resource Timing (full inventory) ──────────
    lines.push('5. ALL .wav RESOURCES (Performance API — full session)');
    lines.push(hr2);
    if (resourceTimings.length > 0) {
        const resRows = resourceTimings.map(r => [
            r.name,
            (r.transferSize / 1024).toFixed(1) + 'KB',
            r.duration.toFixed(1),
        ]);
        table(['File', 'Transfer', 'Resource dur (ms)'], resRows);
        const totalTransfer = resourceTimings.reduce((s, r) => s + r.transferSize, 0);
        lines.push('');
        lines.push(`  Total .wav transferred: ${(totalTransfer / 1024).toFixed(1)}KB across ${resourceTimings.length} files`);
    } else {
        lines.push('  No .wav resources recorded by Performance API.');
    }
    lines.push('');

    // ── Section 6: Summary statistics ────────────────────────────────────
    lines.push('6. SUMMARY STATISTICS');
    lines.push(hr2);
    const allFetches = [...claveColdTimings.fetches, ...iyaColdTimings.fetches, ...addTrackTimings.fetches];
    const allDecodes = [...claveColdTimings.decodes, ...iyaColdTimings.decodes, ...addTrackTimings.decodes];

    if (allFetches.length > 0) {
        const fetchDurations = allFetches.map(f => f.duration);
        const decodeDurations = allDecodes.map(d => d.duration);

        lines.push(`  fetch() for .wav files:`);
        lines.push(`    Count:    ${fetchDurations.length}`);
        lines.push(`    Min:      ${Math.min(...fetchDurations).toFixed(1)} ms`);
        lines.push(`    Max:      ${Math.max(...fetchDurations).toFixed(1)} ms`);
        lines.push(`    Avg:      ${(fetchDurations.reduce((a, b) => a + b, 0) / fetchDurations.length).toFixed(1)} ms`);
        lines.push('');
        lines.push(`  decodeAudioData():`);
        lines.push(`    Count:    ${decodeDurations.length}`);
        lines.push(`    Min:      ${Math.min(...decodeDurations).toFixed(1)} ms`);
        lines.push(`    Max:      ${Math.max(...decodeDurations).toFixed(1)} ms`);
        lines.push(`    Avg:      ${(decodeDurations.reduce((a, b) => a + b, 0) / decodeDurations.length).toFixed(1)} ms`);
    } else {
        lines.push('  No timing data captured — hooks may not have intercepted calls.');
    }
    lines.push('');

    // ── Section 7: Loading strategy analysis ─────────────────────────────
    lines.push('7. LOADING & OFFLOADING STRATEGY ANALYSIS');
    lines.push(hr2);
    lines.push('');
    lines.push('  ┌─────────────────────────────────────────────────────────────────────────────┐');
    lines.push('  │  LOAD TRIGGERS — what action causes .wav files to be fetched + decoded     │');
    lines.push('  └─────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');
    lines.push('  ACTION                              WHAT IS LOADED                         WHERE IT IS CACHED');
    lines.push('  ─────────────────────────────────── ─────────────────────────────────────── ─────────────────────────────────────');
    lines.push('  App startup (app.js)                manifest.json only (instrument map,    dataLoader.manifest');
    lines.push('                                      rhythm paths). No audio loaded.');
    lines.push('');
    lines.push('  loadRhythm() → loadInstrumentsIn    - Instrument definitions (YAML) for    state.instrumentDefinitions[symbol]');
    lines.push('    Parallel()                        each track\'s instrument                audioEngine.buffers[symbol][letter]');
    lines.push('                                      - ALL .wav files for each track\'s');
    lines.push('                                        default sound pack (parallel fetch)');
    lines.push('                                      This is the FIRST audio load on app');
    lines.push('                                      start. All rhythm tracks are ready');
    lines.push('                                      to play immediately after.');
    lines.push('');
    lines.push('  Modal open →                       ALL instrument definitions (YAML)      state.instrumentDefinitions[symbol]');
    lines.push('    preloadInstrumentDefinitions()    — re-fetched every time (no-cache).     (overwrites, never evicted)');
    lines.push('                                      No audio loaded here.');
    lines.push('');
    lines.push('  Pack selected in modal →            Single .wav for the pack\'s first      audioEngine.previewBuffers[url]');
    lines.push('    handleSelectSoundPack()            letter ("O" preferred, else first).   (keyed by full URL, never evicted)');
    lines.push('      → playPackSound()              Fetched on first access; cached after.');
    lines.push('      → audioEngine.previewSound()   SUBSEQUENT clicks on same pack =');
    lines.push('                                      instant (cache hit, zero network).');
    lines.push('');
    lines.push('  Preview chip clicked →              Single .wav for that specific letter  audioEngine.previewBuffers[url]');
    lines.push('    handlePreviewSound()               Same path as pack selection above.');
    lines.push('      → playPackSound()');
    lines.push('      → audioEngine.previewSound()');
    lines.push('');
    lines.push('  Confirm instrument → addTrack()     ALL .wavs for the selected pack       audioEngine.buffers[symbol][letter]');
    lines.push('    → audioEngine.loadSoundPack()      (parallel fetch via Promise.all)     (SEPARATE from previewBuffers)');
    lines.push('                                      These go into the sequencer buffer');
    lines.push('                                      cache, used by playStroke() for');
    lines.push('                                      grid clicks + sequencer playback.');
    lines.push('');
    lines.push('  updateTrackInstrument()             ALL .wavs for the new pack            audioEngine.buffers[newSymbol][letter]');
    lines.push('    → audioEngine.loadSoundPack()      (same as addTrack)');
    lines.push('');
    lines.push('  Grid cell clicked →                 Nothing loaded. Uses buffers from     audioEngine.buffers[symbol][stroke]');
    lines.push('    playStrokeNow()                    addTrack() / loadRhythm().');
    lines.push('');
    lines.push('  Sequencer step →                    Nothing loaded. Uses same buffers.    audioEngine.buffers[symbol][stroke]');
    lines.push('    playStroke()');
    lines.push('');
    lines.push('');
    lines.push('  ┌─────────────────────────────────────────────────────────────────────────────┐');
    lines.push('  │  TWO CACHES — now bridged for the previewed letter                         │');
    lines.push('  └─────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');
    lines.push('  Cache 1: audioEngine.previewBuffers[url]');
    lines.push('    - Used by previewSound() in the instrument modal.');
    lines.push('    - Keyed by full WAV URL (e.g. "data/sounds/clave/CLV.clave.sg.lp.wav").');
    lines.push('    - Populated on-demand when a pack/chip is clicked for the first time.');
    lines.push('    - Also read by loadSoundPack() to avoid redundant fetch+decode.');
    lines.push('');
    lines.push('  Cache 2: audioEngine.buffers[symbol][letter]');
    lines.push('    - Used by playStroke() / playStrokeNow() for grid clicks + sequencer.');
    lines.push('    - Keyed by instrument symbol + uppercase stroke letter.');
    lines.push('    - Populated by loadSoundPack() during addTrack, updateTrackInstrument,');
    lines.push('      and loadRhythm. If the same URL exists in previewBuffers, the');
    lines.push('      decoded AudioBuffer is reused (no redundant fetch).');
    lines.push('');
    lines.push('  NOTE: Only the previewed letter (auto-played on pack selection) benefits');
    lines.push('  from the bridge. Other letters in the pack still require fresh fetch+decode.');
    lines.push('  To bridge all letters, preview ALL sounds when a pack is selected (not just');
    lines.push('  the first letter) — but this trades latency for bandwidth.');
    lines.push('');
    lines.push('');
    lines.push('');
    lines.push('  ┌─────────────────────────────────────────────────────────────────────────────┐');
    lines.push('  │  OFFLOADING / EVICTION — nothing is ever evicted                           │');
    lines.push('  └─────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');
    lines.push('  There is NO offloading or eviction anywhere in the codebase:');
    lines.push('');
    lines.push('  • previewBuffers{} — grows indefinitely, never cleared.');
    lines.push('  • buffers{}        — grows indefinitely, never cleared.');
    lines.push('  • state.instrumentDefinitions{} — grows indefinitely, never cleared.');
    lines.push('  • resetInstrumentGains() resets volume gain values to 1.0 but does NOT');
    lines.push('    touch the audio buffer caches.');
    lines.push('  • No LRU eviction, no max-size cap, no "memory pressure" handler.');
    lines.push('  • No WeakRef, no FinalizationRegistry, no manual cleanup.');
    lines.push('  • The ONLY way to free memory is a full page reload.');
    lines.push('');
    lines.push('  In a long session, every unique WAV URL visited (across all instruments,');
    lines.push('  packs, and the preview path) accumulates in memory permanently.');
    lines.push('');
    lines.push('');
    lines.push('  ┌─────────────────────────────────────────────────────────────────────────────┐');
    lines.push('  │  WHY THE DELAY IS PERCEIVED — root causes                                  │');
    lines.push('  └─────────────────────────────────────────────────────────────────────────────┘');
    lines.push('');
    lines.push('  1. cache: "no-store" on every fetch() in dataLoader._fetchYaml() and');
    lines.push('     audioEngine.previewSound(). The browser HTTP cache is bypassed. Only');
    lines.push('     the in-memory caches (previewBuffers, buffers) prevent re-fetch.');
    lines.push('     First visit to any WAV always hits the network, even on localhost.');
    lines.push('');
    lines.push('  2. decodeAudioData() is CPU-bound and synchronous on the audio thread.');
    lines.push('     For clave (~65-208KB WAV) it is fast (~5-15ms). For Bata drums');
    lines.push('     (~200KB-1.1MB WAV) it is significantly slower (~20-100ms).');
    lines.push('');
    lines.push('  3. Pack selection auto-plays the first letter. Clicking through 8 packs');
    lines.push('     rapidly = 8 sequential fetch+decode cycles on first visit. Each');
    lines.push('     previewSound() is async but does NOT cancel the previous one —');
    lines.push('     multiple can overlap, queuing decodeAudioData calls.');
    lines.push('');
    lines.push('  4. Partial double-load on confirm: the previewed letter is reused from');
    lines.push('     previewBuffers, but other letters in the pack still require fresh');
    lines.push('     fetch+decode. This is a trade-off: pre-loading all letters on pack');
    lines.push('     selection would eliminate the remaining latency but waste bandwidth');
    lines.push('     if the user switches packs before confirming.');
    lines.push('');
    lines.push('  5. No preloading: nothing warms the buffer cache in advance. The full');
    lines.push('     fetch+decode cost is paid on first interaction with each instrument.');
    lines.push('');
    lines.push(hr);
    return lines.join('\n');
}
