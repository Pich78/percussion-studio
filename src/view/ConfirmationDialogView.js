// file: src/view/ConfirmationDialogView.js

/**
 * Renders a modal dialog to confirm a destructive action.
 * This view only renders content when state.confirmation is populated.
 */
export class ConfirmationDialogView {
    /**
     * @param {HTMLElement} container The DOM element to render the dialog into (usually document.body).
     */
    constructor(container) {
        this.container = container;
        this.state = {}; // To hold a reference to the confirmation callbacks
    }

    /**
     * Renders the dialog based on the application state.
     * @param {object} state The application state, specifically the `confirmation` property.
     */
    render(state) {
        // Implementation to come...
    }
}