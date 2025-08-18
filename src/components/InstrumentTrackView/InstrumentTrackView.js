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
        this._handleMouseMove = this._handleMouseMove.bind(this);
        
        this.container.addEventListener('mousedown', this._handleMouseDown);
        this.container.addEventListener('mouseenter', this._handleMouseEnter.bind(this));
        this.container.addEventListener('mouseleave', this._handleMouseLeave.bind(this));
        
        // Listen on `window` for mouseup and mousemove to handle dragging outside the component
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
        
        // Update cursor if mouse is already over the grid
        this._updateCustomCursor();
    }

    _handleMouseEnter(event) {
        // Show custom cursor when entering any grid cell
        if (event.target.closest('.grid-cell')) {
            this._updateCustomCursor();
        }
    }

    _handleMouseLeave(event) {
        // Hide custom cursor when leaving the container
        if (!this.container.contains(event.relatedTarget)) {
            if (this.customCursorEl) {
                this.customCursorEl.style.display = 'none';
            }
        }
    }

    // --- Event Handlers ---
    _handleMouseDown(event) {
        const cell = event.target.closest('.grid-cell');
        if (!cell) return;
        
        // Prevent text selection during drag operations
        event.preventDefault();
        
        // Store the exact cursor position when mouse down occurs
        this.mouseDownInfo = { 
            tickIndex: parseInt(cell.dataset.tickIndex, 10), 
            cell, 
            clientX: event.clientX, 
            clientY: event.clientY,
            // Store the exact center point where the SVG symbol is displayed
            centerX: event.clientX,
            centerY: event.clientY
        };
        
        this.holdTimeout = setTimeout(() => {
            this.isDragging = true;
            // Use the stored center position for the radial menu
            this._showRadialMenu(this.mouseDownInfo.centerX, this.mouseDownInfo.centerY);
        }, HOLD_DURATION_MS);
    }

    _handleMouseUp() {
        clearTimeout(this.holdTimeout);
        if (this.isDragging) {
            // Only update the active sound (cursor), but don't place a note automatically
            if (this.highlightedSound) {
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
    
    _handleMouseMove(event) {
        // Prevent text selection during dragging
        if (this.isDragging) {
            event.preventDefault();
        }
        
        const isWithinComponentGrid = event.target.closest('.grid-cell') && this.container.contains(event.target);

        // --- Handle custom cursor visibility and position ---
        if (isWithinComponentGrid && !this.isDragging) {
            this._updateCustomCursor();
            if (this.customCursorEl) {
                // Center the SVG symbol exactly on the mouse cursor tip
                this.customCursorEl.style.left = `${event.clientX - 12}px`; // -12 to center 24px cursor
                this.customCursorEl.style.top = `${event.clientY - 12}px`;
            }
        } else if (!isWithinComponentGrid && !this.isDragging) {
            // Hide if the mouse is anywhere else (this instance's responsibility)
            if (this.customCursorEl) this.customCursorEl.style.display = 'none';
        }

        // --- Handle highlighting during drag ---
        if (this.isDragging) {
            const radialItems = document.querySelectorAll('.radial-menu .radial-item');
            let currentlyHighlighted = null;
            
            // Calculate distance from the original center point (where timeout expired)
            const centerX = this.mouseDownInfo.centerX;
            const centerY = this.mouseDownInfo.centerY;
            
            radialItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const itemCenterY = rect.top + rect.height / 2;
                
                // Check if current mouse position is close to this item
                const distanceFromMouse = Math.sqrt(
                    Math.pow(event.clientX - itemCenterX, 2) + 
                    Math.pow(event.clientY - itemCenterY, 2)
                );
                
                if (distanceFromMouse < 20) { // Within 20px of item center
                    item.classList.add('highlighted');
                    currentlyHighlighted = item.dataset.soundLetter;
                } else {
                    item.classList.remove('highlighted');
                }
            });
            
            // Only update highlighted sound if it's different
            if (this.highlightedSound !== currentlyHighlighted) {
                this.highlightedSound = currentlyHighlighted;
            }
        }
    }

    _updateCustomCursor() {
        if (!this.state.instrument || !this.state.activeSoundLetter) return;
        
        const { instrument, activeSoundLetter } = this.state;
        const sound = instrument.sounds.find(s => s.letter === activeSoundLetter);
        if (sound?.svg && this.customCursorEl) {
            this.customCursorEl.innerHTML = sound.svg;
            this.customCursorEl.style.display = 'block';
        }
    }

    _initCustomCursor() {
        // Create a unique cursor for this instance to avoid conflicts
        const cursorId = `instrument-track-cursor-${Math.random().toString(36).substr(2, 9)}`;
        this.customCursorEl = document.createElement('div');
        this.customCursorEl.id = cursorId;
        this.customCursorEl.className = 'instrument-track-cursor';
        
        // Apply the cursor styles directly
        Object.assign(this.customCursorEl.style, {
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: '9999',
            width: '24px',
            height: '24px',
            display: 'none',
            opacity: '0.8'
        });
        
        document.body.appendChild(this.customCursorEl);
    }

    _showRadialMenu(centerX, centerY) {
        this._hideRadialMenu();
        const { instrument, activeSoundLetter } = this.state;
        if (!instrument || instrument.sounds.length === 0) return;
        
        const menu = document.createElement('div');
        menu.className = 'radial-menu';
        // Position the menu container exactly at the center point
        menu.style.left = `${centerX}px`;
        menu.style.top = `${centerY}px`;

        const background = document.createElement('div');
        background.className = 'radial-background';
        menu.appendChild(background);

        let soundsToRender = instrument.sounds;
        let angles = [];
        const radius = 25; // Distance from center to symbols

        if (soundsToRender.length === 2) {
            const otherSound = soundsToRender.find(s => s.letter !== activeSoundLetter);
            const currentSound = soundsToRender.find(s => s.letter === activeSoundLetter);
            soundsToRender = [otherSound, currentSound];
            angles = [-Math.PI / 2, Math.PI / 2]; // Top and bottom
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
            
            // Position items around the center point
            item.style.left = `${itemX}px`;
            item.style.top = `${itemY}px`;
            item.style.transform = `translate(-50%, -50%)`; // Center each item on its position
            
            menu.appendChild(item);
        });
        
        document.body.appendChild(menu);
        
        // Hide the custom cursor while the radial menu is open
        if (this.customCursorEl) {
            this.customCursorEl.style.display = 'none';
        }
    }
    
    _hideRadialMenu() {
        const existingMenu = document.querySelector('.radial-menu');
        if (existingMenu) existingMenu.remove();
        
        // Show the custom cursor again if we're still over a grid cell
        try {
            const elementUnderMouse = document.elementFromPoint(window.event?.clientX || 0, window.event?.clientY || 0);
            if (elementUnderMouse?.closest('.grid-cell') && this.container.contains(elementUnderMouse)) {
                this._updateCustomCursor();
            }
        } catch (e) {
            // Fallback if event is not available
        }
    }

    destroy() {
        // Clean up event listeners and cursor element
        this.container.removeEventListener('mousedown', this._handleMouseDown);
        this.container.removeEventListener('mouseenter', this._handleMouseEnter);
        this.container.removeEventListener('mouseleave', this._handleMouseLeave);
        window.removeEventListener('mouseup', this._handleMouseUp, true);
        window.removeEventListener('mousemove', this._handleMouseMove, true);
        
        if (this.customCursorEl && this.customCursorEl.parentNode) {
            this.customCursorEl.parentNode.removeChild(this.customCursorEl);
        }
        
        this._hideRadialMenu();
    }
}