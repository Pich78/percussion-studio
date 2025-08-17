// file: src/components/ConfirmationDialogView/ConfirmationDialogView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class ConfirmationDialogView {
    constructor(appContainer) {
        this.appContainer = appContainer;
        this.state = {};
        this.modalContainer = document.createElement('div');

        loadCSS('/percussion-studio/src/components/ConfirmationDialogView/ConfirmationDialogView.css');
        logEvent('info', 'ConfirmationDialogView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render(state) {
        logEvent('debug', 'ConfirmationDialogView', 'render', 'State', 'Rendering with state:', state);
        this.state = state;
        
        if (!state.confirmation) {
            if (this.modalContainer.parentNode) {
                logEvent('debug', 'ConfirmationDialogView', 'render', 'DOM', 'No confirmation state. Removing modal from DOM.');
                this.appContainer.removeChild(this.modalContainer);
            }
            return;
        }

        const { message } = state.confirmation;

        // Tachyons classes for styling
        const btnBase = "pv2 ph3 br2 f6 fw5 bn pointer";
        const btnConfirm = "bg-dark-red hover-bg-red white";
        const btnCancel = "bg-light-gray hover-bg-moon-gray dark-gray";

        const html = `
            <div class="modal-overlay flex items-center justify-center">
                <div class="modal-dialog bg-white pa4 br2 shadow-5 tc">
                    <p class="f4 mb4">${message}</p>
                    <div class="modal-actions flex justify-end">
                        <button id="cancel-btn" class="${btnBase} ${btnCancel} mr2">Cancel</button>
                        <button id="confirm-btn" class="${btnBase} ${btnConfirm}">Confirm</button>
                    </div>
                </div>
            </div>
        `;

        this.modalContainer.innerHTML = html;
        
        if (!this.modalContainer.parentNode) {
            logEvent('debug', 'ConfirmationDialogView', 'render', 'DOM', 'Confirmation state exists. Appending modal to DOM.');
            this.appContainer.appendChild(this.modalContainer);
        }

        this.attachEventListeners();
    }

    attachEventListeners() {
        logEvent('debug', 'ConfirmationDialogView', 'attachEventListeners', 'Events', 'Attaching event listeners.');
        this.modalContainer.querySelector('#confirm-btn')?.addEventListener('click', () => {
            logEvent('info', 'ConfirmationDialogView', 'handleConfirm', 'Callback', 'Confirm button clicked.');
            this.state.confirmation?.onConfirm?.();
        });
        this.modalContainer.querySelector('#cancel-btn')?.addEventListener('click', () => {
            logEvent('info', 'ConfirmationDialogView', 'handleCancel', 'Callback', 'Cancel button clicked.');
            this.state.confirmation?.onCancel?.();
        });
    }
}