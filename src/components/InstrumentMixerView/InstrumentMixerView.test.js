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
            instrumentDefsBySymbol: {
                KCK: { name: 'Drum Kick' },
                SNR: { name: 'Acoustic Snare' }
            },
            mixer: {
                kick_1: { volume: 1.0, muted: false },
                snare_1: { volume: 0.8, muted: true }
            }
        }
    });

    runner.describe('InstrumentMixerView Rendering', () => {
        runner.it('should render a track with the full name for each instrument', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentMixerView(testContainer, {});
            view.render(getMockState());
            const tracks = testContainer.querySelectorAll('.mixer-track');
            runner.expect(tracks.length).toBe(2);
            runner.expect(testContainer.textContent.includes('Drum Kick')).toBe(true);
            runner.expect(testContainer.textContent.includes('Acoustic Snare')).toBe(true);
        });

        runner.it('should apply the "is-muted" class to the header of a muted track', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentMixerView(testContainer, {});
            view.render(getMockState());
            
            const kickHeader = testContainer.querySelector('[data-instrument-id="kick_1"] .instrument-header');
            const snareHeader = testContainer.querySelector('[data-instrument-id="snare_1"] .instrument-header');

            runner.expect(kickHeader.classList.contains('is-muted')).toBe(false);
            runner.expect(snareHeader.classList.contains('is-muted')).toBe(true);
        });
    });

    runner.describe('InstrumentMixerView Callbacks', () => {
        runner.it('should fire onToggleMute with the correct ID and new value when header is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentMixerView(testContainer, { 
                onToggleMute: (id, muted) => callbackLog.log('onToggleMute', { id, muted }) 
            });
            
            view.render(getMockState()); // kick_1 is NOT muted
            const kickHeader = testContainer.querySelector('[data-instrument-id="kick_1"] .instrument-header');
            kickHeader.click();

            // Expect it to fire with the opposite of its initial state
            callbackLog.wasCalledWith('onToggleMute', { id: 'kick_1', muted: true });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'InstrumentMixerView test suite finished.');
}

export function manualTest() {
    logEvent('info', 'Harness', 'manualTest', 'Setup', 'Setting up manual test for InstrumentMixerView.');
    
    let currentState = {
        rhythm: {
            sound_kit: { KCK: 'kick_1', SNR: 'snare_1', HHC: 'hihat_1' },
            instrumentDefsBySymbol: {
                KCK: { name: '808 Kick' },
                SNR: { name: 'Rock Snare' },
                HHC: { name: 'Closed Hi-Hat' }
            },
            mixer: {
                kick_1: { volume: 1.0, muted: false },
                snare_1: { volume: 0.8, muted: false },
                hihat_1: { volume: 0.6, muted: true }
            }
        }
    };
    
    const view = new InstrumentMixerView(document.getElementById('view-container'), {
        onVolumeChange: (id, vol) => {
            logEvent('info', 'Harness', 'onVolumeChange', 'Callback', `Volume for ${id}: ${vol}`);
            currentState.rhythm.mixer[id].volume = vol;
            view.render(currentState);
        },
        onToggleMute: (id, muted) => {
            logEvent('info', 'Harness', 'onToggleMute', 'Callback', `Mute for ${id}: ${muted}`);
            currentState.rhythm.mixer[id].muted = muted;
            view.render(currentState);
        }
    });

    view.render(currentState);
}