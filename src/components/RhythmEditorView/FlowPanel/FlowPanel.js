// file: src/components/RhythmEditorView/FlowPanel/FlowPanel.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class FlowPanel {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {};
        this.draggedIndex = null;

        loadCSS('/percussion-studio/src/components/RhythmEditorView/FlowPanel/FlowPanel.css');
        logEvent('info', 'FlowPanel', 'constructor', 'Lifecycle', 'Component created.');
        
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.container.addEventListener('dragover', (e) => e.preventDefault());
        this.container.addEventListener('drop', this.handleDrop.bind(this));
        this.container.addEventListener('dragend', this.handleDragEnd.bind(this));
        
        // --- MODIFICATION: Listen for clicks on the whole document ---
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        document.addEventListener('click', this.handleDocumentClick);
    }

    render(state) {
        this.state = state;
        const { flow, currentPatternId, isPinned, scrollToLast } = state;

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

        if (scrollToLast) {
            setTimeout(() => this.container.querySelector('.flow-list')?.scrollTo({ top: 9999, behavior: 'smooth' }), 50);
        }
    }

    // --- MODIFICATION: New method to handle clicks outside the panel ---
    handleDocumentClick(event) {
        // If the panel is pinned and the click is outside the container, unpin it.
        if (this.state.isPinned && !this.container.contains(event.target)) {
            logEvent('debug', 'FlowPanel', 'handleDocumentClick', 'Events', 'Outside click detected. Unpinning.');
            this.callbacks.onPin?.(false);
        }
    }

    // --- MODIFICATION: Changed logic to pin the panel on any internal click ---
    handleClick(event) {
        // Pin the panel on any click inside it, if it's not already pinned.
        if (!this.state.isPinned) {
            this.callbacks.onPin?.(true);
        }

        const target = event.target.closest('[data-action]');
        if (!target) {
            // This was a click on the panel background, which we now use only for pinning.
            return;
        }

        const action = target.dataset.action;
        logEvent('debug', 'FlowPanel', 'handleClick', 'Events', `Action: ${action}`);

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
    }

    handleDragStart(event) {
        const item = event.target.closest('.flow-item');
        if (item) {
            this.draggedIndex = parseInt(item.dataset.index, 10);
            event.dataTransfer.effectAllowed = 'move';
            setTimeout(() => item.classList.add('dragging'), 0);
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const dropTarget = event.target.closest('.flow-item');
        if (dropTarget && this.draggedIndex !== null) {
            const newIndex = Array.from(this.container.querySelectorAll('.flow-item')).indexOf(dropTarget);
            if (this.draggedIndex !== newIndex) {
                this.callbacks.onReorderFlow?.(this.draggedIndex, newIndex);
            }
        }
        this.handleDragEnd();
    }
    
    handleDragEnd() {
        if (this.draggedIndex !== null) {
            this.container.querySelector('.dragging')?.classList.remove('dragging');
            this.draggedIndex = null;
        }
    }
}