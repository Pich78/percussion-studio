// file: src/components/BeatRulerView/BeatRulerView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class BeatRulerView {
    constructor(container) {
        this.container = container;
        this.isRendered = false;

        loadCSS('/percussion-studio/src/components/BeatRulerView/BeatRulerView.css');
        logEvent('debug', 'BeatRulerView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render({ groupingPattern, beatGrouping }) {
        logEvent('debug', 'BeatRulerView', 'render', 'State', 'Render called with', { groupingPattern, beatGrouping });

        this.container.innerHTML = '';

        const rulerEl = document.createElement('div');
        rulerEl.className = 'beat-ruler';

        let beatCounter = 1;

        for (const boxesInThisLine of groupingPattern) {
            const lineEl = document.createElement('div');
            lineEl.className = 'beat-ruler-line';
            lineEl.style.width = `calc(${boxesInThisLine} * var(--cell-width, 40px))`;

            for (let i = 0; i < boxesInThisLine; i += beatGrouping) {
                const numberEl = document.createElement('span');
                numberEl.className = 'beat-ruler-number';
                numberEl.textContent = beatCounter;
                numberEl.style.left = `calc(${i} * var(--cell-width, 40px))`;
                
                lineEl.appendChild(numberEl);
                beatCounter++;
            }
            rulerEl.appendChild(lineEl);
        }
        
        this.container.appendChild(rulerEl);
        this.isRendered = true;
    }

    /**
     * --- FIX: Added the missing destroy method ---
     * This method is called by the parent component to clean up the DOM.
     */
    destroy() {
        this.container.innerHTML = '';
        logEvent('debug', 'BeatRulerView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}