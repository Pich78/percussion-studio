// file: src/view/ConfirmationDialogView.js (Complete, Final Version)

export class ConfirmationDialogView {
    constructor(appContainer) {
        // The view will append its modal to this container (e.g., document.body)
        this.appContainer = appContainer;
        this.state = {};

        // The view creates and manages its own root element
        this.modalContainer = document.createElement('div');

        // Bind event handlers to 'this' instance
        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    render(state) {
        this.state = state;
        
        // If there's no confirmation request, ensure the modal is removed from the DOM.
        if (!state.confirmation) {
            if (this.modalContainer.parentNode === this.appContainer) {
                this.appContainer.removeChild(this.modalContainer);
            }
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

        this.modalContainer.innerHTML = html;
        
        // Ensure the modal is in the DOM before attaching listeners
        if (this.modalContainer.parentNode !== this.appContainer) {
            this.appContainer.appendChild(this.modalContainer);
        }

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Query within the view's own managed container for robustness
        this.modalContainer.querySelector('#confirm-btn')?.addEventListener('click', this.handleConfirm);
        this.modalContainer.querySelector('#cancel-btn')?.addEventListener('click', this.handleCancel);
    }

    handleConfirm() {
        this.state.confirmation?.onConfirm?.();
    }

    handleCancel() {
        this.state.confirmation?.onCancel?.();
    }
}