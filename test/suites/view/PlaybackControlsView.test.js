// file: test/suites/view/PlaybackControlsView.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { PlaybackControlsView } from '/percussion-studio/src/view/PlaybackControlsView.js';

/** Runs automated tests */
export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    
    // Create a sandbox div for tests to render into
    let testContainer = document.getElementById('test-sandbox');
    if (!testContainer) {
        testContainer = document.createElement('div');
        testContainer.id = 'test-sandbox';
        document.body.appendChild(testContainer);
    }

    runner.describe('PlaybackControlsView Rendering', () => {
        runner.it('should render the main playback buttons', () => {
            testContainer.innerHTML = ''; // Clear sandbox
            const view = new PlaybackControlsView(testContainer, {});
            
            view.render({ isPlaying: false, isLoading: false, masterVolume: 1.0 });

            // Check if the buttons exist in the DOM
            const playBtn = testContainer.querySelector('#play-btn');
            const stopBtn = testContainer.querySelector('#stop-btn');
            
            runner.expect(playBtn === null).toBe(false);
            runner.expect(stopBtn === null).toBe(false);
            runner.expect(playBtn.textContent).toBe('Play');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

/** Sets up the interactive workbench */
export function manualTest() {
    const log = new MockLogger('Callbacks');
    const callbacks = {
        onPlay: () => log.log('onPlay'),
        onPause: () => log.log('onPause'),
        onStop: () => log.log('onStop'),
        onMasterVolumeChange: (vol) => log.log('onMasterVolumeChange', { vol }),
        onToggleLoop: (enabled) => log.log('onToggleLoop', { enabled })
    };

    const container = document.getElementById('view-container');
    const view = new PlaybackControlsView(container, callbacks);

    const rerender = () => {
        const isPlaying = document.getElementById('is-playing-check').checked;
        const isLoading = document.getElementById('is-loading-check').checked;
        view.render({ isPlaying, isLoading, masterVolume: 0.8 });
    };
    
    return { view, rerender };
}```

The test will fail because the `render` method is empty. Let's implement it. Ready to proceed?