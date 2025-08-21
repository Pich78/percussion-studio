// file: src/components/RhythmEditorView/FlowPanel/FlowPanel.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { PatternItemView } from './PatternItemView/PatternItemView.js';

export class FlowPanel {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {};
        this.draggedIndex = null;
        this.patternItemViews = [];

        this.dragStartOffset = 0;
        this.draggedItemHeight = 0;
        
        // State for diagnostic logging and direction tracking
        this.lastLoggedCollision = null;
        this.lastAfterElement = null;
        this.lastMouseY = 0;
        this.lastDirection = null;

        loadCSS('/percussion-studio/src/components/RhythmEditorView/FlowPanel/FlowPanel.css');
        loadCSS('/percussion-studio/src/components/RhythmEditorView/FlowPanel/PatternItemView/PatternItemView.css');
        logEvent('info', 'FlowPanel', 'constructor', 'Lifecycle', 'Component created.');
        
        this.handleGlobalClick = this.handleGlobalClick.bind(this);
        document.addEventListener('click', this.handleGlobalClick);

        this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.container.addEventListener('dragover', this.handleDragOver.bind(this));
        this.container.addEventListener('drop', this.handleDrop.bind(this));
        this.container.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    render(state) {
        this.state = state;
        const { flow, currentPatternId, isPinned, globalBPM } = state;

        this.container.className = `editor-panel absolute top-0 left-0 h-100 bg-near-white shadow-2 pa3 ${isPinned ? 'is-pinned' : ''}`;
        this.container.innerHTML = `
            <h3 class="f4 b vertical-text">Rhythm Flow</h3>
            <div class="panel-content w-100">
                <h3 class="f4 b mt0">Rhythm Flow</h3>
                <div class="flow-list flex flex-column mt3"></div>
                <button data-action="add-pattern" class="w-100 mt3 pv2 ph3 bn br2 bg-blue white pointer hover-bg-dark-blue f3">+</button>
            </div>
        `;

        const flowListContainer = this.container.querySelector('.flow-list');
        this.patternItemViews = [];
        
        flow.forEach((item, index) => {
            const isSelected = item.pattern === currentPatternId;
            const itemHost = document.createElement('div');
            itemHost.className = 'flow-item-host';
            itemHost.draggable = true;
            itemHost.dataset.action = 'select-pattern';
            itemHost.dataset.patternId = item.pattern;
            itemHost.dataset.index = index;

            const itemView = new PatternItemView(itemHost, {
                onDelete: () => {
                    if (window.confirm('Remove this pattern from the flow?')) {
                        this.callbacks.onDeleteFlowItem?.(index);
                    }
                },
                onPropertyChange: (property, value) => {
                    this.callbacks.onPatternPropertyChange?.(index, property, value);
                }
            });

            this.patternItemViews.push(itemView);
            itemView.render({ item, index, globalBPM, isSelected });
            flowListContainer.appendChild(itemHost);
        });
    }
    
    handleGlobalClick(event) {
        const isClickInside = this.container.contains(event.target);

        if (isClickInside) {
            if (!this.state.isPinned) {
                this.callbacks.onPin?.(true);
            }

            const target = event.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            logEvent('debug', 'FlowPanel', 'handleGlobalClick', 'Events', `Action: ${action}`);

            switch(action) {
                case 'select-pattern':
                    {
                        const patternId = target.dataset.patternId;
                        let focusTarget = null;
                        const interactiveElement = event.target.closest('input, select');
                        if (interactiveElement) {
                            focusTarget = { property: interactiveElement.dataset.property };
                        }
                        this.callbacks.onPatternSelect?.(patternId, focusTarget);
                        break;
                    }
                case 'add-pattern':
                    this.callbacks.onAddPattern?.();
                    break;
            }
        } else {
            if (this.state.isPinned) {
                this.callbacks.onPin?.(false);
            }
        }
    }

