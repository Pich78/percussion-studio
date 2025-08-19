// file: src/components/RadialSoundSelector/RadialSoundSelector.js
import { logEvent } from '/percussion-studio/lib/Logger.js';

/**
 * A UI widget that displays a radial menu for sound selection.
 * It is instantiated and controlled by a parent component (e.g., PatternEditor).
 * It manages its own temporary interaction state (dragging) and reports the
 * final selection back to its owner via a callback.
 */
export class RadialSoundSelector {
    constructor(callbacks = {}) {
        this.callbacks = callbacks; // Expects onSoundSelected
        
        // Internal state for the drag interaction
        this.isDragging = false;
        this.highlightedSound = null;
        this.mouseDownInfo = null;
        this.menuEl = null;

        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
    }

    /**
     * Creates and displays the radial menu on the screen.
     * @param {object} config
     * @param {number} config.x - The clientX coordinate for the menu's center.
     * @param {number} config.y - The clientY coordinate for the menu's center.
     * @param {Array} config.sounds - The array of sound objects to display.
     * @param {string} config.activeSoundLetter - The letter of the currently active sound.
     */
    show({ x, y, sounds, activeSoundLetter }) {
        if (this.isDragging || !sounds || sounds.length === 0) {
            return; // Prevent showing if already active or no sounds
        }

        // Set up initial state for the drag interaction
        this.isDragging = true;
        this.mouseDownInfo = { centerX: x, centerY: y };

        // Create the menu DOM structure
        this.menuEl = document.createElement('div');
        this.menuEl.className = 'radial-menu';
        this.menuEl.style.left = `${x}px`;
        this.menuEl.style.top = `${y}px`;

        this.menuEl.innerHTML = `
            <div class="radial-background"></div>
            <div class="sector-highlight" style="display: none;"></div>
        `;

        // --- Sound Item Layout Logic (copied and adapted) ---
        let soundsToRender = sounds;
        let angles = [];
        const radius = 25;

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
            item.dataset.soundLetter = sound.letter;
            item.dataset.angle = angles[index];
            
            const angle = angles[index];
            const itemX = radius * Math.cos(angle);
            const itemY = radius * Math.sin(angle);
            
            item.style.left = `${itemX}px`;
            item.style.top = `${itemY}px`;
            item.style.transform = `translate(-50%, -50%)`;
            
            this.menuEl.appendChild(item);
        });
        
        document.body.appendChild(this.menuEl);

        // Attach global listeners now that we are active
        window.addEventListener('mousemove', this._handleMouseMove, true);
        window.addEventListener('mouseup', this._handleMouseUp, true);
        
        logEvent('info', 'RadialSoundSelector', 'show', 'Lifecycle', 'Menu shown.');
    }

    /**
     * Hides and removes the radial menu from the DOM.
     */
    hide() {
        if (this.menuEl) {
            this.menuEl.remove();
            this.menuEl = null;
        }
        
        // Clean up state and listeners
        this.isDragging = false;
        this.highlightedSound = null;
        this.mouseDownInfo = null;
        window.removeEventListener('mousemove', this._handleMouseMove, true);
        window.removeEventListener('mouseup', this._handleMouseUp, true);
        
        logEvent('info', 'RadialSoundSelector', 'hide', 'Lifecycle', 'Menu hidden.');
    }

    _handleMouseUp() {
        if (this.highlightedSound) {
            this.callbacks.onSoundSelected?.(this.highlightedSound);
        }
        // The owner is now responsible for calling hide()
    }

    _handleMouseMove(event) {
        if (!this.isDragging) return;
        event.preventDefault();
        
        const radialItems = this.menuEl.querySelectorAll('.radial-item');
        const sectorHighlight = this.menuEl.querySelector('.sector-highlight');
        let currentlyHighlighted = null;
        
        const { centerX, centerY } = this.mouseDownInfo;
        const mouseX = event.clientX - centerX;
        const mouseY = event.clientY - centerY;
        const mouseAngle = Math.atan2(mouseY, mouseX);
        const mouseDistance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
        
        if (mouseDistance > 10 && mouseDistance < 50) {
            let bestMatch = null;
            let bestAngle = null;
            let smallestAngleDiff = Infinity;
            
            radialItems.forEach(item => {
                const itemAngle = parseFloat(item.dataset.angle);
                let angleDiff = Math.abs(mouseAngle - itemAngle);
                if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
                
                if (angleDiff < smallestAngleDiff) {
                    smallestAngleDiff = angleDiff;
                    bestMatch = item;
                    bestAngle = itemAngle;
                }
                item.classList.remove('highlighted');
            });
            
            if (bestMatch && sectorHighlight) {
                bestMatch.classList.add('highlighted');
                currentlyHighlighted = bestMatch.dataset.soundLetter;
                this._updateSectorHighlight(sectorHighlight, bestAngle, radialItems.length);
            }
        } else {
            radialItems.forEach(item => item.classList.remove('highlighted'));
            if (sectorHighlight) sectorHighlight.style.display = 'none';
        }
        
        if (this.highlightedSound !== currentlyHighlighted) {
            this.highlightedSound = currentlyHighlighted;
        }
    }

    _updateSectorHighlight(sectorElement, selectedAngle, totalSectors) {
        // --- This logic is identical to the corrected version from before ---
        const sectorAngle = (2 * Math.PI) / totalSectors;
        const startAngle = selectedAngle - sectorAngle / 2;
        const endAngle = selectedAngle + sectorAngle / 2;
        
        const startDegrees = (startAngle * 180 / Math.PI) + 90;
        const endDegrees = (endAngle * 180 / Math.PI) + 90;
        
        const normalizeAngle = (angle) => {
            while (angle < 0) angle += 360;
            return angle % 360;
        };
        
        const normalizedStart = normalizeAngle(startDegrees);
        const normalizedEnd = normalizeAngle(endDegrees);
        
        let gradient;
        if (normalizedStart > normalizedEnd) {
            gradient = `conic-gradient(from 0deg, rgba(59, 130, 246, 0.3) ${normalizedStart}deg, rgba(59, 130, 246, 0.3) 360deg, transparent 360deg, transparent 0deg, rgba(59, 130, 246, 0.3) 0deg, rgba(59, 130, 246, 0.3) ${normalizedEnd}deg, transparent ${normalizedEnd}deg)`;
        } else {
            gradient = `conic-gradient(from 0deg, transparent 0deg, transparent ${normalizedStart}deg, rgba(59, 130, 246, 0.3) ${normalizedStart}deg, rgba(59, 130, 246, 0.3) ${normalizedEnd}deg, transparent ${normalizedEnd}deg, transparent 360deg)`;
        }
        
        sectorElement.style.background = gradient;
        sectorElement.style.display = 'block';
    }

    /**
     * Call this to clean up listeners if the parent is destroyed,
     * just in case the menu was left open.
     */
    destroy() {
        this.hide(); // Hide will remove listeners
        logEvent('info', 'RadialSoundSelector', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}