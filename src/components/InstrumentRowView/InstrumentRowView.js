// file: src/components/InstrumentRowView/InstrumentRowView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

/**
 * Renders a single instrument track row, including a header and a dynamic grid of note cells.
 * It is a "dumb" component that is controlled entirely by a parent. It translates props
 * into a DOM structure and reports all user interactions up via callbacks.
 */
export class InstrumentRowView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        loadCSS('/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.css');
        logEvent('debug', 'InstrumentRowView', 'constructor', 'Lifecycle', 'Component created.');
    }

    /**
     * Renders or updates the row based on the provided data.
     * @param {object} props - The data required to render the row.
     * @param {object} props.instrument - The instrument definition ({ name, symbol, sounds }).
     * @param {string} props.notation - The note pattern string (e.g., "||o-p-||").
     * @param {object} props.metrics - The time signature and subdivision info.
     */
    render({ instrument, notation, metrics }) {
        logEvent('debug', 'InstrumentRowView', 'render', 'State', `Rendering row for ${instrument.symbol}`);

        // --- 1. Calculate Layout Parameters ---
        const totalCells = (metrics.beatsPerMeasure / metrics.beatUnit) * metrics.subdivision;
        const notationChars = notation.replace(/\|/g, '');

        // --- 2. Create Header Element ---
        const headerEl = document.createElement('div');
        headerEl.className = 'instrument-row-header';
        headerEl.textContent = instrument.name;
        headerEl.addEventListener('click', () => {
            this.callbacks.onRequestInstrumentChange?.(instrument.symbol);
        });

        // --- 3. Create Grid Container ---
        const gridEl = document.createElement('div');
        gridEl.className = 'instrument-row-grid';
        gridEl.addEventListener('mouseenter', () => this.callbacks.onGridMouseEnter?.(instrument));
        gridEl.addEventListener('mouseleave', () => this.callbacks.onGridMouseLeave?.());

        // --- 4. Loop to Create Each Cell ---
        for (let i = 0; i < totalCells; i++) {
            const cellEl = document.createElement('div');
            cellEl.className = 'grid-cell';
            cellEl.dataset.tickIndex = i;

            // Apply highlight style for main beats
            if ((i % metrics.grouping) === 0) {
                cellEl.classList.add('highlighted-beat');
            }

            // Render the note SVG if one exists at this position
            const soundLetter = notationChars[i];
            if (soundLetter && soundLetter !== '-') {
                const sound = instrument.sounds.find(s => s.letter === soundLetter);
                if (sound?.svg) {
                    // Using a dedicated note element is better for styling and querying
                    const noteEl = document.createElement('div');
                    noteEl.className = 'note';
                    noteEl.innerHTML = sound.svg;
                    cellEl.appendChild(noteEl);
                }
            }
            
            // Report mouse down events up to the parent controller
            cellEl.addEventListener('mousedown', (event) => {
                event.preventDefault(); // Prevent text selection, etc.
                this.callbacks.onCellMouseDown?.(i, event);
            });

            gridEl.appendChild(cellEl);
        }

        // --- 5. Assemble the Final Component ---
        this.container.innerHTML = '';
        this.container.className = 'instrument-row-view';
        this.container.appendChild(headerEl);
        this.container.appendChild(gridEl);
    }
}