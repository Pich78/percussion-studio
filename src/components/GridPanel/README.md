# GridPanel Component System Documentation

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Components:** `GridModel`, `GridPanel`

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [GridModel API Reference](#gridmodel-api-reference)
4. [GridPanel API Reference](#gridpanel-api-reference)
5. [Theming Guide](#theming-guide)
6. [Architecture & Design Decisions](#architecture--design-decisions)
7. [Examples](#examples)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The GridPanel component system provides a visual, interactive percussion notation editor. It consists of two complementary classes:

- **`GridModel`** - State management and business logic layer
- **`GridPanel`** - Web Component for rendering and user interaction

### Key Features

✅ **Rhythmic Intelligence** - Automatic visual shading based on musical context  
✅ **Drag Editing** - Click-and-drag to paint/erase notes  
✅ **Material Design** - M3-compliant hover states and ripple effects  
✅ **Fully Themeable** - CSS custom properties for complete visual control  
✅ **Shadow DOM Isolation** - No style leakage or conflicts  
✅ **Event-Driven** - Clean component communication via Custom Events

---

## Quick Start

### Basic Setup

```javascript
import { GridModel } from './components/GridPanel/GridModel.js';
import { GridPanel } from './components/GridPanel/GridPanel.js';

// 1. Create the model
const model = new GridModel({
  initialProps: {
    notation: 'o-x-o-x-',  // 8 cells: kick-rest-snare-rest pattern
    metrics: {
      feel: 'duple',        // 'duple' or 'triplet'
      beatGrouping: 4       // Beats per measure
    },
    instrument: {
      sounds: [
        { letter: 'o', svg: '<svg>...</svg>' },  // Kick drum
        { letter: 'x', svg: '<svg>...</svg>' }   // Snare drum
      ]
    }
  },
  onUpdate: (cells) => {
    // Called whenever the model changes
    gridPanel.cells = cells;
  }
});

// 2. Create the view
const gridPanel = document.createElement('grid-panel');
document.body.appendChild(gridPanel);

// 3. Initial render
gridPanel.cells = model.cells;

// 4. Handle user interactions
gridPanel.addEventListener('cell-mousedown', (e) => {
  const { tickIndex, hasNote } = e.detail;
  const newSound = hasNote ? '-' : 'x';  // Toggle note
  model.updateCell(tickIndex, newSound);
});
```

---

## GridModel API Reference

### Constructor

```javascript
new GridModel({ initialProps, onUpdate })
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `initialProps` | `Object` | ✅ | Configuration object containing notation, metrics, and instrument |
| `initialProps.notation` | `String` | ✅ | Pattern string (e.g., `'o-x-'`). Each character represents one time subdivision |
| `initialProps.metrics` | `Object` | ✅ | Rhythmic context definition |
| `initialProps.metrics.feel` | `String` | ✅ | Either `'duple'` (straight time) or `'triplet'` (swing/shuffle) |
| `initialProps.metrics.beatGrouping` | `Number` | ✅ | Number of subdivisions per beat (typically 2, 3, or 4) |
| `initialProps.instrument` | `Object` | ✅ | Sound definitions for the instrument |
| `initialProps.instrument.sounds` | `Array<Object>` | ✅ | Array of sound objects with `letter` and `svg` properties |
| `onUpdate` | `Function` | ✅ | Callback function: `(cells: Array<Object>) => void` |

#### Notation String Format

The notation string uses single characters to represent sounds:

- **`-`** (hyphen) - Rest (silence)
- **Any other character** - Sound trigger (must match a `letter` in `instrument.sounds`)

**Example:** `'o-x-o-x-'` creates an 8-step pattern with kicks on beats 1 and 5, snares on beats 3 and 7.

### Properties

#### `cells` (getter)

```javascript
const cellArray = model.cells;
```

Returns the computed view model array. Each cell object contains:

```typescript
{
  key: string,           // Unique identifier: 'cell-0', 'cell-1', etc.
  tickIndex: number,     // Position in sequence (0-indexed)
  shadingClass: string,  // CSS class for rhythmic context
  symbolSVG: string|null, // SVG markup for the sound, or null if rest
  hasNote: boolean       // True if this cell contains a sound
}
```

**Usage Note:** This array is regenerated on every update. Do not mutate it directly.

### Methods

#### `updateCell(tickIndex, newSoundLetter)`

Updates a single cell in the notation.

```javascript
model.updateCell(3, 'x');  // Set cell 3 to 'x' sound
model.updateCell(3, '-');  // Clear cell 3 (make it a rest)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `tickIndex` | `Number` | Zero-based index of the cell to modify |
| `newSoundLetter` | `String` | New sound character (use `'-'` for rest) |

**Side Effects:**
- Regenerates the entire `cells` array
- Calls the `onUpdate` callback with the new cells

**Bounds Safety:** Invalid indices are silently ignored (no error thrown).

#### `getCurrentState()`

Returns the raw, serializable state.

```javascript
const state = model.getCurrentState();
// Returns: { notation: 'o-x-o-x-' }
```

**Use Case:** Save to localStorage, database, or export to file.

---

## GridPanel API Reference

### Custom Element

```html
<grid-panel></grid-panel>
```

Register with:
```javascript
import { GridPanel } from './components/GridPanel/GridPanel.js';
// Automatically registers as 'grid-panel'
```

### Properties

#### `cells` (setter)

```javascript
gridPanel.cells = cellArray;
```

Sets the visual content of the grid. Accepts the cell array format produced by `GridModel.cells`.

**Rendering Behavior:**
- Completely replaces the grid content
- Animates new notes with a scale-up effect
- Preserves rhythmic shading based on `shadingClass`

### Events

The component dispatches two Custom Events:

#### `cell-mousedown`

Fired when a user clicks on a cell.

```javascript
gridPanel.addEventListener('cell-mousedown', (event) => {
  console.log(event.detail);
  // { tickIndex: 3, hasNote: true }
});
```

**Event Properties:**
- `bubbles`: `true`
- `composed`: `true` (crosses Shadow DOM boundary)
- `detail.tickIndex`: Index of clicked cell
- `detail.hasNote`: Whether the cell currently contains a note

#### `cell-mouseenter`

Fired when the mouse enters a cell **while the left button is held down** (drag operation).

```javascript
gridPanel.addEventListener('cell-mouseenter', (event) => {
  console.log(event.detail);
  // { tickIndex: 4, hasNote: false }
});
```

**Use Case:** Implement "paint mode" - drag to set/clear multiple notes.

**Event Properties:** Same as `cell-mousedown`.

---

## Theming Guide

GridPanel exposes **14 CSS custom properties** for complete visual customization.

### Usage

Set variables on the `<grid-panel>` element or any parent:

```css
grid-panel {
  /* Sizing */
  --grid-panel-border-radius: 12px;
  --grid-panel-row-height-multiplier: 5;

  /* Duple feel colors */
  --grid-panel-color-downbeat: #1e40af;
  --grid-panel-color-strong: #3b82f6;
  --grid-panel-color-weak: #dbeafe;

  /* Triplet feel colors */
  --grid-panel-color-triplet1: #065f46;
  --grid-panel-color-triplet2: #10b981;
  --grid-panel-color-triplet3: #d1fae5;

  /* Interaction */
  --grid-panel-color-on-surface: #000000;
  --grid-panel-color-ripple: #ffffff;
  --grid-panel-color-outline: #334155;
}
```

### Complete Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `--grid-panel-border-radius` | `8px` | Corner radius of the entire component |
| `--grid-panel-row-height-multiplier` | `4` | Height = `N × 1rem` |
| `--grid-panel-color-downbeat` | `#ced4da` | Strong beats (1st beat of measure) |
| `--grid-panel-color-strong` | `#e9ecef` | Secondary strong beats |
| `--grid-panel-color-weak` | `#ffffff` | Off-beats and subdivisions |
| `--grid-panel-color-triplet1` | `#d0ebff` | Triplet downbeats |
| `--grid-panel-color-triplet2` | `#e7f5ff` | Triplet second notes |
| `--grid-panel-color-triplet3` | `#f8f9fa` | Triplet third notes |
| `--grid-panel-color-on-surface` | `#1c1b1f` | Hover overlay tint |
| `--grid-panel-color-ripple` | `#1c1b1f` | Click ripple effect color |
| `--grid-panel-color-outline` | `#dee2e6` | Cell border color |

### Rhythmic Shading System

The component applies different background colors based on musical context:

#### Duple Feel (Straight Time)

```
Beat:        1    &    2    &    3    &    4    &
Class:     down  weak strong weak  down weak strong weak
Color:     ████  ░░░░  ███  ░░░░  ████  ░░░░  ███  ░░░░
```

#### Triplet Feel

```
Beat:        1    &   a    2    &   a    3    &   a
Class:     trip1 trip2 trip3 trip1 trip2 trip3 trip1 trip2 trip3
Color:     ████  ███   ░░░░  ████  ███   ░░░░  ████  ███   ░░░░
```

---

## Architecture & Design Decisions

### Why Two Separate Classes?

**Design Pattern:** Model-View Separation

**Rationale:**
- **Testability** - Business logic can be unit tested without DOM
- **Reusability** - Model can drive different views (Canvas, SVG, etc.)
- **Performance** - View can be optimized independently (e.g., virtual scrolling)
- **Maintainability** - Clear boundaries prevent tangled dependencies

### Why Private Fields?

```javascript
class GridModel {
  #notation;  // Private
  #cells;     // Private
}
```

**Design Pattern:** Encapsulation via Information Hiding

**Rationale:**
- **API Stability** - Internal implementation can change without breaking consumers
- **Invariant Protection** - Prevents external code from corrupting state
- **Clear Interface** - Only public methods/getters appear in autocomplete
- **Future-Proof** - ES2022+ standard, widely supported

**Technical Note:** Private fields MUST be declared in the class body (before constructor) per JavaScript specification.

### Why Full Regeneration on Single Cell Update?

```javascript
updateCell(tickIndex, newSoundLetter) {
  // ... mutate notation ...
  this.#generateCells();  // Regenerates ALL cells
}
```

**Design Pattern:** Derived State Consistency

**Rationale:**
- **Simplicity** - No complex diffing algorithm needed
- **Correctness** - Eliminates risk of stale/inconsistent state
- **Performance** - For typical grids (16-32 cells), regeneration is <1ms
- **Maintainability** - Single code path for all updates

**Trade-off:** Could be optimized with dirty-checking for 100+ cell grids.

### Why Shadow DOM?

```javascript
this.attachShadow({ mode: 'open' });
```

**Design Pattern:** Style Encapsulation

**Rationale:**
- **Isolation** - Component styles cannot leak to parent page
- **Portability** - Drop into any project without style conflicts
- **Predictability** - No cascade surprises from global CSS
- **Performance** - Browser can optimize isolated style trees

**Trade-off:** Slightly more complex theming (requires CSS custom properties).

### Why `requestAnimationFrame` for Animations?

```javascript
cellEl.appendChild(noteEl);
requestAnimationFrame(() => {
  noteEl.classList.add('enter-active');
});
```

**Design Pattern:** Two-Frame Animation Trigger

**Rationale:**
- **Transition Requirement** - CSS transitions need a computed "before" state
- **Browser Optimization** - Without rAF, browser may batch both changes
- **Guaranteed Render** - Forces browser to compute initial state first
- **Visual Smoothness** - Ensures scale(0) → scale(1) transition fires

**Alternative Rejected:** `setTimeout(fn, 0)` is less reliable for frame timing.

### Why `composed: true` on Events?

```javascript
this.dispatchEvent(new CustomEvent('cell-mousedown', { 
  bubbles: true,
  composed: true  // Critical!
}));
```

**Design Pattern:** Shadow DOM Event Traversal

**Rationale:**
- **Parent Access** - Events must cross Shadow DOM boundary
- **Standard Pattern** - Required for all custom element events
- **Event Delegation** - Enables parent components to handle events
- **Framework Compatibility** - Works with React, Vue, Angular, etc.

**Without `composed: true`:** Events stop at Shadow DOM root, breaking parent listeners.

### Rhythmic Shading Algorithm

The `#getShadingClass()` method encodes Western music theory:

#### Duple Feel Logic

```javascript
const pos = index % beatGrouping;
if (pos === 0) return 'cell-downbeat';                // Primary accents
if (beatGrouping > 2 && pos === beatGrouping / 2)     // Secondary accents
    return 'cell-strong-beat';
return 'cell-weak-beat';                              // Unaccented beats
```

**Music Theory:** In 4/4 time, beats 1 and 3 are strong (downbeats), beats 2 and 4 are medium (strong-beats), subdivisions are weak.

#### Triplet Feel Logic

```javascript
if (beatGrouping === 3) {
    // Simple triplets: just cycle 1-2-3
    return `cell-triplet-${(index % 3) + 1}`;
}

// Complex: e.g., 4 beats with triplet subdivisions (12 cells)
const posInner = index % 3;
if (posInner === 0) {
    return index % beatGrouping === 0 ? 
        'cell-triplet-1' :    // Main downbeat
        'cell-triplet-2';      // Beat start
}
return 'cell-triplet-3';      // Subdivision
```

**Handles:**
- **Simple triplets** - 3 cells = 1 beat = 1-2-3 pattern
- **Compound time** - 12/8 (4 beats × 3 triplets each)
- **Polyrhythms** - Any combination of beat grouping and feel

---

## Examples

### Example 1: Toggle Note on Click

```javascript
gridPanel.addEventListener('cell-mousedown', (e) => {
  const { tickIndex, hasNote } = e.detail;
  
  // Toggle: if has note, clear it; if empty, add 'x'
  const newSound = hasNote ? '-' : 'x';
  model.updateCell(tickIndex, newSound);
});
```

### Example 2: Paint Mode (Click and Drag)

```javascript
let paintSound = null;

gridPanel.addEventListener('cell-mousedown', (e) => {
  const { tickIndex, hasNote } = e.detail;
  
  // First click sets the paint mode
  paintSound = hasNote ? '-' : 'x';
  model.updateCell(tickIndex, paintSound);
});

gridPanel.addEventListener('cell-mouseenter', (e) => {
  if (paintSound === null) return;
  
  const { tickIndex } = e.detail;
  model.updateCell(tickIndex, paintSound);
});

// Reset paint mode on mouse up
document.addEventListener('mouseup', () => {
  paintSound = null;
});
```

### Example 3: Multi-Sound Instrument

```javascript
const instrument = {
  sounds: [
    { letter: 'k', svg: '<svg><!-- Kick --></svg>' },
    { letter: 's', svg: '<svg><!-- Snare --></svg>' },
    { letter: 'h', svg: '<svg><!-- Hi-hat --></svg>' }
  ]
};

let selectedSound = 'k';

// Change selected sound via UI
document.querySelectorAll('.sound-button').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedSound = btn.dataset.sound;
  });
});

// Place selected sound on click
gridPanel.addEventListener('cell-mousedown', (e) => {
  const { tickIndex, hasNote } = e.detail;
  
  // If clicking an empty cell, add selected sound
  // If clicking a filled cell, clear it
  const newSound = hasNote ? '-' : selectedSound;
  model.updateCell(tickIndex, newSound);
});
```

### Example 4: Save and Load State

```javascript
// Save to localStorage
function savePattern() {
  const state = model.getCurrentState();
  localStorage.setItem('myPattern', JSON.stringify(state));
}

// Load from localStorage
function loadPattern() {
  const saved = localStorage.getItem('myPattern');
  if (!saved) return;
  
  const state = JSON.parse(saved);
  
  // Create new model with loaded notation
  const newModel = new GridModel({
    initialProps: {
      notation: state.notation,
      metrics: { feel: 'duple', beatGrouping: 4 },
      instrument: myInstrument
    },
    onUpdate: (cells) => {
      gridPanel.cells = cells;
    }
  });
  
  gridPanel.cells = newModel.cells;
}
```

### Example 5: Dark Theme

```css
grid-panel.dark-theme {
  --grid-panel-color-downbeat: #1f2937;
  --grid-panel-color-strong: #374151;
  --grid-panel-color-weak: #111827;
  
  --grid-panel-color-triplet1: #1e3a5f;
  --grid-panel-color-triplet2: #1e40af;
  --grid-panel-color-triplet3: #1f2937;
  
  --grid-panel-color-on-surface: #ffffff;
  --grid-panel-color-ripple: #60a5fa;
  --grid-panel-color-outline: #4b5563;
}
```

### Example 6: Responsive Height

```css
/* Mobile: compact */
@media (max-width: 768px) {
  grid-panel {
    --grid-panel-row-height-multiplier: 3;
  }
}

/* Desktop: spacious */
@media (min-width: 769px) {
  grid-panel {
    --grid-panel-row-height-multiplier: 6;
  }
}
```

---

## Troubleshooting

### Problem: Notes don't appear

**Symptom:** Grid renders but no symbols show up.

**Diagnosis:**
```javascript
console.log(model.cells);
// Check if symbolSVG is null for all cells
```

**Causes:**
1. **Notation uses invalid characters** - Characters in notation must match `instrument.sounds[].letter`
2. **SVG is malformed** - Check that `instrument.sounds[].svg` contains valid SVG markup
3. **All rests** - Notation is all `'-'` characters

**Solution:**
```javascript
// Ensure notation matches instrument
const instrument = {
  sounds: [
    { letter: 'o', svg: '<svg>...</svg>' }
  ]
};

const notation = 'o-o-';  // Uses 'o' which exists in sounds
```

### Problem: Events not firing in parent component

**Symptom:** `addEventListener('cell-mousedown', ...)` doesn't trigger.

**Diagnosis:**
```javascript
// Add listener directly to element
gridPanel.addEventListener('cell-mousedown', (e) => {
  console.log('Event received:', e.detail);
});
```

**Causes:**
1. **Event listener on wrong element** - Must be on `<grid-panel>` element
2. **Listener added before element exists** - Check DOM timing

**Solution:**
```javascript
// Wait for element to exist
const gridPanel = document.createElement('grid-panel');
document.body.appendChild(gridPanel);

// Now add listener
gridPanel.addEventListener('cell-mousedown', handleClick);
```

### Problem: Animations not smooth

**Symptom:** Notes appear instantly without scale animation.

**Diagnosis:**
- Check browser DevTools Performance tab
- Look for forced reflows/layouts

**Causes:**
1. **High-frequency updates** - Updating faster than 60fps
2. **Large grids** - 100+ cells may struggle

**Solutions:**
```javascript
// Debounce rapid updates
let updateTimeout;
function debouncedUpdate(tickIndex, sound) {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    model.updateCell(tickIndex, sound);
  }, 16); // ~60fps
}

// OR use CSS will-change hint
grid-panel .note {
  will-change: transform, opacity;
}
```

### Problem: Styling conflicts

**Symptom:** Component looks broken when added to existing page.

**Causes:**
1. **CSS reset affecting Shadow DOM** (unlikely but possible)
2. **Custom properties inherited incorrectly**

**Solutions:**
```css
/* Isolate completely */
grid-panel {
  all: initial;
  display: block;
  /* Then set your custom properties */
}
```

### Problem: GridModel callback not firing

**Symptom:** `onUpdate` never called after `updateCell()`.

**Diagnosis:**
```javascript
const model = new GridModel({
  initialProps: {...},
  onUpdate: (cells) => {
    console.log('Update called with:', cells.length, 'cells');
  }
});

model.updateCell(0, 'x');  // Should trigger console.log
```

**Causes:**
1. **Invalid tickIndex** - Out of bounds indices are silently ignored
2. **Missing onUpdate** - Constructor returns early if missing

**Solutions:**
```javascript
// Always validate
if (tickIndex >= 0 && tickIndex < model.cells.length) {
  model.updateCell(tickIndex, newSound);
}

// Always provide onUpdate
const model = new GridModel({
  initialProps: {...},
  onUpdate: (cells) => {
    // Even if empty, function must exist
    gridPanel.cells = cells;
  }
});
```

---

## Browser Support

| Feature | Minimum Version |
|---------|----------------|
| Private class fields | Chrome 74+, Firefox 90+, Safari 14.1+ |
| Custom Elements | Chrome 54+, Firefox 63+, Safari 10.1+ |
| Shadow DOM v1 | Chrome 53+, Firefox 63+, Safari 10+ |
| CSS Custom Properties | Chrome 49+, Firefox 31+, Safari 9.1+ |

**Recommendation:** Support browsers from 2020 onwards for full functionality.

---

## License & Credits

**Author:** Percussion Studio Development Team  
**License:** [Your License Here]

For questions or issues, please contact [maintainer email] or file an issue on [repository URL].

---

*Last updated: November 2025*