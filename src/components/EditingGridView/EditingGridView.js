// file: src/components/EditingGridView/EditingGridView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { TubsGridRenderer } from '/percussion-studio/lib/TubsGridRenderer/TubsGridRenderer.js';

const HOLD_DURATION_MS = 250; // ms to wait before a click becomes a hold

export class EditingGridView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        
        this.activeSounds = {}; 
        this.holdTimeout = null;
        this.isHolding = false;
        this.mouseDownInfo = null;
        this.customCursorEl = null;

        loadCSS('/percussion-studio/src/components/EditingGridView/EditingGridView.css');
        this._initCustomCursor();

        this._handleClick = this._handleClick.bind(this);
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleMouseLeave = this._handleMouseLeave.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleInput = this._handleInput.bind(this);

        this.container.addEventListener('click', this._handleClick);
        this.container.addEventListener('mousedown', this._handleMouseDown);
        this.container.addEventListener('mouseup', this._handleMouseUp);
        this.container.addEventListener('mouseleave', this._handleMouseLeave);
        this.container.addEventListener('mousemove', this._handleMouseMove);
        this.container.addEventListener('input', this._handleInput);
        
        logEvent('info', 'EditingGridView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render(state) {
        logEvent('debug', 'EditingGridView', 'render', 'State', 'Rendering with state:', state);
        this.state = state;

        this.container.innerHTML = '';

        if (!state.currentPattern || !state.currentPattern.pattern_data || state.currentPattern.pattern_data.length === 0) {
            this._renderZeroState();
            return;
        }

        if (state.resolvedInstruments) {
            Object.values(state.resolvedInstruments).forEach(inst => {
                if (!this.activeSounds[inst.symbol] && inst.sounds.length > 0) {
                    this.activeSounds[inst.symbol] = inst.sounds[0].letter;
                }
            });
        }
        
        const gridFragment = this._buildGrid(state.currentPattern, state.resolvedInstruments);
        this.container.appendChild(gridFragment);
    }

    _renderZeroState() {
        const zeroStateEl = document.createElement('div');
        zeroStateEl.className = 'zero-state-container';
        zeroStateEl.innerHTML = `<button class="add-measure-btn" data-action="add-measure"><span class="plus-icon">+</span> Add First Measure</button>`;
        this.container.appendChild(zeroStateEl);
    }
    
    _buildGrid(pattern, instruments) {
        const fragment = document.createDocumentFragment();
        
        pattern.pattern_data.forEach((measureData, measureIndex) => {
            const measureEl = TubsGridRenderer.createMeasureContainer();
            measureEl.dataset.measureIndex = measureIndex;
            
            const measureHeader = TubsGridRenderer.createMeasureHeader(pattern.metadata);
            measureHeader.innerHTML += `<button class="remove-btn" data-action="remove-measure" title="Remove measure">×</button>`;
            measureEl.appendChild(measureHeader);

            const instrumentSymbols = Object.keys(measureData);
            instrumentSymbols.forEach(symbol => {
                const instrument = instruments[symbol];
                const notation = measureData[symbol].replace(/\|/g, '');
                const rowEl = TubsGridRenderer.createInstrumentRow(symbol);
                const instHeader = TubsGridRenderer.createInstrumentHeader(instrument.name);
                instHeader.innerHTML += `<button class="remove-btn" data-action="remove-instrument" title="Remove instrument track">×</button>`;
                rowEl.appendChild(instHeader);

                for (let i = 0; i < notation.length; i++) {
                    const cellEl = TubsGridRenderer.createGridCell(i);
                    const soundLetter = notation.charAt(i);
                    if (soundLetter !== '-') {
                        const sound = instrument.sounds.find(s => s.letter === soundLetter);
                        if (sound && sound.svg) cellEl.appendChild(TubsGridRenderer.createNoteElement(sound.svg, sound.letter));
                    }
                    rowEl.appendChild(cellEl);
                }
                measureEl.appendChild(rowEl);
            });
            fragment.appendChild(measureEl);
        });

        const addInstrumentRow = document.createElement('div');
        addInstrumentRow.className = 'add-instrument-row';
        addInstrumentRow.innerHTML = `<button data-action="add-instrument">+ Add Instrument</button>`;
        fragment.appendChild(addInstrumentRow);
        
        const addMeasureBtn = document.createElement('button');
        addMeasureBtn.className = 'add-measure-btn bottom-btn';
        addMeasureBtn.dataset.action = 'add-measure';
        addMeasureBtn.innerHTML = `<span class="plus-icon">+</span> Add Measure`;
        fragment.appendChild(addMeasureBtn);

        return fragment;
    }

    _handleClick(event) {
        const button = event.target.closest('button[data-action]');
        if (!button || button.disabled) return;

        const action = button.dataset.action;
        logEvent('debug', 'EditingGridView', '_handleClick', 'Events', `Action button clicked: ${action}`);

        switch (action) {
            case 'add-measure': this.callbacks.onMeasureAdd?.(); break;
            case 'add-instrument': this.callbacks.onInstrumentAdd?.(); break;
            case 'remove-measure': {
                const measureIndex = parseInt(button.closest('.measure-container').dataset.measureIndex, 10);
                this.callbacks.onMeasureRemove?.({ measureIndex });
                break;
            }
            case 'remove-instrument': {
                const symbol = button.closest('.instrument-row').dataset.instrument;
                this.callbacks.onInstrumentRemove?.({ symbol });
                break;
            }
            case 'apply-metric': {
                const measureHeader = button.closest('.measure-header');
                const measureIndex = parseInt(measureHeader.closest('.measure-container').dataset.measureIndex, 10);
                const beats = measureHeader.querySelector('[data-prop="beats"]').value;
                const beatType = measureHeader.querySelector('[data-prop="beatType"]').value;
                const resolution = parseInt(measureHeader.querySelector('[data-prop="resolution"]').value, 10);
                this.callbacks.onMeasureUpdate?.({ measureIndex, metric: `${beats}/${beatType}`, resolution });
                button.disabled = true; // Disable apply button after clicking
                break;
            }
        }
    }
    
    _handleInput(event) {
        const target = event.target;
        if (target.matches('.metric-input, .resolution-select')) {
            const measureHeader = target.closest('.measure-header');
            const applyBtn = measureHeader.querySelector('[data-action="apply-metric"]');
            if (applyBtn) {
                applyBtn.disabled = false;
            }
        }
    }

    _handleMouseDown(event) {
        const cell = event.target.closest('.grid-cell');
        if (!cell) return;
        this.isHolding = false;
        this.mouseDownInfo = { cell, symbol: cell.closest('.instrument-row').dataset.instrument, tickIndex: parseInt(cell.dataset.tickIndex, 10), measureIndex: parseInt(cell.closest('.measure-container').dataset.measureIndex, 10) };
        this.holdTimeout = setTimeout(() => { this.isHolding = true; logEvent('debug', 'EditingGridView', 'hold', 'Events', 'Hold gesture detected.'); this._showRadialMenu(this.mouseDownInfo.cell); }, HOLD_DURATION_MS);
    }
    _handleMouseUp(event) {
        clearTimeout(this.holdTimeout);
        if (this.isHolding || !this.mouseDownInfo) return;
        logEvent('debug', 'EditingGridView', 'tap', 'Events', 'Tap gesture detected.');
        const { cell, symbol, tickIndex, measureIndex } = this.mouseDownInfo;
        if (cell.querySelector('.note')) { this.callbacks.onNoteEdit?.({ action: 'delete', symbol, tickIndex, measureIndex }); } 
        else { const soundLetter = this.activeSounds[symbol]; this.callbacks.onNoteEdit?.({ action: 'add', symbol, tickIndex, measureIndex, soundLetter }); }
        this.mouseDownInfo = null;
    }
    _handleMouseLeave(event) {
        clearTimeout(this.holdTimeout);
        this.isHolding = false;
        this.mouseDownInfo = null;
        this.customCursorEl.style.display = 'none';
        this._hideRadialMenu();
    }
    _handleMouseMove(event) {
        if (!this.customCursorEl) return;
        const row = event.target.closest('.instrument-row');
        if (row) {
            const symbol = row.dataset.instrument;
            const activeSoundLetter = this.activeSounds[symbol];
            const instrument = this.state.resolvedInstruments?.[symbol];
            const sound = instrument?.sounds.find(s => s.letter === activeSoundLetter);
            if (sound?.svg) { this.customCursorEl.innerHTML = sound.svg; this.customCursorEl.style.display = 'block'; } 
            else { this.customCursorEl.style.display = 'none'; }
        } else { this.customCursorEl.style.display = 'none'; }
        this.customCursorEl.style.left = `${event.clientX + 10}px`;
        this.customCursorEl.style.top = `${event.clientY + 10}px`;
    }
    _initCustomCursor() { this.customCursorEl = document.createElement('div'); this.customCursorEl.id = 'editing-grid-cursor'; document.body.appendChild(this.customCursorEl); }
    _showRadialMenu(targetCell) {
        this._hideRadialMenu();
        const { symbol, tickIndex, measureIndex } = this.mouseDownInfo;
        const instrument = this.state.resolvedInstruments[symbol];
        if (!instrument || instrument.sounds.length === 0) return;
        const menu = document.createElement('div'); menu.className = 'radial-menu';
        const rect = targetCell.getBoundingClientRect();
        menu.style.left = `${rect.left + rect.width / 2}px`; menu.style.top = `${rect.top + rect.height / 2}px`;
        const angleStep = (2 * Math.PI) / instrument.sounds.length;
        const radius = 50;
        instrument.sounds.forEach((sound, index) => {
            const item = document.createElement('button'); item.className = 'radial-item'; item.innerHTML = sound.svg; item.title = sound.name;
            const angle = index * angleStep - (Math.PI / 2);
            const x = radius * Math.cos(angle); const y = radius * Math.sin(angle);
            item.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            item.onclick = () => { logEvent('debug', 'EditingGridView', 'radialSelect', 'Events', `Selected sound: ${sound.letter}`); this.activeSounds[symbol] = sound.letter; this.callbacks.onNoteEdit?.({ action: 'set', symbol, tickIndex, measureIndex, soundLetter: sound.letter }); this._hideRadialMenu(); };
            menu.appendChild(item);
        });
        document.body.appendChild(menu);
    }
    _hideRadialMenu() { const existingMenu = document.querySelector('.radial-menu'); if (existingMenu) existingMenu.remove(); }
}