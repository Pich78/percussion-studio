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
        
        const hasNote = soundLetter && soundLetter !== '-';

        // --- Event Handling ---
        const createEventData = (event) => ({
            instrument,
            tickIndex: index,
            hasNote,
            event,
        });

        cellEl.addEventListener('mousedown', (e) => {
            if (this.callbacks.onCellMouseDown) {
                logEvent('debug', 'GridPanelView', '_createCell', 'Event', `mousedown fired for tick ${index}.`);
                this.callbacks.onCellMouseDown(createEventData(e));
            }
        });

        cellEl.addEventListener('mouseup', (e) => {
            if (this.callbacks.onCellMouseUp) {
                logEvent('debug', 'GridPanelView', '_createCell', 'Event', `mouseup fired for tick ${index}.`);
                this.callbacks.onCellMouseUp(createEventData(e));
            }
        });

        cellEl.addEventListener('mouseenter', (e) => {
            // Only fire for drag events (when primary mouse button is pressed)
            if (e.buttons === 1 && this.callbacks.onCellMouseEnter) {
                logEvent('debug', 'GridPanelView', '_createCell', 'Event', `mouseenter (drag) fired for tick ${index}.`);
                this.callbacks.onCellMouseEnter(createEventData(e));
            }
        });

        // Rhythmic Shading Logic
        const isTriplet = metrics.feel === 'triplet';
        if (isTriplet) {
            const tripletPos = index % 3;
            cellEl.classList.add(`cell-triplet-${tripletPos + 1}`);
        } else {
            const beatGrouping = metrics.beatGrouping || 4;
            const isDownbeat = (index % beatGrouping === 0);
            
            if (isDownbeat) {
                 cellEl.classList.add('cell-downbeat');
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
        
        return cellEl;
    }

    destroy() {
        this.container.innerHTML = '';
        logEvent('debug', 'GridPanelView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}