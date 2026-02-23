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

/**
 * Update a stroke at a specific cell position
 * @param {object} state
 * @param {{ track: object, stepIdx: number, stroke: string, dynamic: string }} payload
 */
export const setStroke = (state, { track, stepIdx, stroke, dynamic }) => {
    track.strokes[stepIdx] = stroke;
    if (!track.dynamics) track.dynamics = Array(track.strokes.length).fill('N');
    track.dynamics[stepIdx] = dynamic;
};

/**
 * Set a track's visual subdivision steps
 * @param {object} state
 * @param {{ track: object, trackSteps: number }} payload
 */
export const setTrackSteps = (state, { track, trackSteps }) => {
    track.trackSteps = trackSteps;
};

/**
 * Add a track to all measures in a section
 * @param {object} state
 * @param {{ section: object, trackTemplate: object }} payload
 */
export const addTrackToSection = (state, { section, trackTemplate }) => {
    section.measures.forEach(measure => {
        measure.tracks.push({
            ...trackTemplate,
            id: crypto.randomUUID()
        });
    });
};

/**
 * Update a track's instrument across all measures
 * @param {object} state
 * @param {{ section: object, trackIdx: number, instrument: string, pack: string, volume: number, muted: boolean }} payload
 */
export const updateTrackInstrumentInSection = (state, { section, trackIdx, instrument, pack, volume, muted }) => {
    section.measures.forEach(measure => {
        if (measure.tracks[trackIdx]) {
            measure.tracks[trackIdx].instrument = instrument;
            measure.tracks[trackIdx].pack = pack;
            measure.tracks[trackIdx].volume = volume;
            measure.tracks[trackIdx].muted = muted;
        }
    });
};

// ─── Instrument Definition Mutations ────────────────────────────────────────

/**
 * Cache an instrument definition
 * @param {object} state
 * @param {{ symbol: string, definition: object }} payload
 */
export const setInstrumentDefinition = (state, { symbol, definition }) => {
    state.instrumentDefinitions[symbol] = definition;
};

// ─── Rhythm / Toque Mutations ───────────────────────────────────────────────

/**
 * Set the entire toque state (rhythm loaded/created)
 * @param {object} state
 * @param {{ toque: object }} payload
 */
export const setToque = (state, { toque }) => {
    state.toque = toque;
};

/**
 * Set rhythm source tracking ('repo', 'local', 'new')
 * @param {object} state
 * @param {{ source: string, rhythmId: string|null }} payload
 */
export const setRhythmSource = (state, { source, rhythmId = null }) => {
    state.rhythmSource = source;
    state.currentRhythmId = rhythmId;
};

/**
 * Reset the global mix state
 * @param {object} state
 */
export const resetMix = (state) => {
    state.mix = {};
};

/**
 * Set the active section ID (state + playback sync)
 * @param {object} state
 * @param {{ id: string }} payload
 */
export const setActiveSectionId = (state, { id }) => {
    state.activeSectionId = id;
};

// ─── Section CRUD Mutations ─────────────────────────────────────────────────

/**
 * Push a new section to the toque
 * @param {object} state
 * @param {{ section: object }} payload
 */
export const pushSection = (state, { section }) => {
    state.toque.sections.push(section);
};

/**
 * Delete a section by ID
 * @param {object} state
 * @param {{ id: string }} payload
 */
export const deleteSection = (state, { id }) => {
    state.toque.sections = state.toque.sections.filter(s => s.id !== id);
};

// ─── Measure CRUD Mutations ─────────────────────────────────────────────────

/**
 * Push a measure to the active section
 * @param {object} state
 * @param {{ section: object, measure: object }} payload
 */
export const pushMeasure = (state, { section, measure }) => {
    section.measures.push(measure);
};

/**
 * Delete a measure from a section
 * @param {object} state
 * @param {{ section: object, measureIdx: number }} payload
 */
export const deleteMeasure = (state, { section, measureIdx }) => {
    section.measures.splice(measureIdx, 1);
};

/**
 * Insert a measure at a specific position
 * @param {object} state
 * @param {{ section: object, measureIdx: number, measure: object }} payload
 */
export const insertMeasure = (state, { section, measureIdx, measure }) => {
    section.measures.splice(measureIdx, 0, measure);
};

// ─── Mixer Mutations ────────────────────────────────────────────────────────

/**
 * Ensure a mix entry exists for an instrument
 * @param {object} state
 * @param {{ symbol: string, defaults?: { volume: number, muted: boolean } }} payload
 */
