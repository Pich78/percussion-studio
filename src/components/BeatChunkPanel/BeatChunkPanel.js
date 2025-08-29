// file: src/components/BeatChunkPanel/BeatChunkPanel.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { BeatRulerView as DefaultBeatRulerView } from '/percussion-studio/src/components/BeatRulerView/BeatRulerView.js';
import { InstrumentRowView as DefaultInstrumentRowView } from '/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.js';

export class BeatChunkPanel {
    constructor(container, callbacks, dependencies = {}) {
        this.container = container;
        this.callbacks = callbacks || {};
        
        // --- FIX: True Dependency Injection ---
        // Use the injected mock from the test, or fall back to the real component.
        this.BeatRulerView = dependencies.BeatRulerView || DefaultBeatRulerView;
        this.InstrumentRowView = dependencies.InstrumentRowView || DefaultInstrumentRowView;

        this.childInstances = {
            ruler: null,
            rows: new Map(),
        };

        loadCSS('/percussion-studio/src/components/BeatChunkPanel/BeatChunkPanel.css');
        logEvent('debug', 'BeatChunkPanel', 'constructor', 'Lifecycle', 'Component created.');
    }

    render({ beatNumber, boxesInChunk, instruments, metrics, HeaderComponent }) {
        logEvent('debug', 'BeatChunkPanel', 'render', 'State', `Rendering Beat Chunk #${beatNumber} with ${boxesInChunk} boxes.`);

        this.destroyChildren();
        
        this.container.innerHTML = `
            <div class="beat-chunk-panel">
                <div class="beat-chunk-panel__ruler-area"></div>
                <div class="beat-chunk-panel__header-area--empty"></div>
            </div>
        `;
        const panelEl = this.container.querySelector('.beat-chunk-panel');

        // 1. Render Ruler
        const rulerContainer = this.container.querySelector('.beat-chunk-panel__ruler-area');
        const rulerView = new this.BeatRulerView(rulerContainer);
        rulerView.render({ 
            groupingPattern: [boxesInChunk], 
            beatGrouping: metrics.beatGrouping 
        });
        this.childInstances.ruler = rulerView;
        
        // 2. Render Instrument Rows
        instruments.forEach(instrument => {
            const rowHostEl = document.createElement('div');
            rowHostEl.className = 'beat-chunk-panel__row-container';
            panelEl.appendChild(rowHostEl);

            const rowView = new this.InstrumentRowView(rowHostEl, {
                HeaderComponent: HeaderComponent,
                instrument,
                callbacks: this.callbacks 
            });
            
            let densityClass = 'density-medium';
            if (boxesInChunk <= 8) densityClass = 'density-low';
            if (boxesInChunk > 16) densityClass = 'density-high';

            rowView.render({ 
                instrument, 
                notation: instrument.pattern, 
                metrics,
                densityClass
            });
            
            this.childInstances.rows.set(instrument.id, rowView);
        });
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