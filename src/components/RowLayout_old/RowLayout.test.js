// file: src/components/RowLayout/RowLayout.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { RowLayout } from './RowLayout.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting RowLayout test suite.');
    
    const testSandbox = document.getElementById('test-sandbox');

    runner.describe('RowLayout: Initialization & Structure', () => {
        let layout = null;
        
        runner.afterEach(() => {
            if (layout) {
                layout.destroy();
            }
            testSandbox.innerHTML = '';
        });

        runner.it('should create the main layout container and its children on instantiation', () => {
            layout = new RowLayout(testSandbox);
            runner.expect(testSandbox.querySelector('.row-layout')).not.toBe(null);
            runner.expect(testSandbox.querySelector('.row-layout__header-area')).not.toBe(null);
            runner.expect(testSandbox.querySelector('.row-layout__grid-area')).not.toBe(null);
        });
        
        runner.it('should expose the headerArea as a valid DOM element property', () => {
            layout = new RowLayout(testSandbox);
            runner.expect(layout.headerArea).toBeInstanceOf(HTMLElement);
            runner.expect(layout.headerArea.classList.contains('row-layout__header-area')).toBe(true);
        });

        runner.it('should expose the gridArea as a valid DOM element property', () => {
            layout = new RowLayout(testSandbox);
            runner.expect(layout.gridArea).toBeInstanceOf(HTMLElement);
            runner.expect(layout.gridArea.classList.contains('row-layout__grid-area')).toBe(true);
        });
        
        runner.it('should have only one child in the container, which is the main layout div', () => {
            layout = new RowLayout(testSandbox);
            runner.expect(testSandbox.children.length).toBe(1);
            runner.expect(testSandbox.children[0].classList.contains('row-layout')).toBe(true);
        });
    });

    runner.describe('RowLayout: Destruction', () => {
        runner.it('should clear the container content when destroy() is called', () => {
            const layout = new RowLayout(testSandbox);
            // Verify it's not empty first
            runner.expect(testSandbox.innerHTML).not.toBe('');
            
            layout.destroy();
            
            runner.expect(testSandbox.innerHTML).toBe('');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'RowLayout test suite finished.');
}