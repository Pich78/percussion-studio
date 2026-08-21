/*
  js/events/handlers/gridEvents.js
  Event handlers for grid interactions (cell clicks, track controls, volume).
*/

import { state, commit } from '../../store.js';
import { getActiveSection, snapStepIndex } from '../../store/stateSelectors.js';
import { eventBus } from '../../services/eventBus.js';
import { trackMixer } from '../../services/trackMixer.js';
import { actions } from '../../actions.js';
import { StrokeType } from '../../types.js';
import { getValidInstrumentSteps } from '../../utils/gridUtils.js';
import { updateGlobalCursor } from '../../utils/strokeCursors.js';
import * as pieMenuState from './pieMenuState.js';

/**
 * Handle cell click (update stroke)
 * @param {HTMLElement} target - The clicked cell element
 */
export const handleCellClick = (target) => {
    // If this click is the release of a long press that opened the menu, ignore it
    if (pieMenuState.consumeLongPressFlag()) {
        return;
    }

    // If pie menu is open and we click a cell normally, just close the menu and ignore click
    if (state.uiState.pieMenu.isOpen) {
        closePieMenu();
        return;
    }

    const section = getActiveSection(state);
    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    const rawStepIdx = parseInt(target.dataset.stepIndex);

    const track = section.measures[measureIdx].tracks[trackIdx];

    const targetStepIdx = snapStepIndex(rawStepIdx, track, section);

    actions.handleUpdateStroke(trackIdx, targetStepIdx, measureIdx);
};

/**
 * Handle cell right-click (clear stroke)
 * @param {HTMLElement} target - The clicked cell element
 */
export const handleCellRightClick = (target) => {
    const section = getActiveSection(state);
    const trackIdx = parseInt(target.dataset.trackIndex);
    const stepIdx = parseInt(target.dataset.stepIndex);
    section.tracks[trackIdx].strokes[stepIdx] = StrokeType.None;
    eventBus.emit('grid-refresh');
};

/**
 * Handle mute toggle
 * @param {HTMLElement} target - The mute button element
 */
export const handleToggleMute = (target) => {
    const section = getActiveSection(state);
    const tIdx = parseInt(target.dataset.trackIndex);
    const mIdx = parseInt(target.dataset.measureIndex || 0);
    const track = section.measures[mIdx].tracks[tIdx];

    trackMixer.toggleMute(tIdx, track, track.instrument);
};

/**
 * Handle remove track
 * @param {HTMLElement} target - The remove button element
 */
export const handleRemoveTrack = (target) => {
    if (confirm("Remove track?")) {
        const section = getActiveSection(state);
        const tIdx = parseInt(target.dataset.trackIndex);
        commit('removeTrack', { section, trackIdx: tIdx });
        eventBus.emit('grid-refresh');
    }
};

/**
 * Handle cycle track steps (subdivision)
 * @param {HTMLElement} target - The button element
 */
export const handleCycleTrackSteps = (target) => {
    const section = getActiveSection(state);
    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    const track = section.measures[measureIdx].tracks[trackIdx];

    const currentSteps = track.trackSteps || section.subdivision || 4;
    const validOptions = getValidInstrumentSteps(section.steps);
    const currentIndex = validOptions.indexOf(currentSteps);
    const nextIndex = (currentIndex + 1) % validOptions.length;
    const newSteps = validOptions[nextIndex];

    actions.updateTrackSteps(trackIdx, measureIdx, newSteps);
};

/**
 * Handle toggle snap to grid
 * @param {HTMLElement} target - The button element
 */
export const handleToggleTrackSnap = (target) => {
    const section = getActiveSection(state);
    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    const track = section.measures[measureIdx].tracks[trackIdx];

    commit('toggleTrackSnap', { track });
    eventBus.emit('grid-refresh');
};

// ─── Volume repaint scheduling ──────────────────────────────────────────
// Actions no longer emit repaint events. Drag ticks never schedule (the
// drag machinery emits one reconciling render on release); keyboard or
// programmatic ticks coalesce through this 50 ms leading+trailing
// throttle, so held-arrow updates stay visible without flooding renders.
// Full render, not grid-refresh: muted/solo styling is template-bound
// and lives on surfaces grid-refresh never touches (dual-mode views,
// mixer modals).
const VOLUME_REFRESH_THROTTLE_MS = 50;
let volumeRefreshLast = 0;
let volumeRefreshTimer = null;

export const scheduleVolumeRepaint = () => {
    const now = performance.now();
    const elapsed = now - volumeRefreshLast;
    if (elapsed >= VOLUME_REFRESH_THROTTLE_MS) {
        volumeRefreshLast = now;
        eventBus.emit('render');
        return;
    }
    if (!volumeRefreshTimer) {
        volumeRefreshTimer = setTimeout(() => {
            volumeRefreshTimer = null;
            volumeRefreshLast = performance.now();
            eventBus.emit('render');
        }, VOLUME_REFRESH_THROTTLE_MS - elapsed);
    }
};

