// file: src/components/InstrumentRow/PlaybackInstrumentHeader.integration.js
import './PlaybackInstrumentHeader.js';

const header = document.querySelector('playback-instrument-header');
const logOutput = document.getElementById('log-output');

const MOCK_INSTRUMENT = { name: '808 Snare Drum', pack: 'Classic', volume: 0.8 };
header.instrument = MOCK_INSTRUMENT;

function log(message) {
    logOutput.textContent = `${new Date().toLocaleTimeString()}: ${message}\n${logOutput.textContent}`;
}

header.addEventListener('volume-changed', (e) => {
    log(`'volume-changed' event fired. Detail: ${JSON.stringify(e.detail)}`);
});

header.addEventListener('mute-toggled', () => {
    log(`'mute-toggled' event fired.`);
});

log("Integration harness initialized.");