// file: src/components/EditorRowHeaderView/EditorRowHeaderView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { EditorRowHeaderView } from './EditorRowHeaderView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting EditorRowHeaderView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockProps = () => ({
        instrument: { 
            id: 'kck_1', 
            name: 'Kick Drum', 
            pack: 'Studio Kit' 
        },
        callbacks: {}
    });

    runner.describe('EditorRowHeaderView', () => {
        let view = null;
        
        runner.afterEach(() => {
            if (view) view.destroy();
        });

        runner.it('should render the instrument and pack names correctly', () => {
            testContainer.innerHTML = '';
            const props = getMockProps();
            view = new EditorRowHeaderView(testContainer, props);
            view.render();
            
            const nameEl = testContainer.querySelector('.editor-header__instrument-name');
            const packEl = testContainer.querySelector('.editor-header__pack-name');
            
            runner.expect(nameEl).not.toBe(null);
            runner.expect(packEl).not.toBe(null);
            runner.expect(nameEl.textContent).toBe('Kick Drum');
            runner.expect(packEl.textContent).toBe('Studio Kit');
        });
        
        runner.it('should fire onRequestInstrumentChange callback when clicked', () => {
            const callbackLog = new MockLogger('Callbacks');
            testContainer.innerHTML = '';
            const props = getMockProps();
            props.callbacks.onRequestInstrumentChange = (instrument) => callbackLog.log('onRequestInstrumentChange', instrument);

            view = new EditorRowHeaderView(testContainer, props);
            view.render();
            
            testContainer.click();

            callbackLog.wasCalledWith('onRequestInstrumentChange', props.instrument);
        });

        runner.it('should update its content when render is called with new data', () => {
            testContainer.innerHTML = '';
            const initialProps = getMockProps();
            view = new EditorRowHeaderView(testContainer, initialProps);
            view.render();

            let nameEl = testContainer.querySelector('.editor-header__instrument-name');
            runner.expect(nameEl.textContent).toBe('Kick Drum');

            const newInstrument = { id: 'snr_1', name: 'Snare', pack: 'Rock Kit' };
            view.render(newInstrument);

            nameEl = testContainer.querySelector('.editor-header__instrument-name');
            const packEl = testContainer.querySelector('.editor-header__pack-name');
            runner.expect(nameEl.textContent).toBe('Snare');
            runner.expect(packEl.textContent).toBe('Rock Kit');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'EditorRowHeaderView test suite finished.');
}