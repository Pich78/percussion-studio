// file: src/components/AppMenuView/AppMenuView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';

const getTime = () => new Date().toISOString();

export class AppMenuView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        
        // Load component-specific styles
        loadCSS('/percussion-studio/src/components/AppMenuView/AppMenuView.css');
        console.log(`[${getTime()}][AppMenuView][constructor][Initialization] Component created and styles loaded.`);
    }

    render(state) {
        console.log(`[${getTime()}][AppMenuView][render][Rendering] Rendering with state:`, state);
        if (!this.container) {
            console.error(`[${getTime()}][AppMenuView][render][Error] Container element is null. Cannot render.`);
            return;
        }

        const { isDirty, appView } = state;
        
        const btnBase = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150";
        const btnPrimary = "bg-slate-100 hover:bg-slate-200 text-slate-700";
        const btnSave = "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-slate-400";

        const toggleViewText = appView === 'editing' ? 'Go to Playing' : 'Go to Editing';

        const html = `
            <div class="flex items-center justify-between gap-4 w-full">
                <div class="flex items-center gap-4">
                    <h1 class="text-xl font-bold text-slate-700 mr-4">Percussion Studio</h1>
                    <button id="new-btn" class="${btnBase} ${btnPrimary}">New</button>
                    <button id="load-btn" class="${btnBase} ${btnPrimary}">Load</button>
                    <button id="save-btn" class="${btnBase} ${btnSave}" ${!isDirty ? 'disabled' : ''}>Save</button>
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