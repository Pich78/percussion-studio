// file: test/suites/view/AppMenuView.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { AppMenuView } from '/percussion-studio/src/view/AppMenuView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    
    const testContainer = document.getElementById('test-sandbox');

    runner.describe('AppMenuView Rendering', () => {
        runner.it('should render the main action buttons', () => {
            testContainer.innerHTML = '';
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false });

            const newBtn = testContainer.querySelector('#new-btn');
            const loadBtn = testContainer.querySelector('#load-btn');
            const saveBtn = testContainer.querySelector('#save-btn');
            
            runner.expect(newBtn === null).toBe(false);
            runner.expect(loadBtn === null).toBe(false);
            runner.expect(saveBtn === null).toBe(false);
            runner.expect(saveBtn.disabled).toBe(true); // Save should be disabled when not dirty
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output');
    
    const callbacks = {
        onNewProject: () => log.log('onNewProject'),
        onLoadProject: () => log.log('onLoadProject'),
        onSaveProject: () => log.log('onSaveProject')
    };

    const container = document.getElementById('view-container');
    const view = new AppMenuView(container, callbacks);
    
    const rerender = () => {
        const isDirty = document.getElementById('is-dirty-check').checked;
        view.render({ isDirty });
    };

    return { view, rerender };
}