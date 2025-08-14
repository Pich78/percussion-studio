// file: src/view/ConfirmationDialogView.js (Complete)

export class ConfirmationDialogView {
    constructor(container) {
        this.container = container;
        this.state = {}; // To hold a reference to the confirmation object

        // Bind event handlers to 'this' instance
        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    render(state) {
        // Store the state, which contains the message and callbacks
        this.state = state;
        
        // If there's no confirmation request, render nothing.
        if (!state.confirmation) {
            this.clear();
            return;
        }

        const { message } = state.confirmation;

        const html = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <p>${message}</p>
                    <div class="modal-actions">
                        <button id="confirm-btn">Confirm</button>
                        <button id="cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        // Create a temporary element to hold the modal, so we don't
        // overwrite the container's other children.
        this.modalElement = document.createElement('div');
        this.modalElement.innerHTML = html;
        this.container.appendChild(this.modalElement);

        this.attachEventListeners();
    }

    attachEventListeners() {
        this.container.querySelector('#confirm-btn')?.addEventListener('click', this.handleConfirm);
        this.container.querySelector('#cancel-btn')?.addEventListener('click', this.handleCancel);
    }

    handleConfirm() {
        // Call the onConfirm function that was passed in the state object.
        this.state.confirmation?.onConfirm?.();
    }

    handleCancel() {
        // Call the onCancel function that was passed in the state object.
        this.state.confirmation?.onCancel?.();
    }

    /**
     * Helper method to safely remove the modal from the DOM.
     */
    clear() {
        if (this.modalElement) {
            this.container.removeChild(this.modalElement);
            this.modalElement = null;
        }
    }
}