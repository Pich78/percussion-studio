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
            mixer: {
                kick_1: { volume: 1.0, muted: false },
                snare_1: { volume: 0.8, muted: true }
            }
        }
    });

    runner.describe('InstrumentMixerView Rendering', () => {
        runner.it('should render a track for each instrument', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentMixerView(testContainer, {});
            view.render(getMockState());
            const tracks = testContainer.querySelectorAll('.mixer-track');
            runner.expect(tracks.length).toBe(2);
        });

        runner.it('should set initial values of sliders and checkboxes', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentMixerView(testContainer, {});
            view.render(getMockState());
            
            const snareTrack = testContainer.querySelector('[data-instrument-id="snare_1"]');
            const snareSlider = snareTrack.querySelector('.volume-slider');
            const snareMute = snareTrack.querySelector('.mute-checkbox');

            runner.expect(parseFloat(snareSlider.value)).toBe(0.8);
            runner.expect(snareMute.checked).toBe(true);
        });
    });

    runner.describe('InstrumentMixerView Callbacks', () => {
        runner.it('should fire onVolumeChange with correct ID and value', () => {
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

        runner.it('should fire onToggleMute with correct ID and value', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentMixerView(testContainer, { 
                onToggleMute: (id, muted) => callbackLog.log('onToggleMute', { id, muted }) 
            });
            
            view.render(getMockState());
            const kickMute = testContainer.querySelector('[data-instrument-id="kick_1"] .mute-checkbox');
            kickMute.click(); // This fires a 'change' event for checkboxes

            callbackLog.wasCalledWith('onToggleMute', { id: 'kick_1', muted: true });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'InstrumentMixerView test suite finished.');
}

export function manualTest() {
    logEvent('info', 'Harness', 'manualTest', 'Setup', 'Setting up manual test for InstrumentMixerView.');
    const view = new InstrumentMixerView(document.getElementById('view-container'), {
        onVolumeChange: (id, vol) => logEvent('info', 'Harness', 'onVolumeChange', 'Callback', `Volume changed for ${id}: ${vol}`),
        onToggleMute: (id, muted) => logEvent('info', 'Harness', 'onToggleMute', 'Callback', `Mute toggled for ${id}: ${muted}`)
    });
    
    const mockState = {
        rhythm: {
            sound_kit: { KCK: 'test_kick', SNR: 'test_snare', HHC: 'test_hihat' },
            mixer: {
                test_kick: { volume: 1.0, muted: false },
                test_snare: { volume: 0.8, muted: false },
                test_hihat: { volume: 0.6, muted: true }
            }
        }
    };
    view.render(mockState);
}