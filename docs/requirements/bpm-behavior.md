# BPM Behavior Specification

## Overview

This document describes the runtime behavior of the BPM system. The key design goal is that **`playback.currentPlayheadBpm` is the single source of truth** for all BPM displays and slider controls. The persistent baseline (`state.toque.globalBpm`) is written only to preserve user changes across stop/play cycles.

---

## BPM Values

| Value | Role | Persistence | Set by |
|-------|------|-------------|--------|
| `playback.currentPlayheadBpm` | **Single source of truth** for all displays and the sequencer | Runtime (reset on rhythm load) | User slider, acceleration, section transitions |
| `state.toque.globalBpm` | Persistent baseline, stored in YAML as `global_bpm` | Written to YAML on download | Only from user slider at the moment of drag |
| `section.bpm` | Optional per-section override, stored in YAML as `bpm` | Written to YAML on download | User in section settings; **ignored** if `userHasOverriddenBpm` is true |

---

## The `userHasOverriddenBpm` Flag

A boolean on the `playback` object that controls whether per-section BPM overrides are applied during section transitions.

### When set to `true`
The user has interacted with a BPM control (slider, step button) during the current playback session. Section `bpm` overrides are **ignored** — the live BPM carries through all section transitions unchanged.

### When set to `false`
Section `bpm` overrides are applied on entry (the default). This is the initial state on playback start and after Stop.

### Reset
Cleared to `false` in `stopPlayback()`. Persists for the entire playback session (start to stop).

---

## BPM Flow by Action

### Playback Starts

```
stopPlayback():
    userHasOverriddenBpm = false
    currentPlayheadBpm = firstSection.bpm ?? state.toque.globalBpm
```

### User Changes BPM via Slider / Step

All user-initiated BPM changes follow the same pattern:

```js
state.toque.globalBpm = newValue       // update persistent baseline
playback.currentPlayheadBpm = newValue  // update live value
playback.userHasOverriddenBpm = true    // mark that user took control
```

**Important**: `currentPlayheadBpm` is always updated unconditionally (never gated by `section.bpm`). The user's action always takes effect immediately.

### Acceleration Applied (During Playback)

Applied by `computeNextStep()` in the sequencer at the **end of each complete repetition** (all measures played, before starting the next repetition):

```js
if (section.tempoAcceleration && section.tempoAcceleration !== 0) {
    const multiplier = 1 + (section.tempoAcceleration / 100);
    nextBpm = currentPlayheadBpm * multiplier;  // compound
}
```

This modifies the live BPM in the computed result, which is then assigned to `playback.currentPlayheadBpm` by `applyStepResult()`. The persistent baseline (`state.toque.globalBpm`) is **not** modified by acceleration.

### Section Transition (During Playback)

When the sequencer finishes a section and moves to the next:

```js
if (!userHasOverriddenBpm && nextSection.bpm !== undefined) {
    nextBpm = nextSection.bpm;  // apply override
}
// else: keep current BPM (accelerated value or last user-set value)
```

### User Changes Section via UI (During Playback)

When the user manually selects a different section:

```js
if (!playback.userHasOverriddenBpm) {
    playback.currentPlayheadBpm = section.bpm ?? state.toque.globalBpm;
}
// else: keep current live BPM
```

### Stop Pressed

```js
userHasOverriddenBpm = false
currentPlayheadBpm = firstSection.bpm ?? state.toque.globalBpm
```

The BPM resets to whatever the persistent baseline was last set to. If the user changed the slider during playback, that value is now in `state.toque.globalBpm` and becomes the new baseline.

### Rhythm Reloaded

Both `state.toque.globalBpm` and all `section.bpm` values are replaced by the newly loaded YAML data. `playback.currentPlayheadBpm` is set to the first section's effective BPM during `updateActiveSection()`.

---

## Visual Updates During Playback

All views share the same `updateBpmUi()` function from `js/ui/playheadUtils.js`, called on `step === 0` (repetition boundaries) from each view's `onStep` handler:

| View | File | Calls `updateBpmUi()` on step 0? |
|------|------|-----------------------------------|
| Desktop Editor | `js/views/desktopEditorView.js:28` | Yes |
| Mobile Grid | `js/views/mobileGridView.js:28` | Yes |
| Dual Mode | `js/views/mobileDualModeView.js:80` | Yes |

### What `updateBpmUi()` Updates

