// file: src/components/AppMenuView/AppMenuView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class AppMenuView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        
        loadCSS('/percussion-studio/src/components/AppMenuView/AppMenuView.css');
        logEvent('info', 'AppMenuView', 'constructor', 'Lifecycle', 'Component created.');
        
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.container.addEventListener('click', this.handleClick.bind(this));
    }

    render(state) {
        logEvent('debug', 'AppMenuView', 'render', 'State', 'Rendering with state:', state);
        const { isDirty, appView, isMenuOpen } = state;

        // --- NEW LOGIC: Manage the global "click outside" listener ---
        if (isMenuOpen) {
            document.addEventListener('click', this.handleOutsideClick, true);
        } else {
            document.removeEventListener('click', this.handleOutsideClick, true);
        }

        const menuStateClass = isMenuOpen ? 'is-open' : 'is-closed';
        const btnBase = "w-100 tl pa2 bn bg-transparent hover-bg-light-gray pointer f6";
        const btnDisabled = "o-50 not-allowed";

        let menuItems = '';
        if (appView === 'playing') {
            menuItems = `
                <button data-action="load" class="${btnBase}">Load Rhythm</button>
                <button data-action="toggle-view" class="${btnBase}">Editor</button>
            `;
        } else {
            menuItems = `
                <button data-action="new" class="${btnBase}">New Rhythm</button>
                <button data-action="load" class="${btnBase}">Load Rhythm</button>
                <button data-action="save" class="${btnBase} ${!isDirty ? btnDisabled : ''}" ${!isDirty ? 'disabled' : ''}>Save Rhythm and Patterns</button>
                <button data-action="toggle-view" class="${btnBase}">Playback</button>
            `;
        }

        const html = `
            <div class="flex items-center justify-between w-100 relative">
                <div class="flex items-center">
                    <button data-action="toggle-menu" class="pv2 ph3 br2 bn bg-transparent hover-bg-light-gray pointer f4 mr3">☰</button>
                    <h1 class="f3 b dark-gray">Percussion Studio</h1>
                </div>
                <div class="app-menu-dropdown ${menuStateClass} bg-white br2 w5 mt2">${menuItems}</div>
            </div>
        `;
        this.container.innerHTML = html;
    }

    handleClick(event) {
        const button = event.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        logEvent('debug', 'AppMenuView', 'handleClick', 'Events', `Button clicked with action: ${action}`);

        const actions = {
            'toggle-menu': () => this.callbacks.onToggleMenu?.(),
            'new': () => this.callbacks.onNewProject?.(),
            'load': () => this.callbacks.onLoadProject?.(),
            'save': () => this.callbacks.onSaveProject?.(),
            'toggle-view': () => this.callbacks.onToggleView?.(),
        };

        if (actions[action]) {
            actions[action]();
            // Automatically request to close the menu on any action except toggling it
            if (action !== 'toggle-menu') {
                this.callbacks.onToggleMenu?.(false); // Force close
            }
        }
    }

    handleOutsideClick(event) {
        if (!this.container.contains(event.target)) {
            logEvent('debug', 'AppMenuView', 'handleOutsideClick', 'UI', 'Clicked outside component, requesting menu close.');
            this.callbacks.onToggleMenu?.(false); // Force close
        }
    }
}