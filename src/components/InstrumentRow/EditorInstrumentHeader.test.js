// file: src/components/InstrumentRow/EditorInstrumentHeader.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import './EditorInstrumentHeader.js';

export async function run() {
    const runner = new TestRunner();
    const sandbox = document.getElementById('test-sandbox');

    const MOCK_INSTRUMENT = { id: 'snare-909', name: 'Snare', pack: '909' };

    runner.afterEach(() => { sandbox.innerHTML = ''; });

    runner.it('should render the name and pack correctly', () => {
        const header = document.createElement('editor-instrument-header');
        header.instrument = MOCK_INSTRUMENT;
        sandbox.appendChild(header);

        const name = header.shadowRoot.querySelector('.instrument-name').textContent;
        const pack = header.shadowRoot.querySelector('.pack-name').textContent;

        runner.expect(name).toBe('Snare');
        runner.expect(pack).toBe('909');
    });

    runner.it('should dispatch "edit-instrument-requested" on click', async () => {
        const header = document.createElement('editor-instrument-header');
        header.instrument = MOCK_INSTRUMENT;
        sandbox.appendChild(header);

        // FIX: Manually create a Promise to wait for the event.
        const eventPromise = new Promise(resolve => {
            header.addEventListener('edit-instrument-requested', (event) => {
                resolve(event);
            }, { once: true }); // Automatically remove listener after it fires
        });

        // The component's root is the clickable area
        header.click();

        // Await the promise to resolve when the event is caught.
        const event = await eventPromise;
        
        runner.expect(event.detail.instrumentId).toBe('snare-909');
    });

    await runner.runAll();
    runner.renderResults('test-results');
}