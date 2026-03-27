# AGENTS.md - Percussion Studio Developer Guide

Percussion Studio is a vanilla JavaScript web application (no npm/build tools) using ES modules loaded directly in the browser.

## Project Structure

```
js/
├── actions/       # User action handlers
├── components/    # Reusable UI components
├── events/        # Event handler registration
├── icons/         # SVG icon components
├── services/      # Core services (audio, sequencer)
├── store/         # State management
├── types.js       # Type constants
├── ui/            # UI rendering (layouts, renderers)
├── utils/         # Utility functions
└── views/         # View definitions
```

## Running the Application

```bash
# Start local server (opens browser)
python launch_local.py

# Regenerate manifest after data changes
cd tools && python generate_manifest.py
```

**No automated tests exist** - test manually in browser.

---

## Code Style Guidelines

### File Headers
```javascript
/**
 * js/path/to/file.js
 *
 * Brief description of what this file does.
 */
```

### Imports
- Use relative paths (`../`) for sibling directories, `../../` for grandparents
- Group: external types, then local modules, one import per line

```javascript
import { state, playback } from '../store.js';
import { StrokeType, DynamicType } from '../../types.js';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `mobileEvents.js` |
| Functions | camelCase | `renderLandscape()` |
| Constants | PascalCase | `StrokeType`, `DynamicType` |
| State keys | camelCase | `isPlaying` |
| CSS classes | kebab-case | `bg-gray-900` |

### Component Functions
Return template strings with `data-action` attributes:

```javascript
export const MyComponent = ({ prop1 }) => `
    <div class="component">
        <span>${prop1}</span>
        <button data-action="my-action">Click</button>
    </div>
`;
```

### Event Handling
Use event delegation via `data-action`:

```javascript
const ACTION_HANDLERS = ['toggle-play', 'stop'];
'toggle-play': (e, target) => {
    // handle action
    eventBus.emit('render');
},
```

### State Management
Use `commit(mutationName, payload)` for traceable mutations:

```javascript
import { state, commit } from '../store.js';
commit('SET_PLAYING', { value: true });
```

### Types and Constants
Define as frozen objects:

```javascript
export const StrokeType = Object.freeze({
    None: ' ', Open: 'O', Slap: 'S'
});
```

### Error Handling

```javascript
// Async operations
try {
    const data = await someAsyncFunction();
} catch (error) {
    console.error('[FeatureName] Error:', error);
}

// Synchronous
try { riskyOperation(); } catch (e) { console.error('[Op] Failed:', e); }
```

### Logging
Prefix with feature name: `console.log('[MyFeature] message');`

### CSS
Use Tailwind utility classes: `<div class="flex items-center bg-gray-900">`

---

## Common Patterns

### Modal
```javascript
const renderMyModal = () => {
    if (!state.uiState.myModalOpen) return '';
    return `<div class="fixed inset-0 bg-black/50">
        <button data-action="close-modal">Close</button>
    </div>`;
};
```

### Orientation-Specific Layouts
Use Tailwind's `portrait:` and `landscape:` prefixes. Create separate files for complex views:

```
js/ui/mobile/practitioner/
├── layout.js      # Main entry, composes modules
├── landscape.js   # Landscape rendering
├── portrait.js    # Portrait rendering
└── bpmModal.js    # Shared modal
```
