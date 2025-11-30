// file: src/components/PatternItemViewMD3/PatternItemViewMD3.js

import { logEvent } from '/percussion-studio/lib/Logger.js';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        /* All styles are now encapsulated in the Shadow DOM */
        :host {
            display: block;
            width: 100%;
            contain: content;
        }

        :host([is-dragging]) .list-item {
            opacity: 0.3;
        }

        .list-item {
            --list-item-background-color: var(--md-sys-color-surface-container);
            --list-item-border-color: var(--md-sys-color-outline-variant);
            --list-item-state-color: transparent;
            --text-primary-color: var(--md-sys-color-on-surface);
            --text-secondary-color: var(--md-sys-color-on-surface-variant);
            --icon-color: var(--md-sys-color-on-surface-variant);

            font-family: 'Roboto', sans-serif;
            display: flex;
            align-items: center;
            padding: 8px;
            gap: 12px;
            border-radius: 8px;
            background-color: var(--list-item-background-color);
            border: 1px solid var(--list-item-border-color);
            transition: background-color 0.2s ease-out, border-color 0.2s ease-out, box-shadow 0.2s ease-out;
            position: relative;
        }

        :host(:hover) .list-item {
            --list-item-background-color: var(--md-sys-color-surface-container-high);
        }

        :host([selected]) .list-item {
            --list-item-background-color: var(--md-sys-color-secondary-container);
            --list-item-border-color: var(--md-sys-color-secondary);
            --text-primary-color: var(--md-sys-color-on-secondary-container);
            --text-secondary-color: var(--md-sys-color-on-secondary-container);
            --icon-color: var(--md-sys-color-on-secondary-container);
        }

        /* --- Drag Handle --- */
        .drag-handle {
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--icon-color);
            opacity: 0.7;
            transition: opacity 0.15s ease-in-out;
        }
        .drag-handle:hover {
            opacity: 1;
        }

        /* --- Content Wrapper --- */
        .content-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .top-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .pattern-name {
            font-size: var(--md-sys-typescale-body-large-size, 1rem);
            font-weight: 500;
            color: var(--text-primary-color);
            background: transparent;
            border: none;
            padding: 0;
            margin: 0;
            width: 100%;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        .pattern-name:focus {
            outline: none;
            text-decoration: underline;
        }

        /* --- Modifiers --- */
        .modifiers {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .modifier-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .modifier-label {
            font-size: var(--md-sys-typescale-label-small-size, 0.7rem);
            color: var(--text-secondary-color);
            text-transform: uppercase;
        }

        .modifier-input {
            width: 48px;
            background-color: var(--md-sys-color-surface-variant);
            color: var(--md-sys-color-on-surface-variant);
            border: 1px solid var(--md-sys-color-outline);
            border-radius: 4px;
            padding: 2px 4px;
            text-align: center;
            font-size: var(--md-sys-typescale-body-medium-size, 0.9rem);
        }
        .modifier-input:focus {
            outline: 2px solid var(--md-sys-color-primary);
            border-color: var(--md-sys-color-primary);
        }

        .modifier-value {
            font-size: var(--md-sys-typescale-body-medium-size, 0.9rem);
            color: var(--text-primary-color);
            padding: 2px 8px;
            border-radius: 4px;
            cursor: pointer;
            user-select: none;
            transition: background-color 0.15s ease;
            border: 1px solid transparent;
        }
        .modifier-value:hover {
            background-color: rgba(var(--md-sys-color-on-surface-rgb), 0.08);
        }
        .modifier-value.is-active-editing {
            background-color: var(--md-sys-color-primary-container);
            color: var(--md-sys-color-on-primary-container);
            border-color: var(--md-sys-color-primary);
        }
        
        /* --- Delete Button --- */
        .delete-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: none;
            background: transparent;
            color: var(--icon-color);
            cursor: pointer;
            transition: background-color 0.2s ease, color 0.2s ease;
        }
        .delete-button:hover {
            background-color: var(--md-sys-color-error-container);
            color: var(--md-sys-color-on-error-container);
        }

        .hidden { display: none; }
    </style>
    <div class="list-item" part="list-item">
        <div class="drag-handle" part="drag-handle">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </div>
        <div class="content-wrapper">
            <div class="top-row">
                <select id="pattern-name" class="pattern-name" part="pattern-name"></select>
                <button class="delete-button" part="delete-button" title="Remove Item">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
                </button>
            </div>
            <div class="modifiers">
                <div class="modifier-item">
                    <label for="reps" class="modifier-label">Reps</label>
                    <input id="reps" type="number" class="modifier-input" min="1" max="999" part="reps-input">
                </div>
                <div class="modifier-item">
                    <label class="modifier-label">BPM</label>
                    <span id="bpm" class="modifier-value" data-property="bpm" part="bpm-value"></span>
                </div>
                <div class="modifier-item">
                    <label class="modifier-label">Accel</label>
                    <span id="accel" class="modifier-value" data-property="bpm_accel_cents" part="accel-value"></span>
                </div>
            </div>
        </div>
    </div>
`;

export class PatternItemViewMD3 extends HTMLElement {
    static get observedAttributes() {
        return ['selected', 'item-data', 'global-bpm', 'pattern-list'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this._itemData = {};
        this._globalBPM = 120;
        this._patternList = [];

        // For wheel-to-edit feature
        this.activeProperty = null;
        this.currentValue = 0;

        this._onWheel = this._onWheel.bind(this);
        this._exitActiveMode = this._exitActiveMode.bind(this);
    }
    
    connectedCallback() {
        logEvent('info', 'PatternItemViewMD3', 'connectedCallback', 'Lifecycle', 'Component connected.');
        this._addEventListeners();
        this._render();
    }
    
    disconnectedCallback() {
        logEvent('info', 'PatternItemViewMD3', 'disconnectedCallback', 'Lifecycle', 'Component disconnected.');
        // Cleanup global listeners if component is removed while editing
        if (this.activeProperty) {
            this._exitActiveMode(null, true); 
        }
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        logEvent('debug', 'PatternItemViewMD3', 'attributeChangedCallback', 'Attributes', `${name} changed from ${oldValue} to ${newValue}`);
        switch (name) {
            case 'item-data':
                this._itemData = JSON.parse(newValue);
                break;
            case 'global-bpm':
                this._globalBPM = Number(newValue);
                break;
            case 'pattern-list':
                this._patternList = JSON.parse(newValue);
                break;
        }
        this._render();
    }

    // --- Properties ---
    set itemData(data) {
        this.setAttribute('item-data', JSON.stringify(data));
    }
    get itemData() {
        return this._itemData;
    }

    set globalBPM(value) {
        this.setAttribute('global-bpm', value);
    }
    get globalBPM() {
        return this._globalBPM;
    }

    set patternList(list) {
        this.setAttribute('pattern-list', JSON.stringify(list));
    }
    get patternList() {
        return this._patternList;
    }

    // --- Private methods ---
    
    _addEventListeners() {
        const deleteBtn = this.shadowRoot.querySelector('.delete-button');
        const repsInput = this.shadowRoot.querySelector('#reps');
        const patternSelect = this.shadowRoot.querySelector('#pattern-name');

        deleteBtn.addEventListener('click', () => {
            logEvent('info', 'PatternItemViewMD3', '_addEventListeners', 'Events', 'Delete button clicked.');
            this.dispatchEvent(new CustomEvent('delete-item', { bubbles: true, composed: true }));
        });

        repsInput.addEventListener('change', () => {
             this._emitPropertyChange('repetitions', Number(repsInput.value));
        });
        
        repsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                repsInput.blur();
                this._emitPropertyChange('repetitions', Number(repsInput.value));
            }
        });

        patternSelect.addEventListener('change', () => {
             this._emitPropertyChange('pattern', patternSelect.value);
        });

        this.shadowRoot.querySelectorAll('.modifier-value').forEach(el => {
            el.addEventListener('click', (e) => {
                if (this.activeProperty && this.activeProperty !== el.dataset.property) {
                    this._exitActiveMode();
                }
                if (!this.activeProperty) {
                    e.stopPropagation();
                    this._enterActiveMode(el);
                }
            });
        });
    }

    _render() {
        if (!this.shadowRoot) return;

        const repsInput = this.shadowRoot.querySelector('#reps');
        const bpmValueEl = this.shadowRoot.querySelector('#bpm');
        const accelValueEl = this.shadowRoot.querySelector('#accel');
        const patternSelect = this.shadowRoot.querySelector('#pattern-name');

        const repsValue = this._itemData.repetitions ?? 1;
        const bpmValue = this._itemData.bpm ?? this._globalBPM ?? 80;
        const accelValue = this._itemData.bpm_accel_cents ?? 100;

        repsInput.value = repsValue;
        bpmValueEl.textContent = bpmValue;
        accelValueEl.textContent = accelValue;

        // Populate pattern list dropdown
        patternSelect.innerHTML = '';
        this._patternList.forEach(patternName => {
            const option = document.createElement('option');
            option.value = patternName;
            option.textContent = patternName;
            if (patternName === this.itemData.pattern) {
                option.selected = true;
            }
            patternSelect.appendChild(option);
        });
         if (!this._patternList.includes(this.itemData.pattern)) {
            const option = document.createElement('option');
            option.value = this.itemData.pattern;
            option.textContent = this.itemData.pattern;
            option.selected = true;
            patternSelect.prepend(option);
        }
    }

    _emitPropertyChange(property, value) {
        logEvent('info', 'PatternItemViewMD3', '_emitPropertyChange', 'Events', `Dispatching property-change: ${property}=${value}`);
        this.dispatchEvent(new CustomEvent('property-change', {
            detail: { property, value },
            bubbles: true, composed: true
        }));
    }

    // --- Wheel-to-edit logic ---

    _enterActiveMode(element) {
        this.activeProperty = element.dataset.property;
        this.currentValue = Number(element.textContent);
        element.classList.add('is-active-editing');
        document.body.style.cursor = 'none';

        document.addEventListener('wheel', this._onWheel, { passive: false });
        // Use capture phase to catch clicks outside the component before they are handled elsewhere
        document.addEventListener('click', this._exitActiveMode, { capture: true, once: true });
        logEvent('debug', 'PatternItemViewMD3', '_enterActiveMode', 'UI-State', `Entered active mode for ${this.activeProperty}`);
    }

    _exitActiveMode(event, force = false) {
        if (!this.activeProperty) return;
        
        // If the click was on the active element, don't exit.
        if (event && event.target === this.shadowRoot.querySelector('.is-active-editing')) {
             // Re-add the listener since 'once:true' removed it
             document.addEventListener('click', this._exitActiveMode, { capture: true, once: true });
             return;
        }

        const activeElement = this.shadowRoot.querySelector('.is-active-editing');
        
        // A small delay to allow click events to propagate if needed.
        setTimeout(() => {
            if (event) event.stopPropagation();

            if (activeElement) activeElement.classList.remove('is-active-editing');
            document.body.style.cursor = '';
            document.removeEventListener('wheel', this._onWheel);

            // Don't emit change if forced exit (e.g., disconnectedCallback)
            if (!force) {
                this._emitPropertyChange(this.activeProperty, this.currentValue);
            }
            
            logEvent('debug', 'PatternItemViewMD3', '_exitActiveMode', 'UI-State', `Exited active mode for ${this.activeProperty}`);
            this.activeProperty = null;
        }, 0);
    }
    
    _onWheel(event) {
        if (!this.activeProperty) return;
        event.preventDefault();

        const scrollDirection = -Math.sign(event.deltaY);
        let step = this.activeProperty === 'bpm' ? 5 : 1;
        if (event.shiftKey) step *= 5;

        this.currentValue += (scrollDirection * step);

        if (this.activeProperty === 'bpm') {
            this.currentValue = Math.max(30, Math.min(250, this.currentValue));
        } else if (this.activeProperty === 'bpm_accel_cents') {
            this.currentValue = Math.max(80, Math.min(120, this.currentValue));
        }
        
        const roundedValue = Math.round(this.currentValue);
        const valueDisplay = this.shadowRoot.querySelector(`.modifier-value[data-property="${this.activeProperty}"]`);
        if (valueDisplay) {
            valueDisplay.textContent = roundedValue;
        }
        this.currentValue = roundedValue;
    }
}

customElements.define('pattern-item-view-md3', PatternItemViewMD3);