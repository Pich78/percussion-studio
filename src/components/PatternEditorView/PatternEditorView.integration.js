// file: src/components/PatternEditorView/PatternEditorView.integration.js

import { PatternEditorView } from './PatternEditorView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

document.addEventListener('DOMContentLoaded', () => {
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');

    const manifestData = {
        instrumentDefs: [
            { symbol: 'KCK', name: 'Kick Drum' },
            { symbol: 'SNR', name: 'Snare Drum' },
            { symbol: 'HH', name: 'Hi-Hat' },
            { symbol: 'CR', name: 'Crash Cymbal' }
        ],
        soundPacks: [
            { symbol: 'KCK', pack_name: 'acoustic_kick', name: 'Acoustic Kick' },
            { symbol: 'KCK', pack_name: '808_kick', name: '808 Kick' },
            { symbol: 'SNR', pack_name: 'rock_snare', name: 'Rock Snare' },
            { symbol: 'SNR', pack_name: 'trap_snare', name: 'Trap Snare' },
            { symbol: 'HH', pack_name: 'acoustic_hat', name: 'Acoustic Hat' },
            { symbol: 'HH', pack_name: '808_hat', name: '808 Hat' },
            { symbol: 'CR', pack_name: 'acoustic_crash', name: 'Acoustic Crash' },
        ]
    };

    const editorContainer = document.getElementById('pattern-editor-container');

    try {
        const patternEditor = new PatternEditorView(editorContainer, manifestData);
        logEvent('info', 'IntegrationTest', 'DOMContentLoaded', 'App', 'PatternEditorView component initialized successfully for manual testing.');
    } catch (error) {
        logEvent('error', 'IntegrationTest', 'DOMContentLoaded', 'App', `Failed to initialize PatternEditorView: ${error.message}`);
    }
});
