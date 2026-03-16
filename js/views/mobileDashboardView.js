/**
 * js/views/mobileDashboardView.js
 *
 * View definition for the mobile "The Dashboard" view (P2).
 * Card-based section navigator — each section is a swipeable card
 * with inline BPM, reps, and mini mixer rows.
 */

import { DashboardLayout } from '../ui/mobile/dashboard/layout.js';
import { setupMobileEvents } from '../events/mobileEvents.js';
import { updateVisualStep, scrollToMeasure } from '../ui/playheadUtils.js';

export const mobileDashboardView = {
    id: 'mobile-dashboard',
    name: 'The Dashboard',

    /** Returns the Dashboard layout HTML */
    layout: DashboardLayout,

    /** Sets up mobile-specific event listeners (shared with all mobile views) */
    setupEvents: setupMobileEvents,

    /** Handle playback step visual updates */
    onStep({ step, measure, rep }) {
        updateVisualStep(step, measure);
        scrollToMeasure(measure);
        const repEl = document.getElementById('header-rep-count');
        if (repEl) repEl.textContent = rep;
    }
};
