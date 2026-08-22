# AGENTS.md - Percussion Studio Developer Guide

## 1. Project Overview

Percussion Studio is a **browser-based percussion sequencer** for Afro-Cuban rhythms (Batá, congas, and beyond). It runs entirely in the browser: **vanilla JavaScript with ES modules**, no frameworks, no build step, no package manager. Content (instruments, sound packs, rhythms) is authored as YAML files under `data/` and discovered through an auto-generated `manifest.json`.

The app has two frontends that share the same core engine:

- **Desktop** (`desktop.html`) — full editing: grid painting, sections, measures, tracks, mixer.
- **Mobile** (`mobile.html`) — playback and practice: read-only grid (landscape) plus a control surface (portrait), optimized for iPhone PWA.
- `index.html` redirects to one of the two based on device detection or `?mode=desktop` / `?mode=mobile`.

**Live deployment**: https://pich78.github.io/percussion-studio/ (GitHub Pages).

---

## 2. Hard Constraints

Non-negotiable rules — do not introduce anything that violates them.

| Constraint | Rule |
|---|---|
| **Language** | Vanilla JavaScript + ES modules (`import`/`export`) loaded via `<script type="module">`. |
| **No tooling (app)** | The app itself has no npm, no `package.json`, no bundlers, no Node.js. The deployed site must never contain a Node artifact. |
| **Node only for E2E tests** | Node.js/npm are allowed **only inside `tests/`** to run Playwright browser tests (dev-only). Nothing else may use Node — see `docs/testing.md`. |
| **No frameworks** | No React/Vue/Angular or similar. UI is template strings + direct DOM. |
| **Python only for app tooling** | `tools/generate_manifest.py` (requires `pyyaml`) and `launch_local.py` are the only non-browser runtimes for the app. |
| **Content data** | YAML under `data/`, registered in `manifest.json` (auto-generated — regenerate after data changes). |
| **PWA behavior** | Must prevent native browser gestures (`touch-action` rules) and respect iPhone safe areas — see Conventions. |
| **Docs stay in sync** | Any change in program behavior requires a documentation update in the same change. Any structural change to the software requires a new document or an update of the existing ones (see Documentation Map and How to Work Here). |

---

## 3. Architecture: Shared Core, Multiple UIs

The key architectural idea: **the core engine (audio, playback, mixing, data) is UI-agnostic**. The desktop editor, classic mobile grid, and mobile dual-mode are all thin frontends over the same engine.

### Data flow at a glance

```
data/*.yaml  →  manifest.json  →  dataLoader  →  state.toque
                                                       ↓
user gesture → [data-action] → events/* router → handlers/* → actions/* → commit() → state
                                                       ↓
eventBus ('render') → viewManager.getActiveView().layout() → string → #root.innerHTML

sequencer (audio clock) → eventBus ('transport', ordered facts) → renderer reconciles → targeted DOM updates
```

### Layer map

