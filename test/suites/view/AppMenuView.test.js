// file: test/suites/view/AppMenuView.test.js (Complete)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { AppMenuView } from '/percussion-studio/src/view/AppMenuView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    
    const testContainer = document.getElementById('test-sandbox');

    runner.describe('AppMenuView Rendering', () => {
        runner.it('should disable the save button when not dirty', () => {
            testContainer.innerHTML = '';
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false });
            const saveBtn = testContainer.querySelector('#save-btn');
            runner.expect(saveBtn.disabled).toBe(true);
        });

        runner.it('should enable the save button when dirty', () => {
            testContainer.innerHTML = '';
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: true });
            const saveBtn = testContainer.querySelector('#save-btn');
            runner.expect(saveBtn.disabled).toBe(false);
        });
    });

    runner.describe('AppMenuView Callbacks', () => {
        runner.it('should fire onNewProject when the new button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new AppMenuView(testContainer, { onNewProject: () => callbackLog.log('onNewProject') });
            view.render({ isDirty: false });
            testContainer.querySelector('#new-btn').click();
            callbackLog.wasCalledWith('onNewProject', undefined);
        });

        runner.it('should fire onLoadProject when the load button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new AppMenuView(testContainer, { onLoadProject: () => callbackLog.log('onLoadProject') });
            view.render({ isDirty: false });
            testContainer.querySelector('#load-btn').click();
            callbackLog.wasCalledWith('onLoadProject', undefined);
        });

        runner.it('should fire onSaveProject when the save button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new AppMenuView(testContainer, { onSaveProject: () => callbackLog.log('onSaveProject') });
            view.render({ isDirty: true }); // Must be dirty to enable the button
            testContainer.querySelector('#save-btn').click();
            callbackLog.wasCalledWith('onSaveProject', undefined);
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