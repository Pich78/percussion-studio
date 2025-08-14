// file: src/view/RhythmEditorView.js

/**
 * Renders the UI for managing the playback_flow (adding, removing, reordering patterns).
 */
export class RhythmEditorView {
    /**
     * @param {HTMLElement} container The DOM element to render the editor into.
     * @param {object} callbacks Functions to call for user actions, e.g., { onFlowChange }.
     */
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
    }

    /**
     * Renders the editor based on the application state.
     * @param {object} state The relevant slice of the application state.
     */
    render(state) {
        // Implementation to come...
        this.container.innerHTML = ``;
    }
}