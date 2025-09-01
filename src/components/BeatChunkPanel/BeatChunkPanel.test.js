// file: src/components/BeatChunkPanel/BeatChunkPanel.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { BeatChunkPanel } from './BeatChunkPanel.js';

// --- Custom Mocks for True Unit Testing ---
let lastInjectedHeaderComponent = null;
let instrumentRowInstanceCount = 0;
const MockInstrumentRowView = class {
    constructor({ headerPanel, gridPanel }, { HeaderComponent }) {
        lastInjectedHeaderComponent = HeaderComponent;
        instrumentRowInstanceCount++;
    }
    render(props) {}
    destroy() {}
};
const MockBeatRulerView = class { constructor() {}; render() {}; destroy() {}; };
class MockEditorHeader {}
class MockPlaybackHeader {}
// --- End of Mocks ---

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting BeatChunkPanel test suite.');
    
    const testContainer = document.getElementById('test-sandbox');
    const mockDependencies = {
        BeatRulerView: MockBeatRulerView,
        InstrumentRowView: MockInstrumentRowView
    };

    const getMockProps = (header = MockEditorHeader) => ({
        beatNumber: 1,
        boxesInChunk: 16,
        instruments: [ { id: 'k1', pattern: 'o---' } ],
        metrics: { beatGrouping: 4 },
        HeaderComponent: header
    });

    runner.describe('BeatChunkPanel (Unit Tests)', () => {
        let panel = null;
        
        runner.beforeEach(() => {
            lastInjectedHeaderComponent = null;
            instrumentRowInstanceCount = 0;
        });

        runner.afterEach(() => {
            if (panel) panel.destroy();
        });

        runner.it('should instantiate one InstrumentRowView for each instrument', () => {
            testContainer.innerHTML = '';
            panel = new BeatChunkPanel(testContainer, {}, mockDependencies);
            const props = getMockProps();
            props.instruments.push({ id: 's1', pattern: '----' });
            panel.render(props);
            
            runner.expect(instrumentRowInstanceCount).toBe(2);
        });

        runner.it('should inject the Editor header class into its child', () => {
            testContainer.innerHTML = '';
            panel = new BeatChunkPanel(testContainer, {}, mockDependencies);
            panel.render(getMockProps(MockEditorHeader));

            runner.expect(lastInjectedHeaderComponent).toBe(MockEditorHeader);
        });
        
        runner.it('should inject the Playback header class into its child', () => {
            testContainer.innerHTML = '';
            panel = new BeatChunkPanel(testContainer, {}, mockDependencies);
            panel.render(getMockProps(MockPlaybackHeader));

            runner.expect(lastInjectedHeaderComponent).toBe(MockPlaybackHeader);
        });
        
        runner.it('should call destroy on its child instances', () => {
            testContainer.innerHTML = '';
            panel = new BeatChunkPanel(testContainer, {}, mockDependencies);
            panel.render(getMockProps());
            
            let didDestroy = false;
            try {
                panel.destroy();
                didDestroy = true;
            } catch (e) { didDestroy = false; }
            
            runner.expect(didDestroy).toBe(true);
            runner.expect(testContainer.innerHTML).toBe('');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'BeatChunkPanel test suite finished.');
}