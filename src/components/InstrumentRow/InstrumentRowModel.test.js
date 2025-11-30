// file: src/components/InstrumentRow/InstrumentRowModel.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentRowModel } from './InstrumentRowModel.js';

export async function run() {
    const runner = new TestRunner();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting InstrumentRowModel test suite.');

    // Helper function to provide default mock data for tests
    const getMockProps = (overrides = {}) => {
        const defaults = {
            mode: 'playback',
            rowData: {
                notation: 'o---x---',
                instrument: { name: 'Test Kit', volume: 0.8, sounds: [] },
                metrics: { beatGrouping: 4, feel: 'duple' },
            },
        };

        // FIX: Perform a deep merge on rowData to prevent properties from being overwritten.
        if (overrides.rowData) {
            overrides.rowData = { ...defaults.rowData, ...overrides.rowData };
        }

        return { ...defaults, ...overrides };
    };

    runner.describe('InstrumentRowModel: View Model Getters', () => {
        runner.it('should return the correct header tag name for playback mode', () => {
            const model = new InstrumentRowModel({
                initialProps: getMockProps({ mode: 'playback' }),
                onUpdate: () => {}
            });
            runner.expect(model.headerTagName).toBe('playback-instrument-header');
        });

        runner.it('should return the correct header tag name for editor mode', () => {
            const model = new InstrumentRowModel({
                initialProps: getMockProps({ mode: 'editor' }),
                onUpdate: () => {}
            });
            runner.expect(model.headerTagName).toBe('editor-instrument-header');
        });

        runner.it('should calculate the correct grid column span', () => {
            // This test now provides a complete rowData object.
            const model = new InstrumentRowModel({
                initialProps: getMockProps({ rowData: { notation: '123456789012' } }), // 12 chars
                onUpdate: () => {}
            });
            runner.expect(model.gridColumnSpan).toBe(12);
        });

        runner.it('should expose the child GridModel instance', () => {
            const model = new InstrumentRowModel({
                initialProps: getMockProps(),
                onUpdate: () => {}
            });
            runner.expect(model.gridModel).not.toBe(null);
            runner.expect(model.gridModel.constructor.name).toBe('GridModel');
        });
    });

    runner.describe('InstrumentRowModel: State Updates', () => {
        runner.it('should update its internal state and fire the onUpdate callback', () => {
            let wasCallbackFired = false;
            const model = new InstrumentRowModel({
                initialProps: getMockProps(),
                onUpdate: () => { wasCallbackFired = true; }
            });

            model.toggleMute(); // Perform an action
            
            runner.expect(model.instrumentData.volume).toBe(0);
            runner.expect(wasCallbackFired).toBe(true);
        });

        runner.it('should propagate updates from the child GridModel', () => {
            let wasCallbackFired = false;
            const model = new InstrumentRowModel({
                initialProps: getMockProps(),
                onUpdate: () => { wasCallbackFired = true; }
            });

            // Action: update the child model directly
            model.gridModel.updateCell(0, '-');

            // The parent model's onUpdate callback should have been triggered
            runner.expect(wasCallbackFired).toBe(true);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}