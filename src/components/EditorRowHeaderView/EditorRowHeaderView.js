// file: src/components/EditorRowHeaderView/EditorRowHeaderView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class EditorRowHeaderView {
    constructor(container, { instrument, callbacks }) {
        // The container is the parent-provided area to mount into.
        this.container = container; 
        this.instrument = instrument;
        this.callbacks = callbacks || {};

        loadCSS('/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.css');
        
        // --- YOUR SOLUTION: Create the component's own root element (the "box") ---
        this.rootElement = document.createElement('div');
        this.container.appendChild(this.rootElement);

        this._boundHandleClick = this._handleClick.bind(this);
        // Attach the listener to the component's own root element.
        this.rootElement.addEventListener('click', this._boundHandleClick);

        logEvent('debug', 'EditorRowHeaderView', 'constructor', 'Lifecycle', 'Component created with its own root element.');
    }

    render(instrument) {
        if (instrument) {
            this.instrument = instrument;
        }
        
        // Apply the component's main class to its own root element.
        this.rootElement.className = 'editor-header';
        this.rootElement.setAttribute('title', `Click to change instrument: ${this.instrument.name} - ${this.instrument.pack}`);
        
        // Render the content *inside* the component's root element.
        this.rootElement.innerHTML = `
            <strong class="editor-header__instrument-name">${this.instrument.name}</strong>
            <span class="editor-header__pack-name">${this.instrument.pack}</span>
        `;
    }

    _handleClick() {
        logEvent('debug', 'EditorRowHeaderView', '_handleClick', 'Events', 'Header clicked, firing onRequestInstrumentChange.');
        this.callbacks.onRequestInstrumentChange?.(this.instrument);
    }
    
    destroy() {
        // Clean up the listener from the root element.
        this.rootElement.removeEventListener('click', this._boundHandleClick);
        // Destroy the component by clearing the parent container.
        this.container.innerHTML = '';
        logEvent('debug', 'EditorRowHeaderView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}