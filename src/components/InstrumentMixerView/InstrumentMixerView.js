// file: src/components/InstrumentMixerView/InstrumentMixerView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class InstrumentMixerView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.isRendered = false; // Track if the initial render has happened

        loadCSS('/percussion-studio/src/components/InstrumentMixerView/InstrumentMixerView.css');
        logEvent('info', 'InstrumentMixerView', 'constructor', 'Lifecycle', 'Component created.');
        
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('input', this.handleInput.bind(this));
    }

    render(state) {
        logEvent('debug', 'InstrumentMixerView', 'render', 'State', 'Render called with state:', state);
        
        // If the number of instruments has changed, we need a full rebuild.
        const soundKitSize = Object.keys(state.rhythm?.sound_kit || {}).length;
        const currentTrackCount = this.container.querySelectorAll('.mixer-track').length;

        if (!this.isRendered || soundKitSize !== currentTrackCount) {
            this._initialRender(state);
        } else {
            this._updateDOM(state);
        }
    }

    _initialRender(state) {
        logEvent('debug', 'InstrumentMixerView', '_initialRender', 'DOM', 'Performing full initial render.');
        const { rhythm } = state;
        
        if (!rhythm?.sound_kit || !rhythm?.instrumentDefsBySymbol) {
            this.container.innerHTML = '<p class="f7 tc gray">Mixer not available.</p>';
            return;
        }

        const { sound_kit, mixer, instrumentDefsBySymbol } = rhythm;
        
        const fragment = document.createDocumentFragment();
        const mixerContainer = document.createElement('div');
        mixerContainer.className = 'instrument-mixer flex flex-column gap3';

        for (const [symbol, instrumentId] of Object.entries(sound_kit)) {
            const trackState = mixer?.[instrumentId] || { volume: 1.0, muted: false };
            const instDef = instrumentDefsBySymbol[symbol];
            const instrumentName = instDef?.name || symbol;
            const isEffectivelyMuted = trackState.muted || trackState.volume === 0;
            const mutedClass = isEffectivelyMuted ? 'is-muted' : '';

            const trackElement = document.createElement('div');
            trackElement.className = 'mixer-track flex flex-column'; // Removed padding and gap, handled by panels now
            trackElement.dataset.instrumentId = instrumentId;

            // NEW: Encapsulated header and slider in separate "panel" divs
            trackElement.innerHTML = `
                <div data-action="toggle-mute" class="instrument-header pointer truncate ${mutedClass}" title="${instrumentName}">
                    ${instrumentName}
                </div>
                <div class="volume-slider-panel">
                    <input type="range" class="volume-slider w-100" min="0" max="1" step="0.01" value="${isEffectivelyMuted ? 0 : trackState.volume}" title="Volume">
                </div>
            `;
            mixerContainer.appendChild(trackElement);
        }

        fragment.appendChild(mixerContainer);
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
        this.isRendered = true;
    }

    _updateDOM(state) {
        logEvent('debug', 'InstrumentMixerView', '_updateDOM', 'DOM', 'Performing targeted DOM update.');
        const { rhythm } = state;
        if (!rhythm?.sound_kit) return;

        for (const [symbol, instrumentId] of Object.entries(rhythm.sound_kit)) {
            const trackElement = this.container.querySelector(`[data-instrument-id="${instrumentId}"]`);
            if (!trackElement) continue;

            const trackState = rhythm.mixer?.[instrumentId] || { volume: 1.0, muted: false };
            const isEffectivelyMuted = trackState.muted || trackState.volume === 0;

            // Update header styles
            const header = trackElement.querySelector('.instrument-header');
            header.classList.toggle('is-muted', isEffectivelyMuted);

            // Update slider value
            const slider = trackElement.querySelector('.volume-slider');
            const sliderValue = isEffectivelyMuted ? '0' : String(trackState.volume);
            if (slider.value !== sliderValue) {
                slider.value = sliderValue;
            }
        }
    }

    handleClick(event) {
        const header = event.target.closest('[data-action="toggle-mute"]');
        if (header) {
            const instrumentId = header.closest('.mixer-track')?.dataset.instrumentId;
            if (instrumentId) {
                logEvent('debug', 'InstrumentMixerView', 'handleClick', 'Events', `Mute toggle requested for ${instrumentId}`);
                this.callbacks.onToggleMute?.(instrumentId);
            }
        }
    }

    handleInput(event) {
        if (event.target.classList.contains('volume-slider')) {
            const instrumentId = event.target.closest('.mixer-track')?.dataset.instrumentId;
            if (instrumentId) {
                const newVolume = parseFloat(event.target.value);
                logEvent('debug', 'InstrumentMixerView', 'handleInput', 'Events', `Volume change for ${instrumentId}: ${newVolume}`);
                this.callbacks.onVolumeChange?.(instrumentId, newVolume);
            }
        }
    }
}