// file: src/components/RadialSoundSelector/RadialSoundSelector.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { RadialSoundSelector } from './RadialSoundSelector.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting RadialSoundSelector test suite.');

    const mockSounds = [{letter: 'o', svg: '<svg>o</svg>'}, {letter: 'p', svg: '<svg>p</svg>'}];
    const getMenuEl = () => document.body.querySelector('.radial-menu');

    runner.describe('RadialSoundSelector', () => {
        let menu = null;

        runner.afterEach(() => {
            if (menu) {
                menu.destroy();
                menu = null;
            }
            const el = getMenuEl();
            if (el) el.remove();
        });

        runner.it('should not create a DOM element on instantiation', () => {
            menu = new RadialSoundSelector();
            runner.expect(getMenuEl()).toBe(null);
        });

        runner.it('should create a DOM element when show() is called', () => {
            menu = new RadialSoundSelector();
            menu.show({ x: 10, y: 10, sounds: mockSounds, activeSoundLetter: 'o' });
            runner.expect(getMenuEl()).not.toBe(null);
        });

        runner.it('should remove the DOM element when hide() is called', () => {
            menu = new RadialSoundSelector();
            menu.show({ x: 10, y: 10, sounds: mockSounds, activeSoundLetter: 'o' });
            runner.expect(getMenuEl()).not.toBe(null);
            
            menu.hide();
            runner.expect(getMenuEl()).toBe(null);
        });

        runner.it('should fire the onSoundSelected callback on mouse up when a sound is highlighted', () => {
            const callbackLog = new MockLogger('Callbacks');
            menu = new RadialSoundSelector({
                onSoundSelected: (letter) => callbackLog.log('onSoundSelected', letter)
            });
            
            menu.show({ x: 10, y: 10, sounds: mockSounds, activeSoundLetter: 'o' });
            
            // Manually simulate the state of a drag-selection
            menu.highlightedSound = 'p';
            
            // Manually trigger the mouse up handler
            menu._handleMouseUp();
            
            callbackLog.wasCalledWith('onSoundSelected', 'p');
        });

        runner.it('should NOT fire the onSoundSelected callback if no sound is highlighted', () => {
            const callbackLog = new MockLogger('Callbacks');
            menu = new RadialSoundSelector({
                onSoundSelected: (letter) => callbackLog.log('onSoundSelected', letter)
            });
            
            menu.show({ x: 10, y: 10, sounds: mockSounds, activeSoundLetter: 'o' });
            
            // Ensure no sound is highlighted
            menu.highlightedSound = null;
            
            menu._handleMouseUp();
            
            runner.expect(callbackLog.wasCalled('onSoundSelected')).toBe(false);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'RadialSoundSelector test suite finished.');
}