/**
 * Handle volume slider input.
 * Delegates to the central setGlobalVolume action — state.mix[symbol].volume
 * is the single source of truth and the next render rebuilds the slider
 * from it. Also writes the outside percentage text directly so the
 * prominent value next to the track name updates in lock-step with the
 * slider position during drag (mirrors the BPM pattern at
 * playbackEvents.js:42-45 and mobileEvents.js:634-635).
 *
 * Repaint policy: pointer-drag ticks never schedule a grid-refresh (the
 * drag machinery emits one on release); any other input source (keyboard,
 * programmatic dispatch) goes through scheduleVolumeRepaint().
 *
 * @param {Event} e - The input event (target is the slider element)
 */
export const handleVolumeInput = (e) => {
    const target = e.target;
    const section = getActiveSection(state);
    const tIdx = parseInt(target.dataset.trackIndex);
    const mIdx = parseInt(target.dataset.measureIndex || 0);
    const track = section.measures[mIdx].tracks[tIdx];
    const newVolume = parseFloat(target.value);

    actions.setGlobalVolume(track.instrument, newVolume);

    if (e.detail?.source !== 'pointer-drag') {
        scheduleVolumeRepaint();
    }

    // Direct DOM update of the outside pct text so the prominent value
    // next to the track name updates on every input tick (drag, keyboard,
    // programmatic dispatch). The input handler is the single update
    // point for this surface, matching how the BPM pattern updates
    // #header-global-bpm.
    const container = target.closest('.group\\/vol');
    const outsidePct = container?.parentElement?.querySelector('[data-role="volume-pct-outside"]');
    if (outsidePct) outsidePct.textContent = `${Math.round(newVolume * 100)}%`;
};

/**
 * Handle track steps dropdown change
 * @param {HTMLSelectElement} target - The select element
 */
export const handleTrackStepsChange = (target) => {
    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    const newSteps = parseInt(target.value);
    actions.updateTrackSteps(trackIdx, measureIdx, newSteps);
};

/**
 * Handle stroke selection
 * @param {HTMLElement} target - The stroke button element
 */
export const handleSelectStroke = (target) => {
    commit('setSelectedStroke', { stroke: target.dataset.stroke });
    updateGlobalCursor(state.selectedStroke, state.selectedDynamic);
    eventBus.emit('render');
};

/**
 * Handle dynamic selection
 * @param {HTMLElement} target - The dynamic button element
 */
export const handleSelectDynamic = (target) => {
    commit('setSelectedDynamic', { dynamic: target.dataset.dynamic });
    updateGlobalCursor(state.selectedStroke, state.selectedDynamic);
    eventBus.emit('render');
};

/**
 * Handle clear pattern
 */
export const handleClearPattern = () => {
    if (confirm("Clear all notes in this section?")) {
        const section = getActiveSection(state);
        commit('clearSectionPattern', { section, emptyStroke: StrokeType.None });
        eventBus.emit('grid-refresh');
    }
};

/**
 * Helper to open pie menu
 */
const triggerPieMenuOpen = (target, delayMs, isLongPress) => {
    const section = getActiveSection(state);
    if (!section) return;

    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    const stepIdx = parseInt(target.dataset.stepIndex);

    const track = section.measures[measureIdx]?.tracks[trackIdx];
    if (!track) return;

    const instDef = state.instrumentDefinitions[track.instrument];
    if (!instDef || !instDef.sounds || instDef.sounds.length === 0) return;

    const openFn = () => {
        if (isLongPress) pieMenuState.markLongPressOpen();
        const rect = target.getBoundingClientRect();

        const targetStepIdx = snapStepIndex(stepIdx, track, section);

        commit('openPieMenu', {
            x: rect.left + (rect.width / 2) + window.scrollX,
            y: rect.top + (rect.height / 2) + window.scrollY,
            trackIndex: trackIdx,
            stepIndex: targetStepIdx,
            measureIndex: measureIdx,
            instrumentDef: instDef
        });
        eventBus.emit('render');
    };

    if (delayMs > 0) {
        pieMenuState.scheduleOpen(openFn, delayMs);
    } else {
        openFn();
    }
};

/**
 * Handle mouse down on a tubs-cell (trigger long-press pie menu)
 */
export const handleCellMouseDown = (e, target) => {
    if (window.IS_MOBILE_VIEW || state.isPlaying) return;

    if (state.uiState.pieMenu.isOpen) {
        closePieMenu();
        return;
    }

    pieMenuState.resetLongPressFlag();

    if (state.uiState.pieMenu.editingMode === 'pie-menu' && state.uiState.pieMenu.pieMenuTrigger === 'long-press') {
        const delay = state.uiState.pieMenu.pressTimeMs;
        triggerPieMenuOpen(target, delay, true);
    }
};

/**
 * Handle mouse enter on a tubs-cell (trigger hover pie menu)
 */
