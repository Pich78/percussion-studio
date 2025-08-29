// file: src/components/MeasureLayoutView/MeasureLayoutView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { BeatRulerView as DefaultBeatRulerView } from '/percussion-studio/src/components/BeatRulerView/BeatRulerView.js';
import { BeatView as DefaultBeatView } from '/percussion-studio/src/components/BeatView/BeatView.js';

export class MeasureLayoutView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        
        // Allow for mock injection in tests
        this.BeatRulerView = MeasureLayoutView.prototype.BeatRulerView || DefaultBeatRulerView;
        this.BeatView = MeasureLayoutView.prototype.BeatView || DefaultBeatView;

        this.rulerView = null;
        this.beatViews = new Map();

        loadCSS('/percussion-studio/src/components/MeasureLayoutView/MeasureLayoutView.css');
        logEvent('debug', 'MeasureLayoutView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render({ groupingPattern, metrics, instruments, mode, activeTick = -1 }) {
        logEvent('debug', 'MeasureLayoutView', 'render', 'State', 'Render called with', { groupingPattern, mode, activeTick });

        this.destroyChildren();
        this.container.innerHTML = `
            <div class="measure-layout-view">
                <div class="measure-layout-view__ruler"></div>
                <div class="measure-layout-view__beats"></div>
            </div>
        `;

        const rulerContainer = this.container.querySelector('.measure-layout-view__ruler');
        const beatsContainer = this.container.querySelector('.measure-layout-view__beats');

        // 1. Render Beat Ruler
        this.rulerView = new this.BeatRulerView(rulerContainer);
        this.rulerView.render({ groupingPattern, beatGrouping: metrics.beatGrouping });

        // 2. Render Beat Views based on the grouping pattern
        let tickOffset = 0;
        let beatCounter = 1;
        
        groupingPattern.forEach((boxesInThisBeat, index) => {
            const beatHostEl = document.createElement('div');
            beatsContainer.appendChild(beatHostEl);

            const instrumentsForThisBeat = instruments.map(inst => ({
                ...inst,
                pattern: (inst.pattern || '').substring(tickOffset, tickOffset + boxesInThisBeat)
            }));
            
            const beatView = new this.BeatView(beatHostEl, this.callbacks);
            beatView.render({
                beatNumber: beatCounter,
                instruments: instrumentsForThisBeat,
                metrics: metrics,
                mode: mode,
            });
            
            this.beatViews.set(`beat_${index}`, beatView);
            
            tickOffset += boxesInThisBeat;
            beatCounter += boxesInThisBeat / metrics.beatGrouping;
        });

        if (activeTick > -1) {
            this.updatePlaybackIndicator(activeTick);
        }
    }
    
    updatePlaybackIndicator(absoluteTick) {
        this.container.querySelector('.grid-cell.is-active')?.classList.remove('is-active');

        if (absoluteTick > -1) {
            const allCells = this.container.querySelectorAll('.grid-cell');
            if (absoluteTick < allCells.length) {
                allCells[absoluteTick].classList.add('is-active');
            }
        }
    }

    destroyChildren() {
        this.rulerView?.destroy();
        this.beatViews.forEach(view => view.destroy());
        this.beatViews.clear();
    }

    destroy() {
        this.destroyChildren();
        this.container.innerHTML = '';
        logEvent('debug', 'MeasureLayoutView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}