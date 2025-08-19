// file: src/components/RadialSoundSelector/RadialSoundSelector.js
import { logEvent } from '/percussion-studio/lib/Logger.js';

/**
 * A UI widget that displays a radial menu for sound selection.
 */
export class RadialSoundSelector {
    constructor(callbacks = {}) {
        this.callbacks = callbacks;
        
        this.isDragging = false;
        this.highlightedSound = null;
        this.mouseDownInfo = null;
        this.menuEl = null;

        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
    }

    show({ x, y, sounds, activeSoundLetter }) {
        if (this.isDragging || !sounds || sounds.length === 0) {
            return;
        }

        this.isDragging = true;
        this.mouseDownInfo = { centerX: x, centerY: y };

        this.menuEl = document.createElement('div');
        this.menuEl.className = 'radial-menu';
        this.menuEl.style.left = `${x}px`;
        this.menuEl.style.top = `${y}px`;

        this.menuEl.innerHTML = `
            <div class="radial-background"></div>
            <div class="sector-highlight" style="display: none;"></div>
        `;

        let soundsToRender = sounds;
        let angles = [];
        const radius = 25;

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

        window.addEventListener('mousemove', this._handleMouseMove, true);
        window.addEventListener('mouseup', this._handleMouseUp, true);
        
        logEvent('info', 'RadialSoundSelector', 'show', 'Lifecycle', 'Menu shown.');
    }

    hide() {
        logEvent('debug', 'RadialSoundSelector', 'hide', 'Lifecycle', 'Entering hide method.');
        if (this.menuEl) {
            this.menuEl.remove();
            this.menuEl = null;
            logEvent('debug', 'RadialSoundSelector', 'hide', 'Lifecycle', 'Menu element removed from DOM.');
        }
        
        this.isDragging = false;
        this.highlightedSound = null;
        this.mouseDownInfo = null;
        window.removeEventListener('mousemove', this._handleMouseMove, true);
        window.removeEventListener('mouseup', this._handleMouseUp, true);
        
        logEvent('info', 'RadialSoundSelector', 'hide', 'Lifecycle', 'Menu hidden and listeners cleaned up.');
    }

    _handleMouseUp(event) {
        logEvent('debug', 'RadialSoundSelector', '_handleMouseUp', 'Events', 'MouseUp captured by global listener.');
        
        event.stopPropagation();
        event.preventDefault();

        if (this.highlightedSound) {
            logEvent('debug', 'RadialSoundSelector', '_handleMouseUp', 'Events', `Calling onSoundSelected with: ${this.highlightedSound}`);
            this.callbacks.onSoundSelected?.(this.highlightedSound);
        }
        
        logEvent('debug', 'RadialSoundSelector', '_handleMouseUp', 'Events', 'Proceeding to call hide().');
        this.hide();
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
        const sectorAngleDegrees = 360 / totalSectors;
        const selectedAngleDegrees = selectedAngle * 180 / Math.PI;
        
        // --- FIX: Add 90 degrees to align the JS math coordinate system (0deg=right) with the CSS coordinate system (0deg=up) ---
        const rotation = selectedAngleDegrees - (sectorAngleDegrees / 2) + 90;

        const gradient = `conic-gradient(rgba(59, 130, 246, 0.3) 0deg ${sectorAngleDegrees}deg, transparent ${sectorAngleDegrees}deg 360deg)`;
        
        sectorElement.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        sectorElement.style.background = gradient;
        sectorElement.style.display = 'block';
    }

    destroy() {
        this.hide();
        logEvent('info', 'RadialSoundSelector', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}