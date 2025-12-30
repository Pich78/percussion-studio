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
    uiState: {
        isMenuOpen: false,
        modalOpen: false,
        modalType: 'instrument', // 'instrument' | 'rhythm'
        editingTrackIndex: null
    }
};

// Mutable playback state
export const playback = {
    timeoutId: null,
    currentStep: -1,
    repetitionCounter: 1,
    currentPlayheadBpm: 120, // Default safe value
    activeSectionId: null
};