// file: src/components/EditorPlaybackControlsView/EditorPlaybackControlsView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { EditorPlaybackControlsView } from './EditorPlaybackControlsView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting EditorPlaybackControlsView unit test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    runner.describe('EditorPlaybackControlsView', () => {
        let view = null;
        let transportCallback, settingsCallback;

        const createMockCallbacks = () => {
            const spy = (name) => {
                const fn = (...args) => {
                    fn.called = true;
                    fn.callCount++;
                    fn.lastArgs = args;
                };
                fn.called = false;
                fn.callCount = 0;
                fn.lastArgs = null;
                fn.spyName = name;
                return fn;
            };
            transportCallback = spy('onTransport');
            settingsCallback = spy('onSettingsChange');
        };

        runner.beforeEach(() => {
            logEvent('info', 'TestRunner', 'beforeEach', 'Lifecycle', 'Setting up test environment.');
            testContainer.innerHTML = '';
            createMockCallbacks();
        });

        runner.afterEach(() => {
            logEvent('info', 'TestRunner', 'afterEach', 'Lifecycle', 'Tearing down test environment.');
            if (view) view.destroy();
        });
        
        runner.it('should render with initial default state', () => {
            view = new EditorPlaybackControlsView(testContainer, {});
            runner.expect(testContainer.querySelector('.playback-display-text').textContent).toBe('');
            runner.expect(testContainer.querySelector('[data-action="play"]').disabled).toBe(false);
            runner.expect(testContainer.querySelector('[data-action="pause"]').disabled).toBe(true);
            runner.expect(testContainer.querySelector('[data-action="stop"]').disabled).toBe(true);
            runner.expect(testContainer.querySelector('[data-action="loop"]').classList.contains('active')).toBe(true);
            runner.expect(testContainer.querySelector('[data-control="bpm"]').value).toBe('120');
            runner.expect(testContainer.querySelector('[data-control="volume"]').value).toBe('80');
        });

        runner.it('should call onTransport with "play" when play button is clicked', () => {
            view = new EditorPlaybackControlsView(testContainer, { onTransport: transportCallback });
            testContainer.querySelector('[data-action="play"]').click();
            runner.expect(transportCallback.called).toBe(true);
            runner.expect(transportCallback.lastArgs[0]).toEqual({ action: 'play' });
            runner.expect(testContainer.querySelector('[data-action="play"]').disabled).toBe(true);
        });

        runner.it('should call onSettingsChange when loop button is clicked', () => {
            view = new EditorPlaybackControlsView(testContainer, { onSettingsChange: settingsCallback });
            testContainer.querySelector('[data-action="loop"]').click(); // Toggles to off
            runner.expect(settingsCallback.called).toBe(true);
            runner.expect(settingsCallback.lastArgs[0]).toEqual({ isLooping: false });
            runner.expect(testContainer.querySelector('[data-action="loop"]').classList.contains('active')).toBe(false);
        });

        runner.it('should call onSettingsChange when BPM is changed', () => {
            view = new EditorPlaybackControlsView(testContainer, { onSettingsChange: settingsCallback });
            const bpmInput = testContainer.querySelector('[data-control="bpm"]');
            bpmInput.value = '150';
            bpmInput.dispatchEvent(new Event('input', { bubbles: true }));
            runner.expect(settingsCallback.called).toBe(true);
            runner.expect(settingsCallback.lastArgs[0]).toEqual({ bpm: 150 });
        });

        runner.it('should call onSettingsChange when Volume is changed', () => {
            view = new EditorPlaybackControlsView(testContainer, { onSettingsChange: settingsCallback });
            const volumeInput = testContainer.querySelector('[data-control="volume"]');
            volumeInput.value = '50';
            volumeInput.dispatchEvent(new Event('input', { bubbles: true }));
            runner.expect(settingsCallback.called).toBe(true);
            runner.expect(settingsCallback.lastArgs[0]).toEqual({ volume: 50 });
        });
        
        runner.it('should update the display text via the updateDisplayText method', () => {
            view = new EditorPlaybackControlsView(testContainer, { initialDisplayText: 'Hello' });
            runner.expect(testContainer.querySelector('.playback-display-text').textContent).toBe('Hello');
            view.updateDisplayText('World');
            runner.expect(testContainer.querySelector('.playback-display-text').textContent).toBe('World');
        });

        runner.it('should correctly manage disabled state of transport buttons', () => {
            view = new EditorPlaybackControlsView(testContainer, {});
            
            // --- FIX: Query for buttons inside the test and re-query after each click ---
            let playBtn, pauseBtn, stopBtn;

            const queryButtons = () => {
                playBtn = testContainer.querySelector('[data-action="play"]');
                pauseBtn = testContainer.querySelector('[data-action="pause"]');
                stopBtn = testContainer.querySelector('[data-action="stop"]');
            };
            
            queryButtons();

            // Initial: STOPPED
            runner.expect(playBtn.disabled).toBe(false, 'Play should be enabled when stopped');
            runner.expect(pauseBtn.disabled).toBe(true, 'Pause should be disabled when stopped');
            runner.expect(stopBtn.disabled).toBe(true, 'Stop should be disabled when stopped');

            // Click Play -> PLAYING
            playBtn.click();
            queryButtons(); // Re-query after render
            runner.expect(playBtn.disabled).toBe(true, 'Play should be disabled when playing');
            runner.expect(pauseBtn.disabled).toBe(false, 'Pause should be enabled when playing');
            runner.expect(stopBtn.disabled).toBe(false, 'Stop should be enabled when playing');

            // Click Pause -> PAUSED
            pauseBtn.click();
            queryButtons(); // Re-query after render
            runner.expect(playBtn.disabled).toBe(false, 'Play should be enabled when paused');
            runner.expect(pauseBtn.disabled).toBe(true, 'Pause should be disabled when paused');
            runner.expect(stopBtn.disabled).toBe(false, 'Stop should be enabled when paused');
            
            // Click Stop -> STOPPED
            stopBtn.click();
            queryButtons(); // Re-query after render
            runner.expect(playBtn.disabled).toBe(false, 'Play should be enabled after stop');
            runner.expect(pauseBtn.disabled).toBe(true, 'Pause should be disabled after stop');
            runner.expect(stopBtn.disabled).toBe(true, 'Stop should be disabled after stop');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'EditorPlaybackControlsView test suite finished.');
}