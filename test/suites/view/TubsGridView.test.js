// file: test/suites/view/TubsGridView.test.js (Complete, Final Version)

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
        runner.it('should position the indicator at the correct computed pixel value', () => {
            testContainer.innerHTML = '';
            const state = getMockState();
            const view = new TubsGridView(testContainer, {});
            
            // CRITICAL FIX: To test computed styles, the element must be in the DOM
            // and have a defined size.
            const gridContainer = testContainer.querySelector('.grid') || document.createElement('div');
            testContainer.style.width = '880px'; // 80px header + 16 * 50px cells

            view.render(state);
            view.updatePlaybackIndicator(8); // Move to halfway point (tick 8 of 16)
            
            const indicator = testContainer.querySelector('.playback-indicator');
            
            // Get the browser's actual computed style
            const computedStyle = window.getComputedStyle(indicator);
            const leftPixels = parseFloat(computedStyle.left);

            // Calculate the expected pixel position
            // Total width = 880px. Header = 80px. Cell area = 800px.
            // Halfway into the cell area = 800px * 0.5 = 400px.
            // Total left offset = 80px (header) + 400px = 480px.
            const expectedLeftPixels = 480;

            // Allow for a small tolerance for browser sub-pixel rendering
            const isCloseEnough = Math.abs(leftPixels - expectedLeftPixels) < 1;
            runner.expect(isCloseEnough).toBe(true);
            
            // Clean up style
            testContainer.style.width = '';
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