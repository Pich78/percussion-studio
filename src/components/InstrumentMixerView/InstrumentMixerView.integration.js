// file: src/components/InstrumentMixerView/InstrumentMixerView.integration.js

import { InstrumentMixerView } from './InstrumentMixerView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// A factory function to create and manage a stateful mixer instance
function setupInstance(containerId, initialState) {
    logEvent('info', 'Harness', 'setupInstance', 'Setup', `Creating mixer instance for ${containerId}`);

    let currentState = initialState;
    const container = document.getElementById(containerId);

    if (!container) {
        logEvent('error', 'Harness', 'setupInstance', 'Error', `Container with ID #${containerId} not found.`);
        return;
    }

    const view = new InstrumentMixerView(container, {
        onVolumeChange: (id, vol) => {
            logEvent('info', `Harness:${containerId}`, 'onVolumeChange', 'Callback', `Volume for ${id}: ${vol}`);
            const track = currentState.rhythm.mixer[id];
            track.volume = vol;
            track.muted = (vol === 0);
            if (vol > 0) {
                track.unmutedVolume = vol;
            }
            view.render(currentState);
        },
        onToggleMute: (id) => {
            logEvent('info', `Harness:${containerId}`, 'onToggleMute', 'Callback', `Mute toggle for ${id}`);
            const track = currentState.rhythm.mixer[id];
            track.muted = !track.muted;
            if (track.muted) {
                track.volume = 0;
            } else {
                track.volume = track.unmutedVolume > 0 ? track.unmutedVolume : 1.0;
            }
            view.render(currentState);
        }
    });

    view.render(currentState);
}


// Main function to run the manual test setup
function manualTest() {
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');

    // --- State for Instance 1: Standard Drum Kit ---
    const state1 = {
        rhythm: {
            sound_kit: { KCK: 'kick_1', SNR: 'snare_1', HHC: 'hihat_1' },
            instrumentDefsBySymbol: { KCK: { name: 'Kick' }, SNR: { name: 'Snare' }, HHC: { name: 'Hi-Hat' } },
            mixer: {
                kick_1: { volume: 1.0, muted: false, unmutedVolume: 1.0 },
                snare_1: { volume: 0.8, muted: false, unmutedVolume: 0.8 },
                hihat_1: { volume: 0.6, muted: true, unmutedVolume: 0.6 }
            }
        }
    };

    // --- State for Instance 2: Percussion Kit ---
    const state2 = {
        rhythm: {
            sound_kit: { TML: 'tom_low_1', TMH: 'tom_high_1', CYM: 'cymbal_1' },
            instrumentDefsBySymbol: { TML: { name: 'Low Tom' }, TMH: { name: 'High Tom' }, CYM: { name: 'Cymbal' } },
            mixer: {
                tom_low_1: { volume: 0.7, muted: false, unmutedVolume: 0.7 },
                tom_high_1: { volume: 0.7, muted: false, unmutedVolume: 0.7 },
                cymbal_1: { volume: 0.5, muted: false, unmutedVolume: 0.5 }
            }
        }
    };

    // --- State for Instance 3: Electronic Kit ---
    const state3 = {
        rhythm: {
            sound_kit: { CLAP: 'clap_808', COW: 'cowbell_808' },
            instrumentDefsBySymbol: { CLAP: { name: '808 Clap' }, COW: { name: '808 Cowbell' } },
            mixer: {
                clap_808: { volume: 0.9, muted: false, unmutedVolume: 0.9 },
                cowbell_808: { volume: 0, muted: true, unmutedVolume: 0.6 }
            }
        }
    };

    // --- State for Instance 4: Effects Sends ---
    const state4 = {
        rhythm: {
            sound_kit: { REV: 'reverb_1', DLY: 'delay_1' },
            instrumentDefsBySymbol: { REV: { name: 'Reverb Send' }, DLY: { name: 'Delay Send' } },
            mixer: {
                reverb_1: { volume: 0.25, muted: false, unmutedVolume: 0.25 },
                delay_1: { volume: 0.4, muted: false, unmutedVolume: 0.4 }
            }
        }
    };

    // Initialize all four instances
    setupInstance('instance-1', state1);
    setupInstance('instance-2', state2);
    setupInstance('instance-3', state3);
    setupInstance('instance-4', state4);
}

// Run the setup once the page's DOM is fully loaded.
document.addEventListener('DOMContentLoaded', manualTest);