/**
 * js/views/mobileGridView.js
 * 
 * View definition for the mobile "Classic Grid" view.
 * Wraps the existing mobile layout and events into the view interface.
 */

import { MobileLayout } from '../ui/mobile/layout.js';
import { setupMobileEvents } from '../events/mobileEvents.js';

export const mobileGridView = {
    id: 'mobile-grid',
    name: 'Classic Grid',

    /** Returns the full mobile layout HTML */
    layout: MobileLayout,

    /** Sets up mobile-specific event listeners */
    setupEvents: setupMobileEvents,

    /** Handle playback step visual updates (uses shared renderer utilities at runtime) */
    onStep({ step, measure, rep }) {
        // Lazy-import to avoid circular dependency (renderer → viewManager → view → renderer)
        import('../ui/renderer.js').then(({ updateVisualStep, scrollToMeasure }) => {
            updateVisualStep(step, measure);
            scrollToMeasure(measure);
        });
        const repEl = document.getElementById('header-rep-count');
        if (repEl) repEl.textContent = rep;
    }
};
