// file: src/components/MeasureLayoutView/MeasureLayoutView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
// --- FIX: Import dependencies directly. No more injection for the class itself. ---
import { BeatChunkPanel } from '/percussion-studio/src/components/BeatChunkPanel/BeatChunkPanel.js';

export class MeasureLayoutView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        
        this.chunkPanels = new Map();
        this.playheadElement = null;
        this.lastRenderProps = {};

        loadCSS('/percussion-studio/src/components/MeasureLayoutView/MeasureLayoutView.css');
        logEvent('debug', 'MeasureLayoutView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render({ groupingPattern, metrics, instruments, HeaderComponent }) {
        this.lastRenderProps = { groupingPattern, metrics, instruments, HeaderComponent };
        logEvent('debug', 'MeasureLayoutView', 'render', 'State', 'Render called with', { groupingPattern });

        this.destroyChildren();
        this.container.innerHTML = `
            <div class="measure-layout-view">
                <div class="measure-layout-view__panels"></div>
                <div class="playhead-indicator"></div>
            </div>
        `;

        const panelsContainer = this.container.querySelector('.measure-layout-view__panels');
        this.playheadElement = this.container.querySelector('.playhead-indicator');

        let tickOffset = 0;
        let beatCounter = 1;
        
        groupingPattern.forEach((boxesInChunk, index) => {
            const panelHostEl = document.createElement('div');
            panelsContainer.appendChild(panelHostEl);

            const instrumentsForChunk = instruments.map(inst => ({
                ...inst,
                pattern: (inst.pattern || '').substring(tickOffset, tickOffset + boxesInChunk)
            }));
            
            // --- Use the real BeatChunkPanel component ---
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
    
    updatePlaybackIndicator(absoluteTick) {
        if (!this.playheadElement) return;

        if (absoluteTick > -1) {
            this.playheadElement.classList.add('is-active');
            
            // This logic correctly calculates the X and Y position for the playhead
            // across multiple wrapped panels.
            let remainingTick = absoluteTick;
            let yOffset = 0;
            let xOffset = 0;
            const { groupingPattern } = this.lastRenderProps;
            
            for (let i = 0; i < groupingPattern.length; i++) {
                const panelHost = this.chunkPanels.get(`chunk_${i}`)?.container;
                if (!panelHost) break;

                const boxesInThisChunk = groupingPattern[i];
                if (remainingTick < boxesInThisChunk) {
                    // The tick is in this panel
                    xOffset = remainingTick * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-width') || '40');
                    yOffset += panelHost.offsetTop;
                    break;
                }
                remainingTick -= boxesInThisChunk;
            }
            
            const headerWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-width') || '150');
            this.playheadElement.style.transform = `translate(${headerWidth + xOffset}px, ${yOffset}px)`;

        } else {
            this.playheadElement.classList.remove('is-active');
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