| Layer | Location | Role |
|---|---|---|
| **Bootstrap** | `js/app.js` | Registers views in the view manager, loads manifest + Batá metadata, loads the default rhythm (`manifest.default_rhythm`, overridable via `?rhythm=`). |
| **State** | `js/store.js` | `state` (persistent app data: `toque`, `mix`, `soloTrack`, `uiState`, ...) and `playback` (runtime: `currentPlayheadBpm`, `repetitionCounter`, ...). All changes go through `commit(name, payload)` → `store/mutations.js`. Read helpers in `store/stateSelectors.js`. |
| **Actions** | `js/actions/` | The only write paths for state (e.g., `loadRhythm`, `setMixVolume` / `setMixMuted`, `toggleTrackMute` / `toggleTrackSolo` / `resetMix`). |
| **Core services** | `js/services/` | UI-agnostic singletons: |
| | `audioEngine.js` | Web Audio graph: `source → noteGain (dynamics) → instrumentGain (state.mix volume) → masterGain`. |
| | `sequencer.js` | Playback state machine: `togglePlay()` / `stopPlayback()`, scheduling, section transitions, play modes, tempo acceleration. Emits ordered `transport` events; never emits `render` during playback. |
| | `trackMixer.js` | Mute/solo read-model — getters over `state.soloTrack` + `state.mix`; write paths live in `actions/mixerActions.js` (`toggleTrackMute` / `toggleTrackSolo` / `resetMix`). |
| | `dataLoader.js` | Fetches manifest + YAML with `cache: 'no-store'` (fresh data always). |
| | `eventBus.js` | Carries `transport`, `render`, `grid-refresh`, `scroll-to-measure`. |
| **Events** | `js/events/` | Action routers (`desktopEvents.js`, `mobileEvents.js`) delegate by `data-action` name to `events/handlers/*`. |
| **Components** | `js/components/` | Shared template-string functions returning HTML with `data-action` attributes (grid, timeline, modals, pie menu, ...). |
| **UI layouts** | `js/ui/` | Renderer (`renderer.js`), view-specific layout modules (`ui/desktop/`, `ui/mobile/standard/`, `ui/mobile/dual-mode/`), playback DOM updates (`ui/playheadUtils.js`), unified slider drag machinery (`ui/pointerDrag.js`, shared visuals in `ui/sliderVisuals.js`). |
| **Views** | `js/views/` | Registered view definitions (`desktopEditorView`, `mobileGridView`, `mobileDualModeView`) — each provides `layout()`, `setupEvents()`, `onTransport()`. |
| **Constants** | `js/types.js`, `js/constants.js` | Frozen enums (`StrokeType`, `DynamicType`, `PlayMode`), instrument colors. |

### Dependency direction

Imports flow one way only: **the engine side (`store`, `actions`, `services`) must never import from the UI side (`events`, `components`, `views`, `ui`).** UI code may import engine modules freely (e.g., layouts subscribing to `eventBus`, interaction modules like `ui/pointerDrag.js` emitting on it). When an engine module needs to reach the UI, it emits on the `eventBus` instead of importing UI code — this keeps every module under `js/services/` loadable without a DOM.

The same one-way rule governs repaints: **engine modules must never gate or trigger view updates from gesture state.** Actions mutate state and drive the audio engine only, returning transition info (e.g., `setMixVolume` → `{ muteChanged }`); the interaction layer owns repaint cadence — drag ticks never refresh mid-drag (a single reconciling refresh fires on release), discrete gestures refresh explicitly.

### Rendering model

Renders are **full-page replacements**: the active view's `layout()` returns the entire DOM string, written to `#root.innerHTML`. Because of this:

- Keep layout functions pure, derived from `state` / `playback`.
- `renderer.js` already preserves focus and scroll position across re-renders — don't re-implement that.
- For small updates (slider values, playhead, mute visuals) prefer targeted DOM updates (`playheadUtils.js`) or `grid-refresh` over a full `render`.
- **`grid-refresh` scope caveat**: it rebuilds only `#grid-container`. Surfaces outside it (dual-mode views, mixer/BPM modals) and template-bound styling (muted/solo graying) reconcile only on full `render` — which is why volume/BPM gestures emit `render` on release or via the repaint throttle.

### Playback visuals and the transport stream

During playback the sequencer emits ordered `transport` events and **never
emits `render`**. `renderer.js` consumes them: count-in facts (`phase:
'countin'`) become targeted chip updates; playing facts (`phase: 'playing'`)
are reconciled by section — if `payload.sectionId` differs from what is on
screen, a full rebuild runs synchronously *before* forwarding to the active
view's `onTransport()`, which updates the DOM in place via
`js/ui/playheadUtils.js` (`updateVisualStep`, `scrollToMeasure`, `updateBpmUi`,
`updateVolumeUi`, `updateCountInUi`). Same-section repetition wraps never
rebuild. The full contract (event schema, binding rule, rationale) lives in
`docs/requirements/playback-events.md`.

**Binding rule**: templates bind only user-action state (mix, mute, section
settings) which always re-renders synchronously; live playback state (playhead,
rep counters, live BPM, count-in phase) must never appear in templates — it
reconciles exclusively via transport-driven targeted updates.

