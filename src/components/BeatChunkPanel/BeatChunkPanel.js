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

        this.lastRenderProps = {}; // Store props for granular updates

        loadCSS('/percussion-studio/src/components/BeatChunkPanel/BeatChunkPanel.css');
        logEvent('debug', 'BeatChunkPanel', 'constructor', 'Lifecycle', 'Component created.');
    }

    render({ beatNumber, boxesInChunk, instruments, metrics, HeaderComponent }) {
        this.lastRenderProps = { beatNumber, boxesInChunk, instruments, metrics, HeaderComponent };
        logEvent('debug', 'BeatChunkPanel', 'render', 'State', `Rendering Beat Chunk starting at beat #${beatNumber} with ${boxesInChunk} boxes.`);

        this.destroyChildren();
        
        this.container.innerHTML = `<div class="beat-chunk-panel"></div>`;
        const panelEl = this.container.querySelector('.beat-chunk-panel');

        // --- ROW 1: The Ruler and its empty header ---
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
            startingBeat: beatNumber,
        });
        this.childInstances.ruler = rulerView;
        
        // --- SUBSEQUENT ROWS: The Instruments ---
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
                { headerPanel, gridPanel },
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