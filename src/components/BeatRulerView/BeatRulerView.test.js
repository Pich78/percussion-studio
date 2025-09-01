// file: src/components/BeatRulerView/BeatRulerView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { BeatRulerView } from './BeatRulerView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting BeatRulerView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    runner.describe('BeatRulerView Rendering', () => {

        runner.it('should render numbers starting from 1 by default', () => {
            testContainer.innerHTML = '';
            const view = new BeatRulerView(testContainer);
            view.render({ groupingPattern: [16], beatGrouping: 4 });

            const numbers = testContainer.querySelectorAll('.beat-ruler-number');
            runner.expect(numbers.length).toBe(4);
            runner.expect(numbers[0].textContent).toBe('1');
            runner.expect(numbers[3].textContent).toBe('4');
        });
        
        runner.it('should respect the startingBeat property', () => {
            testContainer.innerHTML = '';
            const view = new BeatRulerView(testContainer);
            // Simulate the second line of a wrapped measure
            view.render({ groupingPattern: [16], beatGrouping: 4, startingBeat: 5 });

            const numbers = testContainer.querySelectorAll('.beat-ruler-number');
            runner.expect(numbers.length).toBe(4);
            runner.expect(numbers[0].textContent).toBe('5');
            runner.expect(numbers[3].textContent).toBe('8');
        });

        runner.it('should handle asymmetrical grouping patterns correctly', () => {
            testContainer.innerHTML = '';
            const view = new BeatRulerView(testContainer);
            view.render({ groupingPattern: [12], beatGrouping: 4 });

            const numbers = testContainer.querySelectorAll('.beat-ruler-number');
            runner.expect(numbers.length).toBe(3);
            runner.expect(numbers[2].textContent).toBe('3');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'BeatRulerView test suite finished.');
}