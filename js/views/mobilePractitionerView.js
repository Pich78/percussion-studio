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

    /** Visual update hook called every sequencer tick */
    onStep: ({ step }) => {
        // Highlight active step header in the practitioner grid
        document.querySelectorAll('#practitioner-grid-scroll th[data-step]').forEach(el => {
            // header cells don't carry data-step, handled via column index
        });

        // Highlight the active column cells
        document.querySelectorAll('#practitioner-grid-scroll td[data-step]').forEach(el => {
            const elStep = parseInt(el.dataset.step, 10);
            if (elStep === step) {
                el.classList.add('ring-1', 'ring-inset', 'ring-indigo-400', 'bg-indigo-500/20');
                el.classList.remove('bg-gray-900');
            } else {
                el.classList.remove('ring-1', 'ring-inset', 'ring-indigo-400', 'bg-indigo-500/20');
                if (!el.classList.contains('bg-indigo-500/30')) {
                    el.classList.add('bg-gray-900');
                }
            }
        });
    }
};
