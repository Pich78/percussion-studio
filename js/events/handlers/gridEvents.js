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

// Timer for hover intent
let pieMenuHoverTimer = null;
let pieMenuCloseTimer = null;

/**
 * Handle cell click (update stroke)
 * @param {HTMLElement} target - The clicked cell element
 */
export const handleCellClick = (target) => {
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
 * Handle mouse enter on a tubs-cell (trigger pie menu)
 */
export const handleCellMouseEnter = (e, target) => {
    // Only desktop makes sense for hover pie menu
    if (window.IS_MOBILE_VIEW || state.isPlaying) return;

    // Clear any pending close
    if (pieMenuCloseTimer) {
        clearTimeout(pieMenuCloseTimer);
        pieMenuCloseTimer = null;
    }

    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
    if (!section) return;

    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    const stepIdx = parseInt(target.dataset.stepIndex);

    const track = section.measures[measureIdx]?.tracks[trackIdx];
    if (!track) return;

    const instDef = state.instrumentDefinitions[track.instrument];
    if (!instDef || !instDef.sounds || instDef.sounds.length === 0) return;

    // Wait slightly before opening to prevent flashing when moving mouse fast across cells
    pieMenuHoverTimer = setTimeout(() => {
        const rect = target.getBoundingClientRect();

        // Snap logic adjustment for the pie menu context record
        let targetStepIdx = stepIdx;
        if (track.snapToGrid) {
            const divisor = track.trackSteps || section.subdivision || 4;
            const groupSize = section.steps / divisor;
            targetStepIdx = Math.floor(stepIdx / groupSize) * groupSize;
            if (targetStepIdx >= section.steps) targetStepIdx = section.steps - groupSize;
        }

        // Center the pie menu on the cell, taking into account scroll position
        state.uiState.pieMenu = {
            isOpen: true,
            x: rect.left + (rect.width / 2) + window.scrollX,
            y: rect.top + (rect.height / 2) + window.scrollY,
            trackIndex: trackIdx,
            stepIndex: targetStepIdx,
            measureIndex: measureIdx,
            instrumentDef: instDef
        };

        renderApp();
    }, 250); // 250ms hover intent
};

/**
 * Handle mouse leave from a tubs-cell
 */
export const handleCellMouseLeave = (e, target) => {
    // Cancel opening if we leave before timer finishes
    if (pieMenuHoverTimer) {
        clearTimeout(pieMenuHoverTimer);
        pieMenuHoverTimer = null;
    }

    // Attempt to close if it is open (with a delay to allow moving into the pie menu)
    if (state.uiState.pieMenu.isOpen) {
        pieMenuCloseTimer = setTimeout(() => {
            closePieMenu();
        }, 300); // 300ms grace period to move mouse into the pie menu bridge
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
    pieMenuCloseTimer = setTimeout(() => {
        closePieMenu();
    }, 200);
};

/**
 * Handle selection of an item in the pie menu
 */
export const handlePieMenuSelect = (e, target) => {
    const stroke = target.dataset.stroke;
    const pm = state.uiState.pieMenu;

    if (pm.isOpen && pm.trackIndex !== null) {
        actions.handleUpdateStrokeDirectly(pm.trackIndex, pm.stepIndex, pm.measureIndex, stroke);
    }
    closePieMenu();
};

/**
 * Closes the pie menu and renders
 */
const closePieMenu = () => {
    if (state.uiState.pieMenu.isOpen) {
        state.uiState.pieMenu.isOpen = false;
        renderApp();
    }
};

