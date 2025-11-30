// file: src/components/BeatChunkPanel/BeatChunkPanel.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { BeatChunkPanel } from './BeatChunkPanel.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting BeatChunkPanel test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    // --- Mocks ---
    // Mocks are defined locally to this test file.
    // They act as "spies" to verify they were called correctly.

    class MockHeaderComponent {
        constructor(container, options) {}
        render(props) {}
        destroy() {}
    }

    class MockInstrumentRowView {
        constructor(panels, options) {
            this.panels = panels;
            this.options = options;
            this.renderCount = 0;
            this.destroyed = false;
        }
        render(props) {
            this.renderCount++;
            // Add a specific class to prove this mock's render was called
            this.panels.headerPanel.classList.add('mock-row-rendered');
        }
        destroy() {
            this.destroyed = true;
        }
    }

    class MockBeatRulerView {
        constructor(container) {
            this.container = container;
            this.rendered = false;
            this.destroyed = false;
        }
        render(props) {
            this.rendered = true;
            this.container.innerHTML = '<div class="mock-ruler-rendered"></div>';
        }
        destroy() {
            this.destroyed = true;
        }
    }

    // --- Test Data Helper ---
    // Helper to generate props, now including the mock components for injection.
    const getMockProps = (instrumentCount = 1) => {
        const instruments = [];
        for (let i = 0; i < instrumentCount; i++) {
            instruments.push({ id: `inst_${i}`, name: `Inst ${i}`, pattern: 'o---' });
        }

        return {
            beatNumber: 1,
            boxesInChunk: 16,
            instruments,
            metrics: { beatGrouping: 4, feel: 'duple' },
            // Mocks are injected via the public render interface
            HeaderComponent: MockHeaderComponent,
            InstrumentRowView: MockInstrumentRowView,
            BeatRulerView: MockBeatRulerView
        };
    };

    runner.describe('BeatChunkPanel', () => {
        let panel = null;
        
        runner.beforeEach(() => {
            // Instantiate the component using its clean, public constructor.
            // No special arguments are needed.
            panel = new BeatChunkPanel(testContainer, {});
        });

        runner.afterEach(() => {
            if (panel) panel.destroy();
            testContainer.innerHTML = '';
        });

        runner.it('should orchestrate the rendering of its children via the public API', () => {
            const props = getMockProps(3);
            panel.render(props);

            // 1. Test that the panel itself created the DOM structure ("slots")
            runner.expect(testContainer.querySelectorAll('.instrument-row__header-panel').length).toBe(3);
            runner.expect(testContainer.querySelectorAll('.instrument-row__grid-panel').length).toBe(3);

            // 2. Test that the injected mock components were successfully rendered
            runner.expect(testContainer.querySelector('.mock-ruler-rendered')).not.toBe(null);
            runner.expect(testContainer.querySelectorAll('.mock-row-rendered').length).toBe(3);
        });

        runner.it('should show and hide its playhead indicator', () => {
            panel.render(getMockProps(1));

            const playhead = testContainer.querySelector('.playhead-indicator');
            runner.expect(playhead.classList.contains('is-active')).toBe(false);

            // Create a fake grid cell for the playhead to measure
            const mockCell = document.createElement('div');
            mockCell.className = 'grid-cell';
            mockCell.dataset.tickIndex = '5';
            testContainer.querySelector('.beat-chunk-panel').appendChild(mockCell);

            panel.updatePlaybackIndicator(5);
            runner.expect(playhead.classList.contains('is-active')).toBe(true);

            panel.updatePlaybackIndicator(-1);
            runner.expect(playhead.classList.contains('is-active')).toBe(false);
        });

        runner.it('should update a single instrument row without re-rendering others', () => {
            const props = getMockProps(2);
            panel.render(props);

            // Get the instantiated mock children from the panel
            const row1 = panel.childInstances.rows.get('inst_0');
            const row2 = panel.childInstances.rows.get('inst_1');

            runner.expect(row1.renderCount).toBe(1);
            runner.expect(row2.renderCount).toBe(1);

            // Create updated instrument data for the second instrument
            const updatedInstrument = { id: 'inst_1', name: 'Updated Inst', pattern: '-o--' };
            panel.updateInstrument(updatedInstrument);

            // Verify only the specified row was re-rendered
            runner.expect(row1.renderCount).toBe(1); // Should not have changed
            runner.expect(row2.renderCount).toBe(2); // Should have been re-rendered
        });

        runner.it('should destroy itself and all child components', () => {
            panel.render(getMockProps(2));

            const ruler = panel.childInstances.ruler;
            const row1 = panel.childInstances.rows.get('inst_0');
            const row2 = panel.childInstances.rows.get('inst_1');
            
            panel.destroy();
            
            // Verify all child `destroy` methods were called
            runner.expect(ruler.destroyed).toBe(true);
            runner.expect(row1.destroyed).toBe(true);
            runner.expect(row2.destroyed).toBe(true);
            
            // Verify the DOM was cleaned up
            runner.expect(testContainer.innerHTML).toBe('');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'BeatChunkPanel test suite finished.');
}