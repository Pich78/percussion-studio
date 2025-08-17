// file: src/components/AppMenuView/AppMenuView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';

const getTime = () => new Date().toISOString();

export class AppMenuView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        
        loadCSS('/percussion-studio/src/components/AppMenuView/AppMenuView.css');
        console.log(`[${getTime()}][AppMenuView][constructor][Initialization] Component created and styles loaded.`);
    }

    render(state) {
        console.log(`[${getTime()}][AppMenuView][render][Rendering] Rendering with Tachyons. State:`, state);
        if (!this.container) {
            console.error(`[${getTime()}][AppMenuView][render][Error] Container element is null.`);
            return;
        }

        const { isDirty, appView } = state;
        
        // Tachyons CSS classes
        const btnBase = "pv2 ph3 br2 f6 fw5 bn pointer";
        const btnPrimary = "bg-light-gray hover-bg-moon-gray dark-gray";
        const btnSave = "bg-blue hover-bg-dark-blue white";
        const disabledState = !isDirty ? 'o-50' : '';

        const toggleViewText = appView === 'editing' ? 'Go to Playing' : 'Go to Editing';

        const html = `
            <div class="flex items-center justify-between w-100">
                <div class="flex items-center">
                    <h1 class="f3 b dark-gray mr3">Percussion Studio</h1>
                    <button id="new-btn" class="${btnBase} ${btnPrimary} mr2">New</button>
                    <button id="load-btn" class="${btnBase} ${btnPrimary} mr2">Load</button>
                    <button id="save-btn" class="${btnBase} ${btnSave} ${disabledState}" ${!isDirty ? 'disabled' : ''}>Save</button>
                </div>
                <button id="toggle-view-btn" class="${btnBase} ${btnPrimary}">${toggleViewText}</button>
            </div>
        `;
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        console.log(`[${getTime()}][AppMenuView][attachEventListeners][Events] Attaching event listeners.`);
        this.container.querySelector('#new-btn')?.addEventListener('click', () => this.callbacks.onNewProject?.());
        this.container.querySelector('#load-btn')?.addEventListener('click', () => this.callbacks.onLoadProject?.());
        this.container.querySelector('#save-btn')?.addEventListener('click', () => this.callbacks.onSaveProject?.());
        this.container.querySelector('#toggle-view-btn')?.addEventListener('click', () => this.callbacks.onToggleView?.());
    }
}