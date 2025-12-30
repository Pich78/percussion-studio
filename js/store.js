import { INITIAL_TOQUE } from './constants.js';
import { StrokeType } from './types.js';

export const state = {
    toque: JSON.parse(JSON.stringify(INITIAL_TOQUE)),
    activeSectionId: INITIAL_TOQUE.sections[0].id,
    isPlaying: false,
    currentStep: -1,
    selectedStroke: StrokeType.Open,
    uiState: {
        isMenuOpen: false,
        modalOpen: false,
        editingTrackIndex: null
    }
};

// Mutable playback state
export const playback = {
    timeoutId: null,
    currentStep: -1,
    repetitionCounter: 1,
    currentPlayheadBpm: state.toque.globalBpm,
    activeSectionId: state.activeSectionId
};