// file: src/components/MeasureLayoutView/MeasureLayoutView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { BeatChunkPanel } from '/percussion-studio/src/components/BeatChunkPanel/BeatChunkPanel.js';

export class MeasureLayoutView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        
        this.chunkPanels = new Map();
        this.lastRenderProps = {};

        loadCSS('/percussion-studio/src/components/MeasureLayoutView/MeasureLayoutView.css');
        logEvent('debug', 'MeasureLayoutView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render({ groupingPattern, metrics, instruments, HeaderComponent }) {
        this.lastRenderProps = { groupingPattern, metrics, instruments, HeaderComponent };
        logEvent('debug', 'MeasureLayoutView', 'render', 'State', 'Render called');

        this.destroyChildren();
        this.container.innerHTML = `<div class="measure-layout-view__panels"></div>`;
        const panelsContainer = this.container.querySelector('.measure-layout-view__panels');

        let tickOffset = 0;
        let beatCounter = 1;
        
        groupingPattern.forEach((boxesInChunk, index) => {
            const panelHostEl = document.createElement('div');
            panelsContainer.appendChild(panelHostEl);

            const instrumentsForChunk = instruments.map(inst => ({
                ...inst,
                pattern: (inst.pattern || '').substring(tickOffset, tickOffset + boxesInChunk)
            }));
            
            const panelView = new BeatChunkPanel(panelHostEl, this.callbacks);
            panelView.render({
                beatNumber: beatCounter,
                boxesInChunk: boxesInChunk,
                instruments: instrumentsForChunk,
                metrics: metrics,
                HeaderComponent: HeaderComponent,
            });
            
            this.chunkPanels.set(`chunk_${index}`, panelView);
            
            tickOffset += boxesInChunk;
            beatCounter += boxesInChunk / metrics.beatGrouping;
        });
    }
    
    /**
     * --- REFACTORED ---
     * This method now finds the correct BeatChunkPanel and delegates the update command to it.
     */
    updatePlaybackIndicator(absoluteTick) {
        let remainingTick = absoluteTick;
        const { groupingPattern } = this.lastRenderProps;

        // Deactivate all panels first
        this.chunkPanels.forEach(panel => panel.updatePlaybackIndicator(-1));

        if (absoluteTick > -1) {
            for (let i = 0; i < groupingPattern.length; i++) {
                const boxesInThisChunk = groupingPattern[i];
                if (remainingTick < boxesInThisChunk) {
                    const targetPanel = this.chunkPanels.get(`chunk_${i}`);
                    targetPanel?.updatePlaybackIndicator(remainingTick);
                    break; 
                }
                remainingTick -= boxesInThisChunk;
            }
        }
    }

    destroyChildren() {
        this.chunkPanels.forEach(view => view.destroy());
        this.chunkPanels.clear();
    }

    destroy() {
        this.destroyChildren();
        this.container.innerHTML = '';
        logEvent('debug', 'MeasureLayoutView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}