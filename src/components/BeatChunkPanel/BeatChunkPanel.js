// file: src/components/BeatChunkPanel/BeatChunkPanel.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { BeatRulerView } from '/percussion-studio/src/components/BeatRulerView/BeatRulerView.js';
import { InstrumentRowView } from '/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.js';
import { PlaybackRowHeaderView } from '/percussion-studio/src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.js';

export class BeatChunkPanel {
    constructor(container, callbacks, dependencies = {}) {
        this.container = container;
        this.callbacks = callbacks || {};
        
        this.BeatRulerView = dependencies.BeatRulerView || BeatRulerView;
        this.InstrumentRowView = dependencies.InstrumentRowView || InstrumentRowView;

        this.childInstances = {
            ruler: null,
            rows: new Map(),
        };

        this.playheadElement = null;
        this.lastRenderProps = {};

        loadCSS('/percussion-studio/src/components/BeatChunkPanel/BeatChunkPanel.css');
        logEvent('debug', 'BeatChunkPanel', 'constructor', 'Lifecycle', 'Component created.');
    }

    render({ beatNumber, boxesInChunk, instruments, metrics, HeaderComponent }) {
        this.lastRenderProps = { beatNumber, boxesInChunk, instruments, metrics, HeaderComponent };
        logEvent('debug', 'BeatChunkPanel', 'render', 'State', `Rendering Beat Chunk starting at beat #${beatNumber}`);

        this.destroyChildren();
        
        this.container.innerHTML = `<div class="beat-chunk-panel"></div>`;
        const panelEl = this.container.querySelector('.beat-chunk-panel');

        if (!panelEl) {
            logEvent('error', 'BeatChunkPanel', 'render', 'DOM', 'Could not find the panel root element.');
            return;
        }

        this.playheadElement = document.createElement('div');
        this.playheadElement.className = 'playhead-indicator';
        panelEl.appendChild(this.playheadElement);

        const rulerHeaderArea = document.createElement('div');
        rulerHeaderArea.className = 'beat-chunk-panel__header-area--empty';
        panelEl.appendChild(rulerHeaderArea);

        const rulerArea = document.createElement('div');
        rulerArea.className = 'beat-chunk-panel__ruler-area';
        panelEl.appendChild(rulerArea);
        
        const rulerView = new this.BeatRulerView(rulerArea);
        rulerView.render({ 
            groupingPattern: [boxesInChunk], 
            beatGrouping: metrics.beatGrouping,
            startingBeat: beatNumber
        });
        this.childInstances.ruler = rulerView;
        
        instruments.forEach(instrument => {
            const headerPanel = document.createElement('div');
            headerPanel.className = 'instrument-row__header-panel';
            const gridPanel = document.createElement('div');
            gridPanel.className = 'instrument-row__grid-panel';
            
            panelEl.appendChild(headerPanel);
            panelEl.appendChild(gridPanel);

            let headerProps;
            if (HeaderComponent === PlaybackRowHeaderView) {
                headerProps = { id: instrument.id, name: instrument.name, volume: instrument.volume, muted: instrument.muted };
            } else {
                headerProps = instrument;
            }

            const rowView = new this.InstrumentRowView(
                { headerPanel, gridPanel }, // Pass the two panel elements
                { HeaderComponent, headerProps, callbacks: this.callbacks }
            );
            
            let densityClass = 'density-medium';
            if (boxesInChunk <= 8) densityClass = 'density-low';
            if (boxesInChunk > 16) densityClass = 'density-high';
            
            headerPanel.classList.add(densityClass);
            gridPanel.classList.add(densityClass);

            rowView.render({ instrument, notation: instrument.pattern, metrics, headerProps });
            this.childInstances.rows.set(instrument.id, rowView);
        });
    }

    updatePlaybackIndicator(tick) {
        if (!this.playheadElement) return;

        if (tick > -1) {
            const columnCells = this.container.querySelectorAll(`.grid-cell[data-tick-index="${tick}"]`);
            if (columnCells.length === 0) {
                this.playheadElement.classList.remove('is-active');
                return;
            }

            const firstCell = columnCells[0];
            const lastCell = columnCells[columnCells.length - 1];

            const x = firstCell.offsetLeft;
            const y = firstCell.offsetTop;
            const width = firstCell.offsetWidth;
            const height = (lastCell.offsetTop + lastCell.offsetHeight) - y;
            
            this.playheadElement.style.width = `${width}px`;
            this.playheadElement.style.height = `${height}px`;
            this.playheadElement.style.transform = `translate(${x}px, ${y}px)`;
            this.playheadElement.classList.add('is-active');
        } else {
            this.playheadElement.classList.remove('is-active');
        }
    }

    updateInstrument(instrument) {
        const rowView = this.childInstances.rows.get(instrument.id);
        if (rowView) {
            const { metrics, HeaderComponent } = this.lastRenderProps;
            let headerProps;
            if (HeaderComponent === PlaybackRowHeaderView) {
                headerProps = { id: instrument.id, name: instrument.name, volume: instrument.volume, muted: instrument.muted };
            } else {
                headerProps = instrument;
            }
            rowView.render({ instrument, notation: instrument.pattern, metrics, headerProps });
        }
    }

    destroyChildren() {
        this.childInstances.ruler?.destroy();
        this.childInstances.rows.forEach(instance => instance.destroy());
        this.childInstances.rows.clear();
    }

    destroy() {
        this.destroyChildren();
        this.container.innerHTML = '';
        logEvent('debug', 'BeatChunkPanel', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}