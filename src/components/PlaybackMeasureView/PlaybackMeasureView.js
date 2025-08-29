// file: src/components/PlaybackMeasureView/PlaybackMeasureView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { METRICS_CONFIG } from '/percussion-studio/src/config/MetricsConfiguration.js';
import { MeasureLayoutView } from '/percussion-studio/src/components/MeasureLayoutView/MeasureLayoutView.js';

export class PlaybackMeasureView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {}; // For future use, e.g., onMeasureClicked
        this.layoutView = null;

        loadCSS('/percussion-studio/src/components/PlaybackMeasureView/PlaybackMeasureView.css');
        logEvent('debug', 'PlaybackMeasureView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render(measureData) {
        logEvent('debug', 'PlaybackMeasureView', 'render', 'State', 'Render called with measure data', measureData);
        const { timeSignature, subdivision, groupingPattern, instruments } = measureData;

        // --- The Core Logic: Interpret saved data with the config ---
        const config = METRICS_CONFIG[timeSignature]?.subdivisions?.[subdivision];
        if (!config) {
            logEvent('error', 'PlaybackMeasureView', 'render', 'Data Error', `No METRICS_CONFIG found for ${timeSignature} @ ${subdivision}`);
            this.container.innerHTML = `<p class="error">Invalid measure data.</p>`;
            return;
        }

        if (this.layoutView) {
            this.layoutView.destroy();
        }
        
        this.container.innerHTML = '';
        this.container.className = 'playback-measure-view';

        // Instantiate the shared layout component
        this.layoutView = new MeasureLayoutView(this.container, this.callbacks);
        
        // Pass the full, enriched data down to the layout view
        this.layoutView.render({
            groupingPattern: groupingPattern,
            metrics: {
                ...config,
                // Ensure the saved time signature and subdivision are used
                timeSignature: timeSignature,
                subdivision: subdivision,
            },
            instruments: instruments,
            mode: 'playback', // Hardcoded to playback mode
        });
    }

    updatePlaybackIndicator(tick, isActive) {
        const activeTick = isActive ? tick : -1;
        this.layoutView?.updatePlaybackIndicator(activeTick);
    }

    destroy() {
        this.layoutView?.destroy();
        this.container.innerHTML = '';
        logEvent('debug', 'PlaybackMeasureView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}