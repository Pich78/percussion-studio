// file: src/components/AppMenuView/AppMenuView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { AppMenuView } from './AppMenuView.js';

const getTime = () => new Date().toISOString();

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    console.log(`[${getTime()}][TestRunner][run][Setup] Starting AppMenuView test suite.`);

    runner.describe('AppMenuView Rendering', () => {
        runner.it('should disable the save button when not dirty', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'playing' });
            const saveButton = testContainer.querySelector('#save-btn');
            runner.expect(saveButton.disabled).toBe(true);
        });

        runner.it('should enable the save button when dirty', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: true, appView: 'editing' });
            const saveButton = testContainer.querySelector('#save-btn');
            runner.expect(saveButton.disabled).toBe(false);
        });

        runner.it('should show "Go to Editing" when in playing view', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'playing' });
            const toggleButton = testContainer.querySelector('#toggle-view-btn');
            runner.expect(toggleButton.textContent).toBe('Go to Editing');
        });

        runner.it('should show "Go to Playing" when in editing view', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'editing' });
            const toggleButton = testContainer.querySelector('#toggle-view-btn');
            runner.expect(toggleButton.textContent).toBe('Go to Playing');
        });
    });

    runner.describe('AppMenuView Callbacks', () => {
        const testCallback = (buttonId, callbackName) => {
            const testContainer = document.createElement('div');
            const logger = new MockLogger('Callbacks');
            const callbacks = { [callbackName]: () => logger.log(callbackName) };
            const view = new AppMenuView(testContainer, callbacks);
            view.render({ isDirty: true, appView: 'playing' });
            testContainer.querySelector(`#${buttonId}`).click();
            logger.wasCalledWith(callbackName);
        };

        runner.it('should fire onNewProject when new button is clicked', () => testCallback('new-btn', 'onNewProject'));
        runner.it('should fire onLoadProject when load button is clicked', () => testCallback('load-btn', 'onLoadProject'));
        runner.it('should fire onSaveProject when save button is clicked', () => testCallback('save-btn', 'onSaveProject'));
        runner.it('should fire onToggleView when toggle button is clicked', () => testCallback('toggle-view-btn', 'onToggleView'));
    });

    await runner.runAll();
    runner.renderResults('test-results');
    console.log(`[${getTime()}][TestRunner][run][Teardown] AppMenuView test suite finished.`);
}