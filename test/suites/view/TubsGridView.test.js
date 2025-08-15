// file: test/suites/view/TubsGridView.test.js (Complete, with Verbose Logging)

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

    runner.describe('TubsGridView Playback Indicator', () => {
        runner.it('should position the indicator at the correct computed pixel value', async () => {
            const log = new MockLogger('TEST LOG');
            testContainer.innerHTML = '';
            const state = getMockState();
            const view = new TubsGridView(testContainer, {});
            view.render(state);
            
            const grid = testContainer.querySelector('.grid');
            grid.style.width = '880px';

            view.updatePlaybackIndicator(8);
            
            await new Promise(resolve => requestAnimationFrame(resolve));

            const indicator = testContainer.querySelector('.playback-indicator');
            const leftPixels = indicator.offsetLeft;

            const expectedLeftPixels = 480;
            const isCloseEnough = Math.abs(leftPixels - expectedLeftPixels) < 1;
            
            // --- VERBOSE DEBUG LOGGING ---
            if (!isCloseEnough) {
                log.log('--- TEST FAILURE DATA ---');
                const gridStyles = window.getComputedStyle(grid);
                const indicatorStyles = window.getComputedStyle(indicator);
                log.log('Grid Parent Width:', window.getComputedStyle(testContainer).width);
                log.log('Grid Style Width (set):', grid.style.width);
                log.log('Grid Computed Width:', gridStyles.width);
                log.log('Indicator Offset Left:', indicator.offsetLeft);
                log.log('Indicator Computed Left:', indicatorStyles.left);
                log.log('Expected Left (pixels):', expectedLeftPixels);
                log.log('Actual Left (pixels):', leftPixels);
                log.log('-------------------------');
            }
            // --- END DEBUG LOGGING ---

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