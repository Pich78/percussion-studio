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
        runner.it('should fire onToggleMenu when hamburger is clicked', () => {
            const testContainer = document.createElement('div');
            const logger = new MockLogger('Callbacks');
            const view = new AppMenuView(testContainer, { onToggleMenu: () => logger.log('onToggleMenu') });
            view.render({ isDirty: false, appView: 'playing', isMenuOpen: false });
            
            testContainer.querySelector('button[data-action="toggle-menu"]').click();
            logger.wasCalledWith('onToggleMenu');
        });

        runner.it('should fire onToggleView and onToggleMenu when mode change is clicked', () => {
            const testContainer = document.createElement('div');
            const logger = new MockLogger('Callbacks');
            const view = new AppMenuView(testContainer, { 
                onToggleView: () => logger.log('onToggleView'),
                onToggleMenu: (force) => logger.log('onToggleMenu', force)
            });
            view.render({ isDirty: false, appView: 'playing', isMenuOpen: true }); // Assume menu is open

            testContainer.querySelector('button[data-action="toggle-view"]').click();
            
            logger.wasCalledWith('onToggleView');
            logger.wasCalledWith('onToggleMenu', false); // Asserts it requests to be closed
        });

        runner.it('should render "Editor Mode" button when in playing view', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'playing', isMenuOpen: true });
            const toggleBtn = testContainer.querySelector('button[data-action="toggle-view"]');
            runner.expect(toggleBtn.textContent).toBe('Editor Mode');
        });

        runner.it('should disable save button when in editing view and not dirty', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ isDirty: false, appView: 'editing', isMenuOpen: true });
            const saveBtn = testContainer.querySelector('button[data-action="save"]');
            runner.expect(saveBtn.disabled).toBe(true);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'AppMenuView test suite finished.');
}