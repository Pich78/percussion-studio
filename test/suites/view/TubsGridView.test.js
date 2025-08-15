// file: test/suites/view/TubsGridView.test.js (Complete, Final Corrected Version)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { TubsGridView } from '/percussion-studio/src/view/TubsGridView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    
    const testContainer = document.getElementById('test-sandbox');

    // This mock state now includes the `instrumentDefsBySymbol` object
    const getMockState = () => ({
        currentPatternId: 'p1',
        rhythm: {
            instrument_kit: { KCK: 'test_kick' },
            instrumentDefsBySymbol: {
                KCK: { name: 'Test Kick', sounds: [{ letter: 'o', svg: 'open.svg' }] }
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

        runner.it('should render note images with the correct src path', () => {
            testContainer.innerHTML = '';
            const view = new TubsGridView(testContainer, {});
            view.render(getMockState());
            const img = testContainer.querySelector('img');
            runner.expect(img === null).toBe(false);
            const expectedSrc = '/percussion-studio/data/instruments/open.svg';
            runner.expect(img.src.includes(expectedSrc)).toBe(true);
        });
    });

    runner.describe('TubsGridView Playback Indicator Logic', () => {
        // This is the correct, simple unit test that does not depend on the DOM
        runner.it('should calculate the correct style STRING for the indicator', () => {
            const view = new TubsGridView(null, {});
            view.state = getMockState();
            
            // The test now calls the internal helper method which we have restored for testability
            const styles = view._calculateIndicatorStyles(8);

            const expectedLeft = 'calc(80px + (100% - 80px) * 0.5)';
            const expectedWidth = 'calc((100% - 80px) / 16)';

            runner.expect(styles.left).toBe(expectedLeft);
            runner.expect(styles.width).toBe(expectedWidth);
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
            instrument_kit: { KCK: 'test_kick', HHC: 'test_snare' }, // Using snare def for HHC visual
            instrumentDefsBySymbol: {
                test_kick: { name: 'Test Kick', sounds: [{ letter: 'o', svg: 'open.svg' }] },
                test_snare: { name: 'Test Snare', sounds: [{ letter: 'x', svg: 'presionado.svg' }] }
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