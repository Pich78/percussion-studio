// file: src/components/InstrumentMixerView/InstrumentMixerView.integration.js

import { InstrumentMixerView } from './InstrumentMixerView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// This function sets up the manual, stateful test environment.
function setupManualTest() {
    logEvent('info', 'Harness', 'manualTest', 'Setup', 'Setting up stateful manual test for InstrumentMixerView.');

    // Initialize the logger to show output in our log panel
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');
    
    // This simulates a parent component (like an app) managing the mixer's state.
    let currentState = {
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
    
    // Find the container in the DOM where the component will be rendered.
    const viewContainer = document.getElementById('view-container');

    // Create a new instance of the view, passing the container and the callbacks.
    const view = new InstrumentMixerView(viewContainer, {
        onVolumeChange: (id, vol) => {
            logEvent('info', 'Harness', 'onVolumeChange', 'Callback', `Volume for ${id}: ${vol}`);
            const track = currentState.rhythm.mixer[id];
            track.volume = vol;
            // If user slides to 0, it's a mute. If they slide away from 0, it's an unmute.
            track.muted = (vol === 0);
            // If they are sliding, this is the new "unmuted" volume unless it's 0.
            if (vol > 0) {
                track.unmutedVolume = vol;
            }
            // Re-render the component with the new state.
            view.render(currentState);
        },
        onToggleMute: (id) => {
            logEvent('info', 'Harness', 'onToggleMute', 'Callback', `Mute toggle for ${id}`);
            const track = currentState.rhythm.mixer[id];
            track.muted = !track.muted;

            if (track.muted) {
                // Muting: Set volume to 0, but preserve the unmuted volume.
                track.volume = 0;
            } else {
                // Unmuting: Restore volume to the last known unmuted level.
                // If for some reason unmutedVolume is 0, default to 1.0.
                track.volume = track.unmutedVolume > 0 ? track.unmutedVolume : 1.0;
            }
            // Re-render the component with the new state.
            view.render(currentState);
        }
    });

    // Perform the initial render of the component.
    view.render(currentState);
}

// Run the setup function once the page's DOM is fully loaded.
document.addEventListener('DOMContentLoaded', setupManualTest);