// file: src/components/PlaybackRowView/PlaybackRowView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { PlaybackRowView } from './PlaybackRowView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting PlaybackRowView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockProps = () => ({
        id: 'track_1',
        instrument: { 
            symbol: 'KCK', name: 'Kick Test', 
            sounds: [{letter: 'o', svg: '<svg>o</svg>'}] 
        },
        notation: '||o-o-o-o-||',
        metrics: { beatsPerMeasure: 4, beatUnit: 4, subdivision: 8, grouping: 2 },
        densityClass: 'density-medium',
        volume: 0.75,
        muted: false,
    });

    runner.describe('PlaybackRowView Rendering', () => {
        runner.it('should render the correct number of grid cells', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackRowView(testContainer, {});
            view.render(getMockProps());
            runner.expect(testContainer.querySelectorAll('.grid-cell').length).toBe(8);
        });

        runner.it('should render an InstrumentMixerView component inside it', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackRowView(testContainer, {});
            view.render(getMockProps());
            const mixerEl = testContainer.querySelector('.mixer-track');
            const sliderEl = testContainer.querySelector('.volume-slider');
            runner.expect(mixerEl).not.toBe(null);
            runner.expect(sliderEl).not.toBe(null);
            runner.expect(parseFloat(sliderEl.value)).toBe(0.75);
        });

        runner.it('should pass mute state correctly to the inner mixer component', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackRowView(testContainer, {});
            let props = getMockProps();
            props.muted = true;
            view.render(props);
            const mixerEl = testContainer.querySelector('.mixer-track');
            runner.expect(mixerEl.classList.contains('is-muted')).toBe(true);
        });
    });

    runner.describe('PlaybackRowView Callbacks', () => {
        runner.it('should fire onCellMouseDown when a grid cell is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PlaybackRowView(testContainer, {
                onCellMouseDown: (index) => callbackLog.log('onCellMouseDown', { index })
            });
            view.render(getMockProps());
            const cellToClick = testContainer.querySelector('[data-tick-index="3"]');
            cellToClick.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            callbackLog.wasCalledWith('onCellMouseDown', { index: 3 });
        });

        runner.it('should fire onToggleMute when mixer header is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PlaybackRowView(testContainer, {
                onToggleMute: (id) => callbackLog.log('onToggleMute', { id })
            });
            view.render(getMockProps());
            const mixerHeader = testContainer.querySelector('.instrument-header');
            mixerHeader.click();
            callbackLog.wasCalledWith('onToggleMute', { id: 'track_1' });
        });

        runner.it('should fire onVolumeChange when mixer slider is moved', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PlaybackRowView(testContainer, {
                onVolumeChange: (id, vol) => callbackLog.log('onVolumeChange', { id, vol })
            });
            view.render(getMockProps());
            const slider = testContainer.querySelector('.volume-slider');
            slider.value = 0.5;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
            callbackLog.wasCalledWith('onVolumeChange', { id: 'track_1', vol: 0.5 });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PlaybackRowView test suite finished.');
}