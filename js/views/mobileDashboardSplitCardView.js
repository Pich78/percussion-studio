/**
 * js/views/mobileDashboardSplitCardView.js
 *
 * View definition for the mobile "The Dashboard - Split Card" view (P2B).
 * Card-based section navigator where each card is split horizontally:
 * left side for settings, right side for a mini read-only grid preview.
 */

import { DashboardSplitCardLayout } from '../ui/mobile/dashboard-split-card/layout.js';
import { setupMobileEvents } from '../events/mobileEvents.js';
import { updateVisualStep, scrollToMeasure } from '../ui/playheadUtils.js';

export const mobileDashboardSplitCardView = {
    id: 'mobile-dashboard-split-card',
    name: 'P2B: Split Card',

    /** Returns the Dashboard Split Card layout HTML */
    layout: DashboardSplitCardLayout,

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
