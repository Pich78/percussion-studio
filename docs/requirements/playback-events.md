# Playback Events: The Transport Stream Contract

This specification defines how playback drives the UI. It exists because of a
real bug: while looping "Eni So" in mobile landscape, the playhead bar was
never visible on the last column of Measure 2 — the scheduler emitted a full
`render` at the same audio instant as the step's visual update, and the render
wiped the freshly drawn highlight (the sound still played, because audio had
been pre-scheduled on the Web Audio timeline).

## 1. The invariant

> After the initial page render, all playback-driven DOM changes flow
> exclusively through the ordered **`transport`** event stream.
>
> - **The scheduler never emits `render`.**
> - **User actions may emit `render`** synchronously (that is the app's
>   standard rendering model and is unchanged).
> - Consequently there are exactly two event categories, which never overlap:
>   user-action renders happen synchronously inside a gesture handler; the
>   playback clock speaks only in ordered `transport` facts.

Because structural reconciliation happens *inside* the single ordered stream,
"rebuild then draw playhead" is atomic by construction. There is nothing to
race and no ordering invariant to maintain by hand.

## 2. Event schema

Emitted by `js/services/sequencer.js`, consumed by `js/ui/renderer.js`.

### Phase `countin`

| Field    | Type    | Meaning                                          |
|----------|---------|--------------------------------------------------|
| `phase`  | string  | `'countin'`                                      |
| `beat`   | number  | Current count-in beat (1-based; `0` when ended)  |
| `total`  | number  | Total beats (6 for subdivision 3, else 4)        |
| `active` | boolean | `true` per beat, `false` on count-in end         |

Handled centrally by the renderer via `updateCountInUi()`
(`js/ui/playheadUtils.js`) as targeted DOM updates. Count-in events never
reach views.

### Phase `playing`

| Field                   | Type          | Meaning                                        |
|-------------------------|---------------|------------------------------------------------|
| `phase`                 | string        | `'playing'`                                    |
| `step`                  | number        | Step index within the measure (0-based)        |
| `measure`               | number        | Measure index within the section (0-based)     |
| `rep`                   | number        | Repetition counter (1-based)                   |
| `sectionId`             | string        | Section the sounding step belongs to           |
| `effectiveRepetitions`  | number | null | Resolved repetition budget (random reps: 🎲N)  |

## 3. Reconciliation rule

The renderer keeps a `lastRenderedSectionId` cache:

- Every `render` event re-syncs the cache after repainting (user actions,
  stop, rhythm load, boot all emit `render`).
- On each `playing` transport fact: if `payload.sectionId` differs from the
  cache, `renderApp()` runs **synchronously first**, then the payload is
  forwarded to the active view's `onTransport()` so the playhead draws on the
  fresh DOM. Otherwise the payload is forwarded directly.

Implications:

- **Genuine section transitions** rebuild at the first step of the *incoming*
  section. The outgoing section's last-step highlight lives out its full
  duration.
- **Same-section repetition wraps** (e.g. "Eni So", one section with
  `repetitions: 1`) never rebuild — they are visually identical to any
  intermediate repetition boundary, which have always been render-free.
- Views receive payloads only for phase `playing`; their contract is
  documented in `js/views/viewManager.js` (`onTransport`).

## 4. The binding rule

Template strings must only bind **user-action state** — data that changes
exclusively inside gesture handlers, where a synchronous full render always
follows (mix volumes, mute flags, section settings…). Templates must never
bind **live playback state** — values that mutate off the render cycle:

- playhead position (`playback.currentStep`),
- repetition counters (`playback.repetitionCounter`,
  `playback.effectiveRepetitions`),
- live BPM (`playback.currentPlayheadBpm`),
- count-in phase (`playback.isCountingIn`, `playback.countInStep`).

Live state reconciles exclusively via targeted updates driven by transport
events (see `updateVisualStep`, `updateBpmUi`, `updateVolumeUi`,
`updateCountInUi` in `js/ui/playheadUtils.js`, and the random-reps badge in
`js/views/desktopEditorView.js`). A template that reads live playback state is
a defect: its value silently freezes until the next unrelated render.

## 5. Case study: the Eni So wipe

Before this contract existed, the scheduler did:

```js
setTimeout(() => eventBus.emit('step', { step, measure }), T);   // draw highlight
if (sectionChanged) {
    setTimeout(() => eventBus.emit('render'), T);                // wipe it again
}
```

Both timeouts shared the timestamp of the *outgoing* step. At execution the
`step` handler drew the playhead on Measure 2's last column and the `render`
handler immediately replaced `#root.innerHTML`, destroying it. For "Eni So"
(single section, `repetitions: 1`) every loop took the section-change branch,
so that column never showed a highlight. Sections with `repetitions > 1` were
affected only once per section transition, because intermediate repetition
boundaries never triggered a render.

## 6. Extending this model

If a future feature makes grid visuals depend on additional transport facts
(e.g. cue strokes on odd repetitions, rep-progress shading), widen the
renderer's reconciliation key from `{sectionId}` to `{sectionId, rep}` — the
decision lives in exactly one place. Any new live value follows the binding
rule: render-stable markup plus a targeted updater fed by the transport
stream.

## 7. Regression coverage

`tests/e2e/playhead-loop.spec.js` (project `mobile-landscape-playhead`) loops
Eni So for ≥2 cycles and asserts:

- a playhead indicator is present on every observed step, including
  Measure 2 / step 12 (`measure 1, step 11`);
- zero full `#root` rebuilds occur during steady playback;
- count-in chips tick via targeted updates when count-in is enabled.
