// file: src/components/AppMenuView/AppMenuView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class AppMenuView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.isMenuOpen = false;
        this.state = {};

        loadCSS('/percussion-studio/src/components/AppMenuView/AppMenuView.css');
        logEvent('info', 'AppMenuView', 'constructor', 'Lifecycle', 'Component created.');
        
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }

    render(state) {
        this.state = state;
        logEvent('debug', 'AppMenuView', 'render', 'State', 'Rendering with state:', state);
        
        const html = `
            <div class="flex items-center justify-between w-100 relative">
                <div class="flex items-center">
                    <button id="hamburger-btn" class="pv2 ph3 br2 bn bg-transparent hover-bg-light-gray pointer f4 mr3">☰</button>
                    <h1 class="f3 b dark-gray">Percussion Studio</h1>
                </div>
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

        return `<div class="app-menu-dropdown ${menuStateClass} bg-white br2 w5 mt2">${menuItems}</div>`;
    }
    
    openMenu() {
        if (this.isMenuOpen) return;
        this.isMenuOpen = true;
        this.render(this.state);
        document.addEventListener('click', this.handleOutsideClick, true);
    }

    closeMenu() {
        if (!this.isMenuOpen) return;
        this.isMenuOpen = false;
        this.render(this.state);
        document.removeEventListener('click', this.handleOutsideClick, true);
    }

    handleOutsideClick(event) {
        if (!this.container.contains(event.target)) {
            this.closeMenu();
        }
    }

    attachEventListeners() {
        this.container.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const closeAfterAction = () => {
                if (button.id !== 'hamburger-btn') this.closeMenu();
            };

            switch (button.id) {
                case 'hamburger-btn':
                    this.isMenuOpen ? this.closeMenu() : this.openMenu();
                    break;
                case 'new-btn':
                    this.callbacks.onNewProject?.();
                    closeAfterAction();
                    break;
                case 'load-btn':
                    this.callbacks.onLoadProject?.();
                    closeAfterAction();
                    break;
                case 'save-btn':
                    this.callbacks.onSaveProject?.();
                    closeAfterAction();
                    break;
                case 'toggle-view-btn':
                    this.callbacks.onToggleView?.();
                    closeAfterAction();
                    break;
            }
        });
    }
}