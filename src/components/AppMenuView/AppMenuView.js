// file: src/components/AppMenuView/AppMenuView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class AppMenuView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.isMenuOpen = false; // Internal UI state for the dropdown
        this.state = {}; // A copy of the app's state for re-rendering

        loadCSS('/percussion-studio/src/components/AppMenuView/AppMenuView.css');
        logEvent('info', 'AppMenuView', 'constructor', 'Lifecycle', 'Component created.');
        
        // Bind methods to ensure 'this' is correct
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }

    render(state) {
        this.state = state; // Cache the latest state
        logEvent('debug', 'AppMenuView', 'render', 'State', 'Rendering with state:', state);
        
        const { appView } = state;

        const html = `
            <div class="flex items-center justify-between w-100 relative">
                <h1 class="f3 b dark-gray">Percussion Studio</h1>
                <button id="hamburger-btn" class="pv2 ph3 br2 bn bg-transparent hover-bg-light-gray pointer f4">☰</button>
                ${this._renderMenu(state)}
            </div>
        `;
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    _renderMenu(state) {
        const { isDirty, appView } = state;
        const menuStateClass = this.isMenuOpen ? 'is-open' : 'is-closed';

        const btnBase = "w-100 tl pa2 bn bg-transparent hover-bg-light-gray pointer f6";
        const btnDisabled = "o-50 not-allowed";

        let menuItems = '';
        if (appView === 'playing') {
            menuItems = `
                <button id="load-btn" class="${btnBase}">Load Rhythm</button>
                <button id="toggle-view-btn" class="${btnBase}">Editor Mode</button>
            `;
        } else { // 'editing' view
            menuItems = `
                <button id="new-btn" class="${btnBase}">New Rhythm</button>
                <button id="load-btn" class="${btnBase}">Load Rhythm</button>
                <button id="save-btn" class="${btnBase} ${!isDirty ? btnDisabled : ''}" ${!isDirty ? 'disabled' : ''}>Save Rhythm and Patterns</button>
                <button id="toggle-view-btn" class="${btnBase}">Playback Mode</button>
            `;
        }

        return `
            <div class="app-menu-dropdown ${menuStateClass} bg-white br2 w5 mt2">
                <div class="pa2">
                    ${menuItems}
                </div>
            </div>
        `;
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        logEvent('debug', 'AppMenuView', 'toggleMenu', 'UI', `Menu toggled. New state: ${this.isMenuOpen ? 'Open' : 'Closed'}`);
        this.render(this.state); // Re-render to show/hide the menu

        // Add or remove the global "click outside" listener
        if (this.isMenuOpen) {
            document.addEventListener('click', this.handleOutsideClick, true);
        } else {
            document.removeEventListener('click', this.handleOutsideClick, true);
        }
    }

    handleOutsideClick(event) {
        // If the click is outside the main container of this component, close the menu
        if (!this.container.contains(event.target)) {
            logEvent('debug', 'AppMenuView', 'handleOutsideClick', 'UI', 'Clicked outside, closing menu.');
            this.toggleMenu();
        }
    }

    attachEventListeners() {
        logEvent('debug', 'AppMenuView', 'attachEventListeners', 'Events', 'Attaching event listeners.');
        
        // Use event delegation on the container for menu items
        this.container.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            switch (button.id) {
                case 'hamburger-btn':
                    this.toggleMenu();
                    break;
                case 'new-btn':
                    this.callbacks.onNewProject?.();
                    break;
                case 'load-btn':
                    this.callbacks.onLoadProject?.();
                    break;
                case 'save-btn':
                    this.callbacks.onSaveProject?.();
                    break;
                case 'toggle-view-btn':
                    this.callbacks.onToggleView?.();
                    break;
            }
        });
    }
}