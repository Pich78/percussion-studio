// file: src/components/RhythmEditorView/RhythmEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class RhythmEditorView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {};
        this.isFlowHovered = false;
        this.draggedIndex = null;
        this.isDragging = false;
        this.dragStartedInPanel = false;

        loadCSS('/percussion-studio/src/components/RhythmEditorView/RhythmEditorView.css');
        logEvent('info', 'RhythmEditorView', 'constructor', 'Lifecycle', 'Component created.');
        
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
        this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
        this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.container.addEventListener('dragover', this.handleDragOver.bind(this));
        this.container.addEventListener('drop', this.handleDrop.bind(this));
        this.container.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    render(state) {
        logEvent('debug', 'RhythmEditorView', 'render', 'State', 'Rendering with state:', state);
        this.state = state;
        const { rhythm, isFlowPinned } = state;

        if (!rhythm) {
            this.container.innerHTML = '<p class="f5 gray i tc pa4">No rhythm loaded.</p>';
            return;
        }

        const gridMarginClasses = `ml-${isFlowPinned ? '64' : '8'}`;

        const html = `
            <div class="relative w-100 h-100">
                ${this._renderFlowPanel(state)}
                <div class="grid-panel absolute top-0 left-0 w-100 h-100 pa3 overflow-auto ${gridMarginClasses}" data-action-scope="grid-panel">
                    ${this._renderGridPanel(state)}
                </div>
            </div>
        `;
        this.container.innerHTML = html;

        // Auto-scroll to the last item if it was just added
        if (state.scrollToLastItem) {
            setTimeout(() => {
                const flowList = this.container.querySelector('.flow-list');
                const lastItem = this.container.querySelector('.flow-item:last-child');
                if (flowList && lastItem) {
                    lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 50); // Small delay to ensure DOM is updated
        }
    }
    
    _renderFlowPanel(state) {
        const { rhythm, currentEditingPatternId, isFlowPinned } = state;
        const isExpanded = isFlowPinned || this.isFlowHovered;

        const flowItems = rhythm.playback_flow.map((item, index) => {
            const selectedClass = item.pattern === currentEditingPatternId ? 'bg-washed-blue b--blue' : 'bg-white';
            return `
                <div data-action="select-pattern" data-pattern-id="${item.pattern}" data-index="${index}" class="flow-item flex items-center justify-between pa2 br1 ba b--black-10 pointer ${selectedClass}" draggable="true">
                    <span class="truncate">${item.pattern}</span>
                    <button data-action="delete-flow-item" data-index="${index}" class="delete-btn pa1 bn bg-transparent f4 red pointer" title="Remove Item">×</button>
                </div>
            `;
        }).join('');

        return `
            <div id="flow-panel" class="editor-panel absolute top-0 left-0 h-100 bg-near-white shadow-2 pa3 ${isExpanded ? 'is-expanded' : ''}">
                <h3 class="f4 b vertical-text">Rhythm Flow</h3>
                <div class="panel-content w-100">
                    <h3 class="f4 b mt0">Rhythm Flow</h3>
                    <div class="flow-list flex flex-column mt3">${flowItems}</div>
                    <button data-action="add-pattern" class="w-100 mt3 pv2 ph3 bn br2 bg-blue white pointer hover-bg-dark-blue f3">+</button>
                </div>
            </div>`;
    }

    _renderGridPanel(state) {
        const { rhythm, currentEditingPatternId } = state;
        if (!currentEditingPatternId || !rhythm.patterns[currentEditingPatternId]) {
            return '<p class="f5 gray i tc pa4">Select a pattern from the Rhythm Flow to edit, or add a new one.</p>';
        }

        const pattern = rhythm.patterns[currentEditingPatternId];
        const measure = pattern.pattern_data[0] || {};
        const resolution = pattern.metadata.resolution;
        const instruments = Object.keys(measure).sort();

        let gridHtml = '';
        instruments.forEach(symbol => {
            const noteString = (measure[symbol] || '').replace(/\|/g, '');
            gridHtml += `<div class="instrument-header">${symbol}</div>`;
            for (let i = 0; i < resolution; i++) {
                // This part would be enhanced to render SVG icons in a real implementation
                const noteChar = noteString[i] || '-';
                gridHtml += `<div class="grid-cell" data-action="edit-note" data-symbol="${symbol}" data-tick="${i}">${noteChar}</div>`;
            }
        });

        return `
            <div class="flex items-center justify-between mb3">
                <h2 class="f3 b mv0">Editing: ${currentEditingPatternId}</h2>
                <div class="playback-controls">
                    <button data-action="play-pattern" class="pv2 ph3 bn br2 bg-green white pointer hover-bg-dark-green mr2">Play Pattern</button>
                    <button data-action="play-rhythm" class="pv2 ph3 bn br2 bg-blue white pointer hover-bg-dark-blue">Play Rhythm</button>
                </div>
            </div>
            <div class="grid" style="grid-template-columns: 100px repeat(${resolution}, 1fr);">${gridHtml}</div>`;
    }

    handleClick(event) {
        // First check if we're clicking on a specific action element
        const actionTarget = event.target.closest('[data-action]');
        if (actionTarget) {
            const action = actionTarget.dataset.action;
            logEvent('debug', 'RhythmEditorView', 'handleClick', 'Events', `Action: ${action}`);

            if (action === 'delete-flow-item') {
                event.stopPropagation(); // Prevent panel pinning when deleting
                if (window.confirm('Remove this pattern from the flow?')) {
                    this.callbacks.onDeleteFlowItem?.(parseInt(actionTarget.dataset.index, 10));
                }
                return; // Exit early to prevent panel pinning logic
            }
            if (action === 'add-pattern') {
                this.callbacks.onAddPattern?.();
                // Don't return here - we want clicking + to pin the panel if it's not pinned
            }
            if (action === 'select-pattern') {
                this.callbacks.onPatternSelect?.(actionTarget.dataset.patternId);
                // Don't return here - we want clicking a pattern to pin the panel if it's not pinned
            }
        }

        // Now handle panel pinning logic - ANY click within a panel should pin it
        const flowPanel = event.target.closest('#flow-panel');
        if (flowPanel) {
            this.callbacks.onPinFlowPanel?.(!this.state.isFlowPinned);
            return;
        }
        
        // If clicking on the grid panel (not on sidebars), unpin the flow panel
        const gridPanel = event.target.closest('[data-action-scope="grid-panel"]');
        if (gridPanel) {
            this.callbacks.onPinFlowPanel?.(false);
        }
    }
    
    handleMouseEnter(event) {
        // Don't handle mouse events while dragging
        if (this.isDragging) return;
        
        // Only handle mouse enter for the panel elements themselves
        if (event.target.id === 'flow-panel' || event.target.closest('#flow-panel') === document.getElementById('flow-panel')) {
            if (!this.state.isFlowPinned && !this.isFlowHovered) {
                this.isFlowHovered = true;
                this.render(this.state);
            }
        }
    }

    handleMouseLeave(event) {
        // Don't handle mouse events while dragging
        if (this.isDragging) return;
        
        // Check if we're actually leaving the panel (not just moving to a child element)
        if (event.target.id === 'flow-panel') {
            if (!this.state.isFlowPinned && this.isFlowHovered) {
                // Make sure we're actually leaving the panel area
                const rect = event.target.getBoundingClientRect();
                const { clientX, clientY } = event;
                if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
                    this.isFlowHovered = false;
                    this.render(this.state);
                }
            }
        }
    }

    handleDragStart(event) {
        const item = event.target.closest('.flow-item');
        if (item) {
            this.draggedIndex = parseInt(item.dataset.index, 10);
            this.isDragging = true;
            this.dragStartedInPanel = event.target.closest('#flow-panel') !== null;
            
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', ''); // Required for some browsers
            
            item.classList.add('dragging');
            logEvent('debug', 'RhythmEditorView', 'handleDragStart', 'Drag', `Started dragging item at index ${this.draggedIndex}`);
        }
    }

    handleDragOver(event) {
        if (this.draggedIndex === null) return;
        
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        
        const flowList = event.target.closest('.flow-list');
        if (!flowList) return;
        
        // Clear previous indicators
        flowList.querySelectorAll('.drop-indicator').forEach(el => el.remove());
        flowList.querySelectorAll('.flow-item').forEach(item => {
            item.classList.remove('drop-target-before', 'drop-target-after');
        });
        
        const flowItems = Array.from(flowList.querySelectorAll('.flow-item'));
        if (flowItems.length === 0) return;
        
        const mouseY = event.clientY;
        let insertIndex = flowItems.length; // Default to end
        
        // Find the insertion point
        for (let i = 0; i < flowItems.length; i++) {
            const rect = flowItems[i].getBoundingClientRect();
            const itemMiddle = rect.top + rect.height / 2;
            
            if (mouseY < itemMiddle) {
                insertIndex = i;
                break;
            }
        }
        
        // Don't show indicator if trying to drop in the same position
        if (insertIndex === this.draggedIndex || insertIndex === this.draggedIndex + 1) {
            return;
        }
        
        // Show visual indicator
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator';
        
        if (insertIndex < flowItems.length) {
            // Insert before an item
            flowItems[insertIndex].classList.add('drop-target-before');
            flowItems[insertIndex].parentNode.insertBefore(indicator, flowItems[insertIndex]);
        } else {
            // Insert at the end
            if (flowItems.length > 0) {
                flowItems[flowItems.length - 1].classList.add('drop-target-after');
                flowItems[flowItems.length - 1].parentNode.appendChild(indicator);
            }
        }
    }

    handleDrop(event) {
        if (this.draggedIndex === null) return;
        
        event.preventDefault();
        
        const flowList = event.target.closest('.flow-list');
        if (!flowList) return;
        
        const flowItems = Array.from(flowList.querySelectorAll('.flow-item'));
        const mouseY = event.clientY;
        let insertIndex = flowItems.length; // Default to end
        
        // Calculate insertion point
        for (let i = 0; i < flowItems.length; i++) {
            const rect = flowItems[i].getBoundingClientRect();
            const itemMiddle = rect.top + rect.height / 2;
            
            if (mouseY < itemMiddle) {
                insertIndex = i;
                break;
            }
        }
        
        // Adjust for the fact that we're removing the dragged item first
        let finalIndex = insertIndex;
        if (this.draggedIndex < insertIndex) {
            finalIndex = insertIndex - 1;
        }
        
        // Only reorder if the position actually changed
        if (finalIndex !== this.draggedIndex) {
            logEvent('debug', 'RhythmEditorView', 'handleDrop', 'Drag', `Moving item from ${this.draggedIndex} to ${finalIndex}`);
            this.callbacks.onReorderFlow?.(this.draggedIndex, finalIndex);
        }
    }

    handleDragEnd(event) {
        logEvent('debug', 'RhythmEditorView', 'handleDragEnd', 'Drag', 'Drag ended');
        
        // Clean up visual indicators
        if (this.container) {
            this.container.querySelectorAll('.drop-indicator').forEach(el => el.remove());
            this.container.querySelectorAll('.flow-item').forEach(item => {
                item.classList.remove('dragging', 'drop-target-before', 'drop-target-after');
            });
        }
        
        // Reset drag state
        this.draggedIndex = null;
        this.isDragging = false;
        
        // Reset panel behavior after drag ends
        setTimeout(() => {
            this.dragStartedInPanel = false;
        }, 100); // Small delay to prevent immediate collapse
    }
}