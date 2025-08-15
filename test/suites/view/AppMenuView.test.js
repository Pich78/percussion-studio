// file: test/suites/view/AppMenuView.test.js (Complete, with Enhanced Logging)
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
            view.render({ isDirty: false, appView: 'playing' });
            const saveBtn = testContainer.querySelector('#save-btn');
            runner.expect(saveBtn.disabled).toBe(true);
        });

        runner.it('should enable the save button when dirty', () => {
            testContainer.innerHTML = '';
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: true, appView: 'playing' });
            const saveBtn = testContainer.querySelector('#save-btn');
            runner.expect(saveBtn.disabled).toBe(false);
        });

        runner.it('should show "Go to Editing View" when in playing view', () => {
            testContainer.innerHTML = '';
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'playing' });
            const toggleBtn = testContainer.querySelector('#toggle-view-btn');
            runner.expect(toggleBtn.textContent).toBe('Go to Editing View');
        });

        runner.it('should show "Go to Playing View" when in editing view', () => {
            testContainer.innerHTML = '';
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'editing' });
            const toggleBtn = testContainer.querySelector('#toggle-view-btn');
            runner.expect(toggleBtn.textContent).toBe('Go to Playing View');
        });
    });

    runner.describe('AppMenuView Callbacks', () => {
        runner.it('should fire onNewProject when the new button is clicked', () => {
            testContainer.innerHTML = '';
            let called = false;
            const view = new AppMenuView(testContainer, { onNewProject: () => called = true });
            view.render({ isDirty: false, appView: 'playing' });
            testContainer.querySelector('#new-btn').click();
            runner.expect(called).toBe(true);
        });

        runner.it('should fire onLoadProject when the load button is clicked', () => {
            testContainer.innerHTML = '';
            let called = false;
            const view = new AppMenuView(testContainer, { onLoadProject: () => called = true });
            view.render({ isDirty: false, appView: 'playing' });
            testContainer.querySelector('#load-btn').click();
            runner.expect(called).toBe(true);
        });

        runner.it('should fire onSaveProject when the save button is clicked', () => {
            testContainer.innerHTML = '';
            let called = false;
            const view = new AppMenuView(testContainer, { onSaveProject: () => called = true });
            view.render({ isDirty: true, appView: 'playing' });
            testContainer.querySelector('#save-btn').click();
            runner.expect(called).toBe(true);
        });

        runner.it('should fire onToggleView when the toggle view button is clicked', () => {
            testContainer.innerHTML = '';
            let called = false;
            const view = new AppMenuView(testContainer, { onToggleView: () => called = true });
            view.render({ isDirty: false, appView: 'playing' });
            testContainer.querySelector('#toggle-view-btn').click();
            runner.expect(called).toBe(true);
        });
    });
    await runner.runAll();
    runner.renderResults('test-results');
}

/**
 * Sets up the interactive workbench with enhanced logging.
 */
export function manualTest() {
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output');
    let currentState = {
        isDirty: document.getElementById('is-dirty-check').checked,
        appView: 'playing'
    };
    const callbacks = {
        onNewProject: () => log.log('onNewProject', { state: currentState }),
        onLoadProject: () => log.log('onLoadProject', { state: currentState }),
        onSaveProject: () => log.log('onSaveProject', { state: currentState }),
        onToggleView: () => {
            log.log('onToggleView', { state: currentState });
            // In the real app, the App class would do this. Here we simulate it.
            currentState.appView = currentState.appView === 'playing' ? 'editing' : 'playing';
            rerender();
        }
    };
    const container = document.getElementById('view-container');
    const view = new AppMenuView(container, callbacks);
    const rerender = () => {
        currentState.isDirty = document.getElementById('is-dirty-check').checked;
        view.render(currentState);
        document.getElementById('current-state-display').innerText = `Current State: ${JSON.stringify(currentState)}`;
    };
    return { rerender };
}
