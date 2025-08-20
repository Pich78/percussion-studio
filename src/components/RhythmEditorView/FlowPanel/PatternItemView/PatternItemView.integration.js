// file: src/components/RhythmEditorView/FlowPanel/PatternItemView/PatternItemView.integration.js

import { PatternItemView } from './PatternItemView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

export function manualTest() {
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');

    // Start with a minimal item to test default value rendering
    let currentState = {
        item: { 
            pattern: 'verse_a', 
            // repetitions, bpm, and bpm_accel_cents are omitted to test defaults
        },
        index: 0,
        globalBPM: 120,
        isSelected: true,
    };

    const container = document.getElementById('view-container');
    const stateDisplay = document.getElementById('current-state-display');

    const rerender = () => {
        logEvent('info', 'Harness', 'rerender', 'State', 'Rerendering component with new state:', currentState);
        view.render(currentState);
        stateDisplay.textContent = `Current State: ${JSON.stringify(currentState.item, null, 2)}`;
    };

    const view = new PatternItemView(container, {
        onDelete: () => {
            logEvent('info', 'Harness', 'onDelete', 'Callback', 'Delete requested for item at index ' + currentState.index);
            alert('Delete callback fired! Check the log.');
        },
        onPropertyChange: (property, value) => {
            logEvent('info', 'Harness', 'onPropertyChange', 'Callback', `Property '${property}' changed to:`, value);
            currentState.item[property] = value;
            rerender();
        }
    });

    rerender();
}