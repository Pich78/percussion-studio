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

        // --- FIX: Create a new root element for the component ---
        // This is the core of the fix. We build everything in this element first.
        const rowEl = document.createElement('div');
        rowEl.className = `instrument-row-view ${densityClass}`;

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

            if ((i % metrics.grouping) === 0) {
                cellEl.classList.add('highlighted-beat');
            } else if (metrics.subdivision >= 32) {
                const sixteenthGrouping = metrics.grouping / 2;
                if ((i % sixteenthGrouping) === 0) {
                    cellEl.classList.add('sub-beat-line');
                }
            }

            const soundLetter = notationChars[i];
            const hasNote = soundLetter && soundLetter !== '-';
            if (hasNote) {
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
                this.callbacks.onCellMouseDown?.(i, event, hasNote);
            });
            
            cellEl.addEventListener('mouseup', (event) => {
                this.callbacks.onCellMouseUp?.(i, event);
            });

            // Append the finished cell to the grid
            gridEl.appendChild(cellEl);
        }

        // --- FIX: Assemble the component in memory first ---
        rowEl.appendChild(headerEl);
        rowEl.appendChild(gridEl);

        // --- FIX: As the final step, safely replace the container's content ---
        this.container.innerHTML = '';
        this.container.appendChild(rowEl);
    }
}