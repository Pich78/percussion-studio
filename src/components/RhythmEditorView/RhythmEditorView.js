// file: src/components/RhythmEditorView/RhythmEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class RhythmEditorView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        loadCSS('/percussion-studio/src/components/RhythmEditorView/RhythmEditorView.css');
        logEvent('info', 'RhythmEditorView', 'constructor', 'Lifecycle', 'Component created.');
        
        // Delegated event listeners
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('mouseover', this.handleMouseOver.bind(this));
        this.container.addEventListener('mouseout', this.handleMouseOut.bind(this));
    }

    render(state) {
        logEvent('debug', 'RhythmEditorView', 'render', 'State', 'Rendering with state:', state);
        const { rhythm, currentEditingPatternId, isFlowPinned, isPalettePinned, selectedNoteLetter } = state;

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
        
        let flowItems = '';
        rhythm.playback_flow.forEach((item, index) => {
            const selectedClass = item.pattern === currentEditingPatternId ? 'bg-washed-blue' : 'bg-white';
            flowItems += `<div data-action="select-pattern" data-pattern-id="${item.pattern}" class="flow-item flex items-center pa2 br1 pointer hover-bg-light-gray ${selectedClass}">${item.pattern} [x${item.repetitions}]</div>`;
        });

        return `
            <div id="flow-panel" class="editor-panel absolute top-0 left-0 h-100 bg-near-white shadow-2 pa3 ${isExpanded ? 'is-expanded' : 'w4'}">
                <h3 class="f4 b vertical-text">Rhythm Flow</h3>
                <div class="panel-content">
                    <h3 class="f4 b mt0">Rhythm Flow</h3>
                    ${flowItems}
                    <button data-action="add-pattern" class="w-100 mt3 pv2 ph3 bn br2 bg-blue white pointer hover-bg-dark-blue">+</button>
                </div>
            </div>`;
    }

    _renderGridPanel(state) {
        const { rhythm, currentEditingPatternId } = state;
        if (!currentEditingPatternId || !rhythm.patterns[currentEditingPatternId]) {
            return '<p class="f5 gray i tc">Select a pattern from the Rhythm Flow to edit.</p>';
        }

        const pattern = rhythm.patterns[currentEditingPatternId];
        const measure = pattern.pattern_data[0] || {};
        const resolution = pattern.metadata.resolution;
        const instruments = Object.keys(measure);

        let gridHtml = '';
        instruments.forEach(symbol => {
            gridHtml += `<div class="instrument-header">${symbol}</div>`;
            const noteString = (measure[symbol] || '').replace(/\|/g, '');
            for (let i = 0; i < resolution; i++) {
                gridHtml += `<div class="grid-cell" data-action="edit-note" data-symbol="${symbol}" data-tick="${i}">${noteString[i] || ''}</div>`;
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

    _renderPalettePanel(state) {
        const { rhythm, isPalettePinned, selectedInstrumentSymbol, selectedNoteLetter } = state;
        const isExpanded = isPalettePinned || this.isPaletteHovered;

        let paletteContent = '<p class="f7 gray i">Select an instrument from the grid to see its notes.</p>';
        if (selectedInstrumentSymbol) {
            const instDef = rhythm.instrumentDefsBySymbol[selectedInstrumentSymbol];
            paletteContent = (instDef.sounds || []).map(sound => {
                const selectedClass = sound.letter === selectedNoteLetter ? 'bg-washed-blue' : '';
                return `<div data-action="select-note" data-note-letter="${sound.letter}" class="pointer pa2 br1 hover-bg-light-gray ${selectedClass}">${sound.name} (${sound.letter})</div>`;
            }).join('');
        }

        return `
            <div id="palette-panel" class="editor-panel absolute top-0 right-0 h-100 bg-near-white shadow-2 pa3 ${isExpanded ? 'is-expanded' : 'w4'}">
                <h3 class="f4 b vertical-text">Palette</h3>
                <div class="panel-content">
                    <h3 class="f4 b mt0">Palette</h3>
                    ${paletteContent}
                </div>
            </div>`;
    }

    // --- Event Handling ---
    
    handleClick(event) {
        const target = event.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        logEvent('debug', 'RhythmEditorView', 'handleClick', 'Events', `Action triggered: ${action}`);

        if (action === 'select-pattern') this.callbacks.onPatternSelect?.(target.dataset.patternId);
        if (action === 'add-pattern') this.callbacks.onAddPattern?.();
        if (action === 'select-note') this.callbacks.onNoteSelect?.(target.dataset.noteLetter);
    }
    
    handleMouseOver(event) {
        if (event.target.closest('#flow-panel')) { this.isFlowHovered = true; this.render(this.state); }
        if (event.target.closest('#palette-panel')) { this.isPaletteHovered = true; this.render(this.state); }
    }

    handleMouseOut(event) {
        if (event.target.closest('#flow-panel')) { this.isFlowHovered = false; this.render(this.state); }
        if (event.target.closest('#palette-panel')) { this.isPaletteHovered = false; this.render(this.state); }
    }
}