export const handleCellMouseEnter = (e, target) => {
    if (window.IS_MOBILE_VIEW || state.isPlaying) return;

    pieMenuState.cancelCloseTimer();

    if (state.uiState.pieMenu.editingMode === 'pie-menu' && state.uiState.pieMenu.pieMenuTrigger === 'hover') {
        const delay = state.uiState.pieMenu.hoverTimeMs;
        triggerPieMenuOpen(target, delay, false);
    }
};

/**
 * Handle mouse leave from a tubs-cell
 */
export const handleCellMouseLeave = (e, target) => {
    pieMenuState.cancelOpenTimer();

    if (state.uiState.pieMenu.isOpen && state.uiState.pieMenu.editingMode === 'pie-menu' && state.uiState.pieMenu.pieMenuTrigger === 'hover') {
        pieMenuState.scheduleClose(() => {
            closePieMenu();
        }, 300);
    }
};

/**
 * Handle mouse enter on the pie menu itself (cancel closing)
 */
export const handlePieMenuMouseEnter = () => {
    pieMenuState.cancelCloseTimer();
};

/**
 * Handle mouse leave from the pie menu (trigger close)
 */
export const handlePieMenuMouseLeave = () => {
    if (state.uiState.pieMenu.editingMode === 'pie-menu' && state.uiState.pieMenu.pieMenuTrigger === 'hover') {
        pieMenuState.scheduleClose(() => {
            closePieMenu();
        }, 200);
    }
};

/**
 * Handle cell right click when pie menu is in right-click mode
 */
export const handleCellRightClickOpenPieMenu = (e, target) => {
    if (window.IS_MOBILE_VIEW || state.isPlaying) return;
    triggerPieMenuOpen(target, 0, false);
};

/**
 * Cancel any pending intent timer (e.g. mouseup or mouseout)
 */
export const cancelPieMenuPress = () => {
    pieMenuState.cancelOpenTimer();
};

/**
 * Handle selection of an item in the pie menu
 */
export const handlePieMenuSelect = (e, target) => {
    const stroke = target.dataset.stroke;
    const pm = state.uiState.pieMenu;

    console.log('[DEBUG handlePieMenuSelect] CLICKED STROKE:', stroke);
    console.log('[DEBUG handlePieMenuSelect] PIE MENU STATE:', JSON.stringify(pm));

    if (pm.isOpen && pm.trackIndex !== null) {
        console.log('[DEBUG handlePieMenuSelect] Inside IF! Calling handleUpdateStrokeDirectly', pm.trackIndex, pm.stepIndex, pm.measureIndex, stroke);

        actions.handleUpdateStrokeDirectly(
            pm.trackIndex,
            pm.stepIndex,
            pm.measureIndex,
            stroke
        );

        if (pm.updateGlobalCursor) {
            commit('setSelectedStroke', { stroke });
            updateGlobalCursor(stroke, state.selectedDynamic);
        }
    }
    closePieMenu();
};

/**
 * Closes the pie menu and renders
 */
export const closePieMenu = () => {
    if (state.uiState.pieMenu.isOpen) {
        commit('closePieMenu');
        eventBus.emit('render');
    }
};

/**
 * Handle mouse wheel to cycle through instrument symbols
 */
export const handleCellMouseWheel = (e, target) => {
    // Only intercept if we're in mouse-wheel editing mode
    if (state.uiState.pieMenu.editingMode !== 'mouse-wheel') return;

    // Prevent default scrolling behaviour when scrolling over grid cells/rows
    e.preventDefault();
    if (window.IS_MOBILE_VIEW || state.isPlaying) return;

    // The target could be a cell or a track row, we need the trackIndex
    const trackIdx = parseInt(target.dataset.trackIndex);
    if (isNaN(trackIdx)) return;

    const section = getActiveSection(state);
    if (!section) return;

    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    const track = section.measures[measureIdx]?.tracks[trackIdx];
    if (!track) return;

    const instDef = state.instrumentDefinitions[track.instrument];
    if (!instDef || !instDef.sounds || instDef.sounds.length === 0) return;

    // Build the array of allowed strokes (including rest)
    const options = [
        ...instDef.sounds.map(s => s.letter),
        StrokeType.None
    ];

    // Find the index of the currently selected global cursor in this track's options
    let currentIndex = options.indexOf(state.selectedStroke);

    // If current stroke isn't valid for this instrument, default to first option
    if (currentIndex === -1) {
        currentIndex = 0;
    }

    // Determine direction from e.deltaY (positive is scroll down, negative is scroll up)
    if (e.deltaY > 0) {
        // Scroll down: next item
        currentIndex = (currentIndex + 1) % options.length;
    } else if (e.deltaY < 0) {
        // Scroll up: previous item
        currentIndex = (currentIndex - 1 + options.length) % options.length;
    } else {
        return;
    }

    const nextStroke = options[currentIndex];

    // Update the global cursor and visual state
    commit('setSelectedStroke', { stroke: nextStroke });
    updateGlobalCursor(nextStroke, state.selectedDynamic);

    // Re-render the app to naturally update the bottom palette selection UI
    eventBus.emit('render');
};

