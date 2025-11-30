// file: src/components/GridPanel/GridModel.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { GridModel } from './GridModel.js';

export async function run() {
    const runner = new TestRunner();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting GridModel test suite.');

    const getMockProps = (overrides = {}) => ({
        notation: 'o---x---',
        instrument: { sounds: [{letter: 'o', svg: 'o'}, {letter: 'x', svg: 'x'}] },
        metrics: { beatGrouping: 4, feel: 'duple' },
        ...overrides
    });

    runner.describe('GridModel: Initialization', () => {
        runner.it('should generate a valid cell view model on creation', () => {
            const model = new GridModel({
                initialProps: getMockProps(),
                onUpdate: () => {}
            });
            const cells = model.cells;
            runner.expect(cells.length).toBe(8);
            runner.expect(cells[0].symbolSVG).toBe('o');
            runner.expect(cells[0].shadingClass).toBe('cell-downbeat');
            runner.expect(cells[4].symbolSVG).toBe('x');
        });
    });

    runner.describe('GridModel: State Updates', () => {
        runner.it('should update notation and regenerate cells when updateCell is called', () => {
            let updatedCells = null;
            const model = new GridModel({
                initialProps: getMockProps(),
                onUpdate: (newCells) => { updatedCells = newCells; }
            });

            model.updateCell(1, 'x'); // Change '-' to 'x'

            const currentState = model.getCurrentState();
            runner.expect(currentState.notation).toBe('ox--x---');

            const newCells = model.cells;
            runner.expect(newCells[1].symbolSVG).toBe('x');
            runner.expect(newCells[1].hasNote).toBe(true);

            // Verify that the onUpdate callback was fired with the new model
            runner.expect(updatedCells).toEqual(newCells);
        });
    });

    runner.describe('GridModel: Shading Logic', () => {
        runner.it('should apply correct triplet shading', () => {
            const model = new GridModel({
                initialProps: getMockProps({ notation: '---', metrics: { beatGrouping: 3, feel: 'triplet' } }),
                onUpdate: () => {}
            });
            const cells = model.cells;
            runner.expect(cells[0].shadingClass).toBe('cell-triplet-1');
            runner.expect(cells[1].shadingClass).toBe('cell-triplet-2');
            runner.expect(cells[2].shadingClass).toBe('cell-triplet-3');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}