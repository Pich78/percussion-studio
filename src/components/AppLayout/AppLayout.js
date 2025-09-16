// file: src/components/AppLayout/AppLayout.js

import { eventBus } from '../EventBus/EventBus.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            height: 100vh;
            width: 100vw;
        }
        .app-layout {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            background-color: #f8f9fa;
        }
        .app-layout__header-area,
        .app-layout__footer-area {
            flex-shrink: 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 10;
        }
        .app-layout__main-area {
            flex-grow: 1;
            overflow-y: auto;
            position: relative;
        }
        .app-layout__footer-area:empty {
            display: none;
        }
    </style>
    <div class="app-layout">
        <header class="app-layout__header-area">
            <slot name="header"></slot>
        </header>
        <main class="app-layout__main-area">
            <!-- Main slot is programmatically populated -->
        </main>
        <footer class="app-layout__footer-area">
            <slot name="footer"></slot>
        </footer>
    </div>
`;

export class AppLayout extends HTMLElement {
    #currentView = null;
    #mainArea = null;
    #boundHandleModeChange;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.#mainArea = this.shadowRoot.querySelector('.app-layout__main-area');
        
        this.#boundHandleModeChange = this.#handleModeChange.bind(this);
    }

    connectedCallback() {
        eventBus.subscribe('app:mode-changed', this.#boundHandleModeChange);
    }

    disconnectedCallback() {
        // FIX: Corrected the typo from 'app-moxde-changed' to 'app:mode-changed'
        eventBus.unsubscribe('app:mode-changed', this.#boundHandleModeChange);
    }

    #handleModeChange(detail) {
        if (detail && detail.mode) {
            this.showView(detail.mode);
        }
    }

    async showView(viewName) {
        if (this.#currentView) {
            this.#currentView.remove();
            this.#currentView = null;
        }

        let newView;
        if (viewName === 'playback') {
            // UPDATED: Import the workbench-specific view
            await import('./PlaybackView_workbench.js');
            newView = document.createElement('playback-view-workbench');
        } else if (viewName === 'editor') {
            // UPDATED: Import the workbench-specific view
            await import('./EditorView_workbench.js');
            newView = document.createElement('editor-view-workbench');
        } else {
            console.warn(`AppLayout: Unknown view name "${viewName}".`);
            return;
        }

        if (newView) {
            this.#mainArea.appendChild(newView);
            this.#currentView = newView;
        }
    }
}

customElements.define('app-layout', AppLayout);