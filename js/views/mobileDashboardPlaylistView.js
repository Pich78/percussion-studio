/**
 * js/views/mobileDashboardPlaylistView.js
 *
 * View definition for the mobile "The Dashboard - Playlist Mode" view (P2C).
 * Sections are listed vertically like a music queue, showing section info
 * with a Now Playing bar at the bottom.
 */

import { DashboardPlaylistLayout } from '../ui/mobile/dashboard-playlist/layout.js';
import { setupMobileEvents } from '../events/mobileEvents.js';
import { updateVisualStep, scrollToMeasure } from '../ui/playheadUtils.js';

export const mobileDashboardPlaylistView = {
    id: 'mobile-dashboard-playlist',
    name: 'P2C: Playlist Mode',

    /** Returns the Dashboard Playlist layout HTML */
    layout: DashboardPlaylistLayout,

    /** Sets up mobile-specific event listeners */
    setupEvents: setupMobileEvents,

    /** Handle playback step visual updates */
    onStep({ step, measure, rep }) {
        updateVisualStep(step, measure);
        scrollToMeasure(measure);
        // Only update rep count if the element exists in header/footer
        const repEl = document.getElementById('header-rep-count');
        if (repEl) repEl.textContent = rep;
    }
};
