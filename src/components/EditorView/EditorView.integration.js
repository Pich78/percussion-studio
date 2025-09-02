// file: src/components/EditorView/EditorView.integration.js

import { EditorView } from './EditorView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

document.addEventListener('DOMContentLoaded', () => {
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');

    const manifestData = {
        soundPacks: [
            { symbol: 'KCK', pack_name: 'acoustic_kick', name: 'Acoustic Kick', sounds: [{letter: 'o', name: 'Hit', svg: ''}] },
            { symbol: 'SNR', pack_name: 'rock_snare', name: 'Rock Snare', sounds: [{letter: 'x', name: 'Rimshot', svg: ''}] },
        ]
    };

    const flowData = Array.from({length: 8}, (_, i) => ({ pattern: `Pattern ${i+1}`}));

    const editorContainer = document.getElementById('editor-container');

    try {
        new EditorView(editorContainer, {
            flow: flowData,
            manifest: manifestData
        });
        logEvent('info', 'IntegrationTest', 'DOMContentLoaded', 'App', 'EditorView component initialized successfully.');
    } catch (error) {
        logEvent('error', 'IntegrationTest', 'DOMContentLoaded', 'App', `Failed to initialize EditorView: ${error.message}`);
        console.error(error);
    }
});