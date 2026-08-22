# Testing: E2E Browser Tests (Playwright)

Percussion Studio's automated testing is a **Playwright E2E suite**. This is the **only** place where Node.js/npm is allowed — everything else in the project is vanilla JS + Python.

## 1. Scope & Constraint

| Rule | Detail |
|---|---|
| **Node.js is test-only** | Node.js/npm exist **only inside `tests/`** (its own `package.json`). The app runtime, `data/`, `tools/`, and the deployed site never use Node. |
| **Python starts the app** | `python launch_local.py` remains the app launcher for manual development. The test runner uses a **test-only server, `tests/test_launch_local.py`**, as Playwright's `webServer`. |
| **No Node in CI/deploy** | GitHub Pages serves static files only; tests are a dev-only tool. |

## 2. The two launch scripts

`launch_local.py` (repo root, app tooling) and `tests/test_launch_local.py` (test-only) are kept in sync under two hard rules:

1. **If a change is done in `launch_local.py`, it shall be done as well in `tests/test_launch_local.py`.**
2. **If a fix for a test is done in `tests/test_launch_local.py`, it shall NOT be ported to `launch_local.py`.**

The test server deliberately differs on test-only concerns: it sets `SO_REUSEADDR` and serves requests in threads (so the test runner can stop/restart it repeatedly without "Address already in use"), keeps its log quiet, and serves the repo root relative to its own path.

## 2. Prerequisites (one-time)

