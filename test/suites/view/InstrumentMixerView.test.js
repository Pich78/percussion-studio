// file: test/suites/view/InstrumentMixerView.test.js (Complete, Corrected & Robust Version)
import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { InstrumentMixerView } from '/percussion-studio/src/view/InstrumentMixerView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    let testContainer = document.getElementById('test-sandbox');
    if (!testContainer) {
        testContainer = document.createElement('div');
        testContainer.id = 'test-sandbox';
        document.body.appendChild(testContainer);
    }

    const getMockState = () => ({
        rhythm: {
            sound_kit: { KCK: 'kick_1', SNR: 'snare_1' },
            mixer: {
                kick_1: { volume: 1.0, muted: false },
                snare_1: { volume: 0.8, muted: true }
            }
        }
    });

    // Helper function for direct throwing assertions, matching the style of MockLogger.
    const assert = (description, actual, expected) => {
        if (actual !== expected) {
            throw new Error(`Assertion Failed: ${description}. Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}.`);
        }
    };

    runner.describe('InstrumentMixerView Rendering', () => {
        runner.it('should render a track for each instrument', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentMixerView(testContainer, {});
            view.render(getMockState());
            const tracks = testContainer.querySelectorAll('.mixer-track');
            assert('Number of rendered tracks', tracks.length, 2);
        });

        runner.it('should set the initial values of sliders and checkboxes', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentMixerView(testContainer, {});
            view.render(getMockState());
            
            const snareTrack = testContainer.querySelector('[data-instrument-id="snare_1"]');
            if (!snareTrack) throw new Error("Snare track element was not found in the DOM.");
            
            const snareVolumeSlider = snareTrack.querySelector('.volume-slider');
            const snareMuteCheckbox = snareTrack.querySelector('.mute-checkbox');

            assert('Snare volume slider initial value', parseFloat(snareVolumeSlider.value), 0.8);
            assert('Snare mute checkbox initial state', snareMuteCheckbox.checked, true);
        });
    });

    runner.describe('InstrumentMixerView Callbacks', () => {
        runner.it('should fire onVolumeChange with the correct ID and value', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const callbacks = { onVolumeChange: (id, vol) => callbackLog.log('onVolumeChange', { id, vol }) };
            const view = new InstrumentMixerView(testContainer, callbacks);
            
            view.render(getMockState());
            const kickSlider = testContainer.querySelector('[data-instrument-id="kick_1"] .volume-slider');
            if (!kickSlider) throw new Error("Kick slider element was not found.");

            kickSlider.value = 0.5;
            kickSlider.dispatchEvent(new Event('input', { bubbles: true }));

            // This is already a throwing assertion, so we use it directly.
            callbackLog.wasCalledWith('onVolumeChange', { id: 'kick_1', vol: 0.5 });
        });

        runner.it('should fire onToggleMute with the correct ID and value', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const callbacks = { onToggleMute: (id, muted) => callbackLog.log('onToggleMute', { id, muted }) };
            const view = new InstrumentMixerView(testContainer, callbacks);
            
            view.render(getMockState());
            const kickMute = testContainer.querySelector('[data-instrument-id="kick_1"] .mute-checkbox');
            if (!kickMute) throw new Error("Kick mute checkbox was not found.");

            kickMute.click();

            // This is also a throwing assertion.
            callbackLog.wasCalledWith('onToggleMute', { id: 'kick_1', muted: true });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output');
    
    const callbacks = {
        onVolumeChange: (instrumentId, volume) => log.log('onVolumeChange', { instrumentId, volume }),
        onToggleMute: (instrumentId, muted) => log.log('onToggleMute', { instrumentId, muted })
    };
    
    const container = document.getElementById('view-container');
    const view = new InstrumentMixerView(container, callbacks);
    
    const mockState = {
        rhythm: {
            sound_kit: { KCK: 'test_kick', SNR: 'test_snare' },
            mixer: {
                test_kick: { volume: 1.0, muted: false },
                test_snare: { volume: 0.8, muted: false }
            }
        }
    };
    view.render(mockState);
}
