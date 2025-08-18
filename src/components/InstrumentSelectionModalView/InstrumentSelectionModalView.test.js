// file: src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentSelectionModalView } from './InstrumentSelectionModalView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting InstrumentSelectionModalView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockData = () => ({
        instrumentDefs: [ { symbol: 'KCK', name: 'Kick' }, { symbol: 'SNR', name: 'Snare' } ],
        soundPacks: [
            { symbol: 'KCK', pack_name: 'kick_1', name: 'Acoustic Kick' },
            { symbol: 'SNR', pack_name: 'snare_1', name: 'Rock Snare' },
            { symbol: 'SNR', pack_name: 'snare_2', name: 'Pop Snare' },
        ]
    });

    runner.describe('InstrumentSelectionModalView', () => {
        runner.it('should be hidden by default', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentSelectionModalView(testContainer, {});
            runner.expect(testContainer.classList.contains('is-visible')).toBe(false);
        });

        runner.it('should become visible when show() is called', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentSelectionModalView(testContainer, {});
            view.show(getMockData());
            runner.expect(testContainer.classList.contains('is-visible')).toBe(true);
        });

        runner.it('should update the sound pack list when an instrument type is clicked', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentSelectionModalView(testContainer, {});
            view.show(getMockData());

            // Initially shows 1 kick pack
            let packButtons = testContainer.querySelectorAll('[data-pack-name]');
            runner.expect(packButtons.length).toBe(1);
            runner.expect(packButtons[0].dataset.packName).toBe('kick_1');

            // Click on Snare
            testContainer.querySelector('button[data-symbol="SNR"]').click();
            
            // Now shows 2 snare packs
            packButtons = testContainer.querySelectorAll('[data-pack-name]');
            runner.expect(packButtons.length).toBe(2);
            runner.expect(packButtons[0].dataset.packName).toBe('snare_1');
        });

        runner.it('should fire onInstrumentSelected callback with correct data on confirm', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentSelectionModalView(testContainer, {
                onInstrumentSelected: (sel) => callbackLog.log('onInstrumentSelected', sel)
            });
            view.show(getMockData());

            // Select Snare type, then the second snare pack
            testContainer.querySelector('button[data-symbol="SNR"]').click();
            testContainer.querySelector('button[data-pack-name="snare_2"]').click();
            testContainer.querySelector('button[data-action="confirm"]').click();

            callbackLog.wasCalledWith('onInstrumentSelected', { symbol: 'SNR', packName: 'snare_2' });
            runner.expect(testContainer.classList.contains('is-visible')).toBe(false); // Should also hide
        });

        runner.it('should disable confirm button until a pack is selected', () => {
             testContainer.innerHTML = '';
            const view = new InstrumentSelectionModalView(testContainer, {});
            view.show(getMockData());

            // Confirm button is initially disabled
            let confirmBtn = testContainer.querySelector('button[data-action="confirm"]');
            runner.expect(confirmBtn.disabled).toBe(true);

            // Select a pack
            testContainer.querySelector('button[data-pack-name="kick_1"]').click();
            
            // Confirm button is now enabled
            confirmBtn = testContainer.querySelector('button[data-action="confirm"]');
            runner.expect(confirmBtn.disabled).toBe(false);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'InstrumentSelectionModalView test suite finished.');
}