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
        });

        runner.it('should render its content inside the provided container', () => {
            testContainer.innerHTML = '';
            view = new PlaybackRowHeaderView(testContainer, {});
            view.render(getMockState());
            
            const nameEl = testContainer.querySelector('.instrument-header');
            const sliderEl = testContainer.querySelector('.volume-slider');
            const trackEl = testContainer.querySelector('.mixer-track');
            
            runner.expect(trackEl).not.toBe(null);
            runner.expect(nameEl.textContent.trim()).toBe('Kick Drum');
            runner.expect(parseFloat(sliderEl.value)).toBe(0.75);
            runner.expect(trackEl.classList.contains('is-muted')).toBe(false);
        });

        runner.it('should apply the "is-muted" class when muted is true', () => {
            testContainer.innerHTML = '';
            view = new PlaybackRowHeaderView(testContainer, {});
            view.render(getMockState({ muted: true }));
            
            runner.expect(testContainer.querySelector('.mixer-track').classList.contains('is-muted')).toBe(true);
        });
        
        runner.it('should fire onVolumeChange callback when slider is moved', () => {
            const callbackLog = new MockLogger('Callbacks');
            testContainer.innerHTML = '';
            view = new PlaybackRowHeaderView(testContainer, {
                callbacks: { onVolumeChange: (id, vol) => callbackLog.log('onVolumeChange', { id, vol }) }
            });
            view.render(getMockState());

            const slider = testContainer.querySelector('.volume-slider');
            slider.value = 0.5;
            slider.dispatchEvent(new Event('input', { bubbles: true }));

            callbackLog.wasCalledWith('onVolumeChange', { id: 'kck_1', vol: 0.5 });
        });
        
        runner.it('should fire onToggleMute callback when the component is clicked', () => {
            const callbackLog = new MockLogger('Callbacks');
            testContainer.innerHTML = '';
            view = new PlaybackRowHeaderView(testContainer, {
                callbacks: { onToggleMute: (id) => callbackLog.log('onToggleMute', { id }) }
            });
            view.render(getMockState());

            testContainer.click();

            callbackLog.wasCalledWith('onToggleMute', { id: 'kck_1' });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PlaybackRowHeaderView test suite finished.');
}