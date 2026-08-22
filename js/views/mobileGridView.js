/**
 * js/views/mobileGridView.js
 * 
 * View definition for the mobile "Classic Grid" view.
 * Wraps the existing mobile layout and events into the view interface.
 */

import { MobileLayout } from '../ui/mobile/standard/layout.js';
import { setupMobileEvents } from '../events/mobileEvents.js';
import { updateVisualStep, scrollToMeasure, updateBpmUi, updateVolumeUi } from '../ui/playheadUtils.js';

export const mobileGridView = {
    id: 'mobile-grid',
    name: 'Classic Grid',

    /** Returns the full mobile layout HTML */
    layout: MobileLayout,

    /** Sets up mobile-specific event listeners */
    setupEvents: setupMobileEvents,

    /** Handle transport stream updates (phase 'playing') */
    onTransport({ phase, step, measure, rep }) {
        if (phase !== 'playing') return;
        updateVisualStep(step, measure);
        scrollToMeasure(measure);
        const repEl = document.getElementById('header-rep-count');
        if (repEl) repEl.textContent = rep;
        if (step === 0) {
            updateBpmUi();
            updateVolumeUi();
        }
    }
};
