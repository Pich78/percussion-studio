// file: src/components/InstrumentMixerView/InstrumentMixerView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentMixerView } from './InstrumentMixerView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting InstrumentMixerView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockState = () => ({
        rhythm: {
            sound_kit: { KCK: 'kick_1', SNR: 'snare_1' },
            instrumentDefsBySymbol: { KCK: { name: 'Drum Kick' }, SNR: { name: 'Snare' } },
            mixer: {
                kick_1: { volume: 1.0, muted: false, unmutedVolume: 1.0 },
                snare_1: { volume: 0, muted: true, unmutedVolume: 0.8 }
            }
        }
    });

    runner.describe('InstrumentMixerView Rendering', () => {
        runner.it('should render the slider at 0 for a muted track', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentMixerView(testContainer, {});
            view.render(getMockState());
            const snareSlider = testContainer.querySelector('[data-instrument-id="snare_1"] .volume-slider');
            runner.expect(parseFloat(snareSlider.value)).toBe(0);
        });

        runner.it('should apply the "is-muted" class when volume is 0', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentMixerView(testContainer, {});
            const state = getMockState();
            state.rhythm.mixer.kick_1.volume = 0; // Manually set volume to 0
            view.render(state);
            const kickHeader = testContainer.querySelector('[data-instrument-id="kick_1"] .instrument-header');
            runner.expect(kickHeader.classList.contains('is-muted')).toBe(true);
        });
    });

    runner.describe('InstrumentMixerView Callbacks', () => {
        runner.it('should fire onToggleMute with the instrument ID when header is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentMixerView(testContainer, { 
                onToggleMute: (id) => callbackLog.log('onToggleMute', { id }) 
            });
            
            view.render(getMockState());
            const kickHeader = testContainer.querySelector('[data-instrument-id="kick_1"] .instrument-header');
            kickHeader.click();

            callbackLog.wasCalledWith('onToggleMute', { id: 'kick_1' });
        });

        runner.it('should fire onVolumeChange when slider is moved', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentMixerView(testContainer, {
                onVolumeChange: (id, vol) => callbackLog.log('onVolumeChange', { id, vol })
            });

            view.render(getMockState());
            const kickSlider = testContainer.querySelector('[data-instrument-id="kick_1"] .volume-slider');
            kickSlider.value = 0.5;
            kickSlider.dispatchEvent(new Event('input', { bubbles: true }));

            callbackLog.wasCalledWith('onVolumeChange', { id: 'kick_1', vol: 0.5 });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'InstrumentMixerView test suite finished.');
}

export function manualTest() {
    logEvent('info', 'Harness', 'manualTest', 'Setup', 'Setting up stateful manual test for InstrumentMixerView.');
    
    // The harness now simulates a parent component (like PlaybackApp) managing state
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
    
    const view = new InstrumentMixerView(document.getElementById('view-container'), {
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
                // If for some reason unmutedVolume is 0, default to 1.
                track.volume = track.unmutedVolume > 0 ? track.unmutedVolume : 1.0;
            }
            view.render(currentState);
        }
    });

    view.render(currentState);
}