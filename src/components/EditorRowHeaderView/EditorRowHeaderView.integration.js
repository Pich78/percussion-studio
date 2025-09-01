// file: src/components/EditorRowHeaderView/EditorRowHeaderView.integration.js

import { EditorRowHeaderView } from './EditorRowHeaderView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- DOM REFERENCES ---
const headerContainer = document.getElementById('header-container');
const instrumentNameInput = document.getElementById('instrument-name');
const packNameInput = document.getElementById('pack-name');
const callbackLogEl = document.getElementById('callback-log');

// --- MOCK DATA & STATE ---
let mockInstrument = {
    id: 'iya_1',
    name: 'Iya',
    pack: 'Dundunba Set',
};

// --- CORE LOGIC ---
const logCallback = (name, data) => {
    const entry = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] [${name}] Fired with: ${JSON.stringify(data)}`;
    callbackLogEl.prepend(entry);
    logEvent('info', 'Workbench', 'Callback', 'Event', `${name} fired.`, data);
};

// --- COMPONENT INSTANTIATION ---
const headerView = new EditorRowHeaderView(headerContainer, {
    instrument: mockInstrument,
    callbacks: {
        onRequestInstrumentChange: (instrument) => {
            logCallback('onRequestInstrumentChange', instrument);
        }
    }
});

function rerender() {
    const newName = instrumentNameInput.value;
    const newPack = packNameInput.value;

    logEvent('info', 'Workbench', 'rerender', 'State', `Re-rendering with name: "${newName}", pack: "${newPack}"`);
    
    // Update the mock data
    mockInstrument.name = newName;
    mockInstrument.pack = newPack;
    
    headerView.render(mockInstrument);
}

// --- UI EVENT BINDINGS ---
[instrumentNameInput, packNameInput].forEach(el => el.addEventListener('input', rerender));

// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized and rendered.');