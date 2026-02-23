/*
  js/actions/sectionActions.js
  Actions for section management (add, delete, duplicate, select).
*/

import { state, playback, commit } from '../store.js';
import { renderApp, refreshGrid } from '../ui/renderer.js';
import { StrokeType } from '../types.js';
import { createEmptySection, cloneSection } from '../utils/rhythmTransformers.js';

/**
 * Update the active section
 * @param {string} id - Section ID to activate
 */
export const updateActiveSection = (id) => {
    commit('setActiveSectionId', { id });
    playback.activeSectionId = id;
    playback.repetitionCounter = 1;

    if (state.toque) {
        const section = state.toque.sections.find(s => s.id === id);
        if (section) playback.currentPlayheadBpm = section.bpm ?? state.toque.globalBpm;
    }
    renderApp();
};

/**
 * Add a new section to the rhythm
 */
export const addSection = () => {
    if (!state.toque) return;

    const sectionNumber = state.toque.sections.length + 1;

    // Get track templates from first section if available
    let trackTemplates = [];
    if (state.toque.sections.length > 0) {
        const firstSection = state.toque.sections[0];
        if (firstSection.measures && firstSection.measures.length > 0) {
            const firstMeasure = firstSection.measures[0];
            if (firstMeasure.tracks && firstMeasure.tracks.length > 0) {
                trackTemplates = firstMeasure.tracks.map(track => ({
                    instrument: track.instrument,
                    pack: track.pack,
                    volume: track.volume,
                    muted: track.muted
                }));
            }
        }
    }

    const newSec = createEmptySection(sectionNumber, 16, 4, trackTemplates);
    commit('pushSection', { section: newSec });
    updateActiveSection(newSec.id);
};

/**
 * Delete a section from the rhythm
 * @param {string} id - Section ID to delete
 */
export const deleteSection = (id) => {
    if (!state.toque || state.toque.sections.length <= 1) return;

    commit('deleteSection', { id });

    if (state.activeSectionId === id) {
        updateActiveSection(state.toque.sections[0].id);
    } else {
        renderApp();
    }
};

/**
 * Duplicate a section
 * @param {string} id - Section ID to duplicate
 */
export const duplicateSection = (id) => {
    const src = state.toque.sections.find(s => s.id === id);
    if (src) {
        const copy = cloneSection(src);
        commit('pushSection', { section: copy });
        updateActiveSection(copy.id);
    }
};

/**
 * Resize all tracks in a section to match new step count
 * @param {object} section - Section to resize
 */
export const resizeTracks = (section) => {
    commit('resizeTracksToSteps', { section, emptyStroke: StrokeType.None });
};
