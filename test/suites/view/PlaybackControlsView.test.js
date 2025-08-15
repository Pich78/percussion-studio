// file: test/suites/view/PlaybackControlsView.test.js (Complete, Final Corrected Version)

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

    const getBaseState = () => ({
        isPlaying: false, isLoading: false, masterVolume: 1.0, loopPlayback: false
    });

    runner.describe('PlaybackControlsView Rendering', () => {
        runner.it('should disable Pause and Stop when stopped', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackControlsView(testContainer, {});
            view.render(getBaseState());
            runner.expect(testContainer.querySelector('#play-btn').disabled).toBe(false);
            runner.expect(testContainer.querySelector('#pause-btn').disabled).toBe(true);
            runner.expect(testContainer.querySelector('#stop-btn').disabled).toBe(true);
        });

        runner.it('should disable Play when playing', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackControlsView(testContainer, {});
            view.render({ ...getBaseState(), isPlaying: true });
            runner.expect(testContainer.querySelector('#play-btn').disabled).toBe(true);
            runner.expect(testContainer.querySelector('#pause-btn').disabled).toBe(false);
            runner.expect(testContainer.querySelector('#stop-btn').disabled).toBe(false);
        });

        runner.it('should apply toggled class to loop button when loop is active', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackControlsView(testContainer, {});
            view.render({ ...getBaseState(), loopPlayback: true });
            const loopBtn = testContainer.querySelector('#loop-btn');
            runner.expect(loopBtn.classList.contains('toggled')).toBe(true);
        });
    });

    runner.describe('PlaybackControlsView Callbacks', () => {
        runner.it('should fire onPlay callback', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PlaybackControlsView(testContainer, { onPlay: () => callbackLog.log('onPlay') });
            view.render(getBaseState());
            testContainer.querySelector('#play-btn').click();
            callbackLog.wasCalledWith('onPlay', undefined);
        });

        runner.it('should fire onToggleLoop callback with the new desired state', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PlaybackControlsView(testContainer, { onToggleLoop: (enabled) => callbackLog.log('onToggleLoop', {enabled}) });
            
            view.render({ ...getBaseState(), loopPlayback: false });
            testContainer.querySelector('#loop-btn').click();
            callbackLog.wasCalledWith('onToggleLoop', {enabled: true});
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output');
    
    // This object is the single source of truth for the UI state
    let currentState = {
        isPlaying: false, isLoading: false, masterVolume: 0.8, loopPlayback: false
    };

    const container = document.getElementById('view-container');
    const view = new PlaybackControlsView(container, {
        // Callbacks from the view update the central state object and then trigger a render
        onPlay: () => { log.log('onPlay'); currentState.isPlaying = true; rerender(); },
        onPause: () => { log.log('onPause'); currentState.isPlaying = false; rerender(); },
        onStop: () => { log.log('onStop'); currentState.isPlaying = false; rerender(); },
        onMasterVolumeChange: (vol) => { log.log('onMasterVolumeChange', { vol }); currentState.masterVolume = vol; },
        onToggleLoop: (enabled) => {
            log.log('onToggleLoop', { enabled });
            currentState.loopPlayback = enabled;
            rerender();
        }
    });
    
    // This function now ONLY re-renders the view based on the current state
    const rerender = () => {
        // Also, sync the checkboxes to match the current state
        document.getElementById('is-playing-check').checked = currentState.isPlaying;
        document.getElementById('is-loading-check').checked = currentState.isLoading;
        document.getElementById('loop-check').checked = currentState.loopPlayback;
        
        view.render(currentState);
    };

    // Listeners on the checkboxes update the state and then call rerender
    document.getElementById('is-playing-check').addEventListener('change', (e) => {
        currentState.isPlaying = e.target.checked;
        rerender();
    });
    document.getElementById('is-loading-check').addEventListener('change', (e) => {
        currentState.isLoading = e.target.checked;
        rerender();
    });
    document.getElementById('loop-check').addEventListener('change', (e) => {
        currentState.loopPlayback = e.target.checked;
        rerender();
    });

    rerender(); // Initial render
    
    return { view, rerender };
}