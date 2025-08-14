// file: test/suites/view/TubsGridView.test.js (Complete and Corrected)

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

    // A more complete mock state that includes instrument definitions
    const getMockState = () => ({
        currentPatternId: 'p1',
        rhythm: {
            instrument_kit: { KCK: 'test_kick' },
            instruments: {
                test_kick: { name: 'Test Kick', sounds: [{ letter: 'o', svg: 'kick_beater.svg' }] }
            },
            patterns: {
                p1: {
                    metadata: { resolution: 16 },
                    pattern_data: [{ KCK: '||o---------------||' }]
                }
            }
        }
    });

    runner.describe('TubsGridView Rendering', () => {
        runner.it('should render the correct number of rows and cells', () => {
            testContainer.innerHTML = '';
            const view = new TubsGridView(testContainer, {});
            view.render(getMockState());
            const headers = testContainer.querySelectorAll('.instrument-header');
            runner.expect(headers.length).toBe(1);
            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells.length).toBe(16);
        });

        runner.it('should render note images with the correct src path', () => {
            testContainer.innerHTML = '';
            const view = new TubsGridView(testContainer, {});
            view.render(getMockState());
            const kickCell = testContainer.querySelectorAll('.grid-cell')[0];
            const img = kickCell.querySelector('img');
            runner.expect(img === null).toBe(false);
            const expectedSrc = '/percussion-studio/data/instruments/test_kick/kick_beater.svg';
            // Use .includes() because the full URL might have the domain prepended
            runner.expect(img.src.includes(expectedSrc)).toBe(true);
        });
    });

    runner.describe('TubsGridView Playback Indicator', () => {
        runner.it('should update the grid-column style of the indicator', () => {
            testContainer.innerHTML = '';
            const view = new TubsGridView(testContainer, {});
            view.render(getMockState());
            view.updatePlaybackIndicator(5);
            const indicator = testContainer.querySelector('.playback-indicator');
            runner.expect(indicator.style.gridColumn).toBe('7');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

/** Sets up the interactive workbench - THIS IS THE FIX FOR THE DESTRUCTURE ERROR */
export function manualTest() {
    const log = new MockLogger('Callbacks');
    const callbacks = {};
    const container = document.getElementById('view-container');
    const view = new TubsGridView(container, callbacks);

    const liveState = {
        currentPatternId: 'p1',
        rhythm: {
            instrument_kit: { KCK: 'test_kick', HHC: 'test_hat' },
            instruments: {
                test_kick: { name: 'Test Kick', sounds: [{ letter: 'o', svg: 'kick_beater.svg' }] },
                test_hat: { name: 'Test Hat', sounds: [{ letter: 'x', svg: 'kick_beater.svg' }] } // Re-use svg for test
            },
            patterns: {
                p1: {
                    metadata: { resolution: 16 },
                    pattern_data: [{
                        KCK: '||o---o---o---o---||',
                        HHC: '||o-o-o-o-o-o-o-o-||'
                    }]
                }
            }
        }
    };
    
    view.render(liveState);
    
    return { view };
}