// file: src/components/RhythmEditorView/RhythmEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class RhythmEditorView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {};

        // Internal UI state for hover effects
        this.isFlowHovered = false;
        this.isPaletteHovered = false;

        loadCSS('/percussion-studio/src/components/RhythmEditorView/RhythmEditorView.css');
        logEvent('info', 'RhythmEditorView', 'constructor', 'Lifecycle', 'Component created.');
        
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('mouseover', this.handleMouseOver.bind(this));
        this.container.addEventListener('mouseout', this.handleMouseOut.bind(this));
    }

    render(state) {
        logEvent('debug', 'RhythmEditorView', 'render', 'State', 'Rendering with state:', state);
        this.state = state; // Cache the latest state from parent
        const { rhythm, isFlowPinned, isPalettePinned } = state;

        if (!rhythm) {
            this.container.innerHTML = '<p class="f5 gray i tc pa4">No rhythm loaded.</p>';
            return;
        }

        const gridMarginClasses = `
            ${isFlowPinned ? 'ml-64' : 'ml-8'} 
            ${isPalettePinned ? 'mr-64' : 'mr-8'}
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
        const { isFlowPinned } = state;
        const isExpanded = isFlowPinned || this.isFlowHovered;
        return `
            <div id="flow-panel" class="editor-panel absolute top-0 left-0 h-100 bg-near-white shadow-2 pa3 ${isExpanded ? 'is-expanded' : ''}">
                <h3 class="f4 b vertical-text">Rhythm Flow</h3>
                <div class="panel-content w-100">
                    <h3 class="f4 b mt0">Rhythm Flow</h3>
                    <!-- Flow content would be rendered here -->
                </div>
            </div>`;
    }

    _renderGridPanel(state) {
        // Unchanged - renders the grid based on pattern data
        return `<!-- Grid HTML would be here -->`;
    }

    _renderPalettePanel(state) {
        const { isPalettePinned } = state;
        const isExpanded = isPalettePinned || this.isPaletteHovered;
        return `
            <div id="palette-panel" class="editor-panel absolute top-0 right-0 h-100 bg-near-white shadow-2 pa3 ${isExpanded ? 'is-expanded' : ''}">
                <h3 class="f4 b vertical-text">Palette</h3>
                <div class="panel-content w-100">
                    <h3 class="f4 b mt0">Palette</h3>
                    <!-- Palette content would be rendered here -->
                </div>
            </div>`;
    }

    handleClick(event) {
        const flowPanel = event.target.closest('#flow-panel');
        if (flowPanel) {
            this.callbacks.onPinFlowPanel?.(!this.state.isFlowPinned); // Toggle pin state
            return;
        }

        const palettePanel = event.target.closest('#palette-panel');
        if (palettePanel) {
            this.callbacks.onPinPalettePanel?.(!this.state.isPalettePinned); // Toggle pin state
            return;
        }
        
        const gridPanel = event.target.closest('[data-action-scope="grid-panel"]');
        if (gridPanel) {
            // Clicking the center grid unpins both sidebars
            this.callbacks.onPinFlowPanel?.(false);
            this.callbacks.onPinPalettePanel?.(false);
        }
    }
    
    handleMouseOver(event) {
        if (event.target.closest('#flow-panel') && !this.isFlowHovered) {
            this.isFlowHovered = true;
            this.render(this.state);
        }
        if (event.target.closest('#palette-panel') && !this.isPaletteHovered) {
            this.isPaletteHovered = true;
            this.render(this.state);
        }
    }

    handleMouseOut(event) {
        if (event.target.closest('#flow-panel') && this.isFlowHovered) {
            this.isFlowHovered = false;
            this.render(this.state);
        }
        if (event.target.closest('#palette-panel') && this.isPaletteHovered) {
            this.isPaletteHovered = false;
            this.render(this.state);
        }
    }
}