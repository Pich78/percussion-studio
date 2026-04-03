/**
 * js/views/desktopEditorView.js
 * 
 * View definition for the desktop "Editor" view.
 * Wraps the existing desktop layout and events into the view interface.
 */

import { DesktopLayout } from '../ui/desktop/layout.js';
import { setupDesktopEvents } from '../events/desktopEvents.js';
import { updateVisualStep, scrollToMeasure } from '../ui/playheadUtils.js';

export const desktopEditorView = {
    id: 'desktop-editor',
    name: 'Desktop Editor',

    /** Returns the full desktop layout HTML */
    layout: DesktopLayout,

    /** Sets up desktop-specific event listeners */
    setupEvents: setupDesktopEvents,

    /** Handle playback step visual updates */
    onStep({ step, measure, rep }) {
        updateVisualStep(step, measure);
        scrollToMeasure(measure);
        const repEl = document.getElementById('header-rep-count');
        if (repEl) repEl.textContent = rep;
    }
};