### Mobile specifics

- The default mobile view is **Dual Mode** (`js/views/mobileDualModeView.js`): landscape = read-only grid + chip bar (BPM / Mixer / Section); portrait = control surface.
- Mobile grids render with `readOnly: true` — grid editing is desktop-only.
- **Fork rule**: shared components stay generic. Dual-mode variants are forks living under `js/ui/mobile/dual-mode/` (e.g., `dualModeTrackRow.js` forks `components/grid/trackRow.js`) — do not modify the shared file for dual-mode concerns.

---

## 4. How to Work Here

### Add a UI feature
1. Render the control in the relevant component/layout with a `data-action` attribute.
2. Register the action name in the appropriate router (`js/events/desktopEvents.js` and/or `js/events/mobileEvents.js`) or a shared `js/events/handlers/` module.
3. Implement state changes through an action (`js/actions/`) + `commit()` mutation — keep `state` (and `state.mix`) as the single source of truth.
4. Emit `eventBus.emit('render')` (or `grid-refresh` for grid-only updates).

### Change behavior
- First read the relevant spec in `docs/requirements/` (BPM, play modes, mute/solo, tempo acceleration, default rhythm) — these define expected behavior precisely.
- Implement, then **keep the spec in sync** if behavior intentionally changes.

### Change content data
1. Edit the YAML under `data/` (follow `docs/data-specifications.md` formats) or drop WAV files following the naming convention (`{SYMBOL}.{sound}.{pack}.wav` — see `docs/adding-instruments.md`).
2. Regenerate the manifest: `python3 tools/generate_manifest.py` (or `cd tools && python3 generate_manifest.py`).
3. Test with `python3 launch_local.py` (it regenerates the manifest automatically).

### Add a view
- Create a definition under `js/views/` (see `viewManager.js` for the required interface: `id`, `layout`, `setupEvents`, optional `onTransport` / `onRender`).
- Register it in `js/app.js` and set it as active for the target platform.

### Keep docs in sync (mandatory)
Documentation updates are part of the change, not an afterthought:

- **Behavior change** → update the relevant spec and user guides in the same commit/change: `docs/requirements/*` for engine behavior, `docs/user-guide-*.md` (EN + IT) for user-visible behavior.
- **Structural change** (new module, new view, new layer, changed architecture) → update `docs/project-constraints.md` and/or `AGENTS.md`, or create a new document if none fits.
- **Data format change** → `docs/data-specifications.md`.
- If the change has no existing document that covers it, **create a new one**.

---

## 5. Documentation Map

| Doc | Contents |
|---|---|
| `docs/data-specifications.md` | YAML formats (instruments, rhythms), WAV naming convention, pattern/dynamics syntax, manifest structure. |
| `docs/adding-instruments.md` | Step-by-step guide for adding a new instrument and running the generator. |
| `docs/symbol-design.md` | Symbol design philosophy: bouba/kiki effect, shape grammar, color language, extensibility rules. |
| `docs/project-constraints.md` | Technology stack, architecture patterns, PWA constraints, development workflow. |
| `docs/testing.md` | E2E browser tests (Playwright): scope (Node only in `tests/`), how to run, iPhone 16 / PWA / Dynamic Island simulation. |
| `docs/requirements/playback-events.md` | Transport stream contract: ordered playback events, renderer reconciliation, template binding rule. |
| `docs/requirements/default-rhythm.md` | Default rhythm configuration + `?rhythm=` URL override. |
| `docs/requirements/bpm-behavior.md` | BPM system: `playback.currentPlayheadBpm` as single source of truth, section overrides. |
| `docs/requirements/tempo-acceleration.md` | Per-repetition tempo acceleration (`tempo_acceleration`). |
| `docs/requirements/mute-solo-spec.md` | Mute/solo state machine (mutually exclusive, one solo at a time). |
| `docs/requirements/section-play-mode.md` | Section play modes: loop, play-once, ad-lib, skip; random repetitions. |
| `docs/user-guide-desktop-{en,it}.md` | Desktop user guides. |
| `docs/user-guide-mobile-{en,it}.md` | Mobile user guides. |

