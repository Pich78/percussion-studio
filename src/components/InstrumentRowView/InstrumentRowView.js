// file: src/components/InstrumentRowView/InstrumentRowView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class InstrumentRowView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        loadCSS('/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.css');
        logEvent('debug', 'InstrumentRowView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render({ instrument, notation, metrics, densityClass }) {
        logEvent('debug', 'InstrumentRowView', 'render', 'State', `Rendering row for ${instrument.symbol} with density ${densityClass}`);

        const totalCells = (metrics.beatsPerMeasure / metrics.beatUnit) * metrics.subdivision;
        const notationChars = notation.replace(/\|/g, '');

        const headerEl = document.createElement('div');
        headerEl.className = 'instrument-row-header';
        headerEl.textContent = instrument.name;
        headerEl.addEventListener('click', () => this.callbacks.onRequestInstrumentChange?.(instrument.symbol));

        const gridEl = document.createElement('div');
        gridEl.className = 'instrument-row-grid';
        gridEl.addEventListener('mouseenter', () => this.callbacks.onGridMouseEnter?.(instrument));
        gridEl.addEventListener('mouseleave', () => this.callbacks.onGridMouseLeave?.());

        for (let i = 0; i < totalCells; i++) {
            const cellEl = document.createElement('div');
            cellEl.className = 'grid-cell';
            cellEl.dataset.tickIndex = i;

            // Apply main beat highlight
            if ((i % metrics.grouping) === 0) {
                cellEl.classList.add('highlighted-beat');
            } 
            // --- NEW: Add softer visual hints for high subdivisions ---
            else if (metrics.subdivision >= 32) {
                // For 32nds, the 16th note positions get a softer line
                const sixteenthGrouping = metrics.grouping / 2;
                if ((i % sixteenthGrouping) === 0) {
                    cellEl.classList.add('sub-beat-line');
                }
            }

            const soundLetter = notationChars[i];
            if (soundLetter && soundLetter !== '-') {
                const sound = instrument.sounds.find(s => s.letter === soundLetter);
                if (sound?.svg) {
                    const noteEl = document.createElement('div');
                    noteEl.className = 'note';
                    noteEl.innerHTML = sound.svg;
                    cellEl.appendChild(noteEl);
                }
            }
            
            cellEl.addEventListener('mousedown', (event) => {
                event.preventDefault();
                this.callbacks.onCellMouseDown?.(i, event);
            });

            gridEl.appendChild(cellEl);
        }

        this.container.innerHTML = '';
        // --- MODIFIED: Apply the density class to the top-level container ---
        this.container.className = `instrument-row-view ${densityClass}`;
        this.container.appendChild(headerEl);
        this.container.appendChild(gridEl);
    }
}