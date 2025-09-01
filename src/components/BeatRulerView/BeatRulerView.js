// file: src/components/BeatRulerView/BeatRulerView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class BeatRulerView {
    constructor(container) {
        this.container = container;
        loadCSS('/percussion-studio/src/components/BeatRulerView/BeatRulerView.css');
        logEvent('debug', 'BeatRulerView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render({ groupingPattern, beatGrouping, startingBeat = 1 }) {
        logEvent('debug', 'BeatRulerView', 'render', 'State', 'Render called with', { groupingPattern, beatGrouping, startingBeat });

        this.container.innerHTML = '';
        this.container.className = 'beat-ruler';

        let beatCounter = startingBeat;

        // In this component's context, groupingPattern will always be a single-item array
        // representing the width of this specific ruler line.
        const boxesInThisLine = groupingPattern[0] || 0;
        
        const lineEl = document.createElement('div');
        lineEl.className = 'beat-ruler-line';
        lineEl.style.width = `calc(${boxesInThisLine} * var(--cell-width))`;

        for (let i = 0; i < boxesInThisLine; i += beatGrouping) {
            const numberEl = document.createElement('span');
            numberEl.className = 'beat-ruler-number';
            numberEl.textContent = beatCounter;
            numberEl.style.left = `calc(${i} * var(--cell-width))`;
            
            lineEl.appendChild(numberEl);
            beatCounter++;
        }
        
        this.container.appendChild(lineEl);
    }

    destroy() {
        this.container.innerHTML = '';
        logEvent('debug', 'BeatRulerView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}