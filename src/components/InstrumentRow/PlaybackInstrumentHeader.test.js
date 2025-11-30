// file: src/components/InstrumentRow/PlaybackInstrumentHeader.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import './PlaybackInstrumentHeader.js';

export async function run() {
    const runner = new TestRunner();
    const sandbox = document.getElementById('test-sandbox');

    const MOCK_INSTRUMENT = { name: 'Kick', pack: '808', volume: 0.75 };

    runner.afterEach(() => { sandbox.innerHTML = ''; });

    runner.describe('Rendering', () => {
        runner.it('should render the name, pack, and volume correctly', () => {
            const header = document.createElement('playback-instrument-header');
            header.instrument = MOCK_INSTRUMENT;
            sandbox.appendChild(header);

            const name = header.shadowRoot.querySelector('.instrument-name').textContent;
            const pack = header.shadowRoot.querySelector('.pack-name').textContent;
            const volume = header.shadowRoot.querySelector('.volume-slider').value;

            runner.expect(name).toBe('Kick');
            runner.expect(pack).toBe('808');
            runner.expect(parseFloat(volume)).toBe(0.75);
        });
    });

    runner.describe('Events', () => {
        runner.it('should dispatch "volume-changed" on slider input', async () => {
            const header = document.createElement('playback-instrument-header');
            header.instrument = MOCK_INSTRUMENT;
            sandbox.appendChild(header);

            // FIX: Manually create a Promise to wait for the event.
            const eventPromise = new Promise(resolve => {
                header.addEventListener('volume-changed', (event) => {
                    resolve(event);
                }, { once: true }); // Automatically remove listener after it fires
            });

            const slider = header.shadowRoot.querySelector('.volume-slider');
            slider.value = 0.5;
            slider.dispatchEvent(new Event('input', { bubbles: true }));

            // Await the promise to resolve when the event is caught.
            const event = await eventPromise;

            runner.expect(event.detail.volume).toBe(0.5);
        });

        runner.it('should dispatch "mute-toggled" on text area click', async () => {
            const header = document.createElement('playback-instrument-header');
            header.instrument = MOCK_INSTRUMENT;
            sandbox.appendChild(header);

            // FIX: Use the same reliable Promise-based pattern.
            const eventPromise = new Promise(resolve => {
                header.addEventListener('mute-toggled', (event) => {
                    resolve(event);
                }, { once: true });
            });
            
            header.shadowRoot.querySelector('.text-info').click();

            const event = await eventPromise;
            runner.expect(event).not.toBe(null);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}