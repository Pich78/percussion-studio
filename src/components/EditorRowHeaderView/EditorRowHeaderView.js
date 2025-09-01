// file: src/components/EditorRowHeaderView/EditorRowHeaderView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class EditorRowHeaderView {
    constructor(container, { instrument, callbacks }) {
        this.container = container;
        this.instrument = instrument;
        this.callbacks = callbacks || {};

        loadCSS('/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.css');
        
        this._boundHandleClick = this._handleClick.bind(this);
        this.container.addEventListener('click', this._boundHandleClick);
        logEvent('debug', 'EditorRowHeaderView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render(instrument) {
        if (instrument) {
            this.instrument = instrument;
        }
        
        this.container.className = 'editor-header';
        this.container.setAttribute('title', `Click to change instrument: ${this.instrument.name} - ${this.instrument.pack}`);
        
        this.container.innerHTML = `
            <strong class="editor-header__instrument-name">${this.instrument.name}</strong>
            <span class="editor-header__pack-name">${this.instrument.pack}</span>
        `;
    }

    _handleClick() {
        logEvent('debug', 'EditorRowHeaderView', '_handleClick', 'Events', 'Header clicked, firing onRequestInstrumentChange.');
        this.callbacks.onRequestInstrumentChange?.(this.instrument);
    }
    
    destroy() {
        this.container.removeEventListener('click', this._boundHandleClick);
        this.container.innerHTML = '';
        logEvent('debug', 'EditorRowHeaderView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}