export const ensureMixEntry = (state, { symbol, defaults = { volume: 1.0, muted: false } }) => {
    if (!state.mix[symbol]) {
        state.mix[symbol] = { ...defaults, lastVolume: defaults.volume };
    }
};

/**
 * Update the global volume for an instrument in the mix
 * @param {object} state
 * @param {{ symbol: string, volume: number }} payload
 */
export const setMixVolume = (state, { symbol, volume }) => {
    const mix = state.mix[symbol];
    if (!mix) return;
    mix.volume = volume;
    if (volume > 0) mix.lastVolume = volume;
    // Sync mute state
    if (volume === 0 && !mix.muted) mix.muted = true;
    else if (volume > 0 && mix.muted) mix.muted = false;
};

/**
 * Set the global mute state for an instrument
 * @param {object} state
 * @param {{ symbol: string, muted: boolean }} payload
 */
export const setMixMuted = (state, { symbol, muted }) => {
    const mix = state.mix[symbol];
    if (!mix) return;
    mix.muted = muted;
    if (muted) {
        if (mix.volume > 0) mix.lastVolume = mix.volume;
        mix.volume = 0;
    } else {
        mix.volume = mix.lastVolume || 1.0;
    }
};

/**
 * Propagate mix volume/mute to all tracks of an instrument across all sections
 * @param {object} state
 * @param {{ symbol: string, volume: number, muted: boolean }} payload
 */
export const propagateMixToTracks = (state, { symbol, volume, muted }) => {
    if (!state.toque?.sections) return;
    state.toque.sections.forEach(section => {
        section.measures.forEach(measure => {
            measure.tracks.forEach(track => {
                if (track.instrument === symbol) {
                    track.volume = volume;
                    track.muted = muted;
                }
            });
        });
    });
};

// ─── Track Resize Mutations ─────────────────────────────────────────────────

/**
 * Resize tracks in a section to match new step count
 * @param {object} state
 * @param {{ section: object, emptyStroke: string }} payload
 */
export const resizeTracksToSteps = (state, { section, emptyStroke }) => {
    const newSteps = section.steps;
    section.measures.forEach(measure => {
        measure.tracks.forEach(track => {
            // Adjust trackSteps if needed
            if (track.trackSteps && track.trackSteps > newSteps) {
                const validDivisors = [];
                for (let i = 1; i <= newSteps; i++) {
                    if (newSteps % i === 0) validDivisors.push(i);
                }
                track.trackSteps = validDivisors.reduce((prev, curr) =>
                    Math.abs(curr - track.trackSteps) < Math.abs(prev - track.trackSteps) ? curr : prev
                );
            }
            // Resize strokes array
            if (newSteps > track.strokes.length) {
                const diff = newSteps - track.strokes.length;
                for (let i = 0; i < diff; i++) track.strokes.push(emptyStroke);
            } else {
                track.strokes.length = newSteps;
            }
            // Resize dynamics array if present
            if (track.dynamics) {
                if (newSteps > track.dynamics.length) {
                    const diff = newSteps - track.dynamics.length;
                    for (let i = 0; i < diff; i++) track.dynamics.push('N');
                } else {
                    track.dynamics.length = newSteps;
                }
            }
        });
    });
};

// ─── Playback Mutations ─────────────────────────────────────────────────────

/**
 * Set playing state
 * @param {object} state
 * @param {{ isPlaying: boolean }} payload
 */
export const setPlaying = (state, { isPlaying }) => {
    state.isPlaying = isPlaying;
};

/**
 * Sync the state-level current step (for rendering)
 * @param {object} state
 * @param {{ step: number }} payload
 */
export const setCurrentStep = (state, { step }) => {
    state.currentStep = step;
};

/**
 * Reset playback to the first section (called on stop)
 * @param {object} state
 * @param {{ sectionId: string }} payload
 */
export const resetPlayback = (state, { sectionId }) => {
    state.isPlaying = false;
    state.currentStep = -1;
    state.activeSectionId = sectionId;
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
    setStroke,
    setTrackSteps,
    addTrackToSection,
    updateTrackInstrumentInSection,
    // Instrument Definitions
    setInstrumentDefinition,
    // Rhythm / Toque
    setToque,
    setRhythmSource,
    resetMix,
    setActiveSectionId,
    // Section CRUD
    pushSection,
    deleteSection,
    // Measure CRUD
    pushMeasure,
    deleteMeasure,
    insertMeasure,
    // Mixer
    ensureMixEntry,
    setMixVolume,
    setMixMuted,
    propagateMixToTracks,
    // Track Resize
    resizeTracksToSteps,
    // Playback
    setPlaying,
    setCurrentStep,
    resetPlayback,
};

