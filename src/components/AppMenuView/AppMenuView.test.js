// file: src/components/AppMenuView/AppMenuView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { AppMenuView } from './AppMenuView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting AppMenuView test suite.');

    runner.describe('AppMenuView Hamburger Menu', () => {
        runner.it('should not show the dropdown menu by default', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'playing' });
            const dropdown = testContainer.querySelector('.app-menu-dropdown.is-open');
            runner.expect(dropdown).toBe(null);
        });

        runner.it('should show the dropdown menu after clicking the hamburger button', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'playing' });
            testContainer.querySelector('#hamburger-btn').click();
            const dropdown = testContainer.querySelector('.app-menu-dropdown.is-open');
            runner.expect(dropdown === null).toBe(false);
        });

        runner.it('should render correct menu items for "playing" view', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'playing' });
            testContainer.querySelector('#hamburger-btn').click(); // Open menu
            
            const newBtn = testContainer.querySelector('#new-btn');
            const loadBtn = testContainer.querySelector('#load-btn');
            const toggleBtn = testContainer.querySelector('#toggle-view-btn');
            
            runner.expect(newBtn).toBe(null); // Should not exist
            runner.expect(loadBtn === null).toBe(false); // Should exist
            runner.expect(toggleBtn.textContent).toBe('Editor Mode');
        });

        runner.it('should render correct menu items for "editing" view and disable save when clean', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'editing' });
            testContainer.querySelector('#hamburger-btn').click(); // Open menu

            const newBtn = testContainer.querySelector('#new-btn');
            const saveBtn = testContainer.querySelector('#save-btn');
            const toggleBtn = testContainer.querySelector('#toggle-view-btn');

            runner.expect(newBtn === null).toBe(false); // Should exist
            runner.expect(saveBtn.disabled).toBe(true); // Should be disabled
            runner.expect(toggleBtn.textContent).toBe('Playback Mode');
        });

        runner.it('should fire onToggleView when the toggle menu item is clicked', () => {
            const testContainer = document.createElement('div');
            const logger = new MockLogger('Callbacks');
            const view = new AppMenuView(testContainer, { onToggleView: () => logger.log('onToggleView') });
            view.render({ isDirty: false, appView: 'playing' });
            
            testContainer.querySelector('#hamburger-btn').click(); // Open menu
            testContainer.querySelector('#toggle-view-btn').click(); // Click menu item

            logger.wasCalledWith('onToggleView');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'AppMenuView test suite finished.');
}