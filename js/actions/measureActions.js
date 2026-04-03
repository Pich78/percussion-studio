/*
  js/actions/measureActions.js
  Actions for measure management (add, delete, duplicate).
*/

import { state, commit } from '../store.js';
import { getActiveSection } from '../store/stateSelectors.js';
import { eventBus } from '../services/eventBus.js';
import { StrokeType } from '../types.js';
import { cloneMeasure } from '../utils/rhythmTransformers.js';

/**
 * Adds a new measure to the active section
 */
export const addMeasure = () => {
    const section = getActiveSection(state);
    if (!section) return;

    // Create new measure with tracks matching existing ones
    const newMeasure = {
        id: crypto.randomUUID(),
        tracks: []
    };

    // If there are existing measures, clone track structure from first measure
    if (section.measures.length > 0) {
        const firstMeasure = section.measures[0];
        firstMeasure.tracks.forEach(track => {
            newMeasure.tracks.push({
                id: crypto.randomUUID(),
                instrument: track.instrument,
                pack: track.pack,
                volume: track.volume,
                muted: track.muted,
                strokes: Array(section.steps).fill(StrokeType.None)
            });
        });
    }

    const newIndex = section.measures.length;
    commit('pushMeasure', { section, measure: newMeasure });
    eventBus.emit('grid-refresh');

    // Scroll to the new measure
    eventBus.emit('scroll-to-measure', { measure: newIndex });
};

/**
 * Deletes a measure from the active section
 * @param {number} measureIdx - Measure index to delete
 */
export const deleteMeasure = (measureIdx) => {
    const section = getActiveSection(state);
    if (!section || section.measures.length <= 1) {
        alert("Cannot delete the last measure");
        return;
    }

    if (confirm("Delete this measure?")) {
        commit('deleteMeasure', { section, measureIdx });
        eventBus.emit('grid-refresh');
    }
};

/**
 * Duplicates a measure in the active section
 * @param {number} measureIdx - Measure index to duplicate
 */
export const duplicateMeasure = (measureIdx) => {
    const section = getActiveSection(state);
    if (!section) return;

    const sourceMeasure = section.measures[measureIdx];
    const newMeasure = cloneMeasure(sourceMeasure);

    // Insert after the source measure
    commit('insertMeasure', { section, measureIdx: measureIdx + 1, measure: newMeasure });
    eventBus.emit('grid-refresh');
};
