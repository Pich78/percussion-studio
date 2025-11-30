// file: src/components/InstrumentRow/EditorInstrumentHeader.integration.js
import './EditorInstrumentHeader.js';

const header = document.querySelector('editor-instrument-header');
const logOutput = document.getElementById('log-output');

const MOCK_INSTRUMENT = { id: 'kick-tr808', name: '808 Kick Drum', pack: 'Classic' };
header.instrument = MOCK_INSTRUMENT;

function log(message) {
    logOutput.textContent = `${new Date().toLocaleTimeString()}: ${message}\n${logOutput.textContent}`;
}

header.addEventListener('edit-instrument-requested', (e) => {
    log(`'edit-instrument-requested' event fired. Detail: ${JSON.stringify(e.detail)}`);
});

log("Integration harness initialized.");