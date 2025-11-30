// file: src/components/PatternItemViewMD3/PatternItemViewMD3.integration.js

import './PatternItemViewMD3.js'; // Import to define the custom element
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

export function manualTest() {
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');

    let componentState = {
        item: { 
            pattern: 'verse_a',
            repetitions: 4
            // bpm, and bpm_accel_cents are omitted to test defaults
        },
        globalBPM: 120,
        isSelected: true,
        patternList: ['verse_a', 'chorus_b', 'bridge_c']
    };

    const container = document.getElementById('view-container');
    const stateDisplay = document.getElementById('current-state-display');

    const rerender = () => {
        logEvent('info', 'Harness', 'rerender', 'State', 'Rerendering component with new state:', componentState);
        
        // Create or update the web component
        let view = container.querySelector('pattern-item-view-md3');
        if (!view) {
            view = document.createElement('pattern-item-view-md3');
            container.appendChild(view);
            
            // Add event listeners only once
            view.addEventListener('delete-item', () => {
                logEvent('info', 'Harness', 'onDelete', 'Callback', 'Delete requested for item:', componentState.item);
                alert('Delete event caught! Check the log.');
            });
    
            view.addEventListener('property-change', (e) => {
                const { property, value } = e.detail;
                logEvent('info', 'Harness', 'onPropertyChange', 'Callback', `Property '${property}' changed to:`, value);
                componentState.item[property] = value;
                rerender(); // Re-render to reflect the state change
            });
        }

        // Update component properties/attributes
        view.itemData = componentState.item;
        view.globalBPM = componentState.globalBPM;
        view.patternList = componentState.patternList;
        if (componentState.isSelected) {
            view.setAttribute('selected', '');
        } else {
            view.removeAttribute('selected');
        }
        
        stateDisplay.textContent = `Current State: ${JSON.stringify(componentState, null, 2)}`;
    };

    rerender();
}