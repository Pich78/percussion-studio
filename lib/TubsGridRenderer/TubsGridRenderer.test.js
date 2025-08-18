// file: lib/TubsGridRenderer/TubsGridRenderer.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { TubsGridRenderer } from './TubsGridRenderer.js';

export async function run() {
    const runner = new TestRunner();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting TubsGridRenderer test suite.');

    runner.describe('TubsGridRenderer Module', () => {

        runner.it('createMeasureContainer() should create a div with the correct class', () => {
            const el = TubsGridRenderer.createMeasureContainer();
            runner.expect(el).not.toBe(null);
            runner.expect(el.tagName).toBe('DIV');
            runner.expect(el.classList.contains('measure-container')).toBe(true);
        });

        runner.it('createMeasureHeader() should create a header with correct content', () => {
            const el = TubsGridRenderer.createMeasureHeader({ metric: '12/8', resolution: 16 });
            runner.expect(el.querySelector('input[data-prop="beats"]').value).toBe('12');
            runner.expect(el.querySelector('input[data-prop="beatType"]').value).toBe('8');
            runner.expect(el.querySelector('select[data-prop="resolution"]').value).toBe('16');
            runner.expect(el.querySelector('button[data-action="apply-metric"]').disabled).toBe(true);
        });

        runner.it('createInstrumentRow() should create a row with a data attribute', () => {
            const el = TubsGridRenderer.createInstrumentRow('CONGA_HI');
            runner.expect(el.classList.contains('instrument-row')).toBe(true);
            runner.expect(el.dataset.instrument).toBe('CONGA_HI');
        });

        runner.it('createInstrumentHeader() should create a header with correct text content', () => {
            const el = TubsGridRenderer.createInstrumentHeader('Conga High');
            runner.expect(el.classList.contains('instrument-header')).toBe(true);
            runner.expect(el.textContent).toBe('Conga High');
        });

        runner.it('createGridCell() should create a cell with a data-tick-index attribute', () => {
            const el = TubsGridRenderer.createGridCell(15);
            runner.expect(el.classList.contains('grid-cell')).toBe(true);
            runner.expect(el.dataset.tickIndex).toBe('15');
        });

        runner.it('createNoteElement() should create a note with SVG content and data-sound', () => {
            const mockSvg = '<svg id="test-svg"></svg>';
            const el = TubsGridRenderer.createNoteElement(mockSvg, 'p');
            runner.expect(el.classList.contains('note')).toBe(true);
            runner.expect(el.querySelector('#test-svg')).not.toBe(null);
            runner.expect(el.dataset.sound).toBe('p');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'TubsGridRenderer test suite finished.');
}