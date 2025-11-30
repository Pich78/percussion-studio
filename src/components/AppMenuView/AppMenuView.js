// file: src/components/AppMenuView/AppMenuView.js
import { loadCSS } from '../../../lib/dom.js'; // Adjusted path assumption based on structure
// Note: Removed Logger for brevity in this snippet, add back if needed

export class AppMenuView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        // Ensure CSS is loaded (or rely on global CSS if you merge it)
        loadCSS('/percussion-studio/src/components/AppMenuView/AppMenuView.css');

        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.container.addEventListener('click', this.handleClick.bind(this));
    }

    render(state) {
        const { isDirty, appView, isMenuOpen } = state;

        // Manage global click listener
        if (isMenuOpen) {
            setTimeout(() => {
                document.addEventListener('click', this.handleOutsideClick);
            }, 0);
        } else {
            document.removeEventListener('click', this.handleOutsideClick);
        }

        const menuStateClass = isMenuOpen ? 'is-open' : 'is-closed';

        // Material Design 3 style classes (using utility classes from main.css or inline styles)
        // We use Material Symbols for the hamburger icon

        let menuItems = '';
        if (appView === 'playing') {
            menuItems = `
                <button data-action="load" class="menu-item">
                    <span class="material-symbols-outlined">folder_open</span>
                    Load Rhythm
                </button>
                <button data-action="toggle-view" class="menu-item">
                    <span class="material-symbols-outlined">edit</span>
                    Go to Editor
                </button>
            `;
        } else {
            menuItems = `
                <button data-action="new" class="menu-item">
                    <span class="material-symbols-outlined">add</span>
                    New Rhythm
                </button>
                <button data-action="load" class="menu-item">
                     <span class="material-symbols-outlined">folder_open</span>
                    Load Rhythm
                </button>
                <button data-action="save" class="menu-item" ${!isDirty ? 'disabled' : ''}>
                    <span class="material-symbols-outlined">save</span>
                    Save Rhythm
                </button>
                <button data-action="toggle-view" class="menu-item">
                    <span class="material-symbols-outlined">play_circle</span>
                    Go to Playback
                </button>
            `;
        }

        const html = `
            <div class="app-menu-wrapper">
                <div class="header-content">
                    <button data-action="toggle-menu" class="icon-button">
                        <span class="material-symbols-outlined">menu</span>
                    </button>
                    <h1 class="app-title">Percussion Studio</h1>
                </div>
                
                <div class="app-menu-dropdown ${menuStateClass}">
                    ${menuItems}
                </div>
            </div>
        `;
        this.container.innerHTML = html;
    }

    handleClick(event) {
        const button = event.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;

        const actions = {
            'toggle-menu': () => this.callbacks.onToggleMenu?.(),
            'new': () => this.callbacks.onNewProject?.(),
            'load': () => this.callbacks.onLoadProject?.(),
            'save': () => this.callbacks.onSaveProject?.(),
            'toggle-view': () => this.callbacks.onToggleView?.(),
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    handleOutsideClick(event) {
        if (!this.container.contains(event.target)) {
            this.callbacks.onToggleMenu?.(false);
        }
    }
}