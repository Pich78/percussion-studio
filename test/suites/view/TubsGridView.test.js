// file: test/suites/view/TubsGridView.test.js (Complete, Final Corrected Version)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { TubsGridView } from '/percussion-studio/src/view/TubsGridView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockState = () => ({
        currentPatternId: 'p1',
        rhythm: {
            instrument_kit: { KCK: 'test_kick' },
            instrumentDefsBySymbol: {
                KCK: { symbol: 'KCK', name: 'Test Kick', sounds: [{ letter: 'o', svg: 'open.svg' }] }
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
        runner.it('should render the correct number of instrument headers and cells', () => {
            testContainer.innerHTML = '';
            const view = new TubsGridView(testContainer, {});
            view.render(getMockState());
            runner.expect(testContainer.querySelectorAll('.instrument-header').length).toBe(1);
            runner.expect(testContainer.querySelectorAll('.grid-cell').length).toBe(16);
        });
    });

    runner.describe('TubsGridView Playback Indicator Logic', () => {
        // THIS IS THE FINAL, CORRECT TEST
        runner.it('should calculate and set the correct style STRING on the indicator', () => {
            const log = new MockLogger('TEST LOG');
            testContainer.innerHTML = '';
            const state = getMockState();
            const view = new TubsGridView(testContainer, {});

            // 1. Render the view to create the elements
            view.render(state);
            
            // 2. Call the update method
            view.updatePlaybackIndicator(8); // Halfway point
            
            // 3. Get the actual style string set by our code
            const indicator = testContainer.querySelector('.playback-indicator');
            const actualStyle = indicator.style.left;

            // 4. Define the two possible valid outcomes (our original, and the browser's simplified version)
            const expectedStyle1 = 'calc(80px + (100% - 80px) * 0.5)';
            const expectedStyle2 = 'calc(50% + 40px)'; // Browser simplified version

            // --- VERBOSE DEBUG LOGGING (Permanent) ---
            log.log('--- TEST VALIDATION DATA ---');
            log.log('Actual Style String:', actualStyle);
            log.log('Is it valid option 1?', actualStyle === expectedStyle1);
            log.log('Is it valid option 2?', actualStyle === expectedStyle2);
            log.log('----------------------------');
            // --- END DEBUG LOGGING ---

            // 5. The test passes if the actual style matches EITHER of the valid possibilities.
            const isCorrect = (actualStyle === expectedStyle1 || actualStyle === expectedStyle2);
            runner.expect(isCorrect).toBe(true);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output');
    const callbacks = {};
    const container = document.getElementById('view-container');
    const view = new TubsGridView(container, callbacks);

    const liveState = {
        currentPatternId: 'p1',
        rhythm: {
            instrument_kit: { KCK: 'test_kick', SNR: 'test_snare' },
            instrumentDefsBySymbol: {
                KCK: { name: 'Test Kick', sounds: [{ letter: 'o', svg: 'open.svg' }, { letter: 'p', svg: 'presionado.svg' }] },
                SNR: { name: 'Test Snare', sounds: [{ letter: 'o', svg: 'open.svg' }] }
            },
            patterns: {
                p1: {
                    metadata: { resolution: 16 },
                    pattern_data: [{
                        KCK: '||o---p---o---p---||',
                        SNR: '||----o-------o---||'
                    }]
                }
            }
        }
    };
    
    view.render(liveState);
    return { view };
}