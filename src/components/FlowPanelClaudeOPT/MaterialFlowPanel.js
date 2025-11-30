// MaterialFlowPanel.js - Optimized Web Component Implementation
export class MaterialFlowPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Consolidated drag state object
        this.dragState = {
            draggedIndex: null,
            startOffset: 0,
            itemHeight: 0,
            lastCollision: null,
            lastAfterElement: null,
            lastMouseY: 0,
            lastDirection: null
        };
        
        // Configuration object
        this.dragConfig = {
            overlapThreshold: 0.25,
            scrollZoneSize: 60,
            scrollSpeed: 5
        };
        
        // Bind methods
        this.handleGlobalClick = this.handleGlobalClick.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleSlotChange = this.handleSlotChange.bind(this);
    }

    static get observedAttributes() {
        return ['pinned', 'title', 'collapsed-width', 'expanded-width', 'overlap-threshold'];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === 'overlap-threshold') {
                this.dragConfig.overlapThreshold = parseFloat(newValue || '0.25');
            }
            this.render();
        }
    }

    get pinned() {
        return this.hasAttribute('pinned');
    }

    set pinned(value) {
        if (value) {
            this.setAttribute('pinned', '');
        } else {
            this.removeAttribute('pinned');
        }
    }

    get title() {
        return this.getAttribute('title') || 'Panel';
    }

    get collapsedWidth() {
        return this.getAttribute('collapsed-width') || '56px';
    }

    get expandedWidth() {
        return this.getAttribute('expanded-width') || '320px';
    }

    get overlapThreshold() {
        return this.dragConfig.overlapThreshold;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}
            </style>
            <div class="panel" part="panel">
                <!-- Collapsed state title -->
                <div class="collapsed-title" part="collapsed-title">
                    <span class="title-text">${this.title}</span>
                </div>
                
                <!-- Expanded content -->
                <div class="panel-content" part="panel-content">
                    <!-- Header slot -->
                    <div class="header-section" part="header">
                        <slot name="header">
                            <h2 class="default-title">${this.title}</h2>
                        </slot>
                    </div>
                    
                    <!-- Main flow list container -->
                    <div class="flow-container" part="flow-container">
                        <div class="flow-list" part="flow-list">
                            <slot name="flow-items"></slot>
                        </div>
                    </div>
                    
                    <!-- Footer slot -->
                    <div class="footer-section" part="footer">
                        <slot name="footer">
                            <button class="add-button" part="add-button">
                                <md-icon>add</md-icon>
                                <span>Add Item</span>
                            </button>
                        </slot>
                    </div>
                </div>
            </div>
        `;
    }

    getStyles() {
        return `
            /* Material Design 3 Tokens */
            :host {
                --md-sys-color-surface: #fef7ff;
                --md-sys-color-surface-variant: #f5eff7;
                --md-sys-color-on-surface: #1d1b20;
                --md-sys-color-on-surface-variant: #49454f;
                --md-sys-color-outline: #7a757f;
                --md-sys-color-outline-variant: #cac4cf;
                --md-sys-color-primary: #6750a4;
                --md-sys-color-on-primary: #ffffff;
                --md-sys-color-secondary: #625b71;
                --md-sys-color-tertiary: #7e5260;
                --md-sys-color-error: #ba1a1a;
                
                /* Elevation tokens */
                --md-sys-elevation-level0: none;
                --md-sys-elevation-level1: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
                --md-sys-elevation-level2: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15);
                --md-sys-elevation-level3: 0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3);
                
                /* Typography tokens */
                --md-sys-typescale-title-medium-font: 'Roboto', sans-serif;
                --md-sys-typescale-title-medium-size: 16px;
                --md-sys-typescale-title-medium-weight: 500;
                --md-sys-typescale-title-medium-line-height: 24px;
                
                --md-sys-typescale-body-medium-font: 'Roboto', sans-serif;
                --md-sys-typescale-body-medium-size: 14px;
                --md-sys-typescale-body-medium-weight: 400;
                --md-sys-typescale-body-medium-line-height: 20px;
                
                /* Shape tokens */
                --md-sys-shape-corner-large: 16px;
                --md-sys-shape-corner-medium: 12px;
                --md-sys-shape-corner-small: 8px;
                --md-sys-shape-corner-extra-small: 4px;
                
                /* Motion tokens */
                --md-sys-motion-duration-short1: 50ms;
                --md-sys-motion-duration-short2: 100ms;
                --md-sys-motion-duration-short3: 150ms;
                --md-sys-motion-duration-short4: 200ms;
                --md-sys-motion-duration-medium1: 250ms;
                --md-sys-motion-duration-medium2: 300ms;
                --md-sys-motion-duration-medium3: 350ms;
                --md-sys-motion-duration-medium4: 400ms;
                
                --md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
                --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
                
                display: block;
                position: relative;
                height: 100%;
            }

            .panel {
                position: relative;
                height: 100%;
                width: ${this.collapsedWidth};
                background-color: var(--md-sys-color-surface);
                border-radius: var(--md-sys-shape-corner-large);
                border: 1px solid var(--md-sys-color-outline-variant);
                box-shadow: var(--md-sys-elevation-level1);
                transition: width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                box-sizing: border-box;
            }

            :host([pinned]) .panel,
            .panel:hover {
                width: ${this.expandedWidth};
                align-items: flex-start;
                justify-content: flex-start;
                box-shadow: var(--md-sys-elevation-level2);
            }

            /* Collapsed title styling */
            .collapsed-title {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 1;
                transition: opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard);
                writing-mode: vertical-lr;
                text-orientation: mixed;
            }

            .title-text {
                font-family: var(--md-sys-typescale-title-medium-font);
                font-size: var(--md-sys-typescale-title-medium-size);
                font-weight: var(--md-sys-typescale-title-medium-weight);
                color: var(--md-sys-color-on-surface-variant);
                letter-spacing: 0.1em;
                text-transform: uppercase;
            }

            :host([pinned]) .collapsed-title,
            .panel:hover .collapsed-title {
                opacity: 0;
                pointer-events: none;
            }

            /* Panel content */
            .panel-content {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                opacity: 0;
                visibility: hidden;
                transition: opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard),
                           visibility var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard);
                padding: 16px;
                box-sizing: border-box;
            }

            :host([pinned]) .panel-content,
            .panel:hover .panel-content {
                opacity: 1;
                visibility: visible;
            }

            /* Header section */
            .header-section {
                flex-shrink: 0;
                margin-bottom: 16px;
            }

            .default-title {
                font-family: var(--md-sys-typescale-title-medium-font);
                font-size: var(--md-sys-typescale-title-medium-size);
                font-weight: var(--md-sys-typescale-title-medium-weight);
                line-height: var(--md-sys-typescale-title-medium-line-height);
                color: var(--md-sys-color-on-surface);
                margin: 0;
                padding: 0;
            }

            /* Flow container */
            .flow-container {
                flex: 1;
                min-height: 0;
                display: flex;
                flex-direction: column;
                margin-bottom: 16px;
            }

            .flow-list {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                position: relative;
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 4px;
                box-sizing: border-box;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .flow-list::-webkit-scrollbar {
                display: none;
            }

            /* Footer section */
            .footer-section {
                flex-shrink: 0;
            }

            .add-button {
                width: 100%;
                padding: 12px 16px;
                background-color: var(--md-sys-color-primary);
                color: var(--md-sys-color-on-primary);
                border: none;
                border-radius: var(--md-sys-shape-corner-medium);
                font-family: var(--md-sys-typescale-body-medium-font);
                font-size: var(--md-sys-typescale-body-medium-size);
                font-weight: var(--md-sys-typescale-body-medium-weight);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: background-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard),
                           box-shadow var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
                box-shadow: var(--md-sys-elevation-level1);
            }

            .add-button:hover {
                background-color: color-mix(in srgb, var(--md-sys-color-primary) 90%, transparent);
                box-shadow: var(--md-sys-elevation-level2);
            }

            .add-button:active {
                background-color: color-mix(in srgb, var(--md-sys-color-primary) 80%, transparent);
                box-shadow: var(--md-sys-elevation-level1);
            }

            /* Drag and drop states */
            ::slotted([draggable]) {
                transition: transform var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard),
                           opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
            }

            ::slotted(.drag-placeholder) {
                opacity: 0.5;
                background-color: var(--md-sys-color-surface-variant) !important;
                border: 2px dashed var(--md-sys-color-outline) !important;
                color: transparent !important;
            }

            ::slotted(.drag-placeholder *) {
                visibility: hidden !important;
            }

            /* Slot styling */
            slot {
                display: block;
            }

            slot[name="flow-items"] {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            /* Custom scrollbar for modern browsers */
            @supports (scrollbar-width: thin) {
                .flow-list {
                    scrollbar-width: thin;
                    scrollbar-color: var(--md-sys-color-outline-variant) transparent;
                }
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .panel {
                    width: ${this.collapsedWidth};
                }
                
                :host([pinned]) .panel {
                    width: min(${this.expandedWidth}, 90vw);
                }
            }

            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .panel {
                    border-width: 2px;
                }
                
                .add-button {
                    border: 2px solid var(--md-sys-color-on-primary);
                }
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .panel,
                .panel-content,
                .collapsed-title,
                .add-button,
                ::slotted([draggable]) {
                    transition: none;
                }
            }

            /* Focus management */
            .panel:focus-within {
                outline: 2px solid var(--md-sys-color-primary);
                outline-offset: 2px;
            }
        `;
    }

    setupEventListeners() {
        document.addEventListener('click', this.handleGlobalClick);
        this.addEventListener('dragstart', this.handleDragStart);
        this.addEventListener('dragover', this.handleDragOver);
        this.addEventListener('drop', this.handleDrop);
        this.addEventListener('dragend', this.handleDragEnd);
        
        // Listen for slot changes to update drag indices
        const flowSlot = this.shadowRoot.querySelector('slot[name="flow-items"]');
        if (flowSlot) {
            flowSlot.addEventListener('slotchange', this.handleSlotChange);
        }
    }

    removeEventListeners() {
        document.removeEventListener('click', this.handleGlobalClick);
        this.removeEventListener('dragstart', this.handleDragStart);
        this.removeEventListener('dragover', this.handleDragOver);
        this.removeEventListener('drop', this.handleDrop);
        this.removeEventListener('dragend', this.handleDragEnd);
    }

    handleSlotChange() {
        this.updateItemIndices();
    }

    updateItemIndices() {
        const flowSlot = this.shadowRoot.querySelector('slot[name="flow-items"]');
        if (!flowSlot) return;
        
        const items = flowSlot.assignedElements();
        items.forEach((item, index) => {
            item.dataset.index = index.toString();
            if (!item.hasAttribute('draggable')) {
                item.draggable = true;
            }
        });
    }

    // Consolidated drag calculations
    calculateDragBounds(mouseY) {
        const { startOffset, itemHeight } = this.dragState;
        return {
            top: mouseY - startOffset,
            bottom: mouseY - startOffset + itemHeight,
            center: mouseY - startOffset + (itemHeight / 2)
        };
    }

    // Unified direction detection with hysteresis
    updateDirection(currentMouseY) {
        const { lastMouseY, lastDirection } = this.dragState;
        const threshold = 2; // Prevent jitter on micro-movements
        
        if (Math.abs(currentMouseY - lastMouseY) < threshold) {
            return lastDirection; // Maintain current direction for small movements
        }
        
        const newDirection = currentMouseY < lastMouseY ? 'up' : 'down';
        
        // Reset collision tracking when direction changes
        if (newDirection !== lastDirection) {
            this.dragState.lastCollision = null;
        }
        
        this.dragState.lastDirection = newDirection;
        this.dragState.lastMouseY = currentMouseY;
        
        return newDirection;
    }

    // Optimized collision detection - single loop for both directions
    detectCollision(dragBounds, direction, restingElements) {
        const overlapThreshold = this.dragState.itemHeight * this.dragConfig.overlapThreshold;
        
        // Single loop with direction-specific logic
        const elementsToCheck = direction === 'down' ? [...restingElements].reverse() : restingElements;
        
        for (const element of elementsToCheck) {
            const elementBounds = element.getBoundingClientRect();
            let collision = null;
            
            if (direction === 'up') {
                // Check if dragged item's top overlaps with element's bottom
                if (dragBounds.top <= (elementBounds.bottom - overlapThreshold)) {
                    collision = { element, direction: 'up', insertBefore: element };
                }
            } else { // direction === 'down'
                // Check if dragged item's bottom overlaps with element's top
                if (dragBounds.bottom >= (elementBounds.top + overlapThreshold)) {
                    const nextSibling = this.getNextValidSibling(element);
                    collision = { element, direction: 'down', insertBefore: nextSibling };
                }
            }
            
            if (collision) return collision;
        }
        
        return null;
    }

    // Helper to find next valid sibling (skipping placeholder)
    getNextValidSibling(element) {
        let next = element.nextElementSibling;
        while (next && next.classList.contains('drag-placeholder')) {
            next = next.nextElementSibling;
        }
        return next;
    }

    // Unified auto-scroll handler
    handleAutoScroll(mouseY, container) {
        const containerBounds = container.getBoundingClientRect();
        const { scrollZoneSize, scrollSpeed } = this.dragConfig;
        
        const distanceFromTop = mouseY - containerBounds.top;
        const distanceFromBottom = containerBounds.bottom - mouseY;
        
        if (distanceFromTop < scrollZoneSize) {
            // Scroll up - speed increases closer to edge
            const scrollIntensity = (scrollZoneSize - distanceFromTop) / scrollZoneSize;
            container.scrollTop -= scrollSpeed * scrollIntensity;
            return 'up';
        } else if (distanceFromBottom < scrollZoneSize) {
            // Scroll down - speed increases closer to edge
            const scrollIntensity = (scrollZoneSize - distanceFromBottom) / scrollZoneSize;
            container.scrollTop += scrollSpeed * scrollIntensity;
            return 'down';
        }
        
        return null;
    }

    // Consolidated event emission
    emitDragEvent(eventType, additionalData = {}) {
        const baseData = {
            draggedIndex: this.dragState.draggedIndex,
            mouseY: this.dragState.lastMouseY,
            direction: this.dragState.lastDirection,
            ...additionalData
        };
        
        this.dispatchEvent(new CustomEvent(eventType, {
            detail: baseData,
            bubbles: true
        }));
    }

    // Separated placeholder positioning logic
    updatePlaceholderPosition(afterElement) {
        if (afterElement !== this.dragState.lastAfterElement) {
            this.dragState.lastAfterElement = afterElement;
            const placeholder = this.querySelector('.drag-placeholder');
            
            if (afterElement === null) {
                this.appendChild(placeholder);
            } else {
                this.insertBefore(placeholder, afterElement);
            }
        }
    }

    handleGlobalClick(event) {
        const isClickInside = this.contains(event.target);
        
        if (isClickInside) {
            if (!this.pinned) {
                this.pinned = true;
                this.dispatchEvent(new CustomEvent('pin-change', {
                    detail: { pinned: true },
                    bubbles: true
                }));
            }
            
            // Handle add button click
            const addButton = event.target.closest('[part="add-button"]');
            if (addButton) {
                this.dispatchEvent(new CustomEvent('add-item', {
                    bubbles: true
                }));
            }
        } else {
            if (this.pinned) {
                this.pinned = false;
                this.dispatchEvent(new CustomEvent('pin-change', {
                    detail: { pinned: false },
                    bubbles: true
                }));
            }
        }
    }

    // Simplified drag start
    handleDragStart(event) {
        const item = event.target.closest('[slot="flow-items"]');
        if (!item) return;
        
        // Reset and initialize drag state
        Object.assign(this.dragState, {
            draggedIndex: parseInt(item.dataset.index || '0', 10),
            lastMouseY: event.clientY,
            lastAfterElement: item.nextElementSibling,
            lastCollision: null,
            lastDirection: null
        });
        
        // Calculate item dimensions
        const rect = item.getBoundingClientRect();
        this.dragState.startOffset = event.clientY - rect.top;
        this.dragState.itemHeight = rect.height;
        
        event.dataTransfer.effectAllowed = 'move';
        
        // Visual feedback with minimal delay
        requestAnimationFrame(() => {
            item.classList.add('drag-placeholder');
        });

        this.emitDragEvent('drag-start', { draggedElement: item });
    }

    // Optimized handleDragOver method
    handleDragOver(event) {
        event.preventDefault();
        
        const flowList = this.shadowRoot.querySelector('.flow-list');
        const placeholder = this.querySelector('.drag-placeholder');
        
        if (!flowList || !placeholder || this.dragState.draggedIndex === null) return;

        const currentMouseY = event.clientY;
        
        // Handle auto-scrolling
        this.handleAutoScroll(currentMouseY, flowList);
        
        // Update direction with hysteresis
        const direction = this.updateDirection(currentMouseY);
        if (!direction) return; // No movement detected
        
        // Calculate drag bounds once
        const dragBounds = this.calculateDragBounds(currentMouseY);
        
        // Get resting elements once
        const flowSlot = this.shadowRoot.querySelector('slot[name="flow-items"]');
        const restingElements = flowSlot.assignedElements().filter(el => 
            !el.classList.contains('drag-placeholder')
        );
        
        // Detect collision
        const collision = this.detectCollision(dragBounds, direction, restingElements);
        
        if (collision) {
            // Only log and emit if this is a new collision
            if (collision.element !== this.dragState.lastCollision) {
                this.emitDragEvent('drag-collision', {
                    collidedElement: collision.element,
                    collisionDirection: collision.direction
                });
                
                this.dragState.lastCollision = collision.element;
            }
            
            // Update placeholder position if needed
            this.updatePlaceholderPosition(collision.insertBefore);
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const placeholder = this.querySelector('.drag-placeholder');
        
        if (this.dragState.draggedIndex !== null && placeholder) {
            const flowSlot = this.shadowRoot.querySelector('slot[name="flow-items"]');
            const items = flowSlot.assignedElements();
            const newIndex = items.indexOf(placeholder);
            
            if (this.dragState.draggedIndex !== newIndex) {
                this.dispatchEvent(new CustomEvent('item-reorder', {
                    detail: {
                        fromIndex: this.dragState.draggedIndex,
                        toIndex: newIndex,
                        draggedElement: placeholder
                    },
                    bubbles: true
                }));
            }
        }
    }

    // Simplified drag end with state cleanup
    handleDragEnd() {
        const placeholder = this.querySelector('.drag-placeholder');
        placeholder?.classList.remove('drag-placeholder');

        this.emitDragEvent('drag-end');

        // Reset all drag state in one operation
        Object.assign(this.dragState, {
            draggedIndex: null,
            startOffset: 0,
            itemHeight: 0,
            lastCollision: null,
            lastAfterElement: null,
            lastMouseY: 0,
            lastDirection: null
        });
    }

    // Public API methods
    addItem(element) {
        element.slot = 'flow-items';
        this.appendChild(element);
        this.updateItemIndices();
    }

    removeItem(index) {
        const flowSlot = this.shadowRoot.querySelector('slot[name="flow-items"]');
        const items = flowSlot.assignedElements();
        if (items[index]) {
            items[index].remove();
            this.updateItemIndices();
        }
    }

    getItems() {
        const flowSlot = this.shadowRoot.querySelector('slot[name="flow-items"]');
        return flowSlot ? flowSlot.assignedElements() : [];
    }

    setOverlapThreshold(threshold) {
        this.dragConfig.overlapThreshold = Math.max(0.1, Math.min(0.9, threshold));
        this.setAttribute('overlap-threshold', this.dragConfig.overlapThreshold.toString());
    }

    // Public method to update configuration
    updateDragConfig(newConfig) {
        Object.assign(this.dragConfig, newConfig);
    }

    // Getter for current drag state (useful for debugging)
    get currentDragState() {
        return { ...this.dragState };
    }
}

// Register the custom element
customElements.define('material-flow-panel', MaterialFlowPanel);