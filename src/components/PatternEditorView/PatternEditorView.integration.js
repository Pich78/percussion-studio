// file: src/components/PatternEditorView/PatternEditorView.integration.js

import { PatternEditorView } from './PatternEditorView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- Controller Logic ---
function handleSave({ isNew, patternData }) {
    logEvent('info', 'Controller', 'handleSave', 'Persistence', `Save request`, { isNew, name: patternData.name });
    const newName = isNew ? window.prompt('Enter a name for this new pattern:', patternData.name) : patternData.name;
    
    if (newName) {
        patternData.name = newName;
        logEvent('info', 'Controller', 'handleSave', 'Persistence', `Pattern saved as "${newName}".`, patternData);
        window.alert('Pattern saved!');
    } else {
        logEvent('warn', 'Controller', 'handleSave', 'Persistence', 'Save cancelled.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');

    // --- MOCK DATA ---
    const svgs = {
        hit: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor" /></svg>',
        cross: '<svg viewBox="0 0 100 100"><line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" stroke-width="12"/><line x1="15" y1="85" x2="85" y2="15" stroke="currentColor" stroke-width="12"/></svg>',
    };
    const manifestData = {
        soundPacks: [
            { symbol: 'KCK', pack_name: 'acoustic_kick', name: 'Acoustic Kick', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}] },
            { symbol: 'SNR', pack_name: 'rock_snare', name: 'Rock Snare', sounds: [{letter: 'x', name: 'Rimshot', svg: svgs.cross}] },
        ]
    };

    const editorContainer = document.getElementById('pattern-editor-container');

    try {
        new PatternEditorView(editorContainer, {
            ...manifestData,
            onSave: handleSave,
        });
        logEvent('info', 'IntegrationTest', 'DOMContentLoaded', 'App', 'PatternEditorView initialized.');
    } catch (error) {
        logEvent('error', 'IntegrationTest', 'DOMContentLoaded', 'App', `Failed to initialize PatternEditorView: ${error.message}`);
        console.error(error);
    }
});