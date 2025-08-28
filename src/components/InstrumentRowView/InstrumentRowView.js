// file: src/components/InstrumentRowView/InstrumentRowView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { EditorRowHeaderView } from '/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.js';
import { PlaybackRowHeaderView } from '/percussion-studio/src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.js';

export class InstrumentRowView {
    constructor(container, { mode, instrument, callbacks }) {
        this.container = container;
        this.mode = mode || 'editor';
        this.callbacks = callbacks || {};
        this.headerComponent = null;
        this.gridPanel = null;
        this.rootEl = null;

        loadCSS('/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.css');
        this._renderBaseLayout();

        const headerPanel = this.container.querySelector('.instrument-row__header-panel');
        
        if (this.mode === 'playback') {
            this.headerComponent = new PlaybackRowHeaderView(headerPanel, {
                onVolumeChange: this.callbacks.onVolumeChange,
                onToggleMute: this.callbacks.onToggleMute
            });
        } else {
            this.headerComponent = new EditorRowHeaderView(headerPanel, {
                instrument: instrument,
                callbacks: {
                    onRequestInstrumentChange: this.callbacks.onRequestInstrumentChange
                }
            });
        }
        logEvent('debug', 'InstrumentRowView', 'constructor', 'Lifecycle', `[${Date.now()}] Component created in '${this.mode}' mode.`);
    }

    _renderBaseLayout() {
        this.rootEl = document.createElement('div');
        this.rootEl.className = 'instrument-row-view';
        
        this.rootEl.innerHTML = `
            <div class="instrument-row__header-panel"></div>
            <div class="instrument-row__grid-panel"></div>
        `;
        this.gridPanel = this.rootEl.querySelector('.instrument-row__grid-panel');
        this.container.appendChild(this.rootEl);
    }

    render({ instrument, notation, metrics, densityClass }) {
        logEvent('debug', 'InstrumentRowView', 'render', 'State', `[${Date.now()}] Rendering row for ${instrument.symbol}`);

        // Set the density class on the root element to control row height
        this.rootEl.className = `instrument-row-view ${densityClass}`;

        // 1. Render the composed header
        if (this.mode === 'playback') {
            this.headerComponent.render({
                id: instrument.id,
                name: instrument.name,
                volume: instrument.volume,
                muted: instrument.muted
            });
        } else {
            this.headerComponent.render(instrument);
        }

        // 2. Render the grid
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
        
        // Rhythmic Shading Logic
        const isTriplet = metrics.feel === 'triplet';
        if (isTriplet) {
            const tripletPos = index % 3;
            cellEl.classList.add(`cell-triplet-${tripletPos + 1}`);
        } else {
            const isDownbeat = (index === 0);
            const isStrongBeat = (index > 0) && (index % metrics.grouping) === 0;
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
        this.container.innerHTML = '';
        logEvent('debug', 'InstrumentRowView', 'destroy', 'Lifecycle', `[${Date.now()}] Component destroyed.`);
    }
}