/**
 * js/views/mobileDimensionBView.js
 * 
 * View definition for "Dimension B: Play Mode vs View Mode".
 */

import { DimensionBLayout } from '../ui/mobile/dimension-b/layout.js';

export const mobileDimensionBView = {
    id: 'mobile-dimension-b',
    name: 'Dimension B Play/View',
    
    /** Returns the Dimension B layout HTML */
    layout: DimensionBLayout,
    
    /** Sets up DOM event listeners unique to this view */
    setupEvents: () => {
        // Most events are handled by the global mobileEvents.js delegator,
        // specifically `toggle-dim-b-mode`.
    },
    
    /** Visual update hook called every sequencer tick */
    onStep: ({ step }) => {
        import('../store.js').then(({ state }) => {
            // Only highlight active step if in play mode
            if (state.uiState.dimensionBMode !== 'view') {
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
            } else {
                // Clear highlights in view mode
                document.querySelectorAll('.step-header').forEach(el => {
                    el.classList.remove('bg-gray-800', 'text-white');
                    el.classList.add('text-gray-500');
                });
                document.querySelectorAll('.tubs-cell').forEach(el => {
                    el.classList.remove('ring-2', 'ring-purple-500', 'ring-inset', 'z-10');
                });
            }
        });
    }
};
