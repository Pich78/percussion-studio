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

// Re-export the unified actions object for backward compatibility
export { actions } from './actions/index.js';

// Also re-export individual actions for direct imports
export {
    loadRhythm,
    loadRhythmFromFile,
    createNewRhythm,
    updateActiveSection,
    addSection,
    deleteSection,
    duplicateSection,
    resizeTracks,
    handleUpdateStroke,
    updateTrackSteps,
    addTrack,
    updateTrackInstrument,
    addMeasure,
    deleteMeasure,
    duplicateMeasure,
    setGlobalVolume,
    setGlobalMute
} from './actions/index.js';

// Legacy: Also export parsePatternString for any external usage
export { parsePatternString } from './utils/patternParser.js';