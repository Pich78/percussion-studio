// file: src/components/InstrumentMixerView/InstrumentMixerView.integration.js

import { InstrumentMixerView } from './InstrumentMixerView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// A simple factory function to create, render, and return a single view instance.
function createInstrumentInstance(parentContainer, instrumentData, callbacks) {
    // Create a dedicated host element for this specific instance
    const hostElement = document.createElement('div');
    parentContainer.appendChild(hostElement);

    const view = new InstrumentMixerView(hostElement, callbacks);
    view.render(instrumentData);
    return view;
}

// Main function to run the manual test setup
function manualTest() {
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');

    // A single, unified state object for the entire "application". All instruments are merged.
    const appState = {
        rhythm: {
            sound_kit: {
                // From group 1
                KCK: 'kick_1', SNR: 'snare_1', HHC: 'hihat_1',
                // From group 2
                TML: 'tom_low_1', TMH: 'tom_high_1', CYM: 'cymbal_1',
                // From group 3
                CLAP: 'clap_808', COW: 'cowbell_808',
                // From group 4
                REV: 'reverb_1', DLY: 'delay_1',
            },
            instrumentDefsBySymbol: {
                KCK: { name: 'Kick' }, SNR: { name: 'Snare' }, HHC: { name: 'Hi-Hat' },
                TML: { name: 'Low Tom' }, TMH: { name: 'High Tom' }, CYM: { name: 'Cymbal' },
                CLAP: { name: '808 Clap' }, COW: { name: '808 Cowbell' },
                REV: { name: 'Reverb Send' }, DLY: { name: 'Delay Send' },
            },
            mixer: {
                kick_1: { volume: 1.0, muted: false, unmutedVolume: 1.0 },
                snare_1: { volume: 0.8, muted: false, unmutedVolume: 0.8 },
                hihat_1: { volume: 0.6, muted: true, unmutedVolume: 0.6 },
                tom_low_1: { volume: 0.7, muted: false, unmutedVolume: 0.7 },
                tom_high_1: { volume: 0.7, muted: false, unmutedVolume: 0.7 },
                cymbal_1: { volume: 0.5, muted: false, unmutedVolume: 0.5 },
                clap_808: { volume: 0.9, muted: false, unmutedVolume: 0.9 },
                cowbell_808: { volume: 0, muted: true, unmutedVolume: 0.6 },
                reverb_1: { volume: 0.25, muted: false, unmutedVolume: 0.25 },
                delay_1: { volume: 0.4, muted: false, unmutedVolume: 0.4 },
            }
        }
    };
    
    // A map to hold all view instances, mapping an instrument ID (e.g., 'kick_1') to its view object.
    const viewInstances = new Map();

    // --- Shared Callbacks for ALL instances ---
    const handleVolumeChange = (id, vol) => {
        logEvent('info', 'Harness', 'onVolumeChange', 'Callback', `Volume for ${id}: ${vol}`);
        const trackState = appState.rhythm.mixer[id];
        if (trackState) {
            trackState.volume = vol;
            trackState.muted = (vol === 0);
            if (vol > 0) {
                trackState.unmutedVolume = vol;
            }
            rerenderSingleInstance(id);
        }
    };

    const handleToggleMute = (id) => {
        logEvent('info', 'Harness', 'onToggleMute', 'Callback', `Mute toggle for ${id}`);
        const trackState = appState.rhythm.mixer[id];
        if (trackState) {
            trackState.muted = !trackState.muted;
            if (trackState.muted) {
                trackState.volume = 0;
            } else {
                trackState.volume = trackState.unmutedVolume > 0 ? trackState.unmutedVolume : 1.0;
            }
            rerenderSingleInstance(id);
        }
    };
    
    const rerenderSingleInstance = (id) => {
        const view = viewInstances.get(id);
        const trackState = appState.rhythm.mixer[id];
        const symbol = Object.keys(appState.rhythm.sound_kit).find(key => appState.rhythm.sound_kit[key] === id);
        const instrumentDef = appState.rhythm.instrumentDefsBySymbol[symbol];

        if (view && trackState && instrumentDef) {
            view.render({
                id: id,
                name: instrumentDef.name,
                volume: trackState.volume,
                muted: trackState.muted,
            });
        }
    };
    
    // --- Main Initialization Logic ---
    const viewContainer = document.getElementById('view-container');
    const { sound_kit, mixer, instrumentDefsBySymbol } = appState.rhythm;

    // A single loop to create all 10 instances in the single container.
    for (const [symbol, id] of Object.entries(sound_kit)) {
        const trackState = mixer[id];
        const instrumentDef = instrumentDefsBySymbol[symbol];

        const newView = createInstrumentInstance(
            viewContainer,
            { // The data for this single instrument
                id: id,
                name: instrumentDef.name,
                volume: trackState.volume,
                muted: trackState.muted,
            },
            { // The shared callback functions
                onVolumeChange: handleVolumeChange,
                onToggleMute: handleToggleMute,
            }
        );

        // Store the new instance so we can update it later.
        viewInstances.set(id, newView);
    }
}

// Run the setup once the page's DOM is fully loaded.
document.addEventListener('DOMContentLoaded', manualTest);