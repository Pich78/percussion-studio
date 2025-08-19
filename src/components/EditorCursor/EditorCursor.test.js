// file: src/components/EditorCursor/EditorCursor.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { EditorCursor } from './EditorCursor.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting EditorCursor test suite.');

    const getCursorEl = () => document.querySelector('.editor-cursor');

    runner.describe('EditorCursor', () => {
        // Use beforeEach and afterEach to ensure a clean slate for every test
        runner.beforeEach(() => {
            // Clean up any cursors from previous tests
            const existingCursor = getCursorEl();
            if (existingCursor) existingCursor.remove();
        });
        
        runner.afterEach(() => {
            const existingCursor = getCursorEl();
            if (existingCursor) existingCursor.remove();
        });

        runner.it('should create a cursor div in the document body on instantiation', () => {
            const cursor = new EditorCursor();
            runner.expect(getCursorEl()).not.toBe(null);
            cursor.destroy(); // Cleanup
        });

        runner.it('should be hidden by default', () => {
            const cursor = new EditorCursor();
            const el = getCursorEl();
            runner.expect(window.getComputedStyle(el).display).toBe('none');
            cursor.destroy();
        });

        runner.it('should become visible and show SVG content when update is called', () => {
            const cursor = new EditorCursor();
            const el = getCursorEl();
            const mockSvg = '<svg>test</svg>';

            cursor.update({ isVisible: true, svg: mockSvg });

            runner.expect(window.getComputedStyle(el).display).toBe('block');
            runner.expect(el.innerHTML).toBe(mockSvg);
            cursor.destroy();
        });

        runner.it('should become hidden when update is called with isVisible: false', () => {
            const cursor = new EditorCursor();
            const el = getCursorEl();
            
            // First show it
            cursor.update({ isVisible: true, svg: '<svg></svg>' });
            runner.expect(window.getComputedStyle(el).display).toBe('block');
            
            // Then hide it
            cursor.update({ isVisible: false, svg: null });
            runner.expect(window.getComputedStyle(el).display).toBe('none');
            cursor.destroy();
        });
        
        runner.it('should remove its element from the DOM when destroy is called', () => {
            const cursor = new EditorCursor();
            runner.expect(getCursorEl()).not.toBe(null);
            
            cursor.destroy();
            runner.expect(getCursorEl()).toBe(null);
        });

        runner.it('should update its position on a window mousemove event', () => {
            const cursor = new EditorCursor();
            const el = getCursorEl();

            // Simulate a mouse move event
            const moveEvent = new MouseEvent('mousemove', { bubbles: true, clientX: 200, clientY: 300 });
            window.dispatchEvent(moveEvent);

            // Expect position to be clientX/Y minus half the cursor size (12)
            runner.expect(el.style.left).toBe('188px');
            runner.expect(el.style.top).toBe('288px');
            cursor.destroy();
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'EditorCursor test suite finished.');
}