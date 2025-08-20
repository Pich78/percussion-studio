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
        
        // --- Use a single global click handler ---
        this.handleGlobalClick = this.handleGlobalClick.bind(this);
        document.addEventListener('click', this.handleGlobalClick);

        this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.container.addEventListener('dragover', (e) => e.preventDefault());
        this.container.addEventListener('drop', this.handleDrop.bind(this));
        this.container.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    render(state) {
        this.state = state;
        const { flow, currentPatternId, isPinned /* scrollToLast removed */ } = state;

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

        // No scrolling behavior: intentionally do not create/update any custom scrollbars
        // and do not call scrollTo() — content will be clipped if it overflows.
    }
    
    // --- No custom scrollbar code (createCustomScrollbar / updateCustomScrollbar removed) ---

    handleGlobalClick(event) {
        const isClickInside = this.container.contains(event.target);

        if (isClickInside) {
            // Pin the panel if it's not already pinned.
            if (!this.state.isPinned) {
                this.callbacks.onPin?.(true);
            }

            // Handle actionable element clicks.
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
            // Unpin the panel if it's currently pinned.
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
