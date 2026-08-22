/**
 * js/views/desktopEditorView.js
 * 
 * View definition for the desktop "Editor" view.
 * Wraps the existing desktop layout and events into the view interface.
 */

import { DesktopLayout } from '../ui/desktop/layout.js';
import { setupDesktopEvents } from '../events/desktopEvents.js';
import { updateVisualStep, scrollToMeasure, updateBpmUi, updateVolumeUi } from '../ui/playheadUtils.js';
import { state } from '../store.js';
import { getActiveSection } from '../store/stateSelectors.js';

/**
 * Update the live random-repetitions badge (🎲N) from transport data.
 *
 * The effective repetitions count is LIVE playback state — per the binding
 * rule it must never be reconciled by a full render, only via this targeted
 * update on repetition boundaries (see docs/requirements/playback-events.md).
 */
const updateRandomRepsBadge = (effectiveRepetitions) => {
    const liveEl = document.querySelector('[data-role="random-reps-live"]');
    const totalEl = document.querySelector('[data-role="rep-total"]');
    if (!liveEl || !totalEl) return;

    const section = getActiveSection(state);
    const showLive = state.isPlaying && section?.randomRepetitions && effectiveRepetitions != null;
    liveEl.classList.toggle('hidden', !showLive);
    totalEl.classList.toggle('hidden', showLive);
    if (showLive) {
        const valEl = liveEl.querySelector('[data-role="random-reps-value"]');
        if (valEl) valEl.textContent = effectiveRepetitions;
    }
};

export const desktopEditorView = {
    id: 'desktop-editor',
    name: 'Desktop Editor',

    /** Returns the full desktop layout HTML */
    layout: DesktopLayout,

    /** Sets up desktop-specific event listeners */
    setupEvents: setupDesktopEvents,

    /** Handle transport stream updates (phase 'playing') */
    onTransport({ phase, step, measure, rep, effectiveRepetitions }) {
        if (phase !== 'playing') return;
        updateVisualStep(step, measure);
        scrollToMeasure(measure);
        const repEl = document.getElementById('header-rep-count');
        if (repEl) repEl.textContent = rep;
        if (step === 0) {
            updateRandomRepsBadge(effectiveRepetitions);
            updateBpmUi();
            updateVolumeUi();
        }
    }
};
