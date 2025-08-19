// file: src/components/MeasureEditorView/MeasureEditorView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { MeasureEditorView } from './MeasureEditorView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting MeasureEditorView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');
    let modalContainer = null;

    const getMockManifest = () => ({
        instrumentDefs: [{ symbol: 'KCK', name: 'Kick Drum' }],
        soundPacks: [{ symbol: 'KCK', pack_name: 'kick_1', name: 'Acoustic Kick' }]
    });

    runner.describe('MeasureEditorView', () => {
        let view = null;
        
        runner.beforeEach(() => {
            modalContainer = document.createElement('div');
            modalContainer.id = 'modal-container';
            document.body.appendChild(modalContainer);
        });

        runner.afterEach(() => {
            if (view) view.destroy();
            if (modalContainer) modalContainer.remove();
            testContainer.innerHTML = '';
        });

        runner.it('should start with zero instrument rows and an "add" button', () => {
            view = new MeasureEditorView(testContainer, getMockManifest());
            runner.expect(testContainer.querySelectorAll('.instrument-row-container').length).toBe(0);
            runner.expect(testContainer.querySelector('.add-instrument-btn')).not.toBe(null);
        });

        // --- NEW: Test for metric controls ---
        runner.it('should render metric controls with default values', () => {
            view = new MeasureEditorView(testContainer, getMockManifest());
            const numeratorInput = testContainer.querySelector('input[data-metric="numerator"]');
            const subdivisionSelect = testContainer.querySelector('select[data-metric="subdivision"]');
            
            runner.expect(numeratorInput.value).toBe('4');
            runner.expect(subdivisionSelect.value).toBe('16');
        });

        runner.it('should re-render child rows when metrics change', () => {
            view = new MeasureEditorView(testContainer, getMockManifest());
            view._confirmAddInstrument({ symbol: 'KCK', packName: 'kick_1' });
            
            // Default 4/4 with 16ths should be 16 cells
            runner.expect(testContainer.querySelectorAll('.grid-cell').length).toBe(16);

            // Simulate changing subdivision to 8th notes
            const subdivisionSelect = testContainer.querySelector('select[data-metric="subdivision"]');
            subdivisionSelect.value = '8';
            subdivisionSelect.dispatchEvent(new Event('change', { bubbles: true }));

            // 4/4 with 8ths should now be 8 cells
            runner.expect(testContainer.querySelectorAll('.grid-cell').length).toBe(8);
        });

        runner.it('should fire onMetricsChange callback when controls are changed', () => {
            const callbackLog = new MockLogger('Callbacks');
            view = new MeasureEditorView(testContainer, {
                ...getMockManifest(),
                onMetricsChange: (metrics) => callbackLog.log('onMetricsChange', metrics)
            });
            
            const numeratorInput = testContainer.querySelector('input[data-metric="numerator"]');
            numeratorInput.value = '7';
            numeratorInput.dispatchEvent(new Event('change', { bubbles: true }));

            const expectedMetrics = { beatsPerMeasure: 7, beatUnit: 4, subdivision: 16, grouping: 4 };
            callbackLog.wasCalledWith('onMetricsChange', expectedMetrics);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'MeasureEditorView test suite finished.');
}