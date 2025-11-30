// file: src/components/GridPanel/GridPanel.js

import { logEvent } from '/percussion-studio/lib/Logger.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            height: 100%;
            width: 100%;
            /* M3 uses rounded corners extensively */
            border-radius: var(--grid-panel-border-radius, 12px);
            overflow: hidden; /* Important for keeping ripples and corners clean */
        }

        .grid-panel-container {
            display: flex;
            align-items: stretch;
            height: 100%;
            width: 100%;
        }

        .grid-box {
            flex-grow: 1;
            flex-basis: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            border-left: 1px solid var(--grid-color-outline, #e0e0e0);
            box-sizing: border-box;
            position: relative; /* Crucial for positioning pseudo-elements and ripples */
            cursor: pointer;
            /* Add transitions for smooth color changes (e.g., playback indicator) */
            transition: background-color 0.15s ease-in-out;
        }

        .grid-box:first-child { border-left: none; }
        
        /* --- 1. THEMING WITH M3 DESIGN TOKENS --- */
        /* These variables are the component's "Theming API" */
        .cell-downbeat { background-color: var(--grid-color-surface-downbeat, #e9ecef); }
        .cell-strong-beat { background-color: var(--grid-color-surface-strong, #f8f9fa); }
        .cell-weak-beat { background-color: var(--grid-color-surface-weak, #ffffff); }

        .cell-triplet-1 { background-color: var(--grid-color-primary-container, #eaddff); }
        .cell-triplet-2 { background-color: var(--grid-color-secondary-container, #e8def8); }
        .cell-triplet-3 { background-color: var(--grid-color-tertiary-container, #f3d8fd); }

        /* --- 2. MICRO-INTERACTIONS (Hover State Layer) --- */
        .grid-box::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: var(--grid-color-on-surface, #1c1b1f); /* M3's primary text color */
            opacity: 0;
            transition: opacity 0.15s ease;
            pointer-events: none; /* Allows clicks to pass through */
        }
        .grid-box:hover::before {
            opacity: 0.08; /* M3 standard hover opacity */
        }

        /* --- RIPPLE EFFECT --- */
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: var(--grid-color-on-surface, #1c1b1f);
            opacity: 0.2; /* M3 ripple opacity */
            transform: scale(0);
            animation: ripple-effect 0.6s linear;
        }
        @keyframes ripple-effect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        /* --- 3. ANIMATING STATE CHANGES (Note Enter/Exit) --- */
        .note { 
            width: 80%; height: 80%;
            /* Initial state for animation */
            transform: scale(0);
            opacity: 0;
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.15s ease;
        }
        .note.enter-active {
            transform: scale(1);
            opacity: 1;
        }
        .note svg { width: 100%; height: 100%; }

        /* 4. ANIMATING THE PLAYBACK INDICATOR (Example Class) */
        .playback-highlight {
            /* This could be a brighter, more prominent color */
            background-color: var(--grid-color-primary, #6750a4) !important;
            color: var(--grid-color-on-primary, #ffffff) !important;
        }

    </style>
    <div class="grid-panel-container"></div>
`;

export class GridPanel extends HTMLElement {
    #container;
    #notation = '';
    #metrics = null;
    #instrument = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.#container = this.shadowRoot.querySelector('.grid-panel-container');
    }

    set notation(value) { this.#notation = value; this.#render(); }
    get notation() { return this.#notation; }

    set metrics(value) { this.#metrics = value; this.#render(); }
    get metrics() { return this.#metrics; }

    set instrument(value) { this.#instrument = value; this.#render(); }
    get instrument() { return this.#instrument; }

    #render() {
        this.#container.innerHTML = '';
        if (!this.#notation || !this.#metrics || !this.#instrument) return;
        
        const notationChars = this.#notation.split('');
        for (let i = 0; i < notationChars.length; i++) {
            const cellEl = this.#createCell(i, notationChars[i]);
            this.#container.appendChild(cellEl);
        }
    }

    #createCell(index, soundLetter) {
        const cellEl = document.createElement('div');
        cellEl.className = 'grid-box';
        cellEl.dataset.tickIndex = index;
        
        const { feel, beatGrouping } = this.#metrics;
        const hasNote = soundLetter && soundLetter !== '-';

        // Rhythmic Shading Logic (Unchanged) ...
        if (feel === 'triplet') {
            if (beatGrouping === 3) {
                const pos = index % beatGrouping;
                cellEl.classList.add(`cell-triplet-${pos + 1}`);
            } else {
                const posInner = index % 3;
                if (posInner === 0) cellEl.classList.add(index % beatGrouping === 0 ? 'cell-triplet-1' : 'cell-triplet-2');
                else cellEl.classList.add('cell-triplet-3');
            }
        } else {
            const pos = index % beatGrouping;
            if (pos === 0) cellEl.classList.add('cell-downbeat');
            else if (beatGrouping > 2 && pos === beatGrouping / 2) cellEl.classList.add('cell-strong-beat');
            else cellEl.classList.add('cell-weak-beat');
        }

        // Note Rendering (with Enter Animation)
        if (hasNote) {
            const sound = this.#instrument.sounds.find(s => s.letter === soundLetter);
            if (sound?.svg) {
                const noteEl = document.createElement('div');
                noteEl.className = 'note';
                noteEl.innerHTML = sound.svg;
                cellEl.appendChild(noteEl);
                // Trigger the animation after the element is in the DOM
                requestAnimationFrame(() => {
                    noteEl.classList.add('enter-active');
                });
            }
        }
        
        const createEventDetail = () => ({ tickIndex: index, hasNote });

        cellEl.addEventListener('mousedown', (e) => {
            this.#createRipple(cellEl, e);
            this.dispatchEvent(new CustomEvent('cell-mousedown', { detail: createEventDetail(), bubbles: true, composed: true }));
        });

        cellEl.addEventListener('mouseenter', (e) => {
            if (e.buttons === 1) {
                this.dispatchEvent(new CustomEvent('cell-mouseenter', { detail: createEventDetail(), bubbles: true, composed: true }));
            }
        });
        
        return cellEl;
    }

    // --- NEW: Ripple Effect Logic ---
    #createRipple(element, event) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        element.appendChild(ripple);
        
        // Clean up the ripple element after the animation is done
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }
}

customElements.define('grid-panel', GridPanel);