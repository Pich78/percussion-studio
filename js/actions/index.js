/*
  js/actions/index.js
  Central re-export of all action modules.
  
  ============================================================================
  BARREL EXPORTS PATTERN
  ============================================================================
  
  This file implements the "barrel exports" pattern, which provides:
  
  1. UNIFIED API: All actions are accessible via a single `actions` object,
     making it easy to discover available operations without knowing which
     file they live in.
  
  2. BACKWARD COMPATIBILITY: Legacy code can still use `actions.loadRhythm()`,
     while new code can use direct imports for better tree-shaking.
  
  3. SINGLE IMPORT POINT: Event handlers can import one object instead of
     multiple files:
     
       // Instead of:
       import { loadRhythm } from './rhythmActions.js';
       import { addTrack } from './trackActions.js';
       
       // Use:
       import { actions } from './actions.js';
       actions.loadRhythm(id);
       actions.addTrack('ITO');
  
  4. REFACTORING SAFETY: Actions can be moved between files without updating
     every import site - only this barrel file needs to change.
  
  ADDING NEW ACTIONS:
    1. Create the action function in the appropriate *Actions.js file
    2. Import it at the top of this file
    3. Add it to the `actions` object
    4. Add it to the named exports at the bottom
  ============================================================================
*/


// Import all action modules
import { loadRhythm, loadRhythmFromFile, createNewRhythm } from './rhythmActions.js';
import { updateActiveSection, addSection, deleteSection, duplicateSection, resizeTracks } from './sectionActions.js';
import { handleUpdateStroke, handleUpdateStrokeDirectly, updateTrackSteps, addTrack, updateTrackInstrument } from './trackActions.js';
import { addMeasure, deleteMeasure, duplicateMeasure } from './measureActions.js';
import { setGlobalVolume, setGlobalMute } from './mixerActions.js';

/**
 * Unified actions object for backward compatibility.
 * All actions are available on this object.
 */
export const actions = {
  // Rhythm actions
  loadRhythm,
  loadRhythmFromFile,
  createNewRhythm,

  // Section actions
  updateActiveSection,
  addSection,
  deleteSection,
  duplicateSection,
  resizeTracks,

  // Track actions
  handleUpdateStroke,
  handleUpdateStrokeDirectly,
  updateTrackSteps,
  addTrack,
  updateTrackInstrument,

  // Measure actions
  addMeasure,
  deleteMeasure,
  duplicateMeasure,

  // Mixer actions
  setGlobalVolume,
  setGlobalMute
};

// Also export individual actions for direct imports
export {
  // Rhythm
  loadRhythm,
  loadRhythmFromFile,
  createNewRhythm,

  // Section
  updateActiveSection,
  addSection,
  deleteSection,
  duplicateSection,
  resizeTracks,

  // Track
  handleUpdateStroke,
  handleUpdateStrokeDirectly,
  updateTrackSteps,
  addTrack,
  updateTrackInstrument,

  // Measure
  addMeasure,
  deleteMeasure,
  duplicateMeasure,

  // Mixer
  setGlobalVolume,
  setGlobalMute
};
