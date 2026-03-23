/**
 * js/views/mobileDimensionCView.js
 * 
 * View definition for "Dimension C: Elevated Mixer Variant".
 */

import { DimensionCLayout } from '../ui/mobile/dimension-c/layout.js';

export const mobileDimensionCView = {
    id: 'mobile-dimension-c',
    name: 'Dimension C Elevated Mixer',
    
    /** Returns the Dimension C layout HTML */
    layout: DimensionCLayout,
    
    /** Sets up DOM event listeners unique to this view */
    setupEvents: () => {
        // Events standard toggles handled by mobileEvents.js globally
    },
    
    /** Visual update hook called every sequencer tick */
    onStep: ({ step }) => {
        // Update active class on grid headers and cells
        document.querySelectorAll('.step-header').forEach(el => {
            el.classList.remove('bg-gray-800', 'text-white');
            el.classList.add('text-gray-500');
        });
        const currentHeader = document.querySelector(`.step-header[data-step="${step}"]`);
        if (currentHeader) {
            currentHeader.classList.remove('text-gray-500');
            currentHeader.classList.add('bg-gray-800', 'text-white');
        }

        document.querySelectorAll('.tubs-cell').forEach(el => {
            el.classList.remove('ring-2', 'ring-purple-500', 'ring-inset', 'z-10');
        });
        document.querySelectorAll(`.tubs-cell[data-step="${step}"]`).forEach(el => {
            el.classList.add('ring-2', 'ring-purple-500', 'ring-inset', 'z-10');
        });
    }
};
