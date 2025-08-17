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
        runner.it('should show the dropdown menu after clicking the hamburger button', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'playing' });
            testContainer.querySelector('#hamburger-btn').click();
            const dropdown = testContainer.querySelector('.app-menu-dropdown.is-open');
            runner.expect(dropdown === null).toBe(false);
        });

        runner.it('should close the menu after a menu item is clicked', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, { onToggleView: () => {} });
            view.render({ isDirty: false, appView: 'playing' });
            
            // Open the menu
            testContainer.querySelector('#hamburger-btn').click();
            runner.expect(testContainer.querySelector('.app-menu-dropdown.is-open') === null).toBe(false);

            // Click an action item
            testContainer.querySelector('#toggle-view-btn').click();
            runner.expect(testContainer.querySelector('.app-menu-dropdown.is-open')).toBe(null);
        });
        
        runner.it('should render correct menu items for "playing" view', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'playing' });
            testContainer.querySelector('#hamburger-btn').click();
            
            runner.expect(testContainer.querySelector('#new-btn')).toBe(null);
            runner.expect(testContainer.querySelector('#load-btn') === null).toBe(false);
            runner.expect(testContainer.querySelector('#toggle-view-btn').textContent).toBe('Editor Mode');
        });

        runner.it('should render correct menu items for "editing" view and disable save when clean', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'editing' });
            testContainer.querySelector('#hamburger-btn').click();

            runner.expect(testContainer.querySelector('#new-btn') === null).toBe(false);
            runner.expect(testContainer.querySelector('#save-btn').disabled).toBe(true);
            runner.expect(testContainer.querySelector('#toggle-view-btn').textContent).toBe('Playback Mode');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'AppMenuView test suite finished.');
}