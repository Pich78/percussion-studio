// file: src/view/RhythmEditorView.js

export class RhythmEditorView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {};

        // Internal UI state for the new sidebar behavior
        this.isFlowPinned = false;
        this.isPalettePinned = false;

        // Bind event handlers
        this.handleClick = this.handleClick.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }

    render(state) {
        this.state = state;
        const { rhythm, currentEditingPatternId } = state;

        if (!rhythm) {
            this.container.innerHTML = '<div>Loading...</div>';
            return;
        }
        
        // CSS classes to control the main grid's margins based on pinned state
        const gridMarginClasses = `
            ${this.isFlowPinned ? 'ml-64' : 'ml-16'} 
            ${this.isPalettePinned ? 'mr-64' : 'mr-16'}
        `;

        const html = `
            <div class="w-full h-full flex transition-all duration-300">
                <!-- Left Panel: Rhythm Flow -->
                ${this._renderFlowPanel(rhythm.playback_flow, currentEditingPatternId)}
                
                <!-- Center Panel: Grid -->
                <div class="grid-panel flex-grow h-full overflow-auto p-4 transition-all duration-300 ${gridMarginClasses}">
                    ${this._renderGridPanel(rhythm, currentEditingPatternId)}
                </div>

                <!-- Right Panel: Instrument Palette -->
                ${this._renderPalettePanel(rhythm)}
            </div>
        `;
        this.container.innerHTML = html;
        this.attachEventListeners();
    }
    
    // --- Private Render Methods with Tailwind CSS ---

    _renderFlowPanel(flow, selectedPatternId) {
        const isPinned = this.isFlowPinned;
        const widthClass = isPinned ? 'w-64' : 'w-16 hover:w-64';
        const titleClasses = isPinned ? 'text-xl font-bold mb-4' : 'vertical-text text-lg font-bold group-hover:hidden';
        const contentVisibility = isPinned ? '' : 'hidden group-hover:block';

        let flowItems = '';
        flow.forEach((item, index) => {
            const isSelected = item.pattern === selectedPatternId ? 'bg-blue-100 border-blue-400' : 'bg-white';
            flowItems += `<div class="flow-item flex items-center p-2 border rounded ${isSelected}" data-pattern-id="${item.pattern}">${item.pattern} [x${item.repetitions}]</div>`;
        });

        return `
            <div id="flow-panel" class="group absolute top-0 left-0 h-full bg-slate-50 shadow-lg z-10 p-4 transition-all duration-300 ${widthClass}">
                <h3 class="${titleClasses}">Rhythm Flow</h3>
                <div class="flow-content mt-4 ${contentVisibility}">
                    ${flowItems}
                    <button class="add-pattern-btn w-full mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600">+</button>
                </div>
            </div>`;
    }

    _renderGridPanel(rhythm, patternId) {
        // This method's internal logic is the same, but we'd add Tailwind classes to its output if needed.
        // For now, the container's padding is the main change.
        if (!patternId || !rhythm.patterns[patternId]) {
            return '<h3>Pattern Grid</h3><p>Select a pattern from the Rhythm Flow to edit.</p>';
        }
        const pattern = rhythm.patterns[patternId];
        const measure = pattern.pattern_data[0] || {};
        const resolution = pattern.metadata.resolution;
        const instruments = Object.keys(measure);
        // ... grid rendering logic ...
        return `<h3>Editing: ${patternId}</h3> <div class="pattern-grid mt-4" style="grid-template-columns: 100px repeat(${resolution}, 1fr);">${/*...grid cells...*/''}</div>`;
    }

    _renderPalettePanel(rhythm) {
        const isPinned = this.isPalettePinned;
        const widthClass = isPinned ? 'w-64' : 'w-16 hover:w-64';
        const titleClasses = isPinned ? 'text-xl font-bold mb-4' : 'vertical-text text-lg font-bold group-hover:hidden';
        const contentVisibility = isPinned ? '' : 'hidden group-hover:block';
        
        let paletteContent = '<p>Select an instrument to see its notes.</p>';
        // Logic to render palette notes if an instrument is selected...

        return `
            <div id="palette-panel" class="group absolute top-0 right-0 h-full bg-slate-50 shadow-lg z-10 p-4 transition-all duration-300 ${widthClass}">
                <h3 class="${titleClasses}">Palette</h3>
                <div class="palette-content mt-4 ${contentVisibility}">
                    ${paletteContent}
                </div>
            </div>`;
    }

    // --- Event Handling ---
    
    attachEventListeners() {
        this.container.addEventListener('click', this.handleClick);
        document.addEventListener('click', this.handleOutsideClick, true); // Use capture phase
    }

    handleClick(event) {
        const flowPanel = event.target.closest('#flow-panel');
        const palettePanel = event.target.closest('#palette-panel');

        if (flowPanel) {
            if (!this.isFlowPinned) {
                this.isFlowPinned = true;
                this.isPalettePinned = false; // Unpin the other panel
                this.render(this.state);
            }
        } else if (palettePanel) {
            if (!this.isPalettePinned) {
                this.isPalettePinned = true;
                this.isFlowPinned = false; // Unpin the other panel
                this.render(this.state);
            }
        }
        // ... other click handlers for buttons, cells etc.
        const flowItem = event.target.closest('.flow-item');
        if (flowItem) {
            this.callbacks.onPatternSelect?.(flowItem.dataset.patternId);
        }
    }

    handleOutsideClick(event) {
        // If neither panel is pinned, do nothing
        if (!this.isFlowPinned && !this.isPalettePinned) {
            return;
        }

        const flowPanel = event.target.closest('#flow-panel');
        const palettePanel = event.target.closest('#palette-panel');
        
        // If the click is outside both panels, unpin them
        if (!flowPanel && !palettePanel) {
            this.isFlowPinned = false;
            this.isPalettePinned = false;
            this.render(this.state);
        }
    }

    destroy() {
        this.container.innerHTML = '';
        // Clean up global event listener
        document.removeEventListener('click', this.handleOutsideClick, true);
    }
}