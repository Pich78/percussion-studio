// file: src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class InstrumentSelectionModalView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        
        // Internal state for the selection process
        this.instrumentDefs = [];
        this.soundPacks = [];
        this.selectedSymbol = null;
        this.selectedPackName = null;

        loadCSS('/percussion-studio/src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.css');
        this.container.addEventListener('click', this._handleClick.bind(this));
        logEvent('info', 'InstrumentSelectionModalView', 'constructor', 'Lifecycle', 'Component created.');
    }

    show({ instrumentDefs, soundPacks }) {
        logEvent('debug', 'InstrumentSelectionModalView', 'show', 'Lifecycle', 'Showing modal with data:', { instrumentDefs, soundPacks });
        this.instrumentDefs = instrumentDefs || [];
        this.soundPacks = soundPacks || [];
        
        // Set initial selection state
        this.selectedSymbol = this.instrumentDefs.length > 0 ? this.instrumentDefs[0].symbol : null;
        this.selectedPackName = null;

        this.render();
        this.container.classList.add('is-visible');
    }

    hide() {
        logEvent('debug', 'InstrumentSelectionModalView', 'hide', 'Lifecycle', 'Hiding modal.');
        this.container.classList.remove('is-visible');
    }

    render() {
        if (!this.instrumentDefs.length) {
            this.container.innerHTML = `<p>No instrument definitions loaded.</p>`;
            return;
        }

        // --- Render Instrument Types (Left Column) ---
        const typesHtml = this.instrumentDefs.map(def => `
            <button 
                class="db w-100 tl pa2 bn bg-transparent hover-bg-light-gray pointer f6 ${def.symbol === this.selectedSymbol ? 'bg-washed-blue b' : ''}"
                data-symbol="${def.symbol}">
                ${def.name}
            </button>
        `).join('');

        // --- Filter and Render Sound Packs (Right Column) ---
        const availablePacks = this.soundPacks.filter(pack => pack.symbol === this.selectedSymbol);
        const packsHtml = availablePacks.map(pack => `
            <button 
                class="db w-100 tl pa2 bn bg-transparent hover-bg-light-gray pointer f6 ${pack.pack_name === this.selectedPackName ? 'bg-washed-blue b' : ''}"
                data-pack-name="${pack.pack_name}">
                ${pack.name}
            </button>
        `).join('');

        const isConfirmDisabled = !this.selectedSymbol || !this.selectedPackName;

        const html = `
            <div class="modal-overlay">
                <div class="modal-content bg-white br2 shadow-5 w-100 w-60-ns" style="max-width: 600px;">
                    <header class="f4 b pa3 bb b--black-10">Select Instrument</header>
                    <div class="modal-body flex">
                        <div class="w-50 br b--black-10 pa2 overflow-y-auto" style="max-height: 50vh;">
                            ${typesHtml}
                        </div>
                        <div class="w-50 pa2 overflow-y-auto" style="max-height: 50vh;">
                            ${availablePacks.length > 0 ? packsHtml : '<p class="f7 gray i tc pa2">No sound packs found for this instrument.</p>'}
                        </div>
                    </div>
                    <footer class="pa3 bt b--black-10 tr">
                        <button data-action="cancel" class="pv2 ph3 bn br2 bg-transparent hover-bg-light-gray pointer f6 mr2">Cancel</button>
                        <button data-action="confirm" class="pv2 ph3 bn br2 bg-blue white pointer hover-bg-dark-blue f6" ${isConfirmDisabled ? 'disabled' : ''}>Select Instrument</button>
                    </footer>
                </div>
            </div>
        `;
        this.container.innerHTML = html;
    }

    _handleClick(event) {
        const button = event.target.closest('button');
        if (!button || button.disabled) return;

        const { symbol, packName, action } = button.dataset;

        if (symbol) {
            logEvent('debug', 'InstrumentSelectionModalView', '_handleClick', 'Events', `Instrument type selected: ${symbol}`);
            this.selectedSymbol = symbol;
            this.selectedPackName = null; // Reset pack selection when type changes
            this.render();
            return;
        }

        if (packName) {
            logEvent('debug', 'InstrumentSelectionModalView', '_handleClick', 'Events', `Sound pack selected: ${packName}`);
            this.selectedPackName = packName;
            this.render();
            return;
        }

        if (action === 'cancel') {
            this.callbacks.onCancel?.();
            this.hide();
        }

        if (action === 'confirm') {
            logEvent('info', 'InstrumentSelectionModalView', '_handleClick', 'Events', 'Selection confirmed.');
            this.callbacks.onInstrumentSelected?.({ 
                symbol: this.selectedSymbol, 
                packName: this.selectedPackName 
            });
            this.hide();
        }
    }
}