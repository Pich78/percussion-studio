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
            view.render({ isMenuOpen: false });
            
            testContainer.querySelector('button[data-action="toggle-menu"]').click();
            logger.wasCalledWith('onToggleMenu');
        });

        runner.it('should fire onToggleMenu(false) when clicking outside the component', () => {
            const wrapper = document.createElement('div');
            const testContainer = document.createElement('div');
            wrapper.appendChild(testContainer); // Place the component inside a wrapper

            const logger = new MockLogger('Callbacks');
            const view = new AppMenuView(testContainer, { onToggleMenu: (force) => logger.log('onToggleMenu', force) });
            
            // Render with the menu open to attach the global listener
            view.render({ isMenuOpen: true });

            // Simulate a click on the wrapper, which is "outside" the component's container
            wrapper.click();
            
            logger.wasCalledWith('onToggleMenu', false);
        });

        runner.it('should render correct menu items for "playing" view', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ appView: 'playing', isMenuOpen: true });
            
            runner.expect(testContainer.querySelector('button[data-action="new"]')).toBe(null);
            runner.expect(testContainer.querySelector('button[data-action="toggle-view"]').textContent).toBe('Editor');
        });

        runner.it('should render correct menu items for "editing" view', () => {
            const testContainer = document.createElement('div');
            const view = new AppMenuView(testContainer, {});
            view.render({ appView: 'editing', isMenuOpen: true });

            runner.expect(testContainer.querySelector('button[data-action="new"]') === null).toBe(false);
            runner.expect(testContainer.querySelector('button[data-action="toggle-view"]').textContent).toBe('Playback');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'AppMenuView test suite finished.');
}