// file: src/components/InstrumentMixerView/InstrumentMixerView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class InstrumentMixerView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.isRendered = false; // Track if the initial render has happened
        this.instrumentId = null;

        loadCSS('/percussion-studio/src/components/InstrumentMixerView/InstrumentMixerView.css');
        logEvent('info', 'InstrumentMixerView', 'constructor', 'Lifecycle', 'Component instance created.');
        
        // Listeners are now on the component's root container
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('input', this.handleInput.bind(this));
    }

    // The render method now accepts state for a SINGLE instrument
    render(instrumentState) {
        logEvent('debug', 'InstrumentMixerView', 'render', 'State', `Render called for instrument ID: ${instrumentState.id}`, instrumentState);
        this.instrumentId = instrumentState.id;

        if (!this.isRendered) {
            this._initialRender(instrumentState);
        } else {
            this._updateDOM(instrumentState);
        }
    }

    _initialRender(state) {
        const { id, name, volume, muted } = state;
        const isEffectivelyMuted = muted || volume === 0;
        const mutedClass = isEffectivelyMuted ? 'is-muted' : '';

        // The component's container IS the mixer track now. No more outer loops or containers.
        this.container.className = 'mixer-track flex flex-column';
        this.container.dataset.instrumentId = id;

        this.container.innerHTML = `
            <div data-action="toggle-mute" class="instrument-header pointer truncate ${mutedClass}" title="${name}">
                ${name}
            </div>
            <div class="volume-slider-panel">
                <input type="range" class="volume-slider w-100" min="0" max="1" step="0.01" value="${isEffectivelyMuted ? 0 : volume}" title="Volume">
            </div>
        `;
        this.isRendered = true;
        logEvent('debug', 'InstrumentMixerView', '_initialRender', 'DOM', `Full render for ${id}.`);
    }

    _updateDOM(state) {
        const { volume, muted } = state;
        const isEffectivelyMuted = muted || volume === 0;

        // Update header styles
        const header = this.container.querySelector('.instrument-header');
        header.classList.toggle('is-muted', isEffectivelyMuted);

        // Update slider value
        const slider = this.container.querySelector('.volume-slider');
        const sliderValue = isEffectivelyMuted ? '0' : String(volume);
        if (slider.value !== sliderValue) {
            slider.value = sliderValue;
        }
        logEvent('debug', 'InstrumentMixerView', '_updateDOM', 'DOM', `Targeted update for ${this.instrumentId}.`);
    }

    handleClick(event) {
        const header = event.target.closest('[data-action="toggle-mute"]');
        if (header && this.instrumentId) {
            logEvent('debug', 'InstrumentMixerView', 'handleClick', 'Events', `Mute toggle requested for ${this.instrumentId}`);
            this.callbacks.onToggleMute?.(this.instrumentId);
        }
    }

    handleInput(event) {
        if (event.target.classList.contains('volume-slider') && this.instrumentId) {
            const newVolume = parseFloat(event.target.value);
            logEvent('debug', 'InstrumentMixerView', 'handleInput', 'Events', `Volume change for ${this.instrumentId}: ${newVolume}`);
            this.callbacks.onVolumeChange?.(this.instrumentId, newVolume);
        }
    }
}