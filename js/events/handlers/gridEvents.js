/*
  js/events/handlers/gridEvents.js
  Event handlers for grid interactions (cell clicks, track controls, volume).
*/

import { state } from '../../store.js';
import { refreshGrid } from '../../ui/renderer.js';
import { actions } from '../../actions.js';
import { StrokeType } from '../../types.js';
import { getValidInstrumentSteps } from '../../utils/gridUtils.js';

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
    refreshGrid();
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

