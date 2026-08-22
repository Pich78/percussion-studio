# Project Constraints

This document captures the technical and architectural constraints of the Percussion Studio project. Follow these when making changes or adding features.

---

## 1. Technology Stack

| Constraint | Details | Source |
|-----------|---------|--------|
| **Vanilla JavaScript** | No frameworks (React, Vue, Angular, etc.). No build step, no bundlers, no `package.json` in the app runtime. | `AGENTS.md:3` |
| **ES Modules** | All JS files use native ES module syntax (`import`/`export`) loaded via `<script type="module">`. | `AGENTS.md:3` |
| **No npm ecosystem (app)** | The app itself has no `package.json`, no `node_modules`, no package manager. The deployed site must never contain a Node artifact. | `AGENTS.md:3` |
| **Automated tests (Playwright)** | Node.js/npm are allowed **only inside `tests/`** to run the Playwright E2E suite (dev-only). Everything else stays Python/browser-only. See `docs/testing.md`. | `AGENTS.md:3` |

| **No Node.js in the app** | Node.js must not be used by the application, its data tooling, or deployment — only by the Playwright E2E tests under `tests/`. The only runtime dependency outside the browser is Python (manifest generation, local server). | `AGENTS.md:3`, explicit project rule |

### Allowed External Dependencies (loaded from CDN)

| Library | Version | Source | Purpose |
|---------|---------|--------|---------|
| js-yaml | 4.1.0 | `cdnjs.cloudflare.com` | YAML parsing |
| Tailwind CSS | latest (play CDN) | `cdn.tailwindcss.com` | CSS utility framework |
| mobile-select | latest | `cdn.jsdelivr.net/npm/mobile-select` | Mobile picker UI |

These are loaded as regular `<script>` tags in `mobile.html` and `desktop.html`, **not** as ES module imports.

---

## 2. Architecture Patterns

| Pattern | Rule | Source |
|---------|------|--------|
| **Event handling** | Event delegation via `data-action` attributes on HTML elements. Handlers match on `e.target.closest('[data-action]')`. | `AGENTS.md:39-46` |
| **State management** | All state changes go through `commit(mutationName, payload)` for traceability. Mutations are registered in `js/store/mutations.js`. | `AGENTS.md:49-52`, `js/store.js:12` |
| **State shape** | Application state lives in the `state` object (`js/store.js:23`). Playback runtime state lives in the separate `playback` object (`js/store.js:103`). | `js/store.js` |
| **Components** | Functions returning template strings with `data-action` attributes. No JSX, no virtual DOM. | `AGENTS.md:31-37` |
| **Rendering** | Views registered via `viewManager.registerView()`. The active view's `render()` function produces the full DOM string. Re-renders replace the entire `#root` innerHTML. | `js/app.js:21-23` |
| **Repaint policy** | Engine code (actions, services) never emits view repaints based on gesture state. Actions mutate state, drive the audio engine, and return transition info (e.g. `{ muteChanged }`); the events/UI layers decide when to emit `render` / `grid-refresh`. Drag ticks suppress repaints by construction — no flags (see `js/ui/pointerDrag.js`, `js/actions/mixerActions.js`). | `AGENTS.md` (Dependency direction) |
| **Transport stream** | During playback the sequencer emits ordered `transport` events only — it never emits `render`. The renderer reconciles section transitions from `payload.sectionId` (rebuild synchronously before drawing the incoming playhead; same-section wraps never rebuild). Full contract: `docs/requirements/playback-events.md`. | `js/services/sequencer.js`, `js/ui/renderer.js` |
| **Template binding rule** | Templates bind only user-action state (mix, mute, section settings) which always re-renders synchronously. Live playback state (playhead position, rep counters, live BPM, count-in phase) must never appear in templates — it reconciles exclusively via transport-driven targeted DOM updates (`js/ui/playheadUtils.js`). A template reading live playback state is a defect: its value freezes until an unrelated render. | `docs/requirements/playback-events.md:4` |
| **CSS** | Tailwind utility classes. Custom CSS is minimal and lives in `<style>` tags in HTML files. | `AGENTS.md:75` |
| **Naming** | Files: `kebab-case.js`. Functions: `camelCase`. Constants: `PascalCase`. CSS classes: `kebab-case`. | `AGENTS.md` |
| **Orientation layouts** | Mobile uses `portrait:`/`landscape:` Tailwind prefixes. Complex views may live in separate files under `js/ui/mobile/dual-mode/`. | `AGENTS.md:84-87` |
| **Logging** | Prefix console logs with feature name in brackets: `console.log('[MyFeature] message')`. | `AGENTS.md` |

