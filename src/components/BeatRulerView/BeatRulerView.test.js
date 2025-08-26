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

        runner.it('should render a single line for a simple measure', () => {
            testContainer.innerHTML = '';
            const view = new BeatRulerView(testContainer);
            view.render({ groupingPattern: [16], beatGrouping: 4 });

            const lines = testContainer.querySelectorAll('.beat-ruler-line');
            runner.expect(lines.length).toBe(1);

            const numbers = testContainer.querySelectorAll('.beat-ruler-number');
            runner.expect(numbers.length).toBe(4);
            runner.expect(numbers[0].textContent).toBe('1');
            runner.expect(numbers[3].textContent).toBe('4');

            // Check positioning of the second beat number
            runner.expect(numbers[1].style.left).toBe('calc(4 * var(--cell-width, 40px))');
        });

        runner.it('should render multiple lines for a wrapped measure', () => {
            testContainer.innerHTML = '';
            const view = new BeatRulerView(testContainer);
            view.render({ groupingPattern: [16, 16], beatGrouping: 4 });

            const lines = testContainer.querySelectorAll('.beat-ruler-line');
            runner.expect(lines.length).toBe(2);

            const allNumbers = testContainer.querySelectorAll('.beat-ruler-number');
            runner.expect(allNumbers.length).toBe(8); // 4 beats per line

            const line1Numbers = lines[0].querySelectorAll('.beat-ruler-number');
            runner.expect(line1Numbers.length).toBe(4);
            runner.expect(line1Numbers[0].textContent).toBe('1');
            runner.expect(line1Numbers[3].textContent).toBe('4');

            const line2Numbers = lines[1].querySelectorAll('.beat-ruler-number');
            runner.expect(line2Numbers.length).toBe(4);
            runner.expect(line2Numbers[0].textContent).toBe('5');
            runner.expect(line2Numbers[3].textContent).toBe('8');

            // The first beat of the *second* line should have a left position of 0
            runner.expect(line2Numbers[0].style.left).toBe('calc(0 * var(--cell-width, 40px))');
        });

        runner.it('should handle asymmetrical grouping patterns correctly', () => {
            testContainer.innerHTML = '';
            const view = new BeatRulerView(testContainer);
            // Simulates a 7/4 measure split into 4 beats + 3 beats
            view.render({ groupingPattern: [16, 12], beatGrouping: 4 });

            const lines = testContainer.querySelectorAll('.beat-ruler-line');
            runner.expect(lines.length).toBe(2);
            
            const line1Numbers = lines[0].querySelectorAll('.beat-ruler-number');
            runner.expect(line1Numbers.length).toBe(4);
            runner.expect(line1Numbers[3].textContent).toBe('4');

            const line2Numbers = lines[1].querySelectorAll('.beat-ruler-number');
            runner.expect(line2Numbers.length).toBe(3);
            runner.expect(line2Numbers[0].textContent).toBe('5');
            runner.expect(line2Numbers[2].textContent).toBe('7');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'BeatRulerView test suite finished.');
}