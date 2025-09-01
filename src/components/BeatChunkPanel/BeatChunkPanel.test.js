// file: src/components/BeatChunkPanel/BeatChunkPanel.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { BeatChunkPanel } from './BeatChunkPanel.js';

// Import all real dependencies for integration-style unit testing
import '/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.js';
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

    runner.describe('BeatChunkPanel', () => {
        let panel = null;
        
        runner.afterEach(() => {
            if (panel) panel.destroy();
            testContainer.innerHTML = '';
        });

        runner.it('should render a ruler and instrument rows', () => {
            panel = new BeatChunkPanel(testContainer, {});
            const props = getMockProps();
            props.instruments.push({ id: 's1', symbol:'SNR', name:'Snare', pack:'Test', pattern: '----', sounds:[] });
            panel.render(props);
            
            runner.expect(testContainer.querySelector('.beat-ruler')).not.toBe(null);
            // --- FIX: Query for the panel elements that BeatChunkPanel creates ---
            runner.expect(testContainer.querySelectorAll('.instrument-row__header-panel').length).toBe(2);
            runner.expect(testContainer.querySelectorAll('.instrument-row__grid-panel').length).toBe(2);
        });

        runner.it('should render the correct header type based on injection', () => {
            panel = new BeatChunkPanel(testContainer, {});
            
            panel.render(getMockProps(EditorRowHeaderView));
            runner.expect(testContainer.querySelector('.editor-header')).not.toBe(null);
            runner.expect(testContainer.querySelector('.mixer-track')).toBe(null);

            panel.render(getMockProps(PlaybackRowHeaderView));
            runner.expect(testContainer.querySelector('.mixer-track')).not.toBe(null);
            runner.expect(testContainer.querySelector('.editor-header')).toBe(null);
        });
        
        runner.it('should show and hide its playhead indicator', () => {
            panel = new BeatChunkPanel(testContainer, {});
            panel.render(getMockProps());

            const playhead = testContainer.querySelector('.playhead-indicator');
            runner.expect(playhead.classList.contains('is-active')).toBe(false);

            panel.updatePlaybackIndicator(3);
            runner.expect(playhead.classList.contains('is-active')).toBe(true);

            panel.updatePlaybackIndicator(-1);
            runner.expect(playhead.classList.contains('is-active')).toBe(false);
        });
        
        runner.it('should destroy all its child components', () => {
            panel = new BeatChunkPanel(testContainer, {});
            panel.render(getMockProps());
            panel.destroy();
            runner.expect(testContainer.innerHTML).toBe('');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'BeatChunkPanel test suite finished.');
}