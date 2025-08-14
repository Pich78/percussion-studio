// file: src/view/ErrorModalView.js (Complete)

export class ErrorModalView {
    constructor(appContainer, callbacks) {
        this.appContainer = appContainer;
        this.callbacks = callbacks || {};
        this.modalContainer = document.createElement('div');
        this.handleDismiss = this.handleDismiss.bind(this);
    }

    render(state) {
        if (!state.error) {
            if (this.modalContainer.parentNode === this.appContainer) {
                this.appContainer.removeChild(this.modalContainer);
            }
            return;
        }

        const { message, details } = state.error;

        const html = `
            <div class="modal-overlay">
                <div class="modal-dialog">
                    <h3>Error</h3>
                    <p>${message}</p>
                    ${details ? `<pre class="modal-details">${details}</pre>` : ''}
                    <div class="modal-actions">
                        <button id="error-ok-btn">OK</button>
                    </div>
                </div>
            </div>
        `;

        this.modalContainer.innerHTML = html;
        
        if (this.modalContainer.parentNode !== this.appContainer) {
            this.appContainer.appendChild(this.modalContainer);
        }

        this.attachEventListeners();
    }

    attachEventListeners() {
        this.modalContainer.querySelector('#error-ok-btn')?.addEventListener('click', this.handleDismiss);
    }

    handleDismiss() {
        this.callbacks.onErrorDismiss?.();
    }
}