    handleDragStart(event) {
        const itemHost = event.target.closest('.flow-item-host');
        if (itemHost) {
            this.draggedIndex = parseInt(itemHost.dataset.index, 10);
            event.dataTransfer.effectAllowed = 'move';
            this.lastMouseY = event.clientY; // Initialize mouse position

            const rect = itemHost.getBoundingClientRect();
            this.dragStartOffset = event.clientY - rect.top;
            this.draggedItemHeight = rect.height;

            setTimeout(() => {
                itemHost.classList.add('drag-placeholder');
            }, 0);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        const listContainer = this.container.querySelector('.flow-list');
        const placeholder = this.container.querySelector('.drag-placeholder');
        if (!listContainer || !placeholder || this.draggedIndex === null) return;

        // 1. Determine direction of movement
        let direction = event.clientY < this.lastMouseY ? 'up' : (event.clientY > this.lastMouseY ? 'down' : this.lastDirection);
        if (direction !== this.lastDirection) {
            this.lastLoggedCollision = null; // Reset collision when direction changes
        }

        // 2. Calculate dragged item's active border position
        const draggedTop = event.clientY - this.dragStartOffset;
        const draggedBottom = draggedTop + this.draggedItemHeight;

        // 3. Find collision based on direction
        const restingElements = [...listContainer.querySelectorAll('.flow-item-host:not(.drag-placeholder)')];
        let collision = null;
        let afterElement = this.lastAfterElement;

        if (direction === 'up') {
            for (const child of restingElements) {
                const childIndex = parseInt(child.dataset.index, 10);
                const childBox = child.getBoundingClientRect();
                // Active border (draggedTop) hits sensible border (childBox.bottom)
                if (childIndex < this.draggedIndex && draggedTop <= childBox.bottom) {
                    collision = { element: child, direction: 'up' };
                    afterElement = child;
                    break;
                }
            }
        } else if (direction === 'down') {
            for (const child of restingElements) {
                const childIndex = parseInt(child.dataset.index, 10);
                const childBox = child.getBoundingClientRect();
                // Active border (draggedBottom) hits sensible border (childBox.top)
                if (childIndex > this.draggedIndex && draggedBottom >= childBox.top) {
                    collision = { element: child, direction: 'down' };
                    let nextSibling = child.nextElementSibling;
                    if (nextSibling && nextSibling.classList.contains('drag-placeholder')) {
                       nextSibling = nextSibling.nextElementSibling;
                    }
                    afterElement = nextSibling;
                    break;
                }
            }
        }

        // 4. Log and update UI if a new, valid collision is detected
        if (collision && collision.element !== this.lastLoggedCollision) {
            const draggedItemName = this.state.flow[this.draggedIndex].pattern;
            const restingItemName = collision.element.dataset.patternId;
            const logMessage = collision.direction === 'up'
                ? `Dragged Item: ${draggedItemName} - Upper border touched ${restingItemName} lower border.`
                : `Dragged Item: ${draggedItemName} - Lower border touched ${restingItemName} upper border.`;
            logEvent('info', 'FlowPanel', 'handleDragOver', 'Border-Touch', `${logMessage} Mouse Y: ${event.clientY}`);
            
            const afterElementName = afterElement ? afterElement.dataset.patternId : 'the end of the list';
            logEvent('info', 'FlowPanel', 'handleDragOver', 'Drop-Area', `Drop area created for '${draggedItemName}' before '${afterElementName}'. Mouse Y: ${event.clientY}`);

            this.lastLoggedCollision = collision.element;
            this.lastAfterElement = afterElement;
        }

        // 5. Update DOM
        if (afterElement === null) {
            listContainer.appendChild(placeholder);
        } else {
            listContainer.insertBefore(placeholder, afterElement);
        }

        // 6. Update state for the next frame
        this.lastMouseY = event.clientY;
        this.lastDirection = direction;
    }

    handleDrop(event) {
        event.preventDefault();
        const placeholder = this.container.querySelector('.drag-placeholder');
        if (this.draggedIndex !== null && placeholder) {
            const listContainer = this.container.querySelector('.flow-list');
            const newIndex = Array.from(listContainer.children).indexOf(placeholder);
            if (this.draggedIndex !== newIndex) {
                this.callbacks.onReorderFlow?.(this.draggedIndex, newIndex);
            }
        }
    }
    
    handleDragEnd() {
        const placeholder = this.container.querySelector('.drag-placeholder');
        if (placeholder) {
            placeholder.classList.remove('drag-placeholder');
        }
        this.draggedIndex = null;
        this.dragStartOffset = 0;
        this.draggedItemHeight = 0;
        this.lastLoggedCollision = null;
        this.lastAfterElement = null;
        this.lastMouseY = 0;
        this.lastDirection = null;
    }
}