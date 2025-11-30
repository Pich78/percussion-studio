// file: src/components/GridPanel/GridPanel.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import './GridPanel.js';

export async function run() {
    const runner = new TestRunner();
    const testSandbox = document.getElementById('test-sandbox');
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting GridPanel test suite.');

    /**
     * A helper to generate the mock "Cell View Model" array that this component expects.
     * This decouples the test from the GridModel's logic.
     */
    const getMockCellViewModels = (count = 4) => {
        return Array.from({ length: count }, (_, i) => ({
            key: `cell-${i}`,
            tickIndex: i,
            shadingClass: i % 2 === 0 ? 'cell-downbeat' : 'cell-weak-beat',
            symbolSVG: i === 0 ? '<svg>o</svg>' : null,
            hasNote: i === 0,
        }));
    };

    runner.afterEach(() => {
        testSandbox.innerHTML = '';
    });

    runner.describe('GridPanel: Rendering', () => {
        runner.it('should render the correct number of cells based on the "cells" property', () => {
            const panel = document.createElement('grid-panel');
            testSandbox.appendChild(panel);
            
            panel.cells = getMockCellViewModels(8); // Give it 8 cells
            
            runner.expect(panel.shadowRoot.querySelectorAll('.grid-box').length).toBe(8);
        });

        runner.it('should apply the correct shading class and SVG from the view model', () => {
            const panel = document.createElement('grid-panel');
            testSandbox.appendChild(panel);
            
            panel.cells = getMockCellViewModels(4);

            const cells = panel.shadowRoot.querySelectorAll('.grid-box');
            
            // Test Cell 0
            runner.expect(cells[0].classList.contains('cell-downbeat')).toBe(true);
            runner.expect(cells[0].querySelector('.note').innerHTML).toBe('<svg>o</svg>');

            // Test Cell 1
            runner.expect(cells[1].classList.contains('cell-weak-beat')).toBe(true);
            runner.expect(cells[1].querySelector('.note')).toBe(null);
        });

        runner.it('should render nothing if the "cells" property is empty or undefined', () => {
            const panel = document.createElement('grid-panel');
            testSandbox.appendChild(panel);

            panel.cells = [];
            runner.expect(panel.shadowRoot.querySelectorAll('.grid-box').length).toBe(0);

            panel.cells = undefined;
            runner.expect(panel.shadowRoot.querySelectorAll('.grid-box').length).toBe(0);
        });
    });

    runner.describe('GridPanel: User Interactions & Events', () => {
        let panel;
        
        runner.beforeEach(() => {
            panel = document.createElement('grid-panel');
            panel.cells = getMockCellViewModels(4);
            testSandbox.appendChild(panel);
        });

        runner.it('should dispatch "cell-mousedown" with correct detail on click', () => {
            let receivedDetail = null;
            panel.addEventListener('cell-mousedown', (e) => {
                receivedDetail = e.detail;
            });

            const targetCell = panel.shadowRoot.querySelectorAll('.grid-box')[1]; // Cell with no note
            targetCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

            runner.expect(receivedDetail).not.toBe(null);
            runner.expect(receivedDetail.tickIndex).toBe(1);
            runner.expect(receivedDetail.hasNote).toBe(false);
        });

        runner.it('should dispatch "cell-mouseenter" only when the mouse button is pressed (drag)', () => {
            let callCount = 0;
            panel.addEventListener('cell-mouseenter', () => {
                callCount++;
            });

            const cell = panel.shadowRoot.querySelectorAll('.grid-box')[2];

            // Simulate a hover (buttons: 0) - should NOT fire
            cell.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, buttons: 0 }));
            runner.expect(callCount).toBe(0);

            // Simulate a drag (buttons: 1) - SHOULD fire
            cell.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, buttons: 1 }));
            runner.expect(callCount).toBe(1);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'GridPanel test suite finished.');
}