---

## 3. Data Layer

| Constraint | Details | Source |
|-----------|---------|--------|
| **No server-side logic** | The application is entirely static files. All data is loaded via `fetch()` using a `manifest.json` registry. | `docs/data-specifications.md` |
| **Data format** | Instrument definitions in YAML under `data/instruments/`; sounds are convention-driven WAV files under `data/sounds/{instrument-name}/` (`{SYMBOL}.{sound}.{pack}.wav`). Rhythms in YAML under `data/rhythms/`. | `README.md`, `docs/data-specifications.md` |
| **Manifest** | `manifest.json` at project root is the central resource registry, auto-generated by `tools/generate_manifest.py`. | `docs/data-specifications.md` |
| **Python dependency** | `tools/generate_manifest.py` requires Python with `pyyaml`. This is the only non-JS dependency. | `README.md` |

---

## 4. PWA / Mobile Constraints

| Constraint | Details | Source |
|-----------|---------|--------|
| **PWA mode** | App runs as a PWA on iOS via `apple-mobile-web-app-capable: yes`. Test in standalone mode on real iPhone. E2E tests approximate standalone via a full-screen viewport + CDP safe-area injection (`Emulation.setSafeAreaInsetsOverride`). | `mobile.html:132-135`, `AGENTS.md:8`, `docs/testing.md` |
| **Safe areas** | Use `env(safe-area-inset-*)` CSS functions for iPhone notch/home indicator. Example: `pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]`. | `AGENTS.md:80-82` |
| **Gesture prevention** | Add `touch-action: none` to interactive elements (sliders, drag handles) to prevent iOS scroll/zoom/pull-to-refresh. | `AGENTS.md:87-97` |
| **Tap delay** | Use `touch-action: manipulation` on buttons and `[data-action]` elements to remove 300ms tap delay. | `mobile.html:88-92` |
| **Pinch-zoom prevention** | Use `touch-action: pan-x pan-y` on grid containers. | `mobile.html:84-86` |
| **Tap highlight** | `-webkit-tap-highlight-color: transparent` on all elements. | `mobile.html:95-97` |

---

## 5. Development Workflow

| Constraint | Details | Source |
|-----------|---------|--------|
| **Local server** | Run `python launch_local.py` (starts HTTP on port 8000, auto-generates manifest). Add `--verbose` to log every HTTP request. | `README.md:35-42` |
| **E2E tests** | Run `bash tests/run_e2e_tests.sh` (Node only inside `tests/`). The runner starts/stops `tests/test_launch_local.py` as the web server. Rule: changes to `launch_local.py` must be mirrored in `tests/test_launch_local.py`; test-only fixes there are NOT ported back. See `docs/testing.md`. | `docs/testing.md` |
| **Caching** | All data fetches use `cache: 'no-store'` (manifest, YAML, Batà metadata). `desktop.html` and `mobile.html` carry no-cache meta tags. Data freshness is hardcoded — there is no dev/prod config flag. | `js/services/dataLoader.js` |
| **Manifest regeneration** | Run `python3 tools/generate_manifest.py` after any data file changes. | `README.md`, `docs/adding-instruments.md` |
| **Deployment** | Deployed to GitHub Pages at `https://pich78.github.io/percussion-studio/`. | `AGENTS.md:7` |

---

## 6. Code Quality

| Constraint | Details | Source |
|-----------|---------|--------|
| **Error handling** | Wrap async operations in try/catch. Use `console.error('[FeatureName] Error:', error)` pattern. | `AGENTS.md` |
| **Imports** | Relative paths for all local imports. One import per line. Group: external types first, then local modules. | `AGENTS.md` |
| **Types** | Define as `Object.freeze({...})` objects. Export from `js/types.js`. | `AGENTS.md`, `js/types.js` |

---

## 7. Feature-Specific Limitations (referenced in requirements docs)

| Feature | Limitation | Source |
|---------|-----------|--------|
| **Section Play Mode** | Once/adlib/skip modes are runtime-only. Not persisted to YAML. Export reverts to default 'loop'. | `docs/requirements/section-play-mode.md:177-178` |
| **Tempo Acceleration** | Applied as compound multiplication at repetition boundaries. Clamped to [40, 240] BPM range. | `docs/requirements/tempo-acceleration.md` |
| **Mute/Solo** | Mute and Solo are mutually exclusive on a track. Only one track can be soloed at a time. | `docs/requirements/mute-solo-spec.md:17` |
| **BPM** | `playback.currentPlayheadBpm` is the single source of truth. `userHasOverriddenBpm` flag controls section override behavior. | `docs/requirements/bpm-behavior.md` |
