import { StrokeType } from './types.js';

export const state = {
    // The active rhythm data. 
    // Will be populated by actions.loadRhythm() via the dataLoader.
    toque: null,

    // Cache for loaded Instrument YAML definitions.
    // Key: Symbol (e.g. "ITO"), Value: The parsed YAML object with .sounds, .name, etc.
    instrumentDefinitions: {},

    activeSectionId: null,
    isPlaying: false,
    currentStep: -1,
    selectedStroke: StrokeType.Open, // Default selected tool
    clipboard: null, // For copy/paste measures
    uiState: {
        isMenuOpen: false,
        modalOpen: false,
        modalType: 'instrument', // 'instrument' | 'rhythm'
        modalStep: 'instrument', // 'instrument' | 'soundpack'
        pendingInstrument: null, // Intermediate state for 2-step selection
        editingTrackIndex: null
    }
};

// Mutable playback state
export const playback = {
    timeoutId: null,
    currentStep: -1,
    currentMeasureIndex: 0, // Track current measure within section
    repetitionCounter: 1,
    currentPlayheadBpm: 120, // Default safe value
    activeSectionId: null
};