// file: src/components/GridPanel/GridPanel.js

import { logEvent } from '/percussion-studio/lib/Logger.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            width: 100%;
            border-radius: var(--grid-panel-border-radius, 8px);
            overflow: hidden;
            
            /* Sizing API: Height is a multiple of a base rem unit */
            height: calc(var(--grid-panel-row-height-multiplier, 4) * 1rem);
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
            border-left: 1px solid var(--grid-panel-color-outline, #dee2e6);
            box-sizing: border-box;
            position: relative;
            cursor: pointer;
            transition: background-color 0.15s ease-in-out;
        }

        .grid-box:first-child { border-left: none; }
        
        /* --- THEMEABLE COLORS via CSS Custom Properties --- */
        .cell-downbeat { background-color: var(--grid-panel-color-downbeat, #ced4da); }
        .cell-strong-beat { background-color: var(--grid-panel-color-strong, #e9ecef); }
        .cell-weak-beat { background-color: var(--grid-panel-color-weak, #ffffff); }

        .cell-triplet-1 { background-color: var(--grid-panel-color-triplet1, #d0ebff); }
        .cell-triplet-2 { background-color: var(--grid-panel-color-triplet2, #e7f5ff); }
        .cell-triplet-3 { background-color: var(--grid-panel-color-triplet3, #f8f9fa); }

        /* Interaction State Layers */
        .grid-box::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: var(--grid-panel-color-on-surface, #1c1b1f);
            opacity: 0;
            transition: opacity 0.15s ease;
            pointer-events: none;
        }
        .grid-box:hover::before {
            opacity: 0.08; /* M3 Hover State */
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: var(--grid-panel-color-ripple, #1c1b1f);
            opacity: 0.2;
            transform: scale(0);
            animation: ripple-effect 0.6s linear;
        }
        @keyframes ripple-effect { to { transform: scale(4); opacity: 0; } }
        
        .note { 
            width: 80%; 
            height: 80%;
            transform: scale(0);
            opacity: 0;
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.15s ease;
        }
        .note.enter-active {
            transform: scale(1);
            opacity: 1;
        }
        .note svg { width: 100%; height: 100%; }
    </style>
    <div class="grid-panel-container"></div>
`;

export class GridPanel extends HTMLElement {
    // Declaration on the class body is the modern, correct syntax.
    #container;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        // Assignment happens within the constructor.
        this.#container = this.shadowRoot.querySelector('.grid-panel-container');
    }

    /**
     * [PUBLIC API] Sets the cell data for the grid.
     * @param {Array<Object>} cellViewModels - An array of pre-processed Cell View Model objects.
     */
    set cells(cellViewModels) {
        this.#render(cellViewModels);
    }

    #render(cells = []) {
        this.#container.innerHTML = ''; 

        for (const cellModel of cells) {
            const cellEl = document.createElement('div');
            cellEl.className = `grid-box ${cellModel.shadingClass}`;
            cellEl.dataset.tickIndex = cellModel.tickIndex;

            if (cellModel.symbolSVG) {
                const noteEl = document.createElement('div');
                noteEl.className = 'note';
                noteEl.innerHTML = cellModel.symbolSVG;
                cellEl.appendChild(noteEl);
                requestAnimationFrame(() => {
                    noteEl.classList.add('enter-active');
                });
            }

            this.#addEventListeners(cellEl, cellModel);
            this.#container.appendChild(cellEl);
        }
    }
    
    #addEventListeners(cellElement, cellModel) {
        cellElement.addEventListener('mousedown', (e) => {
            this.#createRipple(cellElement, e);
            this.dispatchEvent(new CustomEvent('cell-mousedown', { 
                detail: { tickIndex: cellModel.tickIndex, hasNote: cellModel.hasNote },
                bubbles: true, 
                composed: true 
            }));
        });

        cellElement.addEventListener('mouseenter', (e) => {
            if (e.buttons === 1) {
                this.dispatchEvent(new CustomEvent('cell-mouseenter', { 
                    detail: { tickIndex: cellModel.tickIndex, hasNote: cellModel.hasNote },
                    bubbles: true, 
                    composed: true 
                }));
            }
        });
    }

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
        
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }
}

customElements.define('grid-panel', GridPanel);