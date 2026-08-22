# Section Play Mode Feature

## Overview

The Section Play Mode feature allows users to control how each section plays within a rhythm's playback loop. Users can set sections to play normally, play once per session, repeat indefinitely (ad libitum), or be skipped entirely.

## Properties

Each section has the following properties that control playback behavior:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `repetitions` | number | 1 | Number of times to repeat (used when playMode is 'loop') |
| `playMode` | string | 'loop' | Play mode: 'loop', 'once', or 'adlib' |
| `skip` | boolean | false | If true, section never plays |
| `_playedOnce` | boolean | false | Internal flag tracking if section has been played (reset on Stop) |

## Play Modes

### Loop (Default)
Plays the section the number of times specified by the `repetitions` property, then moves to the next section. When reaching the end of all sections, wraps back to the first section.

**Use case**: Normal rhythm playback

### Once
Plays the section exactly once per session. After playing, it is skipped on subsequent cycles until the user presses Stop, which resets all `_playedOnce` flags.

**Use case**: Intro sections, call-and-response patterns

### Ad Lib (Ad Libitum)
Repeats the section indefinitely until manually stopped or skipped. The `repetitions` value is ignored.

**Use case**: Extended solos, improvisational sections

### Skip
The section never plays. It is completely bypassed during playback.

**Use case**: Disabling certain sections without deleting them

## UI Control

In the Section Modal, each section row has a repetition chip that displays the current mode. Tapping it opens the custom drum picker (`js/ui/mobile/dual-mode/wheelPicker.js`): drag or flick to scroll, tap a value to center it, **Done** commits the selection to the section, **Cancel** (or tapping the backdrop) discards it.

| Display | Meaning |
|---------|---------|
| `1` - `64` | Loop mode - plays N times |
| `play once` | Once mode - plays once per session |
| `∞` | Ad lib mode - repeats forever |
| `disabled` | Skip mode - never plays |

### Visual Feedback

- **Loop mode**: Normal appearance (indigo text)
- **Once mode (not played)**: Normal appearance
- **Once mode (played)**: Grayed out (opacity-50)
- **Ad lib mode**: Purple highlight
- **Skip mode**: Grayed out (opacity-50)

## Behavior Flow

### Play Once Example

```
Sections: [A(play once), B(loop 2×), C(loop 2×)]

1. Press Play
2. A plays once → _playedOnce set to true → gray out in UI
3. B plays 2×
4. C plays 2×
5. Loop back to A → A returns 0 (skip) because _playedOnce is true
6. B plays 2×
7. C plays 2×
8. ...continues until Stop

Press Stop → all _playedOnce reset to false → A becomes playable again
```

### Skip Example

```
Sections: [A(loop), B(disabled), C(loop)]

1. Press Play
2. A plays
3. B is skipped (never plays)
4. C plays
5. Loop back to A
6. ...B is always skipped
```

## Implementation Details

### Section Play State Types

The sequencer uses meaningful identifiers instead of magic numbers:

```javascript
const SectionPlayState = Object.freeze({
    SKIP: 'SKIP',           // Section marked as disabled
    PLAYED: 'PLAYED',       // "play once" section already played
    PLAY_ONCE: 'PLAY_ONCE', // "play once" section, not yet played
    ADLIB: 'ADLIB',         // Repeat forever
    LOOP: 'LOOP'            // Normal loop mode
});
```

### getSectionPlayState() Function

Returns a meaningful state object for each section:

```javascript
const getSectionPlayState = (section) => {
    if (section.skip) {
        return { type: SectionPlayState.SKIP, repetitions: 0, id: section.id };
    }
    if (section.playMode === 'adlib') {
        return { type: SectionPlayState.ADLIB, repetitions: -1, id: section.id };
    }
    if (section.playMode === 'once') {
        if (section._playedOnce) {
            return { type: SectionPlayState.PLAYED, repetitions: 0, id: section.id };
        }
        return { type: SectionPlayState.PLAY_ONCE, repetitions: 1, id: section.id };
    }
    return { type: SectionPlayState.LOOP, repetitions: section.repetitions, id: section.id };
};
```

### selectNextSection() Function

Handles finding the next playable section with proper reset logic:

```javascript
const selectNextSection = (currentIndex, sections) => {
    // First pass: try to find next playable section
    while (attempts < length) {
        const playState = getSectionPlayState(checkSection);
        if (playState.type !== SKIP && playState.type !== PLAYED) {
            return { nextIndex, nextSection, needsReset: false };
        }
    }
    
    // Second pass: all sections are SKIP or PLAYED
    // Reset _playedOnce flags and try again
    sections.forEach(s => { if (s._playedOnce) s._playedOnce = false; });
    
    // Now find first playable section after reset
    // ...
};
```

### Reset Behavior

The `_playedOnce` flag is reset in three scenarios:

1. **Stop button pressed**: `stopPlayback()` clears `_playedOnce` on all sections
2. **New rhythm loaded**: `setToque` mutation clears `_playedOnce` on all sections
3. **Automatic reset** (new): When all sections are exhausted (all SKIP or PLAYED), `selectNextSection()` automatically resets all `_playedOnce` flags and restarts the cycle. This enables proper looping behavior for "play once" sections.

### Section Skipping

The `selectNextSection()` function handles section transitions:
- First pass: find next playable section (not SKIP or PLAYED)
- Second pass: if all sections are exhausted, reset `_playedOnce` and try again
- This prevents playback from stalling when all sections are disabled or have been played

### Transition Rendering Semantics

A section transition (including a single-section rhythm wrapping back to
itself, as with "Eni So" at `repetitions: 1`) is **not** accompanied by a
scheduler-issued render. The sequencer only emits ordered `transport` events;
the renderer reconciles the structural change from the incoming section's first
`sectionId` — rebuilding synchronously *before* that step's playhead is drawn.
Consequences:

- The outgoing section's last-step highlight always lives out its full
  duration (this was not true historically: a same-instant render used to wipe
  it — see `docs/requirements/playback-events.md`, §5).
- Same-section repetition wraps never trigger a full rebuild; repetition
  counters and live BPM reconcile via targeted updates on `step === 0`.
- Random repetitions (`randomRepetitions`) re-resolve their effective budget
  per wrap in state; the desktop 🎲 badge refreshes via a targeted update on
  the incoming repetition's first step.

## Files Modified

- `js/types.js` - Added PlayMode constant
- `js/utils/rhythmTransformers.js` - Added skip and playMode properties to section builder
- `js/services/sequencer.js` - Added SectionPlayState, getSectionPlayState() and selectNextSection() functions, refactored sequencer logic
- `js/ui/mobile/dual-mode/sectionModal.js` - Section rows with the reps chip
- `js/ui/mobile/dual-mode/wheelPicker.js` - Custom drum picker used to edit repetitions / play modes
- `js/store/mutations.js` - Added _playedOnce reset on new rhythm load

## Limitations

- The special play mode settings (once, adlib, skip) are runtime-only and are not persisted to YAML files
- When exporting a rhythm to YAML, sections revert to default 'loop' mode with their repetition value
- This feature is currently only available in the mobile/practitioner UI
