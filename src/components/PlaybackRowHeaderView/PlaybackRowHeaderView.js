// file: src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class PlaybackRowHeaderView {
    constructor(container, { callbacks }) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.isRendered = false;
        this.instrumentId = null;

        loadCSS('/percussion-studio/src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.css');
        
        this._boundHandleClick = this._handleClick.bind(this);
        this._boundHandleInput = this._handleInput.bind(this);
        
        this.container.addEventListener('click', this._boundHandleClick);
        this.container.addEventListener('input', this._boundHandleInput);

        logEvent('debug', 'PlaybackRowHeaderView', 'constructor', 'Lifecycle', 'Component instance created.');
    }

    render(state) {
        logEvent('debug', 'PlaybackRowHeaderView', 'render', 'State', `Render called for ID: ${state.id}`, state);
        this.instrumentId = state.id;

        if (!this.isRendered) {
            this._initialRender(state);
        } else {
            this._updateDOM(state);
        }
    }

    _initialRender(state) {
        const { id, name, volume, muted } = state;
        const isEffectivelyMuted = muted || volume === 0;

        // The component now renders its content into the container it was given.
        // It's the parent's job to ensure this container is in the right place.
        this.container.innerHTML = `
            <div class="mixer-track">
                <div class="volume-slider-panel">
                    <input type="range" class="volume-slider w-100" min="0" max="1" step="0.01" value="${isEffectivelyMuted ? 0 : volume}" title="Volume">
                </div>
                <div class="instrument-header pointer truncate" title="${name}">
                    ${name}
                </div>
            </div>
        `;
        this.isRendered = true;
        this._updateDOM(state); // Call update to set initial muted class
        logEvent('debug', 'PlaybackRowHeaderView', '_initialRender', 'DOM', `Full render for ${id}.`);
    }

    _updateDOM(state) {
        const { volume, muted } = state;
        const isEffectivelyMuted = muted || volume === 0;

        const trackEl = this.container.querySelector('.mixer-track');
        if (!trackEl) return;

        trackEl.classList.toggle('is-muted', isEffectivelyMuted);

        const slider = trackEl.querySelector('.volume-slider');
        const sliderValue = isEffectivelyMuted ? '0' : String(volume);
        if (slider.value !== sliderValue) {
            slider.value = sliderValue;
        }
        logEvent('debug', 'PlaybackRowHeaderView', '_updateDOM', 'DOM', `Targeted update for ${this.instrumentId}.`);
    }

    _handleClick(event) {
        if (event.target.classList.contains('volume-slider')) {
            return;
        }
        if (this.instrumentId) {
            logEvent('debug', 'PlaybackRowHeaderView', '_handleClick', 'Events', `Mute toggle requested for ${this.instrumentId}`);
            this.callbacks.onToggleMute?.(this.instrumentId);
        }
    }

    _handleInput(event) {
        if (event.target.classList.contains('volume-slider') && this.instrumentId) {
            const newVolume = parseFloat(event.target.value);
            logEvent('debug', 'PlaybackRowHeaderView', '_handleInput', 'Events', `Volume change for ${this.instrumentId}: ${newVolume}`);
            this.callbacks.onVolumeChange?.(this.instrumentId, newVolume);
        }
    }

    destroy() {
        this.container.removeEventListener('click', this._boundHandleClick);
        this.container.removeEventListener('input', this._boundHandleInput);
        this.container.innerHTML = '';
        logEvent('debug', 'PlaybackRowHeaderView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}