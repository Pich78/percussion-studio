/*
  js/actions/index.js
  Central re-export of all action modules.
  Provides unified 'actions' object for backward compatibility.
*/

// Import all action modules
import { loadRhythm, loadRhythmFromFile, createNewRhythm } from './rhythmActions.js';
import { updateActiveSection, addSection, deleteSection, duplicateSection, resizeTracks } from './sectionActions.js';
import { handleUpdateStroke, updateTrackSteps, addTrack, updateTrackInstrument } from './trackActions.js';
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
