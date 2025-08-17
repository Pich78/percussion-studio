// file: src/components/RhythmEditorView/RhythmEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class RhythmEditorView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {}; // Cache of the last state received from the parent

        // Internal UI state for hover effects, managed entirely by the component
        this.isFlowHovered = false;
        this.isPaletteHovered = false;

        loadCSS('/percussion-studio/src/components/RhythmEditorView/RhythmEditorView.css');
        logEvent('info', 'RhythmEditorView', 'constructor', 'Lifecycle', 'Component created.');
        
        // Delegated event listeners
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('mouseover', this.handleMouseOver.bind(this));
        this.container.addEventListener('mouseout', this.handleMouseOut.bind(this));
    }

    render(state) {
        logEvent('debug', 'RhythmEditorView', 'render', 'State', 'Rendering with state:', state);
        this.state = state;
        const { rhythm, isFlowPinned, isPalettePinned } = state;

        if (!rhythm) {
            this.container.innerHTML = '<p class="f5 gray i tc pa4">No rhythm loaded.</p>';
            return;
        }

        const gridMarginClasses = `
            ${isFlowPinned ? 'ml-64' : 'ml-16'}
            ${isPalettePinned ? 'mr-64' : 'mr-16'}
        `;

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

        const flowItems = rhythm.playback_flow.map(item => {
            const selectedClass = item.pattern === currentEditingPatternId ? 'bg-washed-blue' : 'bg-white';
            return `<div data-action="select-pattern" data-pattern-id="${item.pattern}" class="flow-item flex items-center pa2 br1 pointer hover-bg-light-gray ${selectedClass}">${item.pattern} [x${item.repetitions}]</div>`;
        }).join('');

        return `
            <div id="flow-panel" class="editor-panel absolute top-0 left-0 h-100 bg-near-white shadow-2 pa3 ${isExpanded ? 'is-expanded' : 'w4'}">
                <h3 class="f4 b absolute top-2 left-2 vertical-text">Rhythm Flow</h3>
                <div class="panel-content">
                    <h3 class="f4 b mt0">Rhythm Flow</h3>
                    ${flowItems}
                    <button data-action="add-pattern" class="w-100 mt3 pv2 ph3 bn br2 bg-blue white pointer hover-bg-dark-blue">+</button>
                </div>
            </div>`;
    }

    _renderGridPanel(state) {
        // This method's rendering logic remains the same
        return `<!-- ... Grid HTML ... -->`;
    }

    _renderPalettePanel(state) {
        const { isPalettePinned } = state;
        const isExpanded = isPalettePinned || this.isPaletteHovered;

        return `
            <div id="palette-panel" class="editor-panel absolute top-0 right-0 h-100 bg-near-white shadow-2 pa3 ${isExpanded ? 'is-expanded' : 'w4'}">
                <h3 class="f4 b absolute top-2 right-2 vertical-text">Palette</h3>
                <div class="panel-content">
                    <h3 class="f4 b mt0">Palette</h3>
                    <!-- ... Palette items ... -->
                </div>
            </div>`;
    }

    // --- Event Handling ---
    
    handleClick(event) {
        const flowPanel = event.target.closest('#flow-panel');
        if (flowPanel) {
            logEvent('debug', 'RhythmEditorView', 'handleClick', 'Events', 'Click inside Flow Panel. Firing pin callback.');
            this.callbacks.onPinFlowPanel?.(true);
            return; // Stop further processing
        }

        const palettePanel = event.target.closest('#palette-panel');
        if (palettePanel) {
            logEvent('debug', 'RhythmEditorView', 'handleClick', 'Events', 'Click inside Palette Panel. Firing pin callback.');
            this.callbacks.onPinPalettePanel?.(true);
            return;
        }
        
        // Handle clicks outside the panels for unpinning
        const gridPanel = event.target.closest('[data-action-scope="grid-panel"]');
        if (gridPanel) {
            logEvent('debug', 'RhythmEditorView', 'handleClick', 'Events', 'Click inside Grid Panel. Firing unpin callbacks.');
            this.callbacks.onPinFlowPanel?.(false);
            this.callbacks.onPinPalettePanel?.(false);
        }
        
        // Handle action clicks
        const actionTarget = event.target.closest('[data-action]');
        if (actionTarget) {
            const action = actionTarget.dataset.action;
            if (action === 'select-pattern') this.callbacks.onPatternSelect?.(actionTarget.dataset.patternId);
        }
    }
    
    handleMouseOver(event) {
        if (event.target.closest('#flow-panel')) {
            this.isFlowHovered = true;
            this.render(this.state);
        }
        if (event.target.closest('#palette-panel')) {
            this.isPaletteHovered = true;
            this.render(this.state);
        }
    }

    handleMouseOut(event) {
        if (event.target.closest('#flow-panel')) {
            this.isFlowHovered = false;
            this.render(this.state);
        }
        if (event.target.closest('#palette-panel')) {
            this.isPaletteHovered = false;
            this.render(this.state);
        }
    }
}