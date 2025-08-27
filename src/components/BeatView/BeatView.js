// file: src/components/BeatView/BeatView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentRowView } from '/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.js';

export class BeatView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.childInstances = new Map();

        loadCSS('/percussion-studio/src/components/BeatView/BeatView.css');
        logEvent('debug', 'BeatView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render({ beatNumber, instruments, metrics, mode }) {
        logEvent('debug', 'BeatView', 'render', 'State', `Rendering Beat #${beatNumber} with ${instruments.length} instruments.`);

        // Clean up old instances before re-rendering
        this.childInstances.forEach(instance => instance.destroy?.());
        this.childInstances.clear();
        
        this.container.innerHTML = ''; // Clear the container
        this.container.className = 'beat-view';

        // Render the optional header
        const headerEl = document.createElement('h4');
        headerEl.className = 'beat-view__header';
        headerEl.textContent = `Beat ${beatNumber}`;
        this.container.appendChild(headerEl);
        
        const rowsContainer = document.createElement('div');
        rowsContainer.className = 'beat-view__rows';
        this.container.appendChild(rowsContainer);

        // Render child InstrumentRowView components
        instruments.forEach(instrument => {
            const rowHostEl = document.createElement('div');
            rowsContainer.appendChild(rowHostEl);

            const rowView = new InstrumentRowView(rowHostEl, {
                mode,
                instrument,
                // Pass all callbacks down to the child
                callbacks: this.callbacks 
            });

            // --- FIX 2: Calculate densityClass based on the number of cells in this beat ---
            const totalCells = instrument.pattern.length;
            let densityClass = 'density-medium';
            if (totalCells <= 8) densityClass = 'density-low';
            if (totalCells > 20) densityClass = 'density-high';

            // Pass all required props, including the calculated densityClass.
            rowView.render({ 
                instrument, 
                notation: instrument.pattern, 
                metrics,
                densityClass
            });
            
            // Store the instance for future updates or cleanup
            this.childInstances.set(instrument.id, rowView);
        });
    }

    destroy() {
        this.childInstances.forEach(instance => instance.destroy?.());
        this.childInstances.clear();
        this.container.innerHTML = '';
        logEvent('debug', 'BeatView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}