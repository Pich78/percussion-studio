// file: src/components/InstrumentMixerView/InstrumentMixerView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class InstrumentMixerView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        loadCSS('/percussion-studio/src/components/InstrumentMixerView/InstrumentMixerView.css');
        logEvent('info', 'InstrumentMixerView', 'constructor', 'Lifecycle', 'Component created.');
        
        this.container.addEventListener('input', this.handleInput.bind(this));
        this.container.addEventListener('change', this.handleChange.bind(this));
    }

    render(state) {
        logEvent('debug', 'InstrumentMixerView', 'render', 'State', 'Rendering with state:', state);
        const { rhythm } = state;
        
        if (!rhythm || !rhythm.sound_kit) {
            this.container.innerHTML = '<p class="f7 tc gray">Mixer not available.</p>';
            return;
        }

        const { sound_kit, mixer } = rhythm;
        
        // Use a document fragment for efficient DOM manipulation
        const fragment = document.createDocumentFragment();
        const mixerContainer = document.createElement('div');
        mixerContainer.className = 'instrument-mixer flex flex-column gap3';

        for (const [symbol, instrumentId] of Object.entries(sound_kit)) {
            const trackState = mixer?.[instrumentId] || { volume: 1.0, muted: false };
            const muteId = `mute-${instrumentId.replace(/[^a-zA-Z0-9]/g, '-')}`;
            
            const trackElement = document.createElement('div');
            trackElement.className = 'mixer-track flex items-center';
            trackElement.dataset.instrumentId = instrumentId;

            trackElement.innerHTML = `
                <label class="f6 b w2 tc" title="${instrumentId}">${symbol}</label>
                <input type="range" class="volume-slider flex-auto mh2" min="0" max="1" step="0.01" value="${trackState.volume}" title="Volume">
                <input type="checkbox" id="${muteId}" class="mute-checkbox dn" ${trackState.muted ? 'checked' : ''}>
                <label for="${muteId}" class="mute-label f7 tc b w2 h2 br-100 flex items-center justify-center pointer bg-moon-gray hover-bg-gray white" title="Mute">M</label>
            `;
            mixerContainer.appendChild(trackElement);
        }

        fragment.appendChild(mixerContainer);
        this.container.innerHTML = ''; // Clear previous content
        this.container.appendChild(fragment);
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

    handleChange(event) {
        if (event.target.classList.contains('mute-checkbox')) {
            const instrumentId = event.target.closest('.mixer-track')?.dataset.instrumentId;
            if (instrumentId) {
                const isMuted = event.target.checked;
                logEvent('debug', 'InstrumentMixerView', 'handleChange', 'Events', `Mute toggle for ${instrumentId}: ${isMuted}`);
                this.callbacks.onToggleMute?.(instrumentId, isMuted);
            }
        }
    }
}