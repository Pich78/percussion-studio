// file: src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class PlaybackRowHeaderView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.isRendered = false; // Track if the initial render has happened
        this.instrumentId = null;

        loadCSS('/percussion-studio/src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.css');
        
        // --- FIX: Bind handlers for proper removal ---
        this._boundHandleClick = this._handleClick.bind(this);
        this._boundHandleInput = this._handleInput.bind(this);
        
        this.container.addEventListener('click', this._boundHandleClick);
        this.container.addEventListener('input', this._boundHandleInput);

        logEvent('info', 'PlaybackRowHeaderView', 'constructor', 'Lifecycle', `[${Date.now()}] Component instance created.`);
    }

    render(state) {
        logEvent('debug', 'PlaybackRowHeaderView', 'render', 'State', `[${Date.now()}] Render called for ID: ${state.id}`, state);
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
        const mutedClass = isEffectivelyMuted ? 'is-muted' : '';

        this.container.className = `mixer-track ${mutedClass}`;
        this.container.dataset.instrumentId = id;

        this.container.innerHTML = `
            <div class="volume-slider-panel">
                <input type="range" class="volume-slider w-100" min="0" max="1" step="0.01" value="${isEffectivelyMuted ? 0 : volume}" title="Volume">
            </div>
            <div class="instrument-header pointer truncate" title="${name}">
                ${name}
            </div>
        `;
        this.isRendered = true;
        logEvent('debug', 'PlaybackRowHeaderView', '_initialRender', 'DOM', `[${Date.now()}] Full render for ${id}.`);
    }

    _updateDOM(state) {
        const { volume, muted } = state;
        const isEffectivelyMuted = muted || volume === 0;

        this.container.classList.toggle('is-muted', isEffectivelyMuted);

        const slider = this.container.querySelector('.volume-slider');
        const sliderValue = isEffectivelyMuted ? '0' : String(volume);
        if (slider.value !== sliderValue) {
            slider.value = sliderValue;
        }
        logEvent('debug', 'PlaybackRowHeaderView', '_updateDOM', 'DOM', `[${Date.now()}] Targeted update for ${this.instrumentId}.`);
    }

    _handleClick(event) {
        if (event.target.classList.contains('volume-slider')) {
            return; // Prevent muting when clicking directly on the slider track
        }
        if (this.instrumentId) {
            logEvent('debug', 'PlaybackRowHeaderView', '_handleClick', 'Events', `[${Date.now()}] Mute toggle requested for ${this.instrumentId}`);
            this.callbacks.onToggleMute?.(this.instrumentId);
        }
    }

    _handleInput(event) {
        if (event.target.classList.contains('volume-slider') && this.instrumentId) {
            const newVolume = parseFloat(event.target.value);
            logEvent('debug', 'PlaybackRowHeaderView', '_handleInput', 'Events', `[${Date.now()}] Volume change for ${this.instrumentId}: ${newVolume}`);
            this.callbacks.onVolumeChange?.(this.instrumentId, newVolume);
        }
    }

    destroy() {
        // --- FIX: Add listener cleanup to prevent memory leaks in tests ---
        this.container.removeEventListener('click', this._boundHandleClick);
        this.container.removeEventListener('input', this._boundHandleInput);
        logEvent('info', 'PlaybackRowHeaderView', 'destroy', 'Lifecycle', `[${Date.now()}] Component destroyed and listeners removed.`);
    }
}