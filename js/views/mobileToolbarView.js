/**
 * js/views/mobileToolbarView.js
 * 
 * View definition for the mobile "The Toolbar — Persistent Bottom Drawer" view (P3).
 */

import { DashboardToolbarLayout } from '../ui/mobile/toolbar/layout.js';

/**
 * Mobile Toolbar View (P3 variant) map representation
 */
export const mobileToolbarView = {
    id: 'mobile-toolbar',
    name: 'The Toolbar',
    
    /** Returns the Toolbar layout HTML */
    layout: DashboardToolbarLayout,
    
    /** Sets up DOM event listeners unique to this view */
    setupEvents: () => {
        // Most events are handled by global mobileEvents.js delegator.
        // We only handle view-specific custom DOM side-effects.
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
