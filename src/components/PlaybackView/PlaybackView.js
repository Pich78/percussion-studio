// file: src/components/PlaybackView/PlaybackView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
// In a real implementation, this would import the actual PlaybackMeasureView
// For now, we rely on the parent/integration layer to provide a view constructor.
// import { PlaybackMeasureView } from '/percussion-studio/src/components/PlaybackMeasureView/PlaybackMeasureView.js';

export class PlaybackView {
    constructor(container, { PlaybackMeasureView }) {
        if (!PlaybackMeasureView) {
            throw new Error('PlaybackView requires a PlaybackMeasureView component constructor.');
        }
        this.container = container;
        this.PlaybackMeasureView = PlaybackMeasureView; // The component class to instantiate
        this.measureInstances = new Map();
        this.rhythm = null;

        loadCSS('/percussion-studio/src/components/PlaybackView/PlaybackView.css');
        logEvent('debug', 'PlaybackView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render(rhythm) {
        logEvent('debug', 'PlaybackView', 'render', 'State', `Rendering rhythm with ${rhythm.measures.length} measures.`);
        this.rhythm = rhythm;
        
        this.destroyChildren();
        this.container.innerHTML = '';
        this.container.className = 'playback-view';
        
        const measuresListEl = document.createElement('div');
        measuresListEl.className = 'playback-view__measures-list';

        this.rhythm.measures.forEach(measureData => {
            const measureHostEl = document.createElement('div');
            measureHostEl.className = 'playback-view__measure-container';
            measureHostEl.dataset.measureId = measureData.id;
            measuresListEl.appendChild(measureHostEl);

            const measureView = new this.PlaybackMeasureView(measureHostEl);
            measureView.render(measureData);
            
            this.measureInstances.set(measureData.id, measureView);
        });
        
        this.container.appendChild(measuresListEl);
    }

    updatePlaybackIndicator(tick) {
        if (!this.rhythm) return;
        
        let currentMeasure = null;
        for (const measure of this.rhythm.measures) {
            if (tick >= measure.startTick && tick < measure.endTick) {
                currentMeasure = measure;
                break;
            }
        }

        this.measureInstances.forEach((view, measureId) => {
            if (currentMeasure && measureId === currentMeasure.id) {
                const relativeTick = tick - currentMeasure.startTick;
                view.updatePlaybackIndicator(relativeTick, true);
            } else {
                view.updatePlaybackIndicator(0, false); // Deactivate indicator
            }
        });
    }
    
    destroyChildren() {
        this.measureInstances.forEach(instance => instance.destroy?.());
        this.measureInstances.clear();
    }

    destroy() {
        this.destroyChildren();
        this.container.innerHTML = '';
        logEvent('debug', 'PlaybackView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}