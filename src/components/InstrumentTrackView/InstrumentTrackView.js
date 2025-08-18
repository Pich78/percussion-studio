// file: src/components/InstrumentTrackView/InstrumentTrackView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { TubsGridRenderer } from '/percussion-studio/lib/TubsGridRenderer/TubsGridRenderer.js';

const HOLD_DURATION_MS = 200;

export class InstrumentTrackView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        
        this.state = {};
        this.holdTimeout = null;
        this.isDragging = false;
        this.highlightedSound = null;
        this.mouseDownInfo = null;
        this.customCursorEl = null;

        loadCSS('/percussion-studio/src/components/InstrumentTrackView/InstrumentTrackView.css');
        this._initCustomCursor();

        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleMouseLeave = this._handleMouseLeave.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this.container.addEventListener('mousedown', this._handleMouseDown);
        window.addEventListener('mouseup', this._handleMouseUp, true);
        window.addEventListener('mousemove', this._handleMouseMove, true);
        
        logEvent('info', 'InstrumentTrackView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render(state) {
        this.state = state;
        const { instrument, notation } = this.state;
        this.container.innerHTML = '';
        const rowEl = TubsGridRenderer.createInstrumentRow(instrument.symbol);
        rowEl.appendChild(TubsGridRenderer.createInstrumentHeader(instrument.name));
        const notationChars = notation.replace(/\|/g, '');
        for (let i = 0; i < notationChars.length; i++) {
            const cellEl = TubsGridRenderer.createGridCell(i);
            const soundLetter = notationChars.charAt(i);
            if (soundLetter !== '-') {
                const sound = instrument.sounds.find(s => s.letter === soundLetter);
                if (sound?.svg) cellEl.appendChild(TubsGridRenderer.createNoteElement(sound.svg, sound.letter));
            }
            rowEl.appendChild(cellEl);
        }
        this.container.appendChild(rowEl);
    }

    _handleMouseDown(event) {
        const cell = event.target.closest('.grid-cell');
        if (!cell) return;
        this.mouseDownInfo = { tickIndex: parseInt(cell.dataset.tickIndex, 10), cell, clientX: event.clientX, clientY: event.clientY };
        this.holdTimeout = setTimeout(() => {
            this.isDragging = true;
            this._showRadialMenu(this.mouseDownInfo.clientX, this.mouseDownInfo.clientY);
        }, HOLD_DURATION_MS);
    }

    _handleMouseUp() {
        clearTimeout(this.holdTimeout);
        if (this.isDragging) {
            if (this.highlightedSound) {
                this.callbacks.onNoteEdit?.({ action: 'set', tickIndex: this.mouseDownInfo.tickIndex, soundLetter: this.highlightedSound });
                this.callbacks.onActiveSoundChange?.(this.highlightedSound);
            }
            this._hideRadialMenu();
        } else if (this.mouseDownInfo) {
            const { tickIndex, cell } = this.mouseDownInfo;
            if (cell.querySelector('.note')) {
                this.callbacks.onNoteEdit?.({ action: 'delete', tickIndex });
            } else {
                this.callbacks.onNoteEdit?.({ action: 'add', tickIndex, soundLetter: this.state.activeSoundLetter });
            }
        }
        this.isDragging = false;
        this.highlightedSound = null;
        this.mouseDownInfo = null;
    }

    _handleMouseLeave() {
        if (this.customCursorEl) this.customCursorEl.style.display = 'none';
    }
    
    _handleMouseMove(event) {
        const isWithinComponent = this.container.contains(event.target);
        
        // Custom cursor logic
        if (isWithinComponent && event.target.closest('.grid-cell')) {
            const { instrument, activeSoundLetter } = this.state;
            const sound = instrument.sounds.find(s => s.letter === activeSoundLetter);
            if (sound?.svg && this.customCursorEl) {
                this.customCursorEl.innerHTML = sound.svg;
                this.customCursorEl.style.display = 'block';
            }
            this.customCursorEl.style.left = `${event.clientX + 10}px`;
            this.customCursorEl.style.top = `${event.clientY + 10}px`;
        } else {
            if (this.customCursorEl) this.customCursorEl.style.display = 'none';
        }

        // Drag highlighting logic
        if (this.isDragging) {
            const radialItems = document.querySelectorAll('.radial-item');
            let currentlyHighlighted = null;
            radialItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                const isHovered = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
                if (isHovered) {
                    item.classList.add('highlighted');
                    currentlyHighlighted = item.dataset.soundLetter;
                } else {
                    item.classList.remove('highlighted');
                }
            });
            this.highlightedSound = currentlyHighlighted;
        }
    }

    _initCustomCursor() {
        this.customCursorEl = document.getElementById('instrument-track-cursor') || document.createElement('div');
        this.customCursorEl.id = 'instrument-track-cursor';
        document.body.appendChild(this.customCursorEl);
    }

    _showRadialMenu(x, y) {
        this._hideRadialMenu();
        const { instrument, activeSoundLetter } = this.state;
        if (!instrument || instrument.sounds.length === 0) return;
        
        const menu = document.createElement('div');
        menu.className = 'radial-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        const background = document.createElement('div');
        background.className = 'radial-background';
        menu.appendChild(background);

        let soundsToRender = instrument.sounds;
        let angles = [];
        const radius = 35; // FIX: Closer to the pointer

        if (soundsToRender.length === 2) {
            const otherSound = soundsToRender.find(s => s.letter !== activeSoundLetter);
            const currentSound = soundsToRender.find(s => s.letter === activeSoundLetter);
            soundsToRender = [otherSound, currentSound];
            angles = [-Math.PI / 2, Math.PI / 2];
        } else {
            const angleStep = (2 * Math.PI) / soundsToRender.length;
            for(let i = 0; i < soundsToRender.length; i++) angles.push(i * angleStep - Math.PI / 2);
        }

        soundsToRender.forEach((sound, index) => {
            const item = document.createElement('div');
            item.className = 'radial-item';
            item.innerHTML = sound.svg;
            item.title = sound.name;
            item.dataset.soundLetter = sound.letter;
            const angle = angles[index];
            const itemX = radius * Math.cos(angle);
            const itemY = radius * Math.sin(angle);
            item.style.transform = `translate(-50%, -50%) translate(${itemX}px, ${itemY}px)`;
            menu.appendChild(item);
        });
        document.body.appendChild(menu);
    }
    
    _hideRadialMenu() {
        const existingMenu = document.querySelector('.radial-menu');
        if (existingMenu) existingMenu.remove();
    }
}