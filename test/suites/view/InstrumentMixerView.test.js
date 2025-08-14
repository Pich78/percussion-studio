// file: test/suites/view/InstrumentMixerView.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { InstrumentMixerView } from '/percussion-studio/src/view/InstrumentMixerView.js';

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

    const getMockState = () => ({
        rhythm: {
            instrument_kit: {
                KCK: 'test_kick',
                SNR: 'test_snare',
                HHC: 'test_hihat'
            },
            // A dedicated object to track volumes and mute status
            mixer: {
                test_kick: { volume: 1.0, muted: false },
                test_snare: { volume: 0.8, muted: true },
                test_hihat: { volume: 0.5, muted: false }
            }
        }
    });

    runner.describe('InstrumentMixerView Rendering', () => {
        runner.it('should render a track for each instrument in the kit', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentMixerView(testContainer, {});
            view.render(getMockState());

            const tracks = testContainer.querySelectorAll('.mixer-track');
            runner.expect(tracks.length).toBe(3);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

/** Sets up the interactive workbench */
export function manualTest() {
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output');
    
    const callbacks = {
        onVolumeChange: (instrumentId, volume) => log.log('onVolumeChange', { instrumentId, volume }),
        onToggleMute: (instrumentId, muted) => log.log('onToggleMute', { instrumentId, muted })
    };

    const container = document.getElementById('view-container');
    const view = new InstrumentMixerView(container, callbacks);

    const mockState = {
        rhythm: {
            instrument_kit: { KCK: 'test_kick', SNR: 'test_snare', HHC: 'test_hihat' },
            mixer: {
                test_kick: { volume: 1.0, muted: false },
                test_snare: { volume: 0.8, muted: false },
                test_hihat: { volume: 0.5, muted: true }
            }
        }
    };
    
    view.render(mockState);
}