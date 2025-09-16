// file: src/components/PlaybackLayout/PlaybackLayout.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import './PlaybackLayout.js'; // Import to register the custom element

export async function run() {
    const runner = new TestRunner();
    const testSandbox = document.getElementById('test-sandbox');
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting PlaybackLayout test suite.');

    runner.afterEach(() => {
        testSandbox.innerHTML = '';
    });

    runner.describe('PlaybackLayout: Initialization & Structure', () => {
        runner.it('should create top and bottom slots in its shadow DOM', () => {
            const layout = document.createElement('playback-layout');
            testSandbox.appendChild(layout);

            const shadow = layout.shadowRoot;
            runner.expect(shadow.querySelector('slot[name="top"]')).not.toBe(null);
            runner.expect(shadow.querySelector('slot[name="bottom"]')).not.toBe(null);
        });

        runner.it('should have a root div with the correct class', () => {
            const layout = document.createElement('playback-layout');
            testSandbox.appendChild(layout);

            const shadow = layout.shadowRoot;
            runner.expect(shadow.querySelector('.playback-layout')).not.toBe(null);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PlaybackLayout test suite finished.');
}