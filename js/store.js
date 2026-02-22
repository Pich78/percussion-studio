import { StrokeType } from './types.js';

export const state = {
    // The active rhythm data. 
    // Will be populated by actions.loadRhythm() via the dataLoader.
    // active rhythm data
    toque: null, // { id, name, globalBpm, sections, isBata: boolean, orisha: [], classification: string, description: string }

    // Tracks the source of the current rhythm for share functionality
    // 'repo' = loaded from manifest, 'local' = loaded from user's device, 'new' = created fresh
    rhythmSource: null,
    // The rhythm ID if loaded from repo (used for sharing)
    currentRhythmId: null,

    // Global volume/mute mix state.
    // Key: instrument symbol (e.g. "Iya"), Value: { volume: 1.0, muted: false }
    mix: {},

    // Cache for loaded Instrument YAML definitions.
    // Key: Symbol (e.g. "ITO"), Value: The parsed YAML object with .sounds, .name, etc.
    instrumentDefinitions: {},

    activeSectionId: null,
    isPlaying: false,
    currentStep: -1,
    selectedStroke: StrokeType.Open, // Default selected tool
    clipboard: null, // For copy/paste measures
    countInEnabled: false, // Toggle for count-in feature (enabled by default)
    uiState: {
        isMenuOpen: false,
        modalOpen: false,
        modalType: 'instrument', // 'instrument' | 'rhythm' | 'userGuide'
        modalStep: 'instrument', // 'instrument' | 'soundpack'
        pendingInstrument: null, // Intermediate state for 2-step selection
        pendingSoundPack: null, // Selected sound pack before confirmation
        editingTrackIndex: null,
        isLoadingRhythm: false, // True when rhythm is being loaded
        loadingRhythmName: null, // Name of the rhythm being loaded
        expandedFolders: new Set(), // Tracks which rhythm folders are expanded
        userGuideSubmenuOpen: false, // Tracks if user guide language submenu is open
        userGuideContent: null, // Loaded markdown content for user guide modal
        userGuideLanguage: null, // 'en' | 'it' - currently selected language
        // Pie Menu state for editing symbols on hover
        pieMenu: {
            isOpen: false,
            x: 0,
            y: 0,
            trackIndex: null,
            stepIndex: null,
            measureIndex: null,
            instrumentDef: null,
            editingMode: 'right-click', // 'disabled' | 'hover' | 'long-press' | 'right-click'
            hoverTimeMs: 250,
            pressTimeMs: 400,
            updateGlobalCursor: false, // If true, selecting from pie menu updates bottom palette
            hideCurrentCursor: false // If true, current global cursor symbol is hidden from pie menu
        },
        // BataExplorer state
        bataExplorer: {
            isOpen: false,
            searchTerm: '',
            selectedOrishas: [], // Array of selected Orisha names for filtering
            selectedTypes: [], // Array of selected classification types
            selectedToqueId: null, // Currently selected toque for details panel
            metadata: null // Loaded from bata_metadata.json
        },
        // Rhythm metadata editor state in timeline
        sectionDropdownOpen: false, // Mobile header section switcher
        metadataEditor: {
            orishaDropdownOpen: false
        }
    }
};

// Mutable playback state
export const playback = {
    timeoutId: null,
    currentStep: -1,
    currentMeasureIndex: 0, // Track current measure within section
    repetitionCounter: 1,
    currentPlayheadBpm: 120, // Default safe value
    activeSectionId: null,
    nextNoteTime: 0, // For precision look-ahead scheduling (audioContext time)
    isCountingIn: false, // True when count-in is playing
    countInStep: 0, // Current count-in beat (0-3 or 0-5)
    countInTotal: 4 // Total count-in beats (4 or 6 based on time signature)
};