// file: src/components/GridPanelView/GridPanelView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class GridPanelView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        loadCSS('/percussion-studio/src/components/GridPanelView/GridPanelView.css');
        logEvent('debug', 'GridPanelView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render({ instrument, notation, metrics }) {
        logEvent('debug', 'GridPanelView', 'render', 'State', `Rendering grid for ${instrument?.symbol} with notation: ${notation}`);

        this.container.innerHTML = '';
        this.container.className = 'grid-panel';

        if (!notation || !instrument || !metrics) {
            logEvent('warn', 'GridPanelView', 'render', 'State', 'Render aborted due to missing props.');
            return;
        }
        
        const notationChars = notation.split('');
        
        for (let i = 0; i < notationChars.length; i++) {
            const cellEl = this._createCell(i, notationChars[i], instrument, metrics);
            this.container.appendChild(cellEl);
        }
    }

    _createCell(index, soundLetter, instrument, metrics) {
        const cellEl = document.createElement('div');
        cellEl.className = 'grid-cell';
        cellEl.dataset.tickIndex = index;
        
        const { feel, beatGrouping } = metrics;
        const hasNote = soundLetter && soundLetter !== '-';

        // --- Rhythmic Shading Logic (Upgraded) ---
        if (feel === 'triplet') {
            if (beatGrouping === 3) {
                const positionInBeat = index % beatGrouping;
                cellEl.classList.add(`cell-triplet-${positionInBeat + 1}`);
            } else {
                const positionInInnerTriplet = index % 3;
                if (positionInInnerTriplet === 0) {
                    const positionInOuterBeat = index % beatGrouping;
                    if (positionInOuterBeat === 0) {
                        cellEl.classList.add('cell-triplet-1');
                    } else {
                        cellEl.classList.add('cell-triplet-2');
                    }
                } else {
                    cellEl.classList.add('cell-triplet-3');
                }
            }
        } else { // Duple feel
            const positionInBeat = index % beatGrouping;
            if (positionInBeat === 0) {
                cellEl.classList.add('cell-downbeat');
            } else if (beatGrouping > 2 && positionInBeat === beatGrouping / 2) {
                cellEl.classList.add('cell-strong-beat');
            } else {
                cellEl.classList.add('cell-weak-beat');
            }
        }

        if (hasNote) {
            const sound = instrument.sounds.find(s => s.letter === soundLetter);
            if (sound?.svg) {
                cellEl.innerHTML = `<div class="note">${sound.svg}</div>`;
            }
        }
        
        // --- Event Handling ---
        const createEventData = (event) => ({ instrument, tickIndex: index, hasNote, event });

        cellEl.addEventListener('mousedown', (e) => {
            if (this.callbacks.onCellMouseDown) {
                this.callbacks.onCellMouseDown(createEventData(e));
            }
        });

        cellEl.addEventListener('mouseup', (e) => {
            if (this.callbacks.onCellMouseUp) {
                this.callbacks.onCellMouseUp(createEventData(e));
            }
        });

        cellEl.addEventListener('mouseenter', (e) => {
            if (e.buttons === 1 && this.callbacks.onCellMouseEnter) {
                this.callbacks.onCellMouseEnter(createEventData(e));
            }
        });
        
        return cellEl;
    }

    destroy() {
        this.container.innerHTML = '';
        logEvent('debug', 'GridPanelView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}