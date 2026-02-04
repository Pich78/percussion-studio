/*
  js/store/stateSelectors.js
  Pure functions for querying state (read-only).
  These selectors derive computed values without mutating state.
*/

/**
 * Get the active section from state
 * @param {object} state - Application state
 * @returns {object|null} Active section or null
 */
export const getActiveSection = (state) => {
    if (!state.toque || !state.toque.sections) return null;
    return state.toque.sections.find(s => s.id === state.activeSectionId) || null;
};

/**
 * Get a specific measure from the active section
 * @param {object} state - Application state
 * @param {number} measureIdx - Measure index
 * @returns {object|null} Measure or null
 */
export const getMeasure = (state, measureIdx) => {
    const section = getActiveSection(state);
    if (!section || !section.measures) return null;
    return section.measures[measureIdx] || null;
};

/**
 * Get a specific track from the active section
 * @param {object} state - Application state
 * @param {number} trackIdx - Track index
 * @param {number} measureIdx - Measure index (default 0)
 * @returns {object|null} Track or null
 */
export const getTrack = (state, trackIdx, measureIdx = 0) => {
    const measure = getMeasure(state, measureIdx);
    if (!measure || !measure.tracks) return null;
    return measure.tracks[trackIdx] || null;
};

/**
 * Get mix settings for an instrument
 * @param {object} state - Application state
 * @param {string} instrumentSymbol - Instrument symbol
 * @returns {object} Mix settings with defaults
 */
export const getMixSettings = (state, instrumentSymbol) => {
    if (state.mix && state.mix[instrumentSymbol]) {
        return state.mix[instrumentSymbol];
    }
    return { volume: 1.0, muted: false, lastVolume: 1.0 };
};

/**
 * Get instrument definition from cache
 * @param {object} state - Application state
 * @param {string} instrumentSymbol - Instrument symbol
 * @returns {object|null} Instrument definition or null
 */
export const getInstrumentDefinition = (state, instrumentSymbol) => {
    return state.instrumentDefinitions[instrumentSymbol] || null;
};

/**
 * Check if rhythm can be shared via URL
 * @param {object} state - Application state
 * @returns {boolean} True if shareable
 */
export const isRhythmShareable = (state) => {
    return state.rhythmSource === 'repo' && !!state.currentRhythmId;
};

/**
 * Get the effective BPM for a section (section override or global)
 * @param {object} state - Application state
 * @param {object} section - Section object (optional, uses active section if not provided)
 * @returns {number} Effective BPM
 */
export const getEffectiveBpm = (state, section = null) => {
    const sec = section || getActiveSection(state);
    if (!sec || !state.toque) return 120;
    return sec.bpm ?? state.toque.globalBpm;
};

/**
 * Get all unique instruments in the current rhythm
 * @param {object} state - Application state
 * @returns {string[]} Array of unique instrument symbols
 */
export const getUniqueInstruments = (state) => {
    if (!state.toque || !state.toque.sections) return [];

    const instruments = new Set();
    state.toque.sections.forEach(section => {
        section.measures.forEach(measure => {
            measure.tracks.forEach(track => {
                instruments.add(track.instrument);
            });
        });
    });
    return Array.from(instruments);
};

/**
 * Check if BataExplorer is open
 * @param {object} state - Application state
 * @returns {boolean} True if open
 */
export const isBataExplorerOpen = (state) => {
    return state.uiState?.bataExplorer?.isOpen || false;
};

/**
 * Get BataExplorer metadata
 * @param {object} state - Application state
 * @returns {object|null} Metadata or null
 */
export const getBataMetadata = (state) => {
    return state.uiState?.bataExplorer?.metadata || null;
};

/**
 * Get the explorer metadata for a specific rhythm
 * @param {object} state - Application state
 * @param {string} rhythmId - Rhythm ID
 * @returns {object|null} Rhythm metadata from explorer or null
 */
export const getExplorerRhythmMeta = (state, rhythmId) => {
    const metadata = getBataMetadata(state);
    if (!metadata || !metadata.toques) return null;
    return metadata.toques[rhythmId] || null;
};

/**
 * Check if an instrument definition is loaded
 * @param {object} state - Application state
 * @param {string} instrumentSymbol - Instrument symbol
 * @returns {boolean} True if loaded
 */
export const isInstrumentLoaded = (state, instrumentSymbol) => {
    return !!state.instrumentDefinitions[instrumentSymbol];
};

/**
 * Get valid strokes for an instrument
 * @param {object} state - Application state
 * @param {string} instrumentSymbol - Instrument symbol
 * @returns {string[]} Array of valid stroke letters
 */
export const getValidStrokes = (state, instrumentSymbol) => {
    const def = getInstrumentDefinition(state, instrumentSymbol);
    if (!def || !def.sounds) return [];
    return def.sounds.map(s => s.letter.toUpperCase());
};
