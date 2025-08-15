// file: test/suites/view/TubsGridView.test.js (Complete, Final Corrected Version)
import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { TubsGridView } from '/percussion-studio/src/view/TubsGridView.js';
export async function run() {
const runner = new TestRunner();
MockLogger.clearLogs();
MockLogger.setLogTarget('log-output');

    const testContainer = document.getElementById('test-sandbox');const getMockState = (measureIndex = 0) => ({
    currentPatternId: 'p1',
    currentMeasureIndex: measureIndex,
    rhythm: {
        instrument_kit: { KCK: 'test_kick' },
        instrumentDefsBySymbol: {
            KCK: { symbol: 'KCK', name: 'Test Kick', sounds: [{ letter: 'o', svg: 'open.svg' }, { letter: 'x', svg: 'other.svg' }] }
        },
        patterns: {
            p1: {
                metadata: { resolution: 16 },
                pattern_data: [
                    { KCK: '||o---------------||' }, // Measure 0
                    { KCK: '||x---------------||' }  // Measure 1
                ]
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
        runner.expect(testContainer.querySelector('.instrument-header').dataset.symbol).toBe('KCK');
    });

    runner.it('should render the correct measure based on state.currentMeasureIndex', () => {
        testContainer.innerHTML = '';
        const view = new TubsGridView(testContainer, {});
        
        view.render(getMockState(1));
        
        const firstCellImg = testContainer.querySelector('.grid-cell img');
        runner.expect(firstCellImg !== null).toBe(true);
        runner.expect(firstCellImg.src.includes('other.svg')).toBe(true);
    });
});

runner.describe('TubsGridView Playback Indicator Logic', () => {
    runner.it('should calculate and set the correct style STRING on the indicator', () => {
        const log = new MockLogger('TEST LOG');
        testContainer.innerHTML = '';
        const state = getMockState();
        const view = new TubsGridView(testContainer, {});

        view.render(state);
        view.updatePlaybackIndicator(8); // Halfway point (8 / 16 = 0.5)
        
        const indicator = testContainer.querySelector('.playback-indicator');
        const actualStyle = indicator.style.left;

        // Use the component's static constant to build the expected strings
        const headerWidth = TubsGridView.HEADER_WIDTH_PX;
        const expectedStyle1 = `calc(${headerWidth}px + (100% - ${headerWidth}px) * 0.5)`;
        const expectedStyle2 = `calc(50% + ${headerWidth / 2}px)`; // Browser simplified version

        log.log('--- TEST VALIDATION DATA ---');
        log.log('Header Width Constant (px):', headerWidth);
        log.log('Actual Style String:', actualStyle);
        log.log('Expected Option 1:', expectedStyle1);
        log.log('Expected Option 2:', expectedStyle2);
        log.log('----------------------------');

        const isCorrect = (actualStyle === expectedStyle1 || actualStyle === expectedStyle2);
        runner.expect(isCorrect).toBe(true);
    });
});

runner.describe('User Interactions', () => {
    runner.it('should trigger onToggleMute callback with correct symbol on header click', () => {
        testContainer.innerHTML = '';
        let callbackSymbol = null;
        const mockCallbacks = {
            onToggleMute: (symbol) => { callbackSymbol = symbol; }
        };
        const view = new TubsGridView(testContainer, mockCallbacks);
        
        view.render(getMockState());

        const header = testContainer.querySelector('.instrument-header[data-symbol="KCK"]');
        runner.expect(header !== null).toBe(true);
        
        header.click();

        runner.expect(callbackSymbol).toBe('KCK');
    });
});

await runner.runAll();
runner.renderResults('test-results');
  
}
export function manualTest() {
const log = new MockLogger('Callbacks');
MockLogger.setLogTarget('log-output');
const callbacks = {
onToggleMute: (symbol) => {
log.log('onToggleMute callback triggered for: ${symbol}');
}
};
const container = document.getElementById('view-container');
const view = new TubsGridView(container, callbacks);
    const liveState = {
    currentPatternId: 'p1',
    currentMeasureIndex: 0,
    rhythm: {
        instrument_kit: { KCK: 'test_kick', SNR: 'test_snare' },
        instrumentDefsBySymbol: {
            KCK: { name: 'Test Kick', sounds: [{ letter: 'o', svg: 'open.svg' }, { letter: 'p', svg: 'presionado.svg' }] },
            SNR: { name: 'Test Snare', sounds: [{ letter: 'o', svg: 'open.svg' }] }
        },
        patterns: {
            p1: {
                metadata: { resolution: 16 },
                pattern_data: [
                    { // Measure 1
                        KCK: '||o---p---o---p---||',
                        SNR: '||----o-------o---||'
                    },
                    { // Measure 2
                        KCK: '||p---o---p---o---||',
                        SNR: '||o-------o-------||'
                    }
                ]
            }
        }
    }
};

view.render(liveState);return { view, state: liveState };
  
}