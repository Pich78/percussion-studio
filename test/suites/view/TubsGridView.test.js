// file: test/suites/view/TubsGridView.test.js (Final Corrected Version)

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
            instruments: { test_kick: { name: 'Test Kick', sounds: [{ letter: 'o', svg: 'kick_beater.svg' }] } },
            patterns: { p1: { metadata: { resolution: 16 }, pattern_data: [{ KCK: '||o---------------||' }] } }
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
        runner.it('should update the left style of the indicator', () => {
            testContainer.innerHTML = '';
            const state = getMockState();
            const view = new TubsGridView(testContainer, {});
            view.render(state); // Render first
            
            // The view needs the rhythm data to calculate the percentage
            view.rhythm = state.rhythm; 
            view.rhythm.currentPatternId = state.currentPatternId;
            
            view.updatePlaybackIndicator(8); // Move to the halfway point (tick 8 of 16)
            const indicator = testContainer.querySelector('.playback-indicator');
            // Check that the left style is set to 50% (plus the 80px header offset)
            runner.expect(indicator.style.left).toBe('calc(80px + 50%)');
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
                    { letter: 'o', svg: 'kick_beater.svg' }, { letter: 'x', svg: 'kick_beater.svg' }
                ]}
            },
            patterns: { p1: { metadata: { resolution: 16 }, pattern_data: [{
                        KCK: '||o---o---o---o---||', HHC: '||x-x-x-x-x-x-x-x-||'
            }]}}
        }
    };
    view.render(liveState);
    return { view, state: liveState }; // Return state for the harness to use
}