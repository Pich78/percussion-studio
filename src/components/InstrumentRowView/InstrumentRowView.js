// file: src/components/InstrumentRowView/InstrumentRowView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class InstrumentRowView {
    constructor({ headerPanel, gridPanel }, { callbacks, HeaderComponent, headerProps }) {
        if (!HeaderComponent || !headerPanel || !gridPanel) {
            throw new Error('InstrumentRowView requires HeaderComponent and panel elements.');
        }

        this.headerPanel = headerPanel;
        this.gridPanel = gridPanel;
        this.callbacks = callbacks || {};
        this.headerComponent = null;

        loadCSS('/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.css');
        
        // Pass the prepared props directly to the injected header's constructor
        this.headerComponent = new HeaderComponent(this.headerPanel, {
            ...headerProps,
            callbacks: this.callbacks
        });
        
        logEvent('debug', 'InstrumentRowView', 'constructor', 'Lifecycle', `Component created with injected '${HeaderComponent.name}'.`);
    }

    render({ instrument, notation, metrics, headerProps }) {
        logEvent('debug', 'InstrumentRowView', 'render', 'State', `Rendering row for ${instrument.symbol}`);
        
        // 1. Render the composed header with the latest data
        this.headerComponent.render(headerProps);

        // 2. Render the grid cells into the grid panel
        this.gridPanel.innerHTML = '';
        const notationChars = notation.replace(/\|/g, '');
        
        for (let i = 0; i < notationChars.length; i++) {
            const cellEl = this._createCell(i, notationChars[i], instrument, metrics);
            this.gridPanel.appendChild(cellEl);
        }
    }

    _createCell(index, soundLetter, instrument, metrics) {
        const cellEl = document.createElement('div');
        cellEl.className = 'grid-cell';
        cellEl.dataset.tickIndex = index;
        
        const isTriplet = metrics.feel === 'triplet';
        if (isTriplet) {
            const tripletPos = index % 3;
            cellEl.classList.add(`cell-triplet-${tripletPos + 1}`);
        } else {
            const isDownbeat = (index === 0);
            const isStrongBeat = (index > 0) && (index % metrics.beatGrouping) === 0;
            if (isDownbeat) cellEl.classList.add('cell-downbeat');
            else if (isStrongBeat) cellEl.classList.add('cell-strong-beat');
            else cellEl.classList.add('cell-weak-beat');
        }

        const hasNote = soundLetter && soundLetter !== '-';
        if (hasNote) {
            const sound = instrument.sounds.find(s => s.letter === soundLetter);
            if (sound?.svg) {
                cellEl.innerHTML = `<div class="note">${sound.svg}</div>`;
            }
        }
        
        return cellEl;
    }

    destroy() {
        this.headerComponent?.destroy();
        if (this.headerPanel) this.headerPanel.innerHTML = '';
        if (this.gridPanel) this.gridPanel.innerHTML = '';
        logEvent('debug', 'InstrumentRowView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}