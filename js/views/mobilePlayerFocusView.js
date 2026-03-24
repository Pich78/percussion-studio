/**
 * js/views/mobilePlayerFocusView.js
 * 
 * View definition for the mobile "Focus Mode" view (P1c).
 * Extends The Player with double-tap-to-solo track isolation.
 */

import { PlayerFocusLayout } from '../ui/mobile/player-focus/layout.js';
import { setupFocusModeEvents } from '../ui/mobile/player-focus/focusEvents.js';
import { updateVisualStep, scrollToMeasure } from '../ui/playheadUtils.js';

/**
 * Focus Mode setup: register double-tap-to-solo event handler only.
 * Global mobile events (click delegation, blur, etc.) are already registered
 * by setupMobileEvents() at app startup via the initial mobile-grid view.
 */
const setupFocusViewEvents = () => {
    setupFocusModeEvents();
};

export const mobilePlayerFocusView = {
    id: 'mobile-player-focus',
    name: 'Focus Mode',

    /** Returns the Focus Mode layout HTML */
    layout: PlayerFocusLayout,

    /** Sets up mobile-specific event listeners + Focus Mode double-tap handler */
    setupEvents: setupFocusViewEvents,

    /** Handle playback step visual updates */
    onStep({ step, measure, rep }) {
        updateVisualStep(step, measure);
        scrollToMeasure(measure);
        const repEl = document.getElementById('header-rep-count');
        if (repEl) repEl.textContent = rep;
    }
};

