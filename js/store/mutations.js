/*
  js/store/mutations.js
  Pure mutation functions for centralized state changes.
  
  Each mutation takes (state, payload) and mutates state in place.
  All mutations are registered in the MUTATIONS map for use with commit().
  
  Design: mutations are intentionally simple — they only change state.
  Side effects (rendering, audio, network) belong in actions, not here.
*/

// ─── UI State Mutations ─────────────────────────────────────────────────────

/**
 * Set the loading rhythm overlay state
 * @param {object} state
 * @param {{ isLoading: boolean, name: string|null }} payload
 */
export const setLoadingRhythm = (state, { isLoading, name = null }) => {
    state.uiState.isLoadingRhythm = isLoading;
    state.uiState.loadingRhythmName = isLoading ? name : null;
};

/**
 * Toggle menu open/closed
 * @param {object} state
 * @param {{ isOpen: boolean }} payload
 */
export const setMenuOpen = (state, { isOpen }) => {
    state.uiState.isMenuOpen = isOpen;
};

/**
 * Set modal state
 * @param {object} state
 * @param {{ open: boolean, type?: string }} payload
 */
export const setModal = (state, { open, type = null }) => {
    state.uiState.modalOpen = open;
    if (type) state.uiState.modalType = type;
    if (!open) {
        state.uiState.pendingInstrument = null;
        state.uiState.pendingSoundPack = null;
    }
};

/**
 * Toggle section dropdown (mobile)
 * @param {object} state
 */
export const toggleSectionDropdown = (state) => {
    state.uiState.sectionDropdownOpen = !state.uiState.sectionDropdownOpen;
};

// ─── Pie Menu Mutations ─────────────────────────────────────────────────────

/**
 * Open the pie menu at a specific cell
 * @param {object} state
 * @param {{ x, y, trackIndex, stepIndex, measureIndex, instrumentDef }} payload
 */
export const openPieMenu = (state, payload) => {
    state.uiState.pieMenu = {
        ...state.uiState.pieMenu,
        isOpen: true,
        x: payload.x,
        y: payload.y,
        trackIndex: payload.trackIndex,
        stepIndex: payload.stepIndex,
        measureIndex: payload.measureIndex,
        instrumentDef: payload.instrumentDef
    };
};

/**
 * Close the pie menu
 * @param {object} state
 */
export const closePieMenu = (state) => {
    state.uiState.pieMenu.isOpen = false;
};

/**
 * Update a pie menu setting (editingMode, pieMenuTrigger, etc.)
 * @param {object} state
 * @param {{ key: string, value: any }} payload
 */
export const setPieMenuSetting = (state, { key, value }) => {
    state.uiState.pieMenu[key] = value;
};

/**
 * Update a pie menu boolean behavior flag
 * @param {object} state
 * @param {{ setting: string, checked: boolean }} payload
 */
export const setPieMenuBehavior = (state, { setting, checked }) => {
    state.uiState.pieMenu[setting] = checked;
};

// ─── Selection Mutations ────────────────────────────────────────────────────

/**
 * Set the selected stroke
 * @param {object} state
 * @param {{ stroke: string }} payload
 */
export const setSelectedStroke = (state, { stroke }) => {
    state.selectedStroke = stroke;
};

/**
 * Set the selected dynamic
 * @param {object} state
 * @param {{ dynamic: string }} payload
 */
export const setSelectedDynamic = (state, { dynamic }) => {
    state.selectedDynamic = dynamic;
};

// ─── Section Mutations ──────────────────────────────────────────────────────

/**
 * Set the section's BPM override
 * @param {object} state
 * @param {{ section: object, bpm: number|undefined }} payload
 */
export const setSectionBpm = (state, { section, bpm }) => {
    section.bpm = bpm;
};

/**
 * Toggle BPM override on/off for a section
 * @param {object} state
 * @param {{ section: object, globalBpm: number }} payload
 */
export const toggleBpmOverride = (state, { section, globalBpm }) => {
    section.bpm = (section.bpm !== undefined) ? undefined : globalBpm;
};

/**
 * Set section subdivision
 * @param {object} state
 * @param {{ section: object, subdivision: number }} payload
 */
export const setSectionSubdivision = (state, { section, subdivision }) => {
    section.subdivision = subdivision;
};

/**
 * Set the global BPM
 * @param {object} state
 * @param {{ bpm: number }} payload
 */
export const setGlobalBpm = (state, { bpm }) => {
    state.toque.globalBpm = bpm;
};

// ─── Track Mutations ────────────────────────────────────────────────────────

/**
 * Toggle snap-to-grid for a track
 * @param {object} state
 * @param {{ track: object }} payload
 */
export const toggleTrackSnap = (state, { track }) => {
    track.snapToGrid = !track.snapToGrid;
};

/**
 * Clear all strokes in the active section
 * @param {object} state
 * @param {{ section: object, emptyStroke: string }} payload
 */
export const clearSectionPattern = (state, { section, emptyStroke }) => {
    section.measures.forEach(measure => {
        measure.tracks.forEach(t => t.strokes.fill(emptyStroke));
    });
};

/**
 * Remove a track from all measures
 * @param {object} state
 * @param {{ section: object, trackIdx: number }} payload
 */
export const removeTrack = (state, { section, trackIdx }) => {
    section.measures.forEach(measure => {
        measure.tracks.splice(trackIdx, 1);
    });
};

// ─── Mutation Registry ──────────────────────────────────────────────────────

/**
 * Map of all mutation names to functions.
 * Used by commit() for named dispatch.
 */
export const MUTATIONS = {
    // UI
    setLoadingRhythm,
    setMenuOpen,
    setModal,
    toggleSectionDropdown,
    // Pie Menu
    openPieMenu,
    closePieMenu,
    setPieMenuSetting,
    setPieMenuBehavior,
    // Selection
    setSelectedStroke,
    setSelectedDynamic,
    // Section
    setSectionBpm,
    toggleBpmOverride,
    setSectionSubdivision,
    setGlobalBpm,
    // Track
    toggleTrackSnap,
    clearSectionPattern,
    removeTrack,
};
