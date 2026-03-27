/**
 * js/views/mobilePractitionerView.js
 *
 * View definition for "Dimension D: The Practitioner" —
 * a Dual View where phone orientation drives the experience:
 *   • Landscape → full chromatic notation grid + chips toolbar
 *   • Portrait  → music-player control surface (BPM, mixer, sections)
 */

import { PractitionerLayout } from '../ui/mobile/practitioner/layout.js';

export const mobilePractitionerView = {
    id: 'mobile-practitioner',
    name: 'The Practitioner (Dual)',

    /** Returns the full page HTML */
    layout: PractitionerLayout,

    /** Sets up DOM event listeners unique to this view */
    setupEvents: () => {
        // All events are handled by the global mobileEvents.js delegator
        // via the practitioner-* action handlers registered there.
    },

    /**
     * Visual update hook called every sequencer tick.
     * Step highlighting is handled by TubsCell reading state.currentStep on
     * each render — same as all other mobile views. No custom DOM patching needed.
     */
    onStep: () => {}
};
