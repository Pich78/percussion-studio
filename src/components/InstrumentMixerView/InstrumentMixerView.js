// file: src/components/InstrumentMixerView/InstrumentMixerView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class InstrumentMixerView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        loadCSS('/percussion-studio/src/components/InstrumentMixerView/InstrumentMixerView.css');
        logEvent('info', 'InstrumentMixerView', 'constructor', 'Lifecycle', 'Component created.');
        
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('input', this.handleInput.bind(this));
    }

    render(state) {
        logEvent('debug', 'InstrumentMixerView', 'render', 'State', 'Rendering with state:', state);
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

            // Determine muted state from either the muted flag OR volume being zero
            const isEffectivelyMuted = trackState.muted || trackState.volume === 0;
            const mutedClass = isEffectivelyMuted ? 'is-muted' : '';
            const headerBg = isEffectivelyMuted ? '' : 'bg-green';

            const trackElement = document.createElement('div');
            trackElement.className = 'mixer-track flex flex-column gap2 pa2 br2 bg-light-gray';
            trackElement.dataset.instrumentId = instrumentId;

            trackElement.innerHTML = `
                <div data-action="toggle-mute" class="instrument-header f6 b pv1 ph2 br2 tc pointer ${headerBg} ${mutedClass} white truncate" title="${instrumentName}">${instrumentName}</div>
                <input type="range" class="volume-slider w-100" min="0" max="1" step="0.01" value="${isEffectivelyMuted ? 0 : trackState.volume}" title="Volume">
            `;
            mixerContainer.appendChild(trackElement);
        }

        fragment.appendChild(mixerContainer);
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
    }

    handleClick(event) {
        const header = event.target.closest('[data-action="toggle-mute"]');
        if (header) {
            const instrumentId = header.closest('.mixer-track')?.dataset.instrumentId;
            if (instrumentId) {
                logEvent('debug', 'InstrumentMixerView', 'handleClick', 'Events', `Mute toggle requested for ${instrumentId}`);
                // The component simply reports the user's intent.
                // The parent app is responsible for the complex logic.
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