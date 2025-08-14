// file: test/suites/view/TubsGridView.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { TubsGridView } from '/percussion-studio/src/view/TubsGridView.js';

/** Runs automated tests */
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

    // A mock state for testing the view
    const getMockState = () => ({
        currentPatternId: 'p1',
        rhythm: {
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

            const rows = testContainer.querySelectorAll('.instrument-row');
            // 2 instrument rows + 1 header row (conceptually)
            runner.expect(rows.length).toBe(2);

            const cells = testContainer.querySelectorAll('.grid-cell');
            // 2 instruments * 16 ticks = 32 cells
            runner.expect(cells.length).toBe(32);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

/** Sets up the interactive workbench */
export function manualTest() {
    const log = new MockLogger('Callbacks');
    const callbacks = {}; // No callbacks for now
    const container = document.getElementById('view-container');
    const view = new TubsGridView(container, callbacks);

    // For the manual test, create a more interesting state
    const liveState = {
        currentPatternId: 'p1',
        rhythm: {
            patterns: {
                p1: {
                    metadata: { resolution: 16 },
                    pattern_data: [{
                        KCK: '||o---o---o---o---||',
                        SNR: '||----o-------o---||',
                        HHC: '||o-o-o-o-o-o-o-o-||'
                    }]
                }
            }
        }
    };
    
    view.render(liveState); // Initial render
    
    return { view };
}