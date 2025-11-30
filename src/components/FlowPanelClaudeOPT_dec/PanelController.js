// PanelController.js - Handles panel expand/collapse behavior
export class PanelController {
    constructor(element, config = {}) {
        this.element = element;
        this.config = {
            collapsedWidth: '56px',
            expandedWidth: '320px',
            ...config
        };
        
        this._pinned = false;
        this.handleGlobalClick = this.handleGlobalClick.bind(this);
        this.setupEventListeners();
    }

    get pinned() {
        return this._pinned;
    }

    set pinned(value) {
        if (this._pinned !== value) {
            this._pinned = value;
            this.element.toggleAttribute('pinned', value);
            this._emitEvent('pin-change', { pinned: value });
        }
    }

    setupEventListeners() {
        document.addEventListener('click', this.handleGlobalClick);
    }

    removeEventListeners() {
        document.removeEventListener('click', this.handleGlobalClick);
    }

    handleGlobalClick(event) {
        const isClickInside = this.element.contains(event.target);
        
        if (isClickInside) {
            if (!this.pinned) {
                this.pinned = true;
            }
        } else {
            if (this.pinned) {
                this.pinned = false;
            }
        }
    }

    destroy() {
        this.removeEventListeners();
    }

    _emitEvent(eventType, data) {
        this.element.dispatchEvent(new CustomEvent(eventType, {
            detail: data,
            bubbles: true
        }));
    }
}