```js
const bpmVal = playback.currentPlayheadBpm;
const pct = ((bpmVal - 40) / 200) * 100;

// 1. All range input values (for keyboard/gesture consistency)
input[data-action="update-global-bpm"]

// 2. Slider fill bar and thumb (.group\/bpm containers)
fillBar.style.width = pct + '%';
handle.style.left = 'calc(' + pct + '% - 8px)';

// 3. Portrait dual-mode slider (fill, thumb, label)
portrait-bpm-fill, portrait-bpm-thumb, portrait-bpm-label

// 4. All text BPM displays
header-live-bpm, header-global-bpm
dual-mode-live-bpm-landscape, dual-mode-live-bpm-portrait
```

### Frequency

`updateBpmUi()` fires on every `step === 0` event, which corresponds to each repetition boundary of the active section. At 120 BPM with a 16-step section, this is approximately every 2 seconds. This is sufficient because acceleration is applied only at repetition boundaries.

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User grabs slider during acceleration | Sets `userHasOverriddenBpm = true`. Slider position jumps to user's chosen value. Acceleration continues compounding from the new value on next repetition. |
| User sets BPM, then section changes to one with `bpm` override | Override is ignored (`userHasOverriddenBpm = true`). Current BPM carries through. |
| User has NOT touched slider, section changes to one with `bpm` override | Override is applied (`userHasOverriddenBpm = false`). BPM jumps to the section's BPM. |
| Multiple accelerations compound | Each repetition multiplies the running BPM. E.g., +5% for 3 reps starting at 120: 120 → 126 → 132.3. |
| Stop pressed after acceleration | BPM resets to baseline (last user-set value). Acceleration is discarded. |
| User steps BPM with ±1 from accelerated value | Read from `playback.currentPlayheadBpm`, so 132.3 → 131 (not 119). |
| Desktop slider movement during acceleration | Updated via `updateBpmUi()` on step 0 events via `desktopEditorView.onStep`. |

---

## Complete Data Flow Diagram

```
User drags slider
  ↓
playback.currentPlayheadBpm = newValue  ← SINGLE SOURCE OF TRUTH
state.toque.globalBpm = newValue         ← persistent baseline
playback.userHasOverriddenBpm = true
  ↓
Template reads playback.currentPlayheadBpm → all sliders, badges, labels
Sequencer reads playback.currentPlayheadBpm → step duration (getStepDuration)
  ↓
[Scheduler tick] → computeNextStep()
  ├─ No acceleration → nextBpm = currentPlayheadBpm (unchanged)
  └─ Acceleration on rep boundary → nextBpm = currentPlayheadBpm × (1 + accel/100)
  ├─ Section transition, flag false, section.bpm set → nextBpm = section.bpm
  └─ Section transition, flag true → nextBpm stays as is
  ↓
applyStepResult() → playback.currentPlayheadBpm = nextBpm
  ↓
onStep({ step: 0, ... }) → updateBpmUi()
  ↓
All DOM elements updated from playback.currentPlayheadBpm
```

---

## Files Involved

| File | Role |
|------|------|
| `js/store.js` | Defines `playback.currentPlayheadBpm` and `playback.userHasOverriddenBpm` |
| `js/services/sequencer.js` | Computes next BPM (acceleration + section transitions), resets on stop |
| `js/actions/sectionActions.js` | Sets BPM on section selection (gated by flag) |
| `js/ui/playheadUtils.js` | `updateBpmUi()` — updates all DOM elements from the live BPM |
| `js/views/desktopEditorView.js` | Calls `updateBpmUi()` on step 0 |
| `js/views/mobileGridView.js` | Calls `updateBpmUi()` on step 0 |
| `js/views/mobileDualModeView.js` | Calls `updateBpmUi()` on step 0 |
| `js/events/mobileEvents.js` | All BPM user input handlers set flag + update both values |
| `js/events/desktopEvents.js` | All BPM user input handlers set flag + update both values |
| `js/events/handlers/playbackEvents.js` | Shared BPM input/change handlers |
| `js/ui/desktop/layout.js` | Templates read `playback.currentPlayheadBpm` |
| `js/ui/mobile/standard/layout.js` | Templates read `playback.currentPlayheadBpm` |
| `js/ui/mobile/dual-mode/landscape.js` | Templates read `playback.currentPlayheadBpm` |
| `js/ui/mobile/dual-mode/portrait.js` | Templates read `playback.currentPlayheadBpm` |
| `js/ui/mobile/dual-mode/bpmModal.js` | Templates read `playback.currentPlayheadBpm` |
