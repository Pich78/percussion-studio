// file: test/suites/view/TubsGridView.test.js (Complete)

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
        runner.it('should render the correct number of rows and cells', () => {
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
            const expectedSrc = '/percussion-studio/data/instruments/test_kick/kick_beater.svg';
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

export function manualTest() {
    const log = new MockLogger('Callbacks');
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