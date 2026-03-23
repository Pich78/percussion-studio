/**
 * js/views/mobileToolbarChipsView.js
 * 
 * View definition for the mobile "The Toolbar — Quick-access chips" view (P3a).
 */

import { DashboardToolbarChipsLayout } from '../ui/mobile/toolbar-chips/layout.js';

/**
 * Mobile Toolbar Chips View (P3a variant) map representation
 */
export const mobileToolbarChipsView = {
    id: 'mobile-toolbar-chips',
    name: 'The Toolbar (Chips)',
    
    /** Returns the Toolbar Chips layout HTML */
    layout: DashboardToolbarChipsLayout,
    
    /** Sets up DOM event listeners unique to this view */
    setupEvents: () => {
        // Most events are handled by global mobileEvents.js delegator.
        // The chip interaction popover toggle is general enough we will put it in mobileEvents.js.
    },
    
    /** Visual update hook called every sequencer tick */
    onStep: ({ step }) => {
        // Highlight active step in grid headers
        document.querySelectorAll('.step-header').forEach(el => {
            el.classList.remove('bg-gray-800', 'text-white');
            el.classList.add('text-gray-500');
        });
        const currentHeader = document.querySelector(`.step-header[data-step="${step}"]`);
        if (currentHeader) {
            currentHeader.classList.remove('text-gray-500');
            currentHeader.classList.add('bg-gray-800', 'text-white');
        }

        // Highlight active cells in the grid
        document.querySelectorAll('.tubs-cell').forEach(el => {
            el.classList.remove('ring-2', 'ring-cyan-500', 'ring-inset', 'z-10');
        });
        document.querySelectorAll(`.tubs-cell[data-step="${step}"]`).forEach(el => {
            el.classList.add('ring-2', 'ring-cyan-500', 'ring-inset', 'z-10');
        });
    }
};
