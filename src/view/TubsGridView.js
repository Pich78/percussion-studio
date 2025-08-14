// file: src/view/TubsGridView.js

export class TubsGridView {
    /**
     * @param {HTMLElement} container The DOM element to render the grid into.
     * @param {object} callbacks Functions for user interactions (e.g., onNoteClick).
     */
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
    }

    /**
     * Renders the entire grid based on the current application state.
     * @param {object} state The relevant slice of the application state, including
     *   the resolved rhythm, which patterns to display, etc.
     */
    render(state) {
        // Implementation to come...
        this.container.innerHTML = ``; // Start empty
    }

    /**
     * A dedicated, high-performance method to move the playback indicator.
     * @param {number} tick The current tick to highlight.
     */
    updatePlaybackIndicator(tick) {
        // Implementation to come...
    }
}