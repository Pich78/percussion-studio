// file: src/components/GridPanel/GridPanel.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import './GridPanel.js';

export async function run() {
    const runner = new TestRunner();
    const testSandbox = document.getElementById('test-sandbox');
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting GridPanel test suite.');

    const getMockProps = (overrides = {}) => ({
        instrument: { sounds: [{letter: 'o', svg: '<svg>o</svg>'}] },
        notation: 'o---o---',
        metrics: { beatGrouping: 4, feel: 'duple' },
        ...overrides
    });

    runner.describe('Rendering & Shading', () => {
        runner.it('should render the correct number of grid cells', () => {
            const panel = document.createElement('grid-panel');
            const props = getMockProps();
            panel.instrument = props.instrument;
            panel.metrics = props.metrics;
            panel.notation = props.notation;
            testSandbox.appendChild(panel);

            runner.expect(panel.shadowRoot.querySelectorAll('.grid-box').length).toBe(8);
        });

        runner.it('should apply duple shading classes correctly', () => {
            const panel = document.createElement('grid-panel');
            const props = getMockProps({ notation: '-'.repeat(8), metrics: { beatGrouping: 4, feel: 'duple' } });
            panel.instrument = props.instrument;
            panel.metrics = props.metrics;
            panel.notation = props.notation;
            testSandbox.appendChild(panel);

            const cells = panel.shadowRoot.querySelectorAll('.grid-box');
            runner.expect(cells[0].classList.contains('cell-downbeat')).toBe(true);
            runner.expect(cells[2].classList.contains('cell-strong-beat')).toBe(true);
            runner.expect(cells[4].classList.contains('cell-downbeat')).toBe(true);
        });
    });

    runner.describe('User Interactions & Events', () => {
        let panel;
        
        runner.beforeEach(() => {
            panel = document.createElement('grid-panel');
            const props = getMockProps();
            panel.instrument = props.instrument;
            panel.metrics = props.metrics;
            panel.notation = props.notation;
            testSandbox.appendChild(panel);
        });

        runner.it('should dispatch "cell-mousedown" with correct detail', () => {
            let receivedDetail = null;
            panel.addEventListener('cell-mousedown', (e) => {
                receivedDetail = e.detail;
            });

            const cell = panel.shadowRoot.querySelectorAll('.grid-box')[2];
            cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

            runner.expect(receivedDetail).not.toBe(null);
            runner.expect(receivedDetail.tickIndex).toBe(2);
            runner.expect(receivedDetail.hasNote).toBe(false);
        });

        runner.it('should dispatch "cell-mouseenter" only when mouse button is pressed', () => {
            let receivedDetail = null;
            panel.addEventListener('cell-mouseenter', (e) => {
                receivedDetail = e.detail;
            });

            const cell1 = panel.shadowRoot.querySelectorAll('.grid-box')[1];
            const cell2 = panel.shadowRoot.querySelectorAll('.grid-box')[2];

            // Simulate mouseenter without button press - should not fire
            cell1.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, buttons: 0 }));
            runner.expect(receivedDetail).toBe(null);

            // Simulate mouseenter with button press - should fire
            cell2.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, buttons: 1 }));
            runner.expect(receivedDetail).not.toBe(null);
            runner.expect(receivedDetail.tickIndex).toBe(2);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}