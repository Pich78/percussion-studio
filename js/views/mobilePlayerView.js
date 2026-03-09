/**
 * js/views/mobilePlayerView.js
 * 
 * View definition for the mobile "The Player" view (P1).
 * Wraps the Player layout and mobile events into the view interface.
 */

import { PlayerLayout } from '../ui/mobile/player/layout.js';
import { setupMobileEvents } from '../events/mobileEvents.js';
import { updateVisualStep, scrollToMeasure } from '../ui/playheadUtils.js';

export const mobilePlayerView = {
    id: 'mobile-player',
    name: 'The Player',

    /** Returns the Player layout HTML */
    layout: PlayerLayout,

    /** Sets up mobile-specific event listeners (shared with standard view) */
    setupEvents: setupMobileEvents,

    /** Handle playback step visual updates */
    onStep({ step, measure, rep }) {
        updateVisualStep(step, measure);
        scrollToMeasure(measure);
        const repEl = document.getElementById('header-rep-count');
        if (repEl) repEl.textContent = rep;
    }
};
