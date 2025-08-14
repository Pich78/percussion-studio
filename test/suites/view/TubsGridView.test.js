// file: test/suites/view/TubsGridView.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { TubsGridView } from '/percussion-studio/src/view/TubsGridView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    
    let testContainer = document.getElementById('test-sandbox');
    if (!testContainer) {
        testContainer = document.createElement('div');
        testContainer.id = 'test-sandbox';
        document.body.appendChild(testContainer);
    }

    const getMockState = () => ({
        currentPatternId: 'p1',
        rhythm: {
            instrument_kit: { KCK: 'test_kick', SNR: 'test_snare' },
            patterns: {
                p1: {
                    metadata: { resolution: 16 },
                    pattern_data: [{
                        KCK: '||o---------------||',
                        SNR: '||----o-----------||'
                    }]
                }
            }
        }
    });

    runner.describe('TubsGridView Rendering', () => {
        runner.it('should render the correct number of rows and cells', () => {
            testContainer.innerHTML = '';
            const view = new TubsGridView(testContainer, {});
            view.render(getMockState());

            // Check for instrument header elements
            const headers = testContainer.querySelectorAll('.instrument-header');
            runner.expect(headers.length).toBe(2);

            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells.length).toBe(32); // 2 instruments * 16 ticks
        });

        runner.it('should render note images in the correct cells', () => {
            testContainer.innerHTML = '';
            const view = new TubsGridView(testContainer, {});
            view.render(getMockState());

            const cells = testContainer.querySelectorAll('.grid-cell');
            // KCK is on tick 0, which is the first cell of the first row
            const kickCell = cells[0];
            runner.expect(kickCell.querySelector('img') === null).toBe(false);

            // SNR is on tick 4, which is the 5th cell of the second row (index 16 + 4)
            const snareCell = cells[20];
            runner.expect(snareCell.querySelector('img') === null).toBe(false);

            // An empty cell should not have an image
            const emptyCell = cells[1];
            runner.expect(emptyCell.querySelector('img') === null).toBe(true);
        });
    });

    runner.describe('TubsGridView Playback Indicator', () => {
        runner.it('should update the grid-column style of the indicator', () => {
            testContainer.innerHTML = '';
            const view = new TubsGridView(testContainer, {});
            view.render(getMockState());
            
            view.updatePlaybackIndicator(5);
            const indicator = testContainer.querySelector('.playback-indicator');
            // Tick 5 should be in grid column 7 (1 for header + 5 for tick index + 1 for 1-based CSS)
            runner.expect(indicator.style.gridColumn).toBe('7');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    // ... (manualTest function remains the same as before) ...
}