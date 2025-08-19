// file: src/components/EditorCursor/EditorCursor.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { EditorCursor } from './EditorCursor.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting EditorCursor test suite.');

    const getCursorEl = () => document.body.querySelector('.editor-cursor');

    runner.describe('EditorCursor', () => {
        // --- FIX: Declare cursor here to make it accessible in the cleanup hook ---
        let cursor = null;

        // --- FIX: Use afterEach to guarantee cleanup after every test ---
        runner.afterEach(() => {
            if (cursor) {
                cursor.destroy();
                cursor = null;
            }
            // Also clean the DOM just in case something went wrong before instantiation
            const existingEl = getCursorEl();
            if (existingEl) existingEl.remove();
        });

        runner.it('should create a cursor div in the document body on instantiation', () => {
            cursor = new EditorCursor();
            runner.expect(getCursorEl()).not.toBe(null);
        });

        runner.it('should be hidden by default', () => {
            cursor = new EditorCursor();
            const el = getCursorEl();
            runner.expect(window.getComputedStyle(el).display).toBe('none');
        });

        runner.it('should become visible and show SVG content when update is called', () => {
            cursor = new EditorCursor();
            const el = getCursorEl();
            const mockSvg = '<svg>test</svg>';

            cursor.update({ isVisible: true, svg: mockSvg });

            runner.expect(window.getComputedStyle(el).display).toBe('block');
            runner.expect(el.innerHTML).toBe(mockSvg);
        });

        runner.it('should become hidden when update is called with isVisible: false', () => {
            cursor = new EditorCursor();
            const el = getCursorEl();
            
            cursor.update({ isVisible: true, svg: '<svg></svg>' });
            runner.expect(window.getComputedStyle(el).display).toBe('block');
            
            cursor.update({ isVisible: false, svg: null });
            runner.expect(window.getComputedStyle(el).display).toBe('none');
        });
        
        runner.it('should remove its element from the DOM when destroy is called', () => {
            cursor = new EditorCursor();
            runner.expect(getCursorEl()).not.toBe(null);
            
            cursor.destroy();
            runner.expect(getCursorEl()).toBe(null);
            cursor = null; // Prevent afterEach from trying to destroy it again
        });

        runner.it('should update its position on a window mousemove event', () => {
            cursor = new EditorCursor();
            const el = getCursorEl();

            const moveEvent = new MouseEvent('mousemove', { bubbles: true, clientX: 200, clientY: 300 });
            window.dispatchEvent(moveEvent);

            runner.expect(el.style.left).toBe('188px');
            runner.expect(el.style.top).toBe('288px');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'EditorCursor test suite finished.');
}