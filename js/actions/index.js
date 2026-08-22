/*
  js/actions/index.js
  Central re-export of all action modules as a single `actions` object.

  SINGLE IMPORT POINT: Event handlers import one object instead of
  multiple files:

    import { actions } from '../actions.js';
    actions.loadRhythm(id);

  ADDING NEW ACTIONS:
    1. Create the action function in the appropriate *Actions.js file
    2. Import it at the top of this file
    3. Add it to the `actions` object
*/


// Import all action modules
import { loadRhythm, loadRhythmFromFile, createNewRhythm } from './rhythmActions.js';
import { updateActiveSection, addSection, deleteSection, duplicateSection, resizeTracks } from './sectionActions.js';
import { handleUpdateStroke, handleUpdateStrokeDirectly, updateTrackSteps, addTrack, updateTrackInstrument } from './trackActions.js';
import { addMeasure, deleteMeasure, duplicateMeasure } from './measureActions.js';
import { setMixVolume, setMixMuted, toggleTrackMute, toggleTrackSolo, resetMix } from './mixerActions.js';

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
  setMixVolume,
  setMixMuted,
  toggleTrackMute,
  toggleTrackSolo,
  resetMix
};
