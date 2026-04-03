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

In the Section Modal, each section row has a repetition picker button that displays the current mode:

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

### Sequencer Logic

The `resolveEffectiveRepetitions()` function in `sequencer.js` determines how many times a section should play:

```javascript
const resolveEffectiveRepetitions = (section) => {
    const playMode = section.playMode || 'loop';
    const reps = section.repetitions || 1;
    
    // Skip: never play
    if (section.skip) return 0;
    
    // Adlib: infinite
    if (playMode === 'adlib') return -1;
    
    // Once: play once then skip
    if (playMode === 'once') {
        if (section._playedOnce) return 0;
        return 1;
    }
    
    // Loop: use repetitions value
    return reps;
};
```

### Reset Behavior

The `_playedOnce` flag is reset in two scenarios:
1. **Stop button pressed**: `stopPlayback()` clears `_playedOnce` on all sections
2. **New rhythm loaded**: `setToque` mutation clears `_playedOnce` on all sections

### Section Skipping

When transitioning to the next section, if that section has effective repetitions of 0 (skipped), the sequencer automatically searches for the next available section that can play. This prevents infinite loops when all sections are disabled.

## Files Modified

- `js/types.js` - Added PlayMode constant
- `js/utils/rhythmTransformers.js` - Added skip and playMode properties to section builder
- `js/services/sequencer.js` - Implemented new play mode logic with meaningful property names
- `js/ui/mobile/practitioner/sectionModal.js` - Updated UI with new picker values
- `js/store/mutations.js` - Added _playedOnce reset on new rhythm load

## Limitations

- The special play mode settings (once, adlib, skip) are runtime-only and are not persisted to YAML files
- When exporting a rhythm to YAML, sections revert to default 'loop' mode with their repetition value
- This feature is currently only available in the mobile/practitioner UI
