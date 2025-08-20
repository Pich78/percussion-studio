// file: src/components/RhythmEditorView/FlowPanel/FlowPanel.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class FlowPanel {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {};
        this.draggedIndex = null;
        this.placeholder = null;

        loadCSS('/percussion-studio/src/components/RhythmEditorView/FlowPanel/FlowPanel.css');
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
        const { flow, currentPatternId, isPinned } = state;

        const flowItems = flow.map((item, index) => {
            const selectedClass = item.pattern === currentPatternId ? 'is-selected' : '';
            return `
                <div data-action="select-pattern" data-pattern-id="${item.pattern}" data-index="${index}" class="flow-item flex items-center justify-between pa2 br1 ba b--black-10 pointer bg-white hover-bg-light-gray ${selectedClass}" draggable="true">
                    <span class="truncate">${item.pattern}</span>
                    <button data-action="delete-flow-item" data-index="${index}" class="delete-btn pa1 bn bg-transparent f4 red pointer" title="Remove Item">×</button>
                </div>`;
        }).join('');

        this.container.className = `editor-panel absolute top-0 left-0 h-100 bg-near-white shadow-2 pa3 ${isPinned ? 'is-pinned' : ''}`;
        this.container.innerHTML = `
            <h3 class="f4 b vertical-text">Rhythm Flow</h3>
            <div class="panel-content w-100">
                <h3 class="f4 b mt0">Rhythm Flow</h3>
                <div class="flow-list flex flex-column mt3">${flowItems}</div>
                <button data-action="add-pattern" class="w-100 mt3 pv2 ph3 bn br2 bg-blue white pointer hover-bg-dark-blue f3">+</button>
            </div>
        `;
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
                    this.callbacks.onPatternSelect?.(target.dataset.patternId);
                    break;
                case 'add-pattern':
                    this.callbacks.onAddPattern?.();
                    break;
                case 'delete-flow-item':
                    event.stopPropagation();
                    if (window.confirm('Remove this pattern from the flow?')) {
                        this.callbacks.onDeleteFlowItem?.(parseInt(target.dataset.index, 10));
                    }
                    break;
            }
        } else {
            if (this.state.isPinned) {
                logEvent('debug', 'FlowPanel', 'handleGlobalClick', 'Events', 'Outside click detected. Unpinning.');
                this.callbacks.onPin?.(false);
            }
        }
    }

    handleDragStart(event) {
        const item = event.target.closest('.flow-item');
        if (item) {
            this.draggedIndex = parseInt(item.dataset.index, 10);
            event.dataTransfer.effectAllowed = 'move';
            setTimeout(() => item.classList.add('dragging'), 0);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        const listContainer = this.container.querySelector('.flow-list');
        const draggingItem = this.container.querySelector('.dragging');
        if (!listContainer || !draggingItem) return;

        if (!this.placeholder) {
            this.placeholder = document.createElement('div');
            this.placeholder.className = 'drop-placeholder';
            this.placeholder.style.height = `${draggingItem.offsetHeight}px`;
        }

        const afterElement = this.getDragAfterElement(listContainer, event.clientY);
        if (afterElement == null) {
            listContainer.appendChild(this.placeholder);
        } else {
            listContainer.insertBefore(this.placeholder, afterElement);
        }
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.flow-item:not(.dragging)')];

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
        if (this.draggedIndex !== null && this.placeholder?.parentNode) {
            const listContainer = this.container.querySelector('.flow-list');
            const items = Array.from(listContainer.children).filter(el => 
                el.classList.contains('flow-item') || el === this.placeholder
            );
            const newIndex = items.indexOf(this.placeholder);
            const adjustedIndex = (this.draggedIndex < newIndex) ? newIndex - 1 : newIndex;

            if (this.draggedIndex !== adjustedIndex) {
                this.callbacks.onReorderFlow?.(this.draggedIndex, adjustedIndex);
            }
        }
        this.handleDragEnd();
    }
    
    handleDragEnd() {
        if (this.draggedIndex !== null) {
            this.container.querySelector('.dragging')?.classList.remove('dragging');
            this.draggedIndex = null;
        }
        if (this.placeholder) {
            this.placeholder.remove();
            this.placeholder = null;
        }
    }
}