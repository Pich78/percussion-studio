// AppMenu.js - Web Component
class AppMenu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // State
        this._state = {
            isDirty: false,
            appView: 'playing',
            isMenuOpen: false
        };
        
        // Bind methods
        this.handleClick = this.handleClick.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        
        this.render();
    }
    
    static get observedAttributes() {
        return ['is-dirty', 'app-view', 'is-menu-open'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch (name) {
            case 'is-dirty':
                this._state.isDirty = newValue === 'true';
                break;
            case 'app-view':
                this._state.appView = newValue || 'playing';
                break;
            case 'is-menu-open':
                this._state.isMenuOpen = newValue === 'true';
                this.manageOutsideClickListener();
                break;
        }
        this.render();
    }
    
    get isDirty() { return this._state.isDirty; }
    set isDirty(value) { 
        this._state.isDirty = Boolean(value);
        this.setAttribute('is-dirty', this._state.isDirty.toString());
    }
    
    get appView() { return this._state.appView; }
    set appView(value) {
        this._state.appView = value;
        this.setAttribute('app-view', value);
    }
    
    get isMenuOpen() { return this._state.isMenuOpen; }
    set isMenuOpen(value) {
        this._state.isMenuOpen = Boolean(value);
        this.setAttribute('is-menu-open', this._state.isMenuOpen.toString());
    }
    
    connectedCallback() {
        this.shadowRoot.addEventListener('click', this.handleClick);
        this.render();
    }
    
    disconnectedCallback() {
        this.shadowRoot.removeEventListener('click', this.handleClick);
        document.removeEventListener('click', this.handleOutsideClick, true);
    }
    
    manageOutsideClickListener() {
        if (this._state.isMenuOpen) {
            document.addEventListener('click', this.handleOutsideClick, true);
        } else {
            document.removeEventListener('click', this.handleOutsideClick, true);
        }
    }
    
    render() {
        const { isDirty, appView, isMenuOpen } = this._state;
        
        const menuItems = this.getMenuItems(appView, isDirty);
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                
                .app-header {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 24px;
                    background: var(--md-sys-color-surface-container-low, #f7f2fa);
                    border-radius: 12px;
                    box-shadow: 
                        0 1px 2px rgba(0, 0, 0, 0.3),
                        0 1px 3px 1px rgba(0, 0, 0, 0.15);
                    transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .app-header:hover {
                    box-shadow: 
                        0 2px 6px 2px rgba(0, 0, 0, 0.15),
                        0 1px 2px rgba(0, 0, 0, 0.3);
                }
                
                .header-content {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .menu-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    border: none;
                    border-radius: 24px;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    color: var(--md-sys-color-on-surface, #1d1b20);
                    position: relative;
                    overflow: hidden;
                }
                
                .menu-button::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: currentColor;
                    opacity: 0;
                    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .menu-button:hover::before {
                    opacity: 0.08;
                }
                
                .menu-button:active::before {
                    opacity: 0.12;
                }
                
                .menu-icon {
                    font-size: 24px;
                    line-height: 1;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .menu-button[data-open="true"] .menu-icon {
                    transform: rotate(90deg);
                }
                
                .app-title {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 400;
                    letter-spacing: 0.25px;
                    color: var(--md-sys-color-on-surface, #1d1b20);
                }
                
                .menu-dropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    right: 0;
                    background: var(--md-sys-color-surface-container, #f3edf7);
                    border-radius: 12px;
                    box-shadow: 
                        0 3px 1px -2px rgba(0, 0, 0, 0.2),
                        0 2px 2px 0 rgba(0, 0, 0, 0.14),
                        0 1px 5px 0 rgba(0, 0, 0, 0.12);
                    z-index: 1000;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-origin: top;
                }
                
                .menu-dropdown.closed {
                    opacity: 0;
                    transform: scaleY(0);
                    pointer-events: none;
                }
                
                .menu-dropdown.open {
                    opacity: 1;
                    transform: scaleY(1);
                }
                
                .menu-item {
                    display: block;
                    width: 100%;
                    padding: 16px 24px;
                    border: none;
                    background: transparent;
                    text-align: left;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    letter-spacing: 0.1px;
                    color: var(--md-sys-color-on-surface, #1d1b20);
                    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                
                .menu-item:not(:last-child) {
                    border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
                }
                
                .menu-item::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: currentColor;
                    opacity: 0;
                    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .menu-item:hover::before {
                    opacity: 0.08;
                }
                
                .menu-item:active::before {
                    opacity: 0.12;
                }
                
                .menu-item:disabled {
                    color: var(--md-sys-color-on-surface, #1d1b20);
                    opacity: 0.38;
                    cursor: not-allowed;
                }
                
                .menu-item:disabled::before {
                    display: none;
                }
                
                .menu-item-label {
                    position: relative;
                    z-index: 1;
                }
                
                /* Material Design color tokens fallbacks */
                :host {
                    --md-sys-color-surface-container-low: #f7f2fa;
                    --md-sys-color-surface-container: #f3edf7;
                    --md-sys-color-on-surface: #1d1b20;
                    --md-sys-color-outline-variant: #cac4d0;
                }
                
                @media (prefers-color-scheme: dark) {
                    :host {
                        --md-sys-color-surface-container-low: #1d1b20;
                        --md-sys-color-surface-container: #211f26;
                        --md-sys-color-on-surface: #e6e0e9;
                        --md-sys-color-outline-variant: #49454f;
                    }
                }
            </style>
            
            <div class="app-header">
                <div class="header-content">
                    <button class="menu-button" data-action="toggle-menu" data-open="${isMenuOpen}">
                        <span class="menu-icon">☰</span>
                    </button>
                    <h1 class="app-title">Percussion Studio</h1>
                </div>
                
                <div class="menu-dropdown ${isMenuOpen ? 'open' : 'closed'}">
                    ${menuItems}
                </div>
            </div>
        `;
    }
    
    getMenuItems(appView, isDirty) {
        if (appView === 'playing') {
            return `
                <button class="menu-item" data-action="load">
                    <span class="menu-item-label">Load Rhythm</span>
                </button>
                <button class="menu-item" data-action="toggle-view">
                    <span class="menu-item-label">Editor</span>
                </button>
            `;
        } else {
            return `
                <button class="menu-item" data-action="new">
                    <span class="menu-item-label">New Rhythm</span>
                </button>
                <button class="menu-item" data-action="load">
                    <span class="menu-item-label">Load Rhythm</span>
                </button>
                <button class="menu-item" data-action="save" ${!isDirty ? 'disabled' : ''}>
                    <span class="menu-item-label">Save Rhythm and Patterns</span>
                </button>
                <button class="menu-item" data-action="toggle-view">
                    <span class="menu-item-label">Playback</span>
                </button>
            `;
        }
    }
    
    handleClick(event) {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        
        const action = button.dataset.action;
        
        // Dispatch custom events for each action
        const eventDetail = { action, state: { ...this._state } };
        
        switch (action) {
            case 'toggle-menu':
                this.isMenuOpen = !this._state.isMenuOpen;
                this.dispatchEvent(new CustomEvent('menu-toggle', { 
                    detail: { isOpen: this._state.isMenuOpen } 
                }));
                break;
            case 'new':
                this.dispatchEvent(new CustomEvent('new-project', { detail: eventDetail }));
                this.closeMenu();
                break;
            case 'load':
                this.dispatchEvent(new CustomEvent('load-project', { detail: eventDetail }));
                this.closeMenu();
                break;
            case 'save':
                if (!button.disabled) {
                    this.dispatchEvent(new CustomEvent('save-project', { detail: eventDetail }));
                    this.closeMenu();
                }
                break;
            case 'toggle-view':
                this.dispatchEvent(new CustomEvent('view-toggle', { detail: eventDetail }));
                this.closeMenu();
                break;
        }
    }
    
    handleOutsideClick(event) {
        if (!this.contains(event.target)) {
            this.closeMenu();
        }
    }
    
    closeMenu() {
        if (this._state.isMenuOpen) {
            this.isMenuOpen = false;
            this.dispatchEvent(new CustomEvent('menu-close'));
        }
    }
    
    openMenu() {
        if (!this._state.isMenuOpen) {
            this.isMenuOpen = true;
            this.dispatchEvent(new CustomEvent('menu-open'));
        }
    }
    
    toggleMenu() {
        this.isMenuOpen = !this._state.isMenuOpen;
        this.dispatchEvent(new CustomEvent('menu-toggle', { 
            detail: { isOpen: this._state.isMenuOpen } 
        }));
    }
}

// Register the custom element
customElements.define('app-menu', AppMenu);