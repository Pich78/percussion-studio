/**
 * js/views/mobileDualView.js
 * 
 * View definition for the "Proposal A: Portrait ↔ Landscape Dual View".
 */

import { DualViewLayout } from '../ui/mobile/dual-view/layout.js';

export const mobileDualView = {
    id: 'mobile-dual-view',
    name: 'Dimension A Dual View',
    
    /** Returns the Dual View layout HTML */
    layout: DualViewLayout,
    
    /** Sets up DOM event listeners unique to this view */
    setupEvents: () => {
        // Handled by global mobileEvents.js delegator.
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
            el.classList.remove('ring-2', 'ring-purple-500', 'ring-inset', 'z-10');
        });
        document.querySelectorAll(`.tubs-cell[data-step="${step}"]`).forEach(el => {
            el.classList.add('ring-2', 'ring-purple-500', 'ring-inset', 'z-10');
        });
    }
};
