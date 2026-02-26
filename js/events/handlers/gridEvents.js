/*
  js/events/handlers/gridEvents.js
  Event handlers for grid interactions (cell clicks, track controls, volume).
*/

import { state, commit } from '../../store.js';
import { getActiveSection, snapStepIndex } from '../../store/stateSelectors.js';
import { refreshGrid, renderApp } from '../../ui/renderer.js';
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
    refreshGrid();
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

    const newMutedState = !track.muted;
    actions.setGlobalMute(track.instrument, newMutedState);
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
        refreshGrid();
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
    refreshGrid();
};

/**
 * Handle volume slider input
 * @param {HTMLInputElement} target - The slider element
 */
export const handleVolumeInput = (target) => {
    const section = getActiveSection(state);
    const tIdx = parseInt(target.dataset.trackIndex);
    const mIdx = parseInt(target.dataset.measureIndex || 0);
    const track = section.measures[mIdx].tracks[tIdx];
    const newVolume = parseFloat(target.value);

    // Update state and audio engine
    actions.setGlobalVolume(track.instrument, newVolume);

    // Direct DOM update for immediate visual feedback (no re-render needed)
    const container = target.closest('.group\\/vol');
    if (container) {
        const percentage = Math.round(newVolume * 100);
        // Update fill bar
        const fillBar = container.querySelector('div[class*="bg-gradient"]');
        if (fillBar) fillBar.style.width = `${percentage}%`;
        // Update handle position (8px offset for 4x4 handle)
        const handle = container.querySelector('div[class*="bg-white"]');
        if (handle) handle.style.left = `calc(${percentage}% - 8px)`;
        // Update percentage text
        const percentLabel = container.querySelector('span[class*="font-medium"]');
        if (percentLabel) percentLabel.textContent = `${percentage}%`;
    }
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
    renderApp();
};

/**
 * Handle dynamic selection
 * @param {HTMLElement} target - The dynamic button element
 */
export const handleSelectDynamic = (target) => {
    commit('setSelectedDynamic', { dynamic: target.dataset.dynamic });
    updateGlobalCursor(state.selectedStroke, state.selectedDynamic);
    renderApp();
};

/**
 * Handle clear pattern
 */
export const handleClearPattern = () => {
    if (confirm("Clear all notes in this section?")) {
        const section = getActiveSection(state);
        commit('clearSectionPattern', { section, emptyStroke: StrokeType.None });
        refreshGrid();
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
        renderApp();
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
        renderApp();
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
    renderApp();
};

