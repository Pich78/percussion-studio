// file: src/view/AppMenuView.js

/**
 * Renders the main application menu for high-level actions.
 */
export class AppMenuView {
    /**
     * @param {HTMLElement} container The DOM element to render the menu into.
     * @param {object} callbacks Functions for user actions, e.g., { onNewProject, onLoadProject, onSaveProject }.
     */
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
    }

    /**
     * Renders the menu based on the application state.
     * @param {object} state The relevant slice of the application state, e.g., { isDirty }.
     */
    render(state) {
        // Implementation to come...
        this.container.innerHTML = ``;
    }
}