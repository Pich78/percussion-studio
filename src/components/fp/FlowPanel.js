// file: src/components/FlowPanel/FlowPanel.js

import { logEvent } from '/percussion-studio/lib/Logger.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            width: 100%;
            height: 100%;
            overflow-y: auto;
            position: relative;
            box-sizing: border-box;
        }

        /* Hide scrollbar */
        :host::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }

        .flow-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem; /* Space between slots */
            padding: 0.5rem; /* Padding around the list */
        }

        .flow-item-slot {
            box-sizing: border-box;
            /* The user provides the content, we provide the placeholder look */
            border: 1px solid #d1d5db;
            border-radius: 4px;
            transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .flow-item-slot:hover {
            border-color: #9ca3af;
            box-shadow: 0 1px 3px rgba(0,0,0,0.07);
        }

        .flow-item-slot.drag-placeholder {
            background-color: #e5e7eb;
            border: 2px dashed #9ca3af;
        }

        .flow-item-slot.drag-placeholder ::slotted(*) {
            visibility: hidden;
        }
    </style>
    <div class="flow-list"></div>
`;

export class FlowPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        this._items = [];
        this.listContainer = this.shadowRoot.querySelector('.flow-list');

        // D&D State
        this.draggedIndex = null;
        this.dragStartOffset = 0;
        this.draggedItemHeight = 0;
        this.lastAfterElement = null;
        this.lastMouseY = 0;
        
        // D&D Configuration
        this.overlapThresholdPercent = 0.25;
        this.scrollZoneSize = 60;
        this.scrollSpeed = 5;

        // Bind event handlers
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        
        logEvent('info', 'FlowPanel', 'constructor', 'Lifecycle', 'Web Component created.');
    }

    connectedCallback() {
        this.addEventListener('dragstart', this.handleDragStart);
        this.addEventListener('dragover', this.handleDragOver);
        this.addEventListener('drop', this.handleDrop);
        this.addEventListener('dragend', this.handleDragEnd);
        logEvent('info', 'FlowPanel', 'connectedCallback', 'Lifecycle', 'Component added to DOM.');
    }

    disconnectedCallback() {
        this.removeEventListener('dragstart', this.handleDragStart);
        this.removeEventListener('dragover', this.handleDragOver);
        this.removeEventListener('drop', this.handleDrop);
        this.removeEventListener('dragend', this.handleDragEnd);
        logEvent('info', 'FlowPanel', 'disconnectedCallback', 'Lifecycle', 'Component removed from DOM.');
    }

    set items(newItems) {
        logEvent('debug', 'FlowPanel', 'set items', 'State', 'Setting new items', newItems);
        this._items = newItems;
        this.render();
    }
    
    get items() {
        return this._items;
    }

    render() {
        this.listContainer.innerHTML = '';
        this._items.forEach((item, index) => {
            const slotContainer = document.createElement('div');
            slotContainer.className = 'flow-item-slot';
            slotContainer.draggable = true;
            slotContainer.dataset.index = index;

            const slot = document.createElement('slot');
            // Each slot needs a unique name to project the correct content.
            slot.name = `item-${item.id}`; 
            
            slotContainer.appendChild(slot);
            this.listContainer.appendChild(slotContainer);
        });
    }

    // --- DRAG AND DROP IMPLEMENTATION (BEHAVIOR PRESERVED) ---

    handleDragStart(event) {
        const itemSlot = event.target.closest('.flow-item-slot');
        if (itemSlot) {
            this.draggedIndex = parseInt(itemSlot.dataset.index, 10);
            event.dataTransfer.effectAllowed = 'move';
            this.lastMouseY = event.clientY;

            const rect = itemSlot.getBoundingClientRect();
            this.dragStartOffset = event.clientY - rect.top;
            this.draggedItemHeight = rect.height;
            this.lastAfterElement = itemSlot.nextElementSibling;
            
            logEvent('info', 'FlowPanel', 'handleDragStart', 'D&D', `Drag started for item at index ${this.draggedIndex}.`);

            // Use timeout to allow the browser to create the drag image before we change the style
            setTimeout(() => {
                itemSlot.classList.add('drag-placeholder');
            }, 0);
        }
    }

    handleDragOver(event) {
        event.preventDefault(); // This is necessary to allow a drop
        const placeholder = this.shadowRoot.querySelector('.drag-placeholder');
        if (!placeholder || this.draggedIndex === null) return;
        
        // --- Auto-scroll logic ---
        const listRect = this.getBoundingClientRect(); // Use host element for scroll boundaries
        if (event.clientY < listRect.top + this.scrollZoneSize) {
            this.scrollTop -= this.scrollSpeed;
        } else if (event.clientY > listRect.bottom - this.scrollZoneSize) {
            this.scrollTop += this.scrollSpeed;
        }

        const direction = event.clientY < this.lastMouseY ? 'up' : 'down';
        const overlapThreshold = this.draggedItemHeight * this.overlapThresholdPercent;

        const draggedTop = event.clientY - this.dragStartOffset;
        const draggedBottom = draggedTop + this.draggedItemHeight;

        const restingElements = [...this.listContainer.querySelectorAll('.flow-item-slot:not(.drag-placeholder)')];
        let afterElement = this.lastAfterElement;

        if (direction === 'up') {
            for (const child of restingElements) {
                const childBox = child.getBoundingClientRect();
                if (draggedTop <= (childBox.bottom - overlapThreshold)) {
                    afterElement = child;
                    break;
                }
            }
        } else { // 'down'
            let found = false;
            for (const child of restingElements.reverse()) {
                const childBox = child.getBoundingClientRect();
                if (draggedBottom >= (childBox.top + overlapThreshold)) {
                    let nextSibling = child.nextElementSibling;
                    if (nextSibling && nextSibling.classList.contains('drag-placeholder')) {
                       nextSibling = nextSibling.nextElementSibling;
                    }
                    afterElement = nextSibling;
                    found = true;
                    break; 
                }
            }
            // If dragging down and no collision found, it means it should be at the end.
            if (!found) {
                afterElement = null;
            }
        }

        if (afterElement !== this.lastAfterElement) {
            this.lastAfterElement = afterElement;
            if (afterElement === null) {
                this.listContainer.appendChild(placeholder);
            } else {
                this.listContainer.insertBefore(placeholder, afterElement);
            }
        }
        
        this.lastMouseY = event.clientY;
    }

    handleDrop(event) {
        event.preventDefault();
        const placeholder = this.shadowRoot.querySelector('.drag-placeholder');
        if (this.draggedIndex !== null && placeholder) {
            const newIndex = Array.from(this.listContainer.children).indexOf(placeholder);
            logEvent('info', 'FlowPanel', 'handleDrop', 'D&D', `Item dropped. From index ${this.draggedIndex} to ${newIndex}.`);
            
            if (this.draggedIndex !== newIndex) {
                // Dispatch a custom event instead of calling a callback
                this.dispatchEvent(new CustomEvent('flow-reordered', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        from: this.draggedIndex,
                        to: newIndex
                    }
                }));
            }
        }
    }
    
    handleDragEnd() {
        const placeholder = this.shadowRoot.querySelector('.drag-placeholder');
        if (placeholder) {
            placeholder.classList.remove('drag-placeholder');
        }
        
        // Reset D&D state
        this.draggedIndex = null;
        this.dragStartOffset = 0;
        this.draggedItemHeight = 0;
        this.lastAfterElement = null;
        this.lastMouseY = 0;
        logEvent('info', 'FlowPanel', 'handleDragEnd', 'D&D', 'Drag operation finished.');
    }
}

// Define the custom element for the browser
customElements.define('flow-panel', FlowPanel);