---

## 6. Conventions

### File headers
Every JS file starts with a comment: path + one-line description.

```javascript
/**
 * js/path/to/file.js
 *
 * Brief description of what this file does.
 */
```

### Imports
Relative paths (`../` for siblings, `../../` for grandparents); one import per line; external types first, then local modules.

### Naming

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `mobileEvents.js` |
| Functions | camelCase | `renderLandscape()` |
| Constants | PascalCase | `StrokeType` |
| State keys | camelCase | `isPlaying` |
| CSS classes | kebab-case | `bg-gray-900` |

### Components
Functions returning template strings with `data-action` attributes — no JSX, no virtual DOM.

```javascript
export const MyComponent = ({ prop1 }) => `
    <div class="component">
        <span>${prop1}</span>
        <button data-action="my-action">Click</button>
    </div>
`;
```

### State mutations
All state changes go through `commit(mutationName, payload)`; mutations are registered in `js/store/mutations.js`.

### Constants
Define enums as `Object.freeze({...})` and export from `js/types.js`.

### Error handling
Wrap async operations in try/catch; log with `console.error('[FeatureName] Error:', error)`.

### Logging
Prefix console messages with the feature name: `console.log('[MyFeature] message')`.

### CSS
Tailwind utility classes; custom CSS is minimal and lives in `<style>` tags in the HTML files.

### Common patterns
- **Modal**: conditional render gated by `state.uiState` flags — render `''` when closed, a fixed overlay + `data-action="close-modal"` when open.
- **Orientation-specific layouts**: use Tailwind's `portrait:` and `landscape:` prefixes; put complex views in separate files under `js/ui/mobile/dual-mode/`.

### PWA: safe areas (iPhone)
Use `env(safe-area-inset-*)` for notch/home-indicator avoidance, e.g. `pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]`. Test in PWA (standalone) mode on a real iPhone — behavior differs from Safari.

### PWA: gesture prevention (critical)
Always add `touch-action: none` to interactive elements (range sliders, custom drag surfaces) so iOS Safari doesn't hijack touches for scroll, zoom, or pull-to-refresh.

---

## 7. Verification

- **Every bug fix ships with a regression test.** The standing cycle: detect the bug reading the code → write the failing E2E test → run it and confirm it fails for the expected reason (real presence of the bug) → fix minimally → re-run to green → full suite green before finishing. If the test cannot be made to fail, the defect is latent: still fix the code, and ship the test as an invariant pin.
- Run `python launch_local.py` (regenerates the manifest and serves on port 8000). Add `--verbose` to log every HTTP request — useful for debugging data loading.
- After content changes: `cd tools && python generate_manifest.py`.
- Test both frontends: `index.html?mode=desktop` and `index.html?mode=mobile` (or open the HTML files directly).
- Test in a browser manually; for mobile, verify on a real iPhone in PWA (standalone) mode — safe areas and gesture behavior only behave correctly there.
- Run the E2E suite (Node only inside `tests/`, starts/stops the server automatically): `bash tests/run_e2e_tests.sh`. Six projects: desktop, iPhone 16 mobile portrait/landscape (Safari-like), a playback-loop regression project, and PWA full-screen portrait/landscape with Dynamic Island safe-area simulation — see `docs/testing.md`.
- **Kill the server BEFORE starting anything. ALWAYS.** Whether starting the E2E suite or a manual browser session: first run `pkill -f launch_local.py` (and `pkill -f test_launch_local.py`) unconditionally — do not check whether port 8000 is occupied first, just kill. Then start a fresh server (`python3 launch_local.py` for manual testing, or the suite's own runner for E2E). A stale server holding the port makes the app hang on the loading screen and all E2E tests fail with `#grid-container` never visible.
- After the testing session finishes, kill any server the agent started: `pkill -f launch_local.py` (the E2E runner stops its own server, but any manually launched `launch_local.py` must be terminated).
- The opencode agent can inspect the running app interactively through the Playwright MCP browser tools (configured in `opencode.json`); screenshots are returned as images.
