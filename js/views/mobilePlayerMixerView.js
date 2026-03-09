/**
 * js/views/mobilePlayerMixerView.js
 * 
 * View definition for the mobile "Player + Mixer" view (P1a).
 * Extends The Player with a swipe-up mixer bottom sheet.
 */

import { PlayerMixerLayout } from '../ui/mobile/player-mixer/layout.js';
import { setupMobileEvents } from '../events/mobileEvents.js';
import { updateVisualStep, scrollToMeasure } from '../ui/playheadUtils.js';

export const mobilePlayerMixerView = {
    id: 'mobile-player-mixer',
    name: 'Player + Mixer',

    /** Returns the Player + Mixer layout HTML */
    layout: PlayerMixerLayout,

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
