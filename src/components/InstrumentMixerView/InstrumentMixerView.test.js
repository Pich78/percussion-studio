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