1. Install Node.js 22 (Node 18 is EOL). User-level, no sudo:

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   # reopen the shell, then:
   nvm install 22
   ```

2. Install the Playwright test runner + Chromium browser:

   ```bash
   cd tests
   npm install
   npx playwright install chromium
   # if system libraries are missing on a headless box (needs sudo):
   sudo npx playwright install --with-deps chromium
   ```

Where things live: node binary in `~/.nvm` (user-wide), npm packages only in `tests/node_modules` (gitignored), browser binaries in `~/.cache/ms-playwright` (shared cache).

## 3. Running the suite

```bash
bash tests/run_e2e_tests.sh
```

The runner sources nvm, then runs `npm test` in `tests/`. Playwright starts `python tests/test_launch_local.py` (port 8000) itself via `webServer` (or reuses a server you already have on port 8000, including a manually running `python launch_local.py`).

Run a single file/line:

```bash
cd tests
npx playwright test desktop
npx playwright test mobile-portrait
npx playwright test e2e/mobile-pwa-portrait.spec.js
```

## 4. What is covered

Six projects, one test each:

| Project | Viewport / device | Spec |
|---|---|---|
| `desktop` | chromium 1280×800 | `e2e/desktop.spec.js` — grid renders, play/stop toggles state; regression pins: static playhead parks in the paused measure across re-renders, new-rhythm clears any active solo, track removal reconciles `soloTrack`, BPM-override flips the timeline tempo badge immediately. |
| `mobile-portrait` | iPhone 16, Safari-like **393×659** | `e2e/mobile-portrait.spec.js` — portrait control surface, toggles play; regression pin: random-reps dice toggle writes the canonical `randomRepetitions` field (sequencer + templates read it) and the 🎲 badge appears. |
| `mobile-landscape` | iPhone 16, Safari-like **734×343** | `e2e/mobile-landscape.spec.js` — landscape read-only grid, toggles play. |
| `mobile-landscape-playhead` | iPhone 16, Safari-like **734×343** | `e2e/playhead-loop.spec.js` — playback-loop regression for the transport stream contract: playhead visible on every step across loop boundaries (incl. last column of the last measure), zero full rebuilds during steady playback, count-in chip ticks via targeted updates. |
| `mobile-pwa-portrait` | iPhone 16, full-screen **393×852** | `e2e/mobile-pwa-portrait.spec.js` — full viewport + Dynamic Island insets. |
| `mobile-pwa-landscape` | iPhone 16, full-screen **852×393** | `e2e/mobile-pwa-landscape.spec.js` — full viewport + Dynamic Island insets. |

Screenshots are written to `tests/test-results/` (gitignored) on demand and on failure.

### Bug-fix procedure

Every bug fix ships with a regression test — the cycle is mandatory (also in AGENTS.md §7):

1. Detect the bug reading the code.
2. Write the failing E2E test first.
3. Run it and confirm it fails **for the expected reason** (real presence of the bug).
4. Fix minimally.
5. Re-run to green, then run the full suite before finishing.

If step 3 shows the test already passes, the defect is latent: still fix the code, and ship the test as an invariant pin. Tests may reach into app modules directly via dynamic `import()` inside `page.evaluate` (same module instances the app uses — see the `playback`/`state` assertions pattern).

### iPhone 16 device

Playwright 1.60 ships no `iPhone 16` descriptor, so `tests/playwright.config.js` defines one: `393×852` CSS px @3x, `isMobile`, `hasTouch`, iPhone OS 18 UA. Each project sets its own viewport.

### Safari vs. PWA full screen ("more screen")

In Safari the visible web viewport is smaller (browser chrome): **393×659** portrait, **734×343** landscape. In PWA standalone mode the app gets the **full physical size**: **393×852** / **852×393** — same as Chrome DevTools' iPhone emulation.

### Dynamic Island simulation

`tests/e2e/helpers/safeArea.js` calls the Chromium CDP command **`Emulation.setSafeAreaInsetsOverride`**, which makes `env(safe-area-inset-*)` resolve to simulated values. This covers both the app's `--safe-area-*` CSS variables (`mobile.html`) and the raw `env()` usages in `js/ui/mobile/dual-mode/portrait.js`.

Approximate iPhone 16 insets (configurable constants in `safeArea.js`):

| Orientation | Top | Bottom | Left | Right |
|---|---|---|---|---|
| portrait | 59 | 34 | — | — |
| landscape | — | — | 59 | 59 |

If the CDP command is unavailable, the helper falls back to overriding the `--safe-area-*` variables via an init script (covers variable-based styles only).

**Limitation:** the E2E suite approximates PWA standalone. Final safe-area and gesture verification must still be done on a real iPhone in PWA mode (see AGENTS.md) — behavior there differs from the emulation.

## 5. Interactive inspection via opencode MCP

`opencode.json` registers the official **Playwright MCP** (`npx -y @playwright/mcp@latest`). After restarting opencode, the agent can:

- navigate to `http://localhost:8000/?mode=desktop` / `mobile.html`,
- click, type, scroll, read the DOM, and take screenshots that are returned as images.

Use it to inspect the running app interactively during development (mirrors the same Chromium engine and iPhone emulation the suite uses).

## 6. Adding a test

1. Put specs in `tests/e2e/`. Common selectors: `[data-action="toggle-play"]`, `[data-action="stop"]`, `#grid-container`, `#dual-mode-landscape-header`. Dual-mode renders both orientations in the DOM, so use `:visible` (e.g. `[data-action="toggle-play"]:visible`) to target the active one.
2. One spec file per project/config; add the matching `project` entry (with its viewport/device) in `tests/playwright.config.js` and point its `testMatch` at the new file.
3. For PWA/safe-area checks, reuse `applySafeAreaOverride`, `IPHONE_16_SAFE_AREAS`, `readCssVar`, `expectInsetPadding` from `helpers/safeArea.js`.
4. Keep screenshots in `test-results/` (gitignored), never commit them.
5. Run the suite (section 3) and confirm it passes before finishing.

## 7. Troubleshooting

- **`WebServer` fails to start** → check port 8000 is free, or that `python tests/test_launch_local.py` runs from the repo root (the config sets `webServer.cwd = '..'`).
- **CDP safe-area override not applied** → the spec navigates after applying the override; if Chromium is too old, the fallback path logs `[SafeArea] CDP override unavailable...` and applies CSS-variable overrides only.
- **Both portrait and landscape buttons match** → use the `:visible` pseudo-selector (see section 6).
