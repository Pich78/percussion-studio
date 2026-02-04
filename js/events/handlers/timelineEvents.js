/*
  js/events/handlers/timelineEvents.js
  Event handlers for timeline/section management.
*/

import { state, playback } from '../../store.js';
import { renderApp, refreshGrid } from '../../ui/renderer.js';
import { actions } from '../../actions.js';
import { getClosestDivisor } from '../../utils/gridUtils.js';

/**
 * Handle timeline section select
 * @param {string} sectionId - The section ID
 */
export const handleTimelineSelect = (sectionId) => {
    actions.updateActiveSection(sectionId);
};

/**
 * Handle add section
 */
export const handleAddSection = () => {
    actions.addSection();
};

/**
 * Handle delete section
 * @param {HTMLElement} target - The delete button element
 */
export const handleDeleteSection = (target) => {
    actions.deleteSection(target.dataset.id);
};

/**
 * Handle duplicate section
 * @param {HTMLElement} target - The duplicate button element
 */
export const handleDuplicateSection = (target) => {
    actions.duplicateSection(target.dataset.id);
};

/**
 * Handle section name update
 * @param {HTMLInputElement} target - The input element
 */
export const handleUpdateSectionName = (target) => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    if (section) {
        section.name = target.value;
        renderApp();
    }
};

/**
 * Handle meter update
 * @param {HTMLSelectElement} target - The select element
 */
export const handleUpdateMeter = (target) => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    if (!section) return;

    if (target.value === 'custom') {
        section.steps = 16;
        section.subdivision = 4;
        section.isCustomOverride = true;

        // Reset all track overrides
        section.measures.forEach(m => m.tracks.forEach(t => delete t.trackSteps));

        actions.resizeTracks(section);
        refreshGrid();
        renderApp();
        return;
    }

    const [steps, subdivision] = target.value.split('-').map(Number);
    section.steps = steps;
    section.subdivision = subdivision;
    section.isCustomOverride = false;

    // Reset all track overrides
    section.measures.forEach(m => m.tracks.forEach(t => delete t.trackSteps));

    actions.resizeTracks(section);
    refreshGrid();
    renderApp();
};

/**
 * Handle custom steps update
 * @param {HTMLInputElement} target - The input element
 */
export const handleUpdateCustomSteps = (target) => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    if (!section) return;

    const newSteps = Math.max(1, Math.min(64, parseInt(target.value) || 1));
    section.steps = newSteps;

    // Calculate a valid subdivision for the new step count
    section.subdivision = getClosestDivisor(4, newSteps);

    // Reset all track overrides
    section.measures.forEach(m => m.tracks.forEach(t => delete t.trackSteps));

    actions.resizeTracks(section);
    refreshGrid();
    renderApp();
};

/**
 * Handle custom subdivision update
 * @param {HTMLInputElement} target - The input element
 */
export const handleUpdateCustomSubdivision = (target) => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    if (!section) return;

    const newSubdivision = Math.max(1, Math.min(12, parseInt(target.value) || 1));
    section.subdivision = newSubdivision;
    refreshGrid();
    renderApp();
};

/**
 * Handle repetitions update
 * @param {HTMLInputElement} target - The input element
 */
export const handleUpdateRepetitions = (target) => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    if (section) {
        section.repetitions = Math.max(1, Number(target.value));
        renderApp();
    }
};

/**
 * Handle rhythm name update
 * @param {HTMLInputElement} target - The input element
 */
export const handleUpdateRhythmName = (target) => {
    if (state.toque) {
        state.toque.name = target.value;
    }
};

/**
 * Handle rhythm name enter key
 * @param {KeyboardEvent} e - The keyboard event
 * @param {HTMLInputElement} target - The input element
 */
export const handleRhythmNameKeydown = (e, target) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        target.blur();
    }
};

/**
 * Handle add measure
 */
export const handleAddMeasure = () => {
    actions.addMeasure();
};

/**
 * Handle delete measure
 * @param {HTMLElement} target - The delete button element
 */
export const handleDeleteMeasure = (target) => {
    actions.deleteMeasure(parseInt(target.dataset.measureIndex));
};

/**
 * Handle duplicate measure
 * @param {HTMLElement} target - The duplicate button element
 */
export const handleDuplicateMeasure = (target) => {
    actions.duplicateMeasure(parseInt(target.dataset.measureIndex));
};

/**
 * Handle rhythm metadata: toggle Batá mode
 */
export const handleToggleBataRhythmMode = () => {
    state.toque.isBata = !state.toque.isBata;
    if (state.toque.isBata) {
        if (!state.toque.orisha) state.toque.orisha = [];
        if (state.toque.classification === undefined) state.toque.classification = null;
        if (state.toque.description === undefined) state.toque.description = '';
    }
    renderApp();
};

/**
 * Handle toggle metadata Orisha dropdown
 */
export const handleToggleMetadataOrishaDropdown = () => {
    state.uiState.metadataEditor.orishaDropdownOpen = !state.uiState.metadataEditor.orishaDropdownOpen;
    renderApp();
};

/**
 * Handle toggle rhythm Orisha
 * @param {HTMLElement} target - The Orisha option element
 */
export const handleToggleRhythmOrisha = (target) => {
    const orisha = target.dataset.orisha;
    if (!state.toque.orisha) state.toque.orisha = [];
    const idx = state.toque.orisha.indexOf(orisha);
    if (idx >= 0) {
        state.toque.orisha.splice(idx, 1);
    } else {
        state.toque.orisha.push(orisha);
    }
    state.uiState.metadataEditor.orishaDropdownOpen = false;
    renderApp();
};

/**
 * Handle remove rhythm Orisha
 * @param {HTMLElement} target - The remove button element
 */
export const handleRemoveRhythmOrisha = (target) => {
    const orisha = target.dataset.orisha;
    if (state.toque.orisha) {
        const idx = state.toque.orisha.indexOf(orisha);
        if (idx >= 0) state.toque.orisha.splice(idx, 1);
    }
    renderApp();
};

/**
 * Handle set rhythm classification
 * @param {HTMLElement} target - The classification option element
 */
export const handleSetRhythmClassification = (target) => {
    const classification = target.dataset.classification;
    if (state.toque.classification === classification) {
        state.toque.classification = null;
    } else {
        state.toque.classification = classification;
    }
    renderApp();
};

/**
 * Handle update rhythm description
 * @param {HTMLTextAreaElement} target - The textarea element
 */
export const handleUpdateRhythmDescription = (target) => {
    state.toque.description = target.value;
    // No renderApp() to avoid textarea losing focus during typing
};

/**
 * Setup drag and drop for timeline sections
 * @param {HTMLElement} root - The root element
 */
export const setupDragAndDrop = (root) => {
    let draggedIndex = null;

    root.addEventListener('dragstart', (e) => {
        const item = e.target.closest('[data-role="timeline-item"]');
        if (item) {
            draggedIndex = parseInt(item.dataset.index);
            e.dataTransfer.effectAllowed = 'move';
        } else {
            e.preventDefault();
        }
    });

    root.addEventListener('dragover', (e) => e.preventDefault());

    root.addEventListener('drop', (e) => {
        const item = e.target.closest('[data-role="timeline-item"]');
        if (item && draggedIndex !== null) {
            const targetIndex = parseInt(item.dataset.index);
            if (draggedIndex !== targetIndex) {
                const moved = state.toque.sections.splice(draggedIndex, 1)[0];
                state.toque.sections.splice(targetIndex, 0, moved);
                renderApp();
            }
            draggedIndex = null;
        }
    });
};
