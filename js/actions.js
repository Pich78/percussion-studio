/*
  js/actions.js
  FACADE: Re-exports all actions from modular action files.
  This file maintains backward compatibility with existing imports.
  
  For new code, consider importing directly from:
  - './actions/rhythmActions.js'
  - './actions/sectionActions.js'
  - './actions/trackActions.js'
  - './actions/measureActions.js'
  - './actions/mixerActions.js'
*/

// Single import surface: consumers use the unified `actions` object.
export { actions } from './actions/index.js';