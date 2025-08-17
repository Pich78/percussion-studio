// file: src/components/RhythmEditorView/RhythmEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class RhythmEditorView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {};
        this.isFlowHovered = false;
        this.isPaletteHovered = false;
        this.draggedIndex = null;

        loadCSS('/percussion-studio/src/components/RhythmEditorView/RhythmEditorView.css');
        logEvent('info', 'RhythmEditorView', 'constructor', 'Lifecycle', 'Component created.');
        
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('mouseover', this.handleMouseOver.bind(this));
        this.container.addEventListener('mouseout', this.handleMouseOut.bind(this));
        this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.container.addEventListener('dragover', this.handleDragOver.bind(this));
        this.container.addEventListener('drop', this.handleDrop.bind(this));
    }

    render(state) {
        logEvent('debug', 'RhythmEditorView', 'render', 'State', 'Rendering with state:', state);
        this.state = state;
        const { rhythm, isFlowPinned, isPalettePinned } = state;

        if (!rhythm) {
            this.container.innerHTML = '<p class="f5 gray i tc pa4">No rhythm loaded.</p>';
            return;
        }

        const gridMarginClasses = `ml-${isFlowPinned ? '64' : '8'} mr-${isPalettePinned ? '64' : '8'}`;

        const html = `
            <div class="relative w-100 h-100">
                ${this._renderFlowPanel(state)}
                <div class="grid-panel absolute top-0 left-0 w-100 h-100 pa3 overflow-auto ${gridMarginClasses}" data-action-scope="grid-panel">
                    ${this._renderGridPanel(state)}
                </div>
                ${this._renderPalettePanel(state)}
            </div>
        `;
        this.container.innerHTML = html;
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
            <div id="flow-panel" data-action="pin-flow" class="editor-panel absolute top-0 left-0 h-100 bg-near-white shadow-2 pa3 ${isExpanded ? 'is-expanded' : ''}">
                <h3 class="f4 b absolute top-2 left-2 vertical-text">Rhythm Flow</h3>
                <div class="panel-content w-100">
                    <h3 class="f4 b mt0">Rhythm Flow</h3>
                    <div class="flow-list flex flex-column gap2 mt3">${flowItems}</div>
                    <button data-action="add-pattern" class="w-100 mt3 pv2 ph3 bn br2 bg-blue white pointer hover-bg-dark-blue f3">+</button>
                </div>
            </div>`;
    }

    _renderGridPanel(state) {
        // ... unchanged ...
        return `<!-- Grid HTML -->`;
    }

    _renderPalettePanel(state) {
        // ... logic restored ...
        const { isPalettePinned } = state;
        const isExpanded = isPalettePinned || this.isPaletteHovered;
        return `
            <div id="palette-panel" data-action="pin-palette" class="editor-panel absolute top-0 right-0 h-100 bg-near-white shadow-2 pa3 ${isExpanded ? 'is-expanded' : ''}">
                <h3 class="f4 b absolute top-2 right-2 vertical-text">Palette</h3>
                <div class="panel-content w-100">
                    <h3 class="f4 b mt0">Palette</h3>
                    <!-- Palette content -->
                </div>
            </div>`;
    }

    handleClick(event) {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;
        logEvent('debug', 'RhythmEditorView', 'handleClick', 'Events', `Action: ${action}`);

        switch(action) {
            case 'pin-flow': this.callbacks.onPinFlowPanel?.(!this.state.isFlowPinned); break;
            case 'pin-palette': this.callbacks.onPinPalettePanel?.(!this.state.isPalettePinned); break;
            case 'select-pattern': this.callbacks.onPatternSelect?.(target.dataset.patternId); break;
            case 'add-pattern': this.callbacks.onAddPattern?.(); break;
            case 'delete-flow-item':
                if (window.confirm('Remove this pattern from the flow?')) {
                    this.callbacks.onDeleteFlowItem?.(parseInt(target.dataset.index, 10));
                }
                break;
        }
    }
    
    handleMouseOver(event) {
        if (event.target.closest('#flow-panel') && !this.isFlowHovered) {
            this.isFlowHovered = true; this.render(this.state);
        }
        if (event.target.closest('#palette-panel') && !this.isPaletteHovered) {
            this.isPaletteHovered = true; this.render(this.state);
        }
    }
    handleMouseOut(event) {
        if (event.target.closest('#flow-panel') && this.isFlowHovered) {
            this.isFlowHovered = false; this.render(this.state);
        }
        if (event.target.closest('#palette-panel') && this.isPaletteHovered) {
            this.isPaletteHovered = false; this.render(this.state);
        }
    }

    handleDragStart(event) {
        const item = event.target.closest('.flow-item');
        if (item) this.draggedIndex = parseInt(item.dataset.index, 10);
    }
    handleDragOver(event) { event.preventDefault(); }
    handleDrop(event) {
        event.preventDefault();
        const dropTarget = event.target.closest('.flow-item');
        if (dropTarget && this.draggedIndex !== null) {
            const dropIndex = parseInt(dropTarget.dataset.index, 10);
            if (this.draggedIndex !== dropIndex) {
                this.callbacks.onReorderFlow?.(this.draggedIndex, dropIndex);
            }
        }
        this.draggedIndex = null;
    }
}