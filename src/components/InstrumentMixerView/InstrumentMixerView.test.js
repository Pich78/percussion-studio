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

    // Mocks for a single instrument state, matching the new component API.
    const getActiveKickState = () => ({
        id: 'kick_1',
        name: 'Kick',
        volume: 1.0,
        muted: false,
    });

    const getMutedSnareState = () => ({
        id: 'snare_1',
        name: 'Snare',
        volume: 0,
        muted: true,
    });

    runner.describe('InstrumentMixerView Rendering', () => {
        runner.it('should render the slider at 0 for a muted track', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentMixerView(testContainer, {});
            view.render(getMutedSnareState());
            // The test container IS the component, so we can select directly within it.
            const snareSlider = testContainer.querySelector('.volume-slider');
            runner.expect(parseFloat(snareSlider.value)).toBe(0);
        });

        runner.it('should apply the "is-muted" class to the root element when volume is 0', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentMixerView(testContainer, {});
            const state = getActiveKickState();
            state.volume = 0; // Manually set volume to 0
            view.render(state);
            // The 'is-muted' class is now on the root element itself.
            runner.expect(testContainer.classList.contains('is-muted')).toBe(true);
        });

        runner.it('should apply the "is-muted" class to the root element when muted is true', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentMixerView(testContainer, {});
            const state = getActiveKickState();
            state.muted = true; // Manually set muted to true
            view.render(state);
            runner.expect(testContainer.classList.contains('is-muted')).toBe(true);
        });
    });

    runner.describe('InstrumentMixerView Callbacks', () => {
        runner.it('should fire onToggleMute when the component is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentMixerView(testContainer, { 
                onToggleMute: (id) => callbackLog.log('onToggleMute', { id }) 
            });
            
            view.render(getActiveKickState());
            // Clicking anywhere on the component (except the slider itself) should toggle mute.
            const header = testContainer.querySelector('.instrument-header');
            header.click();

            callbackLog.wasCalledWith('onToggleMute', { id: 'kick_1' });
        });

        runner.it('should fire onVolumeChange when slider is moved', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentMixerView(testContainer, {
                onVolumeChange: (id, vol) => callbackLog.log('onVolumeChange', { id, vol })
            });

            view.render(getActiveKickState());
            const kickSlider = testContainer.querySelector('.volume-slider');
            kickSlider.value = 0.5;
            kickSlider.dispatchEvent(new Event('input', { bubbles: true }));

            callbackLog.wasCalledWith('onVolumeChange', { id: 'kick_1', vol: 0.5 });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'InstrumentMixerView test suite finished.');
}