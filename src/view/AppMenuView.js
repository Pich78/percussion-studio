// file: src/view/AppMenuView.js (Complete)

export class AppMenuView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
    }

    render(state) {
        const { isDirty } = state;
        const saveDisabled = !isDirty;

        const html = `
            <div class="app-menu">
                <button id="new-btn">New</button>
                <button id="load-btn">Load</button>
                <button id="save-btn" ${saveDisabled ? 'disabled' : ''}>Save</button>
            </div>
        `;
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.container.querySelector('#new-btn')?.addEventListener('click', () => {
            this.callbacks.onNewProject?.();
        });
        this.container.querySelector('#load-btn')?.addEventListener('click', () => {
            this.callbacks.onLoadProject?.();
        });
        this.container.querySelector('#save-btn')?.addEventListener('click', () => {
            this.callbacks.onSaveProject?.();
        });
    }
}