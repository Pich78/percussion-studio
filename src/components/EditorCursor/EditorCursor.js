// file: src/components/EditorCursor/EditorCursor.js
import { logEvent } from '/percussion-studio/lib/Logger.js';

/**
 * A self-contained service that manages the creation, state, and position
 * of a custom "paintbrush" cursor for the editor. It is instantiated once
 * by a parent controller and commanded via its public methods.
 */
export class EditorCursor {
    constructor() {
        this.cursorEl = document.createElement('div');
        this.cursorEl.className = 'editor-cursor';
        document.body.appendChild(this.cursorEl);

        // Bind the move handler once for efficiency. The listener must be on `window`
        // to track the cursor's position anywhere on the screen.
        this._handleMouseMove = this._handleMouseMove.bind(this);
        window.addEventListener('mousemove', this._handleMouseMove, true);

        logEvent('info', 'EditorCursor', 'constructor', 'Lifecycle', 'EditorCursor service created and attached to window.');
    }

    /**
     * Updates the cursor's state (visibility and content).
     * This is the primary command method for the parent controller.
     * @param {object} state
     * @param {boolean} state.isVisible - Should the cursor be visible?
     * @param {string|null} state.svg - The SVG string to display as the cursor.
     */
    update({ isVisible, svg }) {
        if (isVisible && svg) {
            this.cursorEl.innerHTML = svg;
            this.cursorEl.style.display = 'block';
        } else {
            this.cursorEl.style.display = 'none';
        }
    }

    /**
     * Private handler to update the cursor's position on every mouse move.
     * @param {MouseEvent} event
     */
    _handleMouseMove(event) {
        // Center the 24x24px cursor element on the mouse pointer.
        // The subtraction of 12 is half the cursor's width/height.
        this.cursorEl.style.left = `${event.clientX - 12}px`;
        this.cursorEl.style.top = `${event.clientY - 12}px`;
    }

    /**
     * Cleans up the DOM element and event listeners to prevent memory leaks.
     * This should be called when the parent editor component is destroyed.
     */
    destroy() {
        window.removeEventListener('mousemove', this._handleMouseMove, true);
        if (this.cursorEl.parentNode) {
            this.cursorEl.parentNode.removeChild(this.cursorEl);
        }
        logEvent('info', 'EditorCursor', 'destroy', 'Lifecycle', 'EditorCursor service destroyed.');
    }
}