/**
 * js/views/mobileDashboardStackView.js
 *
 * View definition for the mobile "Dashboard — Stack Layout" view (P2a).
 * Vertical scrollable section cards where the active section is expanded
 * and auto-scrolls into view. Inactive sections appear as compact rows.
 */

import { DashboardStackLayout, scrollActiveCardIntoView } from '../ui/mobile/dashboard-stack/layout.js';
import { setupMobileEvents } from '../events/mobileEvents.js';
import { updateVisualStep, scrollToMeasure } from '../ui/playheadUtils.js';

export const mobileDashboardStackView = {
    id: 'mobile-dashboard-stack',
    name: 'Dashboard — Stack',

    /** Returns the Dashboard Stack layout HTML */
    layout: DashboardStackLayout,

    /** Sets up mobile-specific event listeners (shared with all mobile views) */
    setupEvents: setupMobileEvents,

    /**
     * After render: auto-scroll the active card into view so it's
     * always visible at the top of the stack area.
     */
    onRender() {
        scrollActiveCardIntoView();
    },

    /** Handle playback step visual updates */
    onStep({ step, measure, rep }) {
        updateVisualStep(step, measure);
        scrollToMeasure(measure);
        const repEl = document.getElementById('header-rep-count');
        if (repEl) repEl.textContent = rep;
    }
};
