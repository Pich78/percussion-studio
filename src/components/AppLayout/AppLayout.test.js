// file: src/components/AppLayout/AppLayout.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { eventBus } from '../EventBus/EventBus.js';
import './AppLayout.js';

import './PlaybackView_workbench.js';
import './EditorView_workbench.js';

export async function run() {
    const runner = new TestRunner();
    const testSandbox = document.getElementById('test-sandbox');
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting AppLayout test suite.');

    runner.afterEach(() => {
        testSandbox.innerHTML = '';
        eventBus._clearAll();
    });

    runner.describe('AppLayout: View Switching API', () => {
        runner.it('should add the correct view to the DOM when showView() is called', async () => {
            const layout = document.createElement('app-layout');
            testSandbox.appendChild(layout);

            await layout.showView('editor');
            
            // FIX: Query the shadowRoot to find the dynamically added component.
            runner.expect(layout.shadowRoot.querySelector('editor-view-workbench')).not.toBe(null);
            runner.expect(layout.shadowRoot.querySelector('playback-view-workbench')).toBe(null);
        });

        runner.it('should remove the old view when switching to a new one', async () => {
            const layout = document.createElement('app-layout');
            testSandbox.appendChild(layout);

            await layout.showView('editor'); // Initial state
            await layout.showView('playback'); // Switch

            // FIX: Query the shadowRoot to verify the state of the internal DOM.
            runner.expect(layout.shadowRoot.querySelector('editor-view-workbench')).toBe(null);
            runner.expect(layout.shadowRoot.querySelector('playback-view-workbench')).not.toBe(null);
        });
    });

    runner.describe('AppLayout: Event Bus Integration', () => {
        runner.it('should switch views when "app:mode-changed" is published', async () => {
            const layout = document.createElement('app-layout');
            testSandbox.appendChild(layout);
            
            await layout.showView('playback'); // Set initial state
            
            eventBus.publish('app:mode-changed', { mode: 'editor' });
            
            // Wait for the async import and DOM update to complete
            await new Promise(resolve => setTimeout(resolve, 10)); 

            // FIX: Query the shadowRoot for the final assertion.
            runner.expect(layout.shadowRoot.querySelector('playback-view-workbench')).toBe(null);
            runner.expect(layout.shadowRoot.querySelector('editor-view-workbench')).not.toBe(null);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'AppLayout test suite finished.');
}