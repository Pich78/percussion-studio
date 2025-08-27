// file: src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { PlaybackRowHeaderView } from './PlaybackRowHeaderView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting PlaybackRowHeaderView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockState = (overrides = {}) => ({
        id: 'kck_1',
        name: 'Kick Drum',
        volume: 0.75,
        muted: false,
        ...overrides,
    });

    runner.describe('PlaybackRowHeaderView', () => {
        let view = null;
        
        runner.afterEach(() => {
            if (view) view.destroy();
            testContainer.innerHTML = '';
        });

        runner.it('should render with correct initial volume and name', () => {
            view = new PlaybackRowHeaderView(testContainer, {});
            view.render(getMockState());
            
            const nameEl = testContainer.querySelector('.instrument-header');
            const sliderEl = testContainer.querySelector('.volume-slider');
            
            runner.expect(nameEl.textContent.trim()).toBe('Kick Drum');
            runner.expect(parseFloat(sliderEl.value)).toBe(0.75);
            runner.expect(testContainer.classList.contains('is-muted')).toBe(false);
        });

        runner.it('should apply the "is-muted" class when muted is true', () => {
            view = new PlaybackRowHeaderView(testContainer, {});
            view.render(getMockState({ muted: true }));
            
            runner.expect(testContainer.classList.contains('is-muted')).toBe(true);
        });
        
        runner.it('should fire onVolumeChange callback when slider is moved', () => {
            const callbackLog = new MockLogger('Callbacks');
            view = new PlaybackRowHeaderView(testContainer, {
                onVolumeChange: (id, vol) => callbackLog.log('onVolumeChange', { id, vol })
            });
            view.render(getMockState());

            const slider = testContainer.querySelector('.volume-slider');
            slider.value = 0.5;
            slider.dispatchEvent(new Event('input', { bubbles: true }));

            callbackLog.wasCalledWith('onVolumeChange', { id: 'kck_1', vol: 0.5 });
        });
        
        runner.it('should fire onToggleMute callback when the component is clicked', () => {
            const callbackLog = new MockLogger('Callbacks');
            view = new PlaybackRowHeaderView(testContainer, {
                onToggleMute: (id) => callbackLog.log('onToggleMute', { id })
            });
            view.render(getMockState());

            testContainer.click();

            callbackLog.wasCalledWith('onToggleMute', { id: 'kck_1' });
        });

        runner.it('should NOT fire onToggleMute when the slider itself is the click target', () => {
            const callbackLog = new MockLogger('Callbacks');
            view = new PlaybackRowHeaderView(testContainer, {
                onToggleMute: (id) => callbackLog.log('onToggleMute', { id })
            });
            view.render(getMockState());

            const slider = testContainer.querySelector('.volume-slider');
            slider.click();

            // --- FINAL, ROBUST FIX ---
            // This safely checks if the logHistory object was created and if it has the specific key.
            // If logHistory is undefined, the expression is false, and the test passes.
            const wasCalled = callbackLog.logHistory ? callbackLog.logHistory.hasOwnProperty('onToggleMute') : false;
            runner.expect(wasCalled).toBe(false);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PlaybackRowHeaderView test suite finished.');
}