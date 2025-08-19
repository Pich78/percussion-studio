// file: src/components/MeasureEditorView/MeasureEditorView.integration.js

import { MeasureEditorView } from './MeasureEditorView.js';
import { Logger } from '/percussion-studio/lib/Logger.js';

/**
 * This script sets up the manual test workbench for the MeasureEditorView component.
 * It initializes the component with mock data and wires up loggers to display
 * internal events and callbacks for interactive testing.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the logger to output to the dedicated log panel in the HTML
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');

    // Mock data for instruments and sound packs, required by the component
    const manifestData = {
        instrumentDefs: [
            { symbol: 'KCK', name: 'Kick Drum' },
            { symbol: 'SNR', name: 'Snare Drum' },
            { symbol: 'HHC', name: 'Hi-Hat Closed' },
            { symbol: 'HHO', name: 'Hi-Hat Open' },
            { symbol: 'CRS', name: 'Crash Cymbal' },
        ],
        soundPacks: [
            { symbol: 'KCK', pack_name: 'acoustic_kick', name: 'Acoustic Kick' },
            { symbol: 'SNR', pack_name: 'rock_snare', name: 'Rock Snare' },
            { symbol: 'HHC', pack_name: 'closed_hat', name: 'Acoustic Hi-hat' },
            { symbol: 'HHO', pack_name: 'open_hat', name: 'Open Hi-hat' },
            { symbol: 'CRS', pack_name: 'crash_cymbal', name: '18" Crash' },
        ]
    };
    
    /**
     * Logs component callbacks to a dedicated panel in the UI for visibility.
     * @param {string} name - The name of the callback.
     * @param {object} data - The data payload from the callback.
     */
    function logCallback(name, data) {
         const logEl = document.getElementById('callback-log');
         const entry = document.createElement('div');
         const time = new Date().toLocaleTimeString();
         entry.textContent = `[${time}] [${name}] Fired with: ${JSON.stringify(data)}`;
         logEl.prepend(entry); // Prepend to see the latest first
    }

    // Find the container element in the DOM where the component will be rendered
    const editorContainer = document.getElementById('measure-editor-container');

    // Instantiate the component, passing in the container, mock data, and callback handlers
    new MeasureEditorView(editorContainer, {
        instrumentDefs: manifestData.instrumentDefs,
        soundPacks: manifestData.soundPacks,
        onMetricsChange: (newMetrics) => logCallback('onMetricsChange', newMetrics),
        onCellMouseDown: (instrument, tick, hasNote) => logCallback('onCellMouseDown', { symbol: instrument.symbol, tick, hasNote }),
        onGridMouseEnter: (instrument) => logCallback('onGridMouseEnter', { symbol: instrument.symbol }),
        onGridMouseLeave: () => logCallback('onGridMouseLeave', {})
    });
});