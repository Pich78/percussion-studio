// file: src/components/EditorView/EditorView.integration.js

import { EditorView } from './EditorView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

document.addEventListener('DOMContentLoaded', () => {
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');

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

    const flowData = Array.from({length: 8}, (_, i) => ({ pattern: `Pattern ${i+1}`, repetitions: (i+1)*2 }));

    const editorContainer = document.getElementById('editor-container');

    try {
        const editorView = new EditorView(editorContainer, {
            flow: flowData,
            manifest: manifestData
        });
        logEvent('info', 'IntegrationTest', 'DOMContentLoaded', 'App', 'EditorView component initialized successfully.');
    } catch (error) {
        logEvent('error', 'IntegrationTest', 'DOMContentLoaded', 'App', `Failed to initialize EditorView: ${error.message}`);
        console.error(error);
    }
});