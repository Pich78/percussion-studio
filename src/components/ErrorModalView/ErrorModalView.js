// file: src/components/ErrorModalView/ErrorModalView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class ErrorModalView {
    constructor(appContainer, callbacks) {
        this.appContainer = appContainer;
        this.callbacks = callbacks || {};
        this.modalContainer = document.createElement('div');

        loadCSS('/percussion-studio/src/components/ErrorModalView/ErrorModalView.css');
        logEvent('info', 'ErrorModalView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render(state) {
        logEvent('debug', 'ErrorModalView', 'render', 'State', 'Rendering with state:', state);
        
        if (!state.error) {
            if (this.modalContainer.parentNode) {
                logEvent('debug', 'ErrorModalView', 'render', 'DOM', 'No error state. Removing modal from DOM.');
                this.appContainer.removeChild(this.modalContainer);
            }
            return;
        }

        const { message, details } = state.error;

        // Tachyons classes for styling
        const btnBase = "pv2 ph3 br2 f6 fw5 bn pointer";
        const btnOk = "bg-blue hover-bg-dark-blue white";
        const detailsBox = "bg-washed-red pa2 br2 mt3 tl f7 lh-copy code";

        const html = `
            <div class="modal-overlay flex items-center justify-center">
                <div class="modal-dialog bg-white pa4 br2 shadow-5 tc mw6">
                    <h3 class="f3 mt0 mb3 dark-red">An Error Occurred</h3>
                    <p class="f4 mb3">${message}</p>
                    ${details ? `<pre class="${detailsBox}">${details}</pre>` : ''}
                    <div class="modal-actions flex justify-end mt4">
                        <button id="error-ok-btn" class="${btnBase} ${btnOk}">OK</button>
                    </div>
                </div>
            </div>
        `;

        this.modalContainer.innerHTML = html;
        
        if (!this.modalContainer.parentNode) {
            logEvent('debug', 'ErrorModalView', 'render', 'DOM', 'Error state exists. Appending modal to DOM.');
            this.appContainer.appendChild(this.modalContainer);
        }

        this.attachEventListeners();
    }

    attachEventListeners() {
        logEvent('debug', 'ErrorModalView', 'attachEventListeners', 'Events', 'Attaching event listener.');
        this.modalContainer.querySelector('#error-ok-btn')?.addEventListener('click', () => {
            logEvent('info', 'ErrorModalView', 'handleDismiss', 'Callback', 'OK button clicked.');
            this.callbacks.onErrorDismiss?.();
        });
    }
}