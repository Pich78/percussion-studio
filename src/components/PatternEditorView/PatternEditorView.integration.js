// file: src/components/PatternEditorView/PatternEditorView.integration.js

import { PatternEditorView } from './PatternEditorView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- REMOVED: Playback state and transport/settings handlers are no longer needed ---

// --- NEW: Controller logic for saving ---
function handleSave({ isNew, patternData }) {
    logEvent('info', 'Controller', 'handleSave', 'Persistence', `Save request received`, { isNew, name: patternData.name });
    if (isNew) {
        const newName = window.prompt('Please enter a name for this pattern:', patternData.name);
        if (newName) {
            patternData.name = newName;
            // In a real app, you would now save `patternData`
            logEvent('info', 'Controller', 'handleSave', 'Persistence', `Pattern saved with new name "${newName}".`, patternData);
            window.alert('Pattern saved!');
        } else {
            logEvent('warn', 'Controller', 'handleSave', 'Persistence', 'Save was cancelled by user.');
        }
    } else {
        // In a real app, you would now update the existing pattern
        logEvent('info', 'Controller', 'handleSave', 'Persistence', `Pattern "${patternData.name}" updated.`, patternData);
        window.alert('Pattern updated!');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');

    // --- FIX: Use complete mock data with SVG definitions ---
    const svgs = {
        hit: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor" /></svg>',
        stopped: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="12" fill="none" /></svg>',
        cross: '<svg viewBox="0 0 100 100"><line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" stroke-width="12"/><line x1="15" y1="85" x2="85" y2="15" stroke="currentColor" stroke-width="12"/></svg>',
        pedal: '<svg viewBox="0 0 100 100"><line x1="15" y1="85" x2="85" y2="85" stroke="currentColor" stroke-width="12"/><line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" stroke-width="12"/></svg>',
        sizzle: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="10" fill="none" /><line x1="30" y1="70" x2="70" y2="30" stroke="currentColor" stroke-width="10" /></svg>'
    };

    const manifestData = {
        instrumentDefs: [
            { symbol: 'KCK', name: 'Kick Drum' },
            { symbol: 'SNR', name: 'Snare Drum' },
            { symbol: 'HHC', name: 'Hi-Hat' },
            { symbol: 'CR', name: 'Crash Cymbal' }
        ],
        soundPacks: [
            { symbol: 'KCK', pack_name: 'acoustic_kick', name: 'Acoustic Kick', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 's', name: 'Stopped Hit', svg: svgs.stopped}] },
            { symbol: 'KCK', pack_name: '808_kick', name: '808 Kick', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}] },
            { symbol: 'SNR', pack_name: 'rock_snare', name: 'Rock Snare', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 'x', name: 'Rimshot', svg: svgs.cross}] },
            { symbol: 'SNR', pack_name: 'trap_snare', name: 'Trap Snare', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 'x', name: 'Rimshot', svg: svgs.cross}] },
            { symbol: 'HHC', pack_name: 'acoustic_hat', name: 'Acoustic Hat', sounds: [{letter: 'x', name: 'Closed', svg: svgs.cross}, {letter: 'o', name: 'Open', svg: svgs.stopped}, {letter: 'p', name: 'Pedal', svg: svgs.pedal}] },
            { symbol: 'HHC', pack_name: '808_hat', name: '808 Hat', sounds: [{letter: 'x', name: 'Closed', svg: svgs.cross}, {letter: 'o', name: 'Open', svg: svgs.stopped}] },
            { symbol: 'CR', pack_name: 'acoustic_crash', name: 'Acoustic Crash', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 'z', name: 'Sizzle', svg: svgs.sizzle}] },
        ]
    };

    const editorContainer = document.getElementById('pattern-editor-container');

    try {
        // --- MODIFIED: Pass only the save callback to the view ---
        const patternEditor = new PatternEditorView(editorContainer, {
            ...manifestData,
            onSave: handleSave,
        });
        logEvent('info', 'IntegrationTest', 'DOMContentLoaded', 'App', 'PatternEditorView component initialized successfully for manual testing.');
    } catch (error) {
        logEvent('error', 'IntegrationTest', 'DOMContentLoaded', 'App', `Failed to initialize PatternEditorView: ${error.message}`);
    }
});