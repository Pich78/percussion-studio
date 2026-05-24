# Tempo Acceleration Specification

## Overview

Tempo acceleration allows a section's BPM to increase (or decrease) gradually with each repetition during playback. This creates build-ups, accelerando, or ritardando effects without requiring multiple sections at different BPMs.

---

## Section Property

Each section can optionally define a `tempoAcceleration` value:

| Property | Type | Default | Range | Description |
|----------|------|---------|-------|-------------|
| `tempoAcceleration` | number | `0` | -10 to 10 | Percentage change per repetition. Positive = accelerate, negative = decelerate. |

**YAML field name:** `tempo_acceleration` (snake_case)

**YAML example:**

```yaml
playback_flow:
  - name: "Build-Up"
    repetitions: 4
    tempo_acceleration: 5
    steps: 16
    subdivision: 4
    measures:
      - pattern:
          itotele_main: "O---O---O---O---"
```

---

## Computation

### Formula

The acceleration is applied as a **compound multiplication** at the end of each complete repetition of the section (all measures played, before starting the next repetition):

```
nextBpm = currentBpm × (1 + tempoAcceleration / 100)
```

where `currentBpm` is the running live BPM value at that point.

### Example

Section with `tempoAcceleration: 5` (5%), starting at 120 BPM, 3 repetitions:

| Repetition | BPM before repetition | Calculation |
|-----------|----------------------|-------------|
| 1 | 120.0 | (initial) |
| 2 | 126.0 | 120.0 × 1.05 |
| 3 | 132.3 | 126.0 × 1.05 |

### Negative Acceleration (Deceleration)

A negative value decelerates. Example with `tempoAcceleration: -3` (-3%), starting at 120 BPM:

| Repetition | BPM before repetition | Calculation |
|-----------|----------------------|-------------|
| 1 | 120.0 | (initial) |
| 2 | 116.4 | 120.0 × 0.97 |
| 3 | 112.9 | 116.4 × 0.97 |

### Range Clamping

The resulting BPM is always clamped within the supported range [40, 240] by the scheduler when used in step duration calculations.

---

## BPM Initialization and Flow

### Source of Truth

There are two BPM values in the application state:

1. **[Persistent] `state.toque.globalBpm`** — The global BPM of the rhythm, stored in the YAML as `global_bpm`.
2. **[Persistent] `section.bpm`** — Optional per-section BPM override (`undefined` if not set).
3. **[Runtime] `playback.currentPlayheadBpm`** — The live accumulator BPM used by the sequencer for scheduling. This is the value that tempo acceleration modifies.

### Initialization on Playback Stop

When playback stops (`stopPlayback()`), the live BPM resets based on the first section:

```
playback.currentPlayheadBpm = firstSection.bpm ?? state.toque.globalBpm
```

### Initialization on Section Change

When the sequencer enters a new section, the live BPM is set based on that section:

```
if (nextSection.bpm !== undefined)
    playback.currentPlayheadBpm = nextSection.bpm
```

If the new section has **no** BPM override, the live BPM **retains its current value** — including any acceleration accumulated from the previous section.

### On User BPM Change (during playback)

When the user modifies the global BPM via slider/input:

```
state.toque.globalBpm = newValue
if (activeSection.bpm === undefined)
    playback.currentPlayheadBpm = newValue
```

If the active section has a BPM override, the change to `globalBpm` has no immediate effect on playback (it will take effect when transitioning to a section without an override).

---

## Behavior in the Sequencer

The acceleration is applied in `computeNextStep()` at the point where a section finishes all its measures and prepares to repeat (`sequencer.js:272-276`):

```
if (section.tempoAcceleration && section.tempoAcceleration !== 0)
    multiplier = 1 + (section.tempoAcceleration / 100)
    nextBpm = nextBpm × multiplier
```

### Carry-Over Between Sections

Accumulated acceleration carries over between sections. For example:

```
Section A: tempoAcceleration: 5, repetitions: 3
  → after A, liveBpm is accelerated (e.g., 120 → 132.3)

Section B: no bpm override, no tempoAcceleration
  → continues at 132.3

Section C: bpm: 100 (override), tempoAcceleration: 2
  → resets to 100, then accelerates from there
```

The only ways the accumulated BPM resets:
1. A section transition into a section that defines its own `bpm` override.
2. User presses Stop (resets to first section's BPM).

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| `tempoAcceleration: 0` | No change per repetition (default). |
| Section with 1 repetition | Acceleration is computed but no subsequent repetition uses it (effectively ignored). |
| Adlib section with acceleration | Accelerates each repetition indefinitely. No upper bound enforcement beyond [40, 240] clamping. |
| Section with `bpm` override | On entry, resets live BPM to the override value — previous acceleration is discarded. |
| User changes `globalBpm` during playback | Takes effect only if active section has no `bpm` override. |

---

## Persistence

`tempoAcceleration` is persisted in the YAML rhythm file:

```yaml
playback_flow:
  - name: "Crescendo"
    repetitions: 8
    tempo_acceleration: 3
    steps: 16
    subdivision: 4
    measures:
      - pattern:
          iya: "O---O---O---O---"
```

When exporting (`rhythmExporter.js`), sections with non-zero `tempoAcceleration` are written with `tempo_acceleration`. Sections with zero or undefined are omitted.
