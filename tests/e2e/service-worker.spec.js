/**
 * tests/e2e/service-worker.spec.js
 *
 * Service worker regression suite (project `service-worker`, Chromium with
 * serviceWorkers: 'allow'). Covers docs/requirements/offline-updates.md:
 *
 *  1. sw.js installs the generated snapshot (precache.json), aligns the
 *     running page with a one-time reload, and serves the whole app —
 *     shell, data (YAML/WAV) — with the network offline.
 *  2. A simulated deploy (tests/test_launch_local.py serves a mutated
 *     precache version) is swapped in atomically; the app reloads only when
 *     playback is idle, never mid-session.
 *
 * `?sw=1` forces registration on localhost (skipped by default there).
 */

const { test, expect } = require('@playwright/test');

const APP_URL = '/mobile.html?sw=1';

const trackNavigations = (page) => page.addInitScript(() => {
    const count = parseInt(sessionStorage.getItem('__navCount') || '0', 10) + 1;
    sessionStorage.setItem('__navCount', String(count));
});

// Tolerates mid-reload context destruction: returns 0 so expect.poll retries.
const navCount = (page) => page.evaluate(
    () => parseInt(sessionStorage.getItem('__navCount') || '0', 10)
).catch(() => 0);

const waitForSnapshot = (page) => page.waitForFunction(async () => {
    const keys = await caches.keys();
    return keys.some((key) => key.startsWith('ps-v'));
}, null, { timeout: 90000 });

const waitForControlled = (page) => page.waitForFunction(
    () => !!navigator.serviceWorker.controller, null, { timeout: 30000 }
);

test('service worker installs the snapshot and serves the app offline', async ({ page, context, request }) => {
    await request.post('/__test/version', { data: { version: null } });
    await trackNavigations(page);

    await page.goto(APP_URL);
    await expect(page.locator('#dual-mode-landscape-header')).toBeVisible({ timeout: 20000 });
    await waitForControlled(page);
    await waitForSnapshot(page);

    // The first verified snapshot aligns the running page with one reload
    // (deferred until idle, which it is here).
    await expect.poll(() => navCount(page), { timeout: 60000 }).toBeGreaterThanOrEqual(2);
    await expect(page.locator('#dual-mode-landscape-header')).toBeVisible({ timeout: 20000 });

    // Offline: shell, rhythm YAML and a WAV all come from the snapshot.
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#dual-mode-landscape-header')).toBeVisible({ timeout: 20000 });

    const offlineAssets = await page.evaluate(async () => {
        const check = async (url) => {
            try {
                return (await fetch(url)).ok;
            } catch {
                return false;
            }
        };
        return {
            manifest: await check('manifest.json'),
            yaml: await check('data/rhythms/Clave/2-3_son_clave.yaml'),
            wav: await check('data/sounds/clave/CLV.clave.sg.clave.wav'),
        };
    });
    expect(offlineAssets).toEqual({ manifest: true, yaml: true, wav: true });

    await context.setOffline(false);
});

test('a new version swaps atomically and reloads only when playback is idle', async ({ page, request }) => {
    await request.post('/__test/version', { data: { version: null } });
    await trackNavigations(page);

    await page.goto(APP_URL);
    await expect(page.locator('#dual-mode-landscape-header')).toBeVisible({ timeout: 20000 });
    await waitForControlled(page);
    await waitForSnapshot(page);
    await expect.poll(() => navCount(page), { timeout: 60000 }).toBeGreaterThanOrEqual(2);
    await expect(page.locator('#dual-mode-landscape-header')).toBeVisible({ timeout: 20000 });
    const settledNavigations = await navCount(page);

    // Pretend playback is active: the swap must not reload the page.
    await page.evaluate(async () => {
        const { state } = await import('/js/store.js');
        state.isPlaying = true;
    });

    // Simulated deploy + forced update check.
    await request.post('/__test/version', { data: { version: 'e2e-swap-version' } });
    await page.evaluate(() => navigator.serviceWorker.controller.postMessage({ type: 'ps-check-update' }));

    // The new snapshot is verified and active while the session keeps running.
    await expect.poll(
        () => page.evaluate(async () => (await caches.keys()).some((key) => key.includes('e2e-swap-version'))),
        { timeout: 90000 }
    ).toBe(true);
    expect(await navCount(page)).toBe(settledNavigations);

    // Idle again: the deferred reload runs and the new version takes over.
    await page.evaluate(async () => {
        const { state } = await import('/js/store.js');
        const { eventBus } = await import('/js/services/eventBus.js');
        state.isPlaying = false;
        eventBus.emit('render');
    });
    await expect.poll(() => navCount(page), { timeout: 30000 }).toBeGreaterThanOrEqual(settledNavigations + 1);

    // After the reload the new snapshot is what the worker serves.
    const activeAssetCount = await page.evaluate(async () => {
        const keys = await caches.keys();
        const name = keys.find((key) => key.includes('e2e-swap-version'));
        if (!name) return 0;
        const cache = await caches.open(name);
        return (await cache.keys()).length;
    });
    expect(activeAssetCount).toBeGreaterThan(100);
});
