// file: test/suites/view/TubsGridView.test.js (Complete, Final Version)

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
        runner.it('should render the correct number of instrument headers and cells', () => {
            testContainer.innerHTML = '';
            const view = new TubsGridView(testContainer, {});
            view.render(getMockState());
            runner.expect(testContainer.querySelectorAll('.instrument-header').length).toBe(1);
            runner.expect(testContainer.querySelectorAll('.grid-cell').length).toBe(16);
        });
    });

    runner.describe('TubsGridView Playback Indicator', () => {
        // CRITICAL FIX: The test must be async to wait for rendering.
        runner.it('should position the indicator at the correct computed pixel value', async () => {
            testContainer.innerHTML = '';
            const state = getMockState();
            const view = new TubsGridView(testContainer, {});
            view.render(state);
            
            const grid = testContainer.querySelector('.grid');
            grid.style.width = '880px';

            view.updatePlaybackIndicator(8);
            
            // This is the key: wait for the next browser paint cycle.
            await new Promise(resolve => setTimeout(resolve, 0));

            const indicator = testContainer.querySelector('.playback-indicator');
            const computedStyle = window.getComputedStyle(indicator);
            const leftPixels = parseFloat(computedStyle.left);

            const expectedLeftPixels = 480;
            const isCloseEnough = Math.abs(leftPixels - expectedLeftPixels) < 1;
            runner.expect(isCloseEnough).toBe(true);
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
            instrument_kit: { KCK: 'test_kick', HHC: 'test_kick' },
            instruments: {
                test_kick: { name: 'Test Kick', sounds: [
                    { letter: 'o', svg: 'kick_beater.svg' },
                    { letter: 'x', svg: 'kick_beater.svg' }
                ]}
            },
            patterns: {
                p1: {
                    metadata: { resolution: 16 },
                    pattern_data: [{
                        KCK: '||o---o---o---o---||',
                        HHC: '||x-x-x-x-x-x-x-x-||'
                    }]
                }
            }
        }
    };
    
    view.render(liveState);
    return { view };
}