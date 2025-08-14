// file: test/suites/view/PlaybackControlsView.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { PlaybackControlsView } from '/percussion-studio/src/view/PlaybackControlsView.js';

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

    runner.describe('PlaybackControlsView Rendering', () => {
        runner.it('should render correctly in a "stopped" state', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackControlsView(testContainer, {});
            view.render({ isPlaying: false, isLoading: false, masterVolume: 1.0, loopPlayback: false });

            const playBtn = testContainer.querySelector('#play-pause-btn');
            runner.expect(playBtn.textContent).toBe('Play');
            runner.expect(playBtn.disabled).toBe(false);
        });

        runner.it('should render correctly in a "playing" state', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackControlsView(testContainer, {});
            view.render({ isPlaying: true, isLoading: false, masterVolume: 1.0, loopPlayback: false });

            const playBtn = testContainer.querySelector('#play-pause-btn');
            runner.expect(playBtn.textContent).toBe('Pause');
        });

        runner.it('should disable buttons when in a "loading" state', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackControlsView(testContainer, {});
            view.render({ isPlaying: false, isLoading: true, masterVolume: 1.0, loopPlayback: false });

            const playBtn = testContainer.querySelector('#play-pause-btn');
            const stopBtn = testContainer.querySelector('#stop-btn');
            runner.expect(playBtn.disabled).toBe(true);
            runner.expect(stopBtn.disabled).toBe(true);
        });
    });

    runner.describe('PlaybackControlsView Callbacks', () => {
        runner.it('should fire the onPlay callback when the play button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PlaybackControlsView(testContainer, { onPlay: () => callbackLog.log('onPlay') });
            
            view.render({ isPlaying: false, isLoading: false });
            testContainer.querySelector('#play-pause-btn').click();

            callbackLog.wasCalledWith('onPlay', undefined);
        });

        runner.it('should fire the onMasterVolumeChange callback when slider is moved', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PlaybackControlsView(testContainer, { onMasterVolumeChange: (vol) => callbackLog.log('onMasterVolumeChange', {vol}) });

            view.render({ masterVolume: 1.0 });
            const slider = testContainer.querySelector('#master-volume');
            slider.value = 0.5;
            // We must manually create and dispatch the 'input' event in a test environment
            slider.dispatchEvent(new Event('input', { bubbles: true }));

            callbackLog.wasCalledWith('onMasterVolumeChange', {vol: 0.5});
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output'); // Also log manual interactions
    const callbacks = {
        onPlay: () => { log.log('onPlay'); document.getElementById('is-playing-check').checked = true; rerender(); },
        onPause: () => { log.log('onPause'); document.getElementById('is-playing-check').checked = false; rerender(); },
        onStop: () => { log.log('onStop'); document.getElementById('is-playing-check').checked = false; rerender(); },
        onMasterVolumeChange: (vol) => log.log('onMasterVolumeChange', { vol }),
        onToggleLoop: (enabled) => { log.log('onToggleLoop', { enabled }); rerender(); }
    };

    const container = document.getElementById('view-container');
    const view = new PlaybackControlsView(container, callbacks);

    const rerender = () => {
        const isPlaying = document.getElementById('is-playing-check').checked;
        const isLoading = document.getElementById('is-loading-check').checked;
        // Get current values from the form to maintain state
        const volume = container.querySelector('#master-volume')?.value || 0.8;
        const loop = container.querySelector('#loop-checkbox')?.checked || false;
        
        view.render({ isPlaying, isLoading, masterVolume: parseFloat(volume), loopPlayback: loop });
    };
    
    return { view, rerender };
}