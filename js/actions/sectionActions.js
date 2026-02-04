/*
  js/actions/sectionActions.js
  Actions for section management (add, delete, duplicate, select).
*/

import { state, playback } from '../store.js';
import { renderApp, refreshGrid } from '../ui/renderer.js';
import { StrokeType } from '../types.js';
import { createEmptySection, cloneSection } from '../utils/rhythmTransformers.js';

/**
 * Update the active section
 * @param {string} id - Section ID to activate
 */
export const updateActiveSection = (id) => {
    state.activeSectionId = id;
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
    state.toque.sections.push(newSec);
    updateActiveSection(newSec.id);
};

/**
 * Delete a section from the rhythm
 * @param {string} id - Section ID to delete
 */
export const deleteSection = (id) => {
    if (!state.toque || state.toque.sections.length <= 1) return;

    state.toque.sections = state.toque.sections.filter(s => s.id !== id);

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
        state.toque.sections.push(copy);
        updateActiveSection(copy.id);
    }
};

/**
 * Resize all tracks in a section to match new step count
 * @param {object} section - Section to resize
 */
export const resizeTracks = (section) => {
    const newSteps = section.steps;
    section.measures.forEach(measure => {
        measure.tracks.forEach(track => {
            // When section steps change, adjust trackSteps if needed
            if (track.trackSteps && track.trackSteps > newSteps) {
                // Find closest valid divisor
                const validDivisors = [];
                for (let i = 1; i <= newSteps; i++) {
                    if (newSteps % i === 0) validDivisors.push(i);
                }
                track.trackSteps = validDivisors.reduce((prev, curr) =>
                    Math.abs(curr - track.trackSteps) < Math.abs(prev - track.trackSteps) ? curr : prev
                );
            }
            // Resize strokes array to match section steps
            if (newSteps > track.strokes.length) {
                const diff = newSteps - track.strokes.length;
                for (let i = 0; i < diff; i++) track.strokes.push(StrokeType.None);
            } else {
                track.strokes.length = newSteps;
            }
        });
    });
};
