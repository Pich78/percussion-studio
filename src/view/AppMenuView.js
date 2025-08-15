// file: src/view/AppMenuView.js (Complete)
export class AppMenuView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
    }

    render(state) {
        const { isDirty, appView } = state;
        const saveDisabled = !isDirty;

        // Determine button text based on the current view
        const toggleViewText = appView === 'editing' ? 'Go to Playing View' : 'Go to Editing View';

        const html = `
            <div class="app-menu">
                <button id="new-btn">New Project</button>
                <button id="load-btn">Load Project</button>
                <button id="save-btn" ${saveDisabled ? 'disabled' : ''}>Save Project</button>
                <button id="toggle-view-btn">${toggleViewText}</button>
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
        // Add event listener for the new button
        this.container.querySelector('#toggle-view-btn')?.addEventListener('click', () => {
            this.callbacks.onToggleView?.();
        });
    }
}
