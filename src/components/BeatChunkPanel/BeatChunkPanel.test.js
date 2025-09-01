// file: src/components/BeatChunkPanel/BeatChunkPanel.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { BeatChunkPanel } from './BeatChunkPanel.js';

// Import header components for the header injection test
import { EditorRowHeaderView } from '/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.js';
import { PlaybackRowHeaderView } from '/percussion-studio/src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting BeatChunkPanel test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockProps = (header = EditorRowHeaderView) => ({
        beatNumber: 1,
        boxesInChunk: 16,
        instruments: [ 
            { id: 'k1', symbol: 'KCK', name: 'Kick', pack: 'Test', pattern: 'o---'.repeat(4), sounds: [] } 
        ],
        metrics: { beatGrouping: 4, feel: 'duple' },
        HeaderComponent: header
    });

    // Mock InstrumentRowView for unit testing
    class MockInstrumentRowView {
        constructor(panels, options) {
            this.panels = panels;
            this.options = options;
            this.rendered = false;
        }
        
        render(props) {
            this.rendered = true;
            // Keep the original class names for testing
            this.panels.headerPanel.classList.add('mock-header-rendered');
            this.panels.gridPanel.classList.add('mock-grid-rendered');
        }
        
        destroy() {
            this.rendered = false;
        }
    }

    // Mock BeatRulerView for unit testing
    class MockBeatRulerView {
        constructor(container) {
            this.container = container;
            this.rendered = false;
        }
        
        render(props) {
            this.rendered = true;
            this.container.innerHTML = '<div class="beat-ruler">Mock Ruler</div>';
        }
        
        destroy() {
            this.rendered = false;
        }
    }

    runner.describe('BeatChunkPanel', () => {
        let panel = null;
        
        runner.afterEach(() => {
            if (panel) panel.destroy();
            testContainer.innerHTML = '';
        });

        runner.it('should render a ruler and instrument rows', () => {
            // Inject mocks for unit testing
            panel = new BeatChunkPanel(testContainer, {}, {
                InstrumentRowView: MockInstrumentRowView,
                BeatRulerView: MockBeatRulerView
            });
            
            const props = getMockProps();
            props.instruments.push({ id: 's1', symbol:'SNR', name:'Snare', pack:'Test', pattern: '----', sounds:[] });
            panel.render(props);
            
            // Test that BeatChunkPanel created the ruler
            runner.expect(testContainer.querySelector('.beat-ruler')).not.toBe(null);
            
            // Test that BeatChunkPanel created the correct number of panel pairs
            runner.expect(testContainer.querySelectorAll('.instrument-row__header-panel').length).toBe(2);
            runner.expect(testContainer.querySelectorAll('.instrument-row__grid-panel').length).toBe(2);
            
            // Test that the mocked InstrumentRowView was called
            runner.expect(testContainer.querySelectorAll('.mock-header-rendered').length).toBe(2);
            runner.expect(testContainer.querySelectorAll('.mock-grid-rendered').length).toBe(2);
        });

        runner.it('should render the correct header type based on injection', () => {
            // For this test, we need to use real components to test the injection
            panel = new BeatChunkPanel(testContainer, {});
            
            panel.render(getMockProps(EditorRowHeaderView));
            runner.expect(testContainer.querySelector('.editor-header')).not.toBe(null);
            runner.expect(testContainer.querySelector('.mixer-track')).toBe(null);

            panel.render(getMockProps(PlaybackRowHeaderView));
            runner.expect(testContainer.querySelector('.mixer-track')).not.toBe(null);
            runner.expect(testContainer.querySelector('.editor-header')).toBe(null);
        });
        
        runner.it('should show and hide its playhead indicator', () => {
            // Use mocks for this unit test
            panel = new BeatChunkPanel(testContainer, {}, {
                InstrumentRowView: MockInstrumentRowView,
                BeatRulerView: MockBeatRulerView
            });
            panel.render(getMockProps());

            const playhead = testContainer.querySelector('.playhead-indicator');
            runner.expect(playhead.classList.contains('is-active')).toBe(false);

            // We need to create mock grid cells for the playhead positioning to work
            const mockCell = document.createElement('div');
            mockCell.className = 'grid-cell';
            mockCell.dataset.tickIndex = '3';
            mockCell.style.position = 'absolute';
            mockCell.style.left = '100px';
            mockCell.style.top = '50px';
            mockCell.style.width = '20px';
            mockCell.style.height = '30px';
            testContainer.appendChild(mockCell);

            panel.updatePlaybackIndicator(3);
            runner.expect(playhead.classList.contains('is-active')).toBe(true);

            panel.updatePlaybackIndicator(-1);
            runner.expect(playhead.classList.contains('is-active')).toBe(false);
        });
        
        runner.it('should destroy all its child components', () => {
            panel = new BeatChunkPanel(testContainer, {}, {
                InstrumentRowView: MockInstrumentRowView,
                BeatRulerView: MockBeatRulerView
            });
            panel.render(getMockProps());
            panel.destroy();
            runner.expect(testContainer.innerHTML).toBe('');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'BeatChunkPanel test suite finished.');
}