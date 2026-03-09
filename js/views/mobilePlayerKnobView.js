/**
 * js/views/mobilePlayerKnobView.js
 * 
 * View definition for the mobile "Player + Knob" view (P1b).
 * Extends The Player with a circular rotary tempo knob.
 */

import { PlayerKnobLayout } from '../ui/mobile/player-knob/layout.js';
import { setupMobileEvents } from '../events/mobileEvents.js';
import { updateVisualStep, scrollToMeasure } from '../ui/playheadUtils.js';

export const mobilePlayerKnobView = {
    id: 'mobile-player-knob',
    name: 'Player + Knob',

    /** Returns the Player + Knob layout HTML */
    layout: PlayerKnobLayout,

    /** Sets up mobile-specific event listeners (shared with standard/player views) */
    setupEvents: setupMobileEvents,

    /** Handle playback step visual updates */
    onStep({ step, measure, rep }) {
        updateVisualStep(step, measure);
        scrollToMeasure(measure);
        const repEl = document.getElementById('header-rep-count');
        if (repEl) repEl.textContent = rep;
    }
};
