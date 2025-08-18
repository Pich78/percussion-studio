// file: src/components/InstrumentTrackView/InstrumentTrackView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { TubsGridRenderer } from '/percussion-studio/lib/TubsGridRenderer/TubsGridRenderer.js';

const HOLD_DURATION_MS = 250;

export class InstrumentTrackView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        
        this.state = {};
        this.holdTimeout = null;
        this.isHolding = false;
        this.mouseDownInfo = null;
        this.customCursorEl = null;

        loadCSS('/percussion-studio/src/components/InstrumentTrackView/InstrumentTrackView.css');
        this._initCustomCursor();

        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleMouseLeave = this._handleMouseLeave.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this.container.addEventListener('mousedown', this._handleMouseDown);
        this.container.addEventListener('mouseup', this._handleMouseUp);
        this.container.addEventListener('mouseleave', this._handleMouseLeave);
        this.container.addEventListener('mousemove', this._handleMouseMove);
        
        logEvent('info', 'InstrumentTrackView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render(state) {
        this.state = state;
        const { instrument, notation, activeSoundLetter } = this.state;
        
        this.container.innerHTML = '';

        const rowEl = TubsGridRenderer.createInstrumentRow(instrument.symbol);
        const headerEl = TubsGridRenderer.createInstrumentHeader(instrument.name);
        rowEl.appendChild(headerEl);

        const notationChars = notation.replace(/\|/g, '');
        for (let i = 0; i < notationChars.length; i++) {
            const cellEl = TubsGridRenderer.createGridCell(i);
            const soundLetter = notationChars.charAt(i);
            if (soundLetter !== '-') {
                const sound = instrument.sounds.find(s => s.letter === soundLetter);
                if (sound?.svg) {
                    cellEl.appendChild(TubsGridRenderer.createNoteElement(sound.svg, sound.letter));
                }
            }
            rowEl.appendChild(cellEl);
        }
        this.container.appendChild(rowEl);
    }

    // --- Event Handlers ---
    _handleMouseDown(event) {
        const cell = event.target.closest('.grid-cell');
        if (!cell) return;
        this.isHolding = false;
        this.mouseDownInfo = { tickIndex: parseInt(cell.dataset.tickIndex, 10), cell };
        this.holdTimeout = setTimeout(() => {
            this.isHolding = true;
            this._showRadialMenu(this.mouseDownInfo.cell);
        }, HOLD_DURATION_MS);
    }

    _handleMouseUp() {
        clearTimeout(this.holdTimeout);
        if (this.isHolding || !this.mouseDownInfo) return;
        
        const { tickIndex, cell } = this.mouseDownInfo;
        const hasNote = cell.querySelector('.note');
        if (hasNote) {
            this.callbacks.onNoteEdit?.({ action: 'delete', tickIndex });
        } else {
            this.callbacks.onNoteEdit?.({ action: 'add', tickIndex, soundLetter: this.state.activeSoundLetter });
        }
        this.mouseDownInfo = null;
    }

    _handleMouseLeave() {
        clearTimeout(this.holdTimeout);
        this.isHolding = false;
        this.mouseDownInfo = null;
        this.customCursorEl.style.display = 'none';
        this._hideRadialMenu();
    }
    
    _handleMouseMove(event) {
        if (!this.customCursorEl) return;
        const { instrument, activeSoundLetter } = this.state;
        const sound = instrument.sounds.find(s => s.letter === activeSoundLetter);
        if (sound?.svg) {
            this.customCursorEl.innerHTML = sound.svg;
            this.customCursorEl.style.display = 'block';
        } else {
            this.customCursorEl.style.display = 'none';
        }
        this.customCursorEl.style.left = `${event.clientX + 10}px`;
        this.customCursorEl.style.top = `${event.clientY + 10}px`;
    }

    // --- UI Logic ---
    _initCustomCursor() {
        if (document.getElementById('instrument-track-cursor')) {
            this.customCursorEl = document.getElementById('instrument-track-cursor');
        } else {
            this.customCursorEl = document.createElement('div');
            this.customCursorEl.id = 'instrument-track-cursor';
            document.body.appendChild(this.customCursorEl);
        }
    }

    _showRadialMenu(targetCell) {
        this._hideRadialMenu();
        const { instrument, activeSoundLetter } = this.state;
        if (!instrument || instrument.sounds.length === 0) return;
        
        const menu = document.createElement('div');
        menu.className = 'radial-menu';
        const rect = targetCell.getBoundingClientRect();
        menu.style.left = `${rect.left + rect.width / 2}px`;
        menu.style.top = `${rect.top + rect.height / 2}px`;

        let soundsToRender = instrument.sounds;
        let angles = [];

        // Special case for 2 sounds
        if (soundsToRender.length === 2) {
            const otherSound = soundsToRender.find(s => s.letter !== activeSoundLetter);
            const currentSound = soundsToRender.find(s => s.letter === activeSoundLetter);
            soundsToRender = [otherSound, currentSound]; // Prioritize the "other" sound
            angles = [-Math.PI / 2, Math.PI / 2]; // Top and Bottom positions
        } else {
            const angleStep = (2 * Math.PI) / soundsToRender.length;
            for(let i = 0; i < soundsToRender.length; i++) angles.push(i * angleStep - Math.PI / 2);
        }

        const radius = 50;
        soundsToRender.forEach((sound, index) => {
            const item = document.createElement('button');
            item.className = 'radial-item';
            item.innerHTML = sound.svg;
            item.title = sound.name;
            const angle = angles[index];
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            item.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            item.onclick = () => {
                this.callbacks.onNoteEdit?.({ action: 'set', tickIndex: this.mouseDownInfo.tickIndex, soundLetter: sound.letter });
                this.callbacks.onActiveSoundChange?.(sound.letter);
                this._hideRadialMenu();
            };
            menu.appendChild(item);
        });
        document.body.appendChild(menu);
    }
    
    _hideRadialMenu() {
        const existingMenu = document.querySelector('.radial-menu');
        if (existingMenu) existingMenu.remove();
    }
}