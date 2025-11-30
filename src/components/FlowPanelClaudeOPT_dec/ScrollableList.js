// ScrollableList.js - Manages scrollable container with items
export class ScrollableList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._items = [];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    height: 100%;
                }
                
                .container {
                    height: 100%;
                    overflow-y: auto;
                    overflow-x: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 4px;
                    box-sizing: border-box;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                
                .container::-webkit-scrollbar {
                    display: none;
                }
                
                ::slotted([draggable]) {
                    transition: transform 150ms cubic-bezier(0.2, 0, 0, 1),
                               opacity 150ms cubic-bezier(0.2, 0, 0, 1);
                }
                
                ::slotted(.drag-placeholder) {
                    opacity: 0.5;
                    background-color: var(--md-sys-color-surface-variant, #f5eff7) !important;
                    border: 2px dashed var(--md-sys-color-outline, #7a757f) !important;
                    color: transparent !important;
                }
                
                ::slotted(.drag-placeholder *) {
                    visibility: hidden !important;
                }
            </style>
            <div class="container" part="container">
                <slot></slot>
            </div>
        `;
    }

    setupEventListeners() {
        const slot = this.shadowRoot.querySelector('slot');
        slot.addEventListener('slotchange', this.handleSlotChange.bind(this));
    }

    removeEventListeners() {
        // Cleanup handled by disconnectedCallback
    }

    handleSlotChange() {
        this.updateItemIndices();
        this._emitEvent('items-changed', { items: this.getItems() });
    }

    updateItemIndices() {
        const items = this.getItems();
        items.forEach((item, index) => {
            item.dataset.index = index.toString();
            if (!item.hasAttribute('draggable')) {
                item.draggable = true;
            }
        });
    }

    addItem(element) {
        this.appendChild(element);
        this.updateItemIndices();
    }

    removeItem(index) {
        const items = this.getItems();
        if (items[index]) {
            items[index].remove();
            this.updateItemIndices();
        }
    }

    getItems() {
        const slot = this.shadowRoot.querySelector('slot');
        return slot ? slot.assignedElements() : [];
    }

    getContainer() {
        return this.shadowRoot.querySelector('.container');
    }

    _emitEvent(eventType, data) {
        this.dispatchEvent(new CustomEvent(eventType, {
            detail: data,
            bubbles: true
        }));
    }
}