/*
  js/events/handlers/gridEvents.js
  Event handlers for grid interactions (cell clicks, track controls, volume).
*/

import { state } from '../../store.js';
import { refreshGrid, renderApp } from '../../ui/renderer.js';
import { actions } from '../../actions.js';
import { StrokeType } from '../../types.js';
import { getValidInstrumentSteps } from '../../utils/gridUtils.js';
import { updateGlobalCursor } from '../../utils/strokeCursors.js';

// Timers and state for pie menu interactions
let pieMenuTimer = null;
let pieMenuCloseTimer = null;
let justOpenedByLongPress = false;

/**
 * Handle cell click (update stroke)
 * @param {HTMLElement} target - The clicked cell element
 */
export const handleCellClick = (target) => {
    // If this click is the release of a long press that opened the menu, ignore it
    if (justOpenedByLongPress) {
        justOpenedByLongPress = false;
        return;
    }

    // If pie menu is open and we click a cell normally, just close the menu and ignore click
    if (state.uiState.pieMenu.isOpen) {
        closePieMenu();
        return;
    }

    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    const rawStepIdx = parseInt(target.dataset.stepIndex);

    const track = section.measures[measureIdx].tracks[trackIdx];

    let targetStepIdx = rawStepIdx;

    // Snap Input Logic
    if (track.snapToGrid) {
        const divisor = track.trackSteps || section.subdivision || 4;
        const groupSize = section.steps / divisor;
        targetStepIdx = Math.floor(rawStepIdx / groupSize) * groupSize;
        if (targetStepIdx >= section.steps) {
            targetStepIdx = section.steps - groupSize;
        }
    }

    actions.handleUpdateStroke(trackIdx, targetStepIdx, measureIdx);
};

/**
 * Handle cell right-click (clear stroke)
 * @param {HTMLElement} target - The clicked cell element
 */
export const handleCellRightClick = (target) => {
    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
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
    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
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
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        const tIdx = parseInt(target.dataset.trackIndex);
        section.measures.forEach(measure => {
            measure.tracks.splice(tIdx, 1);
        });
        refreshGrid();
    }
};

/**
 * Handle cycle track steps (subdivision)
 * @param {HTMLElement} target - The button element
 */
export const handleCycleTrackSteps = (target) => {
    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
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
    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    const track = section.measures[measureIdx].tracks[trackIdx];

    track.snapToGrid = !track.snapToGrid;
    refreshGrid();
};

/**
 * Handle volume slider input
 * @param {HTMLInputElement} target - The slider element
 */
export const handleVolumeInput = (target) => {
    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
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
    state.selectedStroke = target.dataset.stroke;
    updateGlobalCursor(state.selectedStroke);
    renderApp();
};

/**
 * Handle clear pattern
 */
export const handleClearPattern = () => {
    if (confirm("Clear all notes in this section?")) {
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        section.measures.forEach(measure => {
            measure.tracks.forEach(t => t.strokes.fill(StrokeType.None));
        });
        refreshGrid();
    }
};

/**
 * Helper to open pie menu
 */
const triggerPieMenuOpen = (target, delayMs, isLongPress) => {
    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
    if (!section) return;

    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    const stepIdx = parseInt(target.dataset.stepIndex);

    const track = section.measures[measureIdx]?.tracks[trackIdx];
    if (!track) return;

    const instDef = state.instrumentDefinitions[track.instrument];
    if (!instDef || !instDef.sounds || instDef.sounds.length === 0) return;

    const openFn = () => {
        if (isLongPress) justOpenedByLongPress = true;
        const rect = target.getBoundingClientRect();

        let targetStepIdx = stepIdx;
        if (track.snapToGrid) {
            const divisor = track.trackSteps || section.subdivision || 4;
            const groupSize = section.steps / divisor;
            targetStepIdx = Math.floor(stepIdx / groupSize) * groupSize;
            if (targetStepIdx >= section.steps) targetStepIdx = section.steps - groupSize;
        }

        state.uiState.pieMenu = {
            ...state.uiState.pieMenu,
            isOpen: true,
            x: rect.left + (rect.width / 2) + window.scrollX,
            y: rect.top + (rect.height / 2) + window.scrollY,
            trackIndex: trackIdx,
            stepIndex: targetStepIdx,
            measureIndex: measureIdx,
            instrumentDef: instDef
        };
        renderApp();
    };

    if (delayMs > 0) {
        pieMenuTimer = setTimeout(openFn, delayMs);
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

    justOpenedByLongPress = false;

    if (state.uiState.pieMenu.editingMode === 'long-press') {
        const delay = state.uiState.pieMenu.pressTimeMs;
        triggerPieMenuOpen(target, delay, true);
    }
};

/**
 * Handle mouse enter on a tubs-cell (trigger hover pie menu)
 */
export const handleCellMouseEnter = (e, target) => {
    if (window.IS_MOBILE_VIEW || state.isPlaying) return;

    if (pieMenuCloseTimer) {
        clearTimeout(pieMenuCloseTimer);
        pieMenuCloseTimer = null;
    }

    if (state.uiState.pieMenu.editingMode === 'hover') {
        const delay = state.uiState.pieMenu.hoverTimeMs;
        triggerPieMenuOpen(target, delay, false);
    }
};

/**
 * Handle mouse leave from a tubs-cell
 */
export const handleCellMouseLeave = (e, target) => {
    if (pieMenuTimer) {
        clearTimeout(pieMenuTimer);
        pieMenuTimer = null;
    }

    if (state.uiState.pieMenu.isOpen && state.uiState.pieMenu.editingMode === 'hover') {
        pieMenuCloseTimer = setTimeout(() => {
            closePieMenu();
        }, 300);
    }
};

/**
 * Handle mouse enter on the pie menu itself (cancel closing)
 */
export const handlePieMenuMouseEnter = () => {
    if (pieMenuCloseTimer) {
        clearTimeout(pieMenuCloseTimer);
        pieMenuCloseTimer = null;
    }
};

/**
 * Handle mouse leave from the pie menu (trigger close)
 */
export const handlePieMenuMouseLeave = () => {
    if (state.uiState.pieMenu.editingMode === 'hover') {
        pieMenuCloseTimer = setTimeout(() => {
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
    if (pieMenuTimer) {
        clearTimeout(pieMenuTimer);
        pieMenuTimer = null;
    }
};

/**
 * Handle selection of an item in the pie menu
 */
export const handlePieMenuSelect = (e, target) => {
    const stroke = target.dataset.stroke;
    const pm = state.uiState.pieMenu;

    if (pm.isOpen && pm.trackIndex !== null) {
        actions.handleUpdateStrokeDirectly(pm.trackIndex, pm.stepIndex, pm.measureIndex, stroke);

        if (pm.updateGlobalCursor) {
            state.selectedStroke = stroke;
            updateGlobalCursor(stroke);
        }
    }
    closePieMenu();
};

/**
 * Closes the pie menu and renders
 */
export const closePieMenu = () => {
    if (state.uiState.pieMenu.isOpen) {
        state.uiState.pieMenu.isOpen = false;
        renderApp();
    }
};

