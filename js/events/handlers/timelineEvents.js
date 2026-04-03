/*
  js/events/handlers/timelineEvents.js
  Event handlers for timeline/section management.
*/

import { state, playback } from '../../store.js';
import { getActiveSection } from '../../store/stateSelectors.js';
import { eventBus } from '../../services/eventBus.js';
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
    const section = getActiveSection(state);
    if (section) {
        section.name = target.value;
        eventBus.emit('render');
    }
};

/**
 * Handle meter update
 * @param {HTMLSelectElement} target - The select element
 */
export const handleUpdateMeter = (target) => {
    const section = getActiveSection(state);
    if (!section) return;

    if (target.value === 'custom') {
        section.steps = 16;
        section.subdivision = 4;
        section.isCustomOverride = true;

        // Reset all track overrides
        section.measures.forEach(m => m.tracks.forEach(t => delete t.trackSteps));

        actions.resizeTracks(section);
        eventBus.emit('grid-refresh');
        eventBus.emit('render');
        return;
    }

    const [steps, subdivision] = target.value.split('-').map(Number);
    section.steps = steps;
    section.subdivision = subdivision;
    section.isCustomOverride = false;

    // Reset all track overrides
    section.measures.forEach(m => m.tracks.forEach(t => delete t.trackSteps));

    actions.resizeTracks(section);
    eventBus.emit('grid-refresh');
    eventBus.emit('render');
};

/**
 * Handle custom steps update
 * @param {HTMLInputElement} target - The input element
 */
export const handleUpdateCustomSteps = (target) => {
    const section = getActiveSection(state);
    if (!section) return;

    const newSteps = Math.max(1, Math.min(64, parseInt(target.value) || 1));
    section.steps = newSteps;

    // Calculate a valid subdivision for the new step count
    section.subdivision = getClosestDivisor(4, newSteps);

    // Reset all track overrides
    section.measures.forEach(m => m.tracks.forEach(t => delete t.trackSteps));

    actions.resizeTracks(section);
    eventBus.emit('grid-refresh');
    eventBus.emit('render');
};

/**
 * Handle custom subdivision update
 * @param {HTMLInputElement} target - The input element
 */
export const handleUpdateCustomSubdivision = (target) => {
    const section = getActiveSection(state);
    if (!section) return;

    const newSubdivision = Math.max(1, Math.min(12, parseInt(target.value) || 1));
    section.subdivision = newSubdivision;
    eventBus.emit('grid-refresh');
    eventBus.emit('render');
};

/**
 * Handle repetitions update
 * @param {HTMLInputElement} target - The input element
 */
export const handleUpdateRepetitions = (target) => {
    const section = getActiveSection(state);
    if (section) {
        section.repetitions = Math.max(1, Number(target.value));
        eventBus.emit('render');
    }
};

/**
 * Handle toggle random repetitions
 */
export const handleToggleRandomRepetitions = () => {
    const section = getActiveSection(state);
    if (section) {
        section.randomRepetitions = !section.randomRepetitions;
        eventBus.emit('render');
    }
};

/**
 * Handle toggle section enabled/disabled from timeline
 * @param {HTMLElement} target - The toggle button element
 */
export const handleToggleSectionEnabled = (target) => {
    const sectionId = target.dataset.id;
    const section = state.toque.sections.find(s => s.id === sectionId);
    if (section) {
        section.skip = !section.skip;
        if (section.skip) {
            section.playMode = 'skip';
        } else if (section.playMode === 'skip') {
            section.playMode = 'loop';
        }
        eventBus.emit('render');
    }
};

/**
 * Handle play mode update from settings bar
 * @param {HTMLSelectElement} target - The select element
 */
export const handleUpdatePlayMode = (target) => {
    const section = getActiveSection(state);
    if (section) {
        const playMode = target.value;
        section.playMode = playMode;
        if (playMode === 'skip') {
            section.skip = true;
        } else {
            section.skip = false;
        }
        eventBus.emit('render');
    }
};

/**
 * Handle toggle play mode dropdown visibility
 * @param {HTMLElement} target - The dropdown button element
 */
export const handleTogglePlayModeDropdown = (target) => {
    const container = target.closest('#play-mode-dropdown-container');
    if (!container) return;
    
    const dropdown = container.querySelector('[data-role="play-mode-dropdown"]');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
};

/**
 * Handle select play mode from custom dropdown
 * @param {HTMLElement} target - The option button element
 */
export const handleSelectPlayMode = (target) => {
    const section = getActiveSection(state);
    if (section) {
        const playMode = target.dataset.value;
        section.playMode = playMode;
        if (playMode === 'skip') {
            section.skip = true;
        } else {
            section.skip = false;
        }
        
        // Close dropdown
        const container = document.getElementById('play-mode-dropdown-container');
        if (container) {
            const dropdown = container.querySelector('[data-role="play-mode-dropdown"]');
            if (dropdown) {
                dropdown.classList.add('hidden');
            }
        }
        
        eventBus.emit('render');
    }
};

/**
 * Handle reset played once state (when "Played" is displayed)
 * @param {HTMLElement} target - The button element
 */
export const handleResetPlayedOnce = (target) => {
    const section = getActiveSection(state);
    if (section && section.playMode === 'once' && section._playedOnce) {
        section._playedOnce = false;
        eventBus.emit('render');
    }
};

/**
 * Close all open dropdowns (call on outside click)
 */
export const closeAllDropdowns = () => {
    const dropdown = document.querySelector('[data-role="play-mode-dropdown"]');
    if (dropdown) {
        dropdown.classList.add('hidden');
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
    eventBus.emit('render');
};

/**
 * Handle toggle metadata Orisha dropdown
 */
export const handleToggleMetadataOrishaDropdown = () => {
    state.uiState.metadataEditor.orishaDropdownOpen = !state.uiState.metadataEditor.orishaDropdownOpen;
    eventBus.emit('render');
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
    eventBus.emit('render');
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
    eventBus.emit('render');
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
    eventBus.emit('render');
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
                eventBus.emit('render');
            }
            draggedIndex = null;
        }
    });
};
