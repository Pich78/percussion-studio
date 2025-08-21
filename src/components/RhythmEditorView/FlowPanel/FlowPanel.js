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

        // Render the main panel structure, leaving the list empty
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
        
        // Create and render a PatternItemView for each item in the flow
        flow.forEach((item, index) => {
            const isSelected = item.pattern === currentPatternId;

            // Create a host element that will be draggable and handle selection clicks
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
                // The 'delete-flow-item' action is now handled by the PatternItemView's callback
            }
        } else {
            if (this.state.isPinned) {
                logEvent('debug', 'FlowPanel', 'handleGlobalClick', 'Events', 'Outside click detected. Unpinning.');
                this.callbacks.onPin?.(false);
            }
        }
    }

    handleDragStart(event) {
        const itemHost = event.target.closest('.flow-item-host');
        if (itemHost) {
            this.draggedIndex = parseInt(itemHost.dataset.index, 10);
            event.dataTransfer.effectAllowed = 'move';
            setTimeout(() => {
                itemHost.classList.add('drag-placeholder');
            }, 0);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        const listContainer = this.container.querySelector('.flow-list');
        const placeholder = this.container.querySelector('.drag-placeholder');
        if (!listContainer || !placeholder) return;

        const afterElement = this.getDragAfterElement(listContainer, event.clientY);
        if (afterElement == null) {
            listContainer.appendChild(placeholder);
        } else {
            listContainer.insertBefore(placeholder, afterElement);
        }
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.flow-item-host:not(.drag-placeholder)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
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
    }
}