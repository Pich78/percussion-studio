// file: src/components/PlaybackControlsView/PlaybackControlsView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class PlaybackControlsView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.isRendered = false;

        loadCSS('/percussion-studio/src/components/PlaybackControlsView/PlaybackControlsView.css');
        logEvent('info', 'PlaybackControlsView', 'constructor', 'Lifecycle', 'Component created.');
        
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('input', this.handleInput.bind(this));
    }

    render(state) {
        logEvent('debug', 'PlaybackControlsView', 'render', 'State', 'Render called with state:', state);
        if (!this.isRendered) {
            this._initialRender(state);
        } else {
            this._updateDOM(state);
        }
    }

    _initialRender(state) {
        logEvent('debug', 'PlaybackControlsView', '_initialRender', 'DOM', 'Performing full initial render.');
        const html = `
            <div class="playback-controls flex items-center justify-between gap4 h-100">
                <div class="button-group flex items-center gap2">
                    <button data-action="play">Play</button>
                    <button data-action="pause">Pause</button>
                    <button data-action="stop">Stop</button>
                </div>
                <div class="slider-group flex items-center gap3 flex-auto mh4">
                    <label for="bpm-slider" class="f6 b dark-gray">BPM</label>
                    <input type="range" id="bpm-slider" data-action="bpm-change" min="20" max="200" step="1" class="control-slider flex-auto">
                    <span id="bpm-value" class="f4 b w3 tc"></span>
                </div>
                <div class="misc-controls flex items-center gap4">
                    <button data-action="toggle-loop">Loop</button>
                    <div class="flex items-center gap2">
                         <label for="master-volume" class="f6 b dark-gray">Volume</label>
                         <input type="range" id="master-volume" data-action="volume-change" min="0" max="1" step="0.01" class="control-slider w4">
                    </div>
                </div>
            </div>
        `;
        this.container.innerHTML = html;
        this.isRendered = true;
        this._updateDOM(state);
    }

    _updateDOM(state) {
        logEvent('debug', 'PlaybackControlsView', '_updateDOM', 'DOM', 'Performing targeted DOM update.');
        const { isPlaying, isLoading, masterVolume, loopPlayback, globalBPM } = state;

        // --- NEW COLOR AND STYLE LOGIC ---
        const btnBase = "pv2 ph3 br2 f6 fw5 bn pointer";
        const btnPrimary = "bg-blue hover-bg-dark-blue white"; // Active, primary action
        const btnDisabled = "bg-light-gray o-50 not-allowed"; // Disabled state
        const btnToggled = "bg-green hover-bg-dark-green white"; // Toggled ON state for Loop

        const playBtn = this.container.querySelector('[data-action="play"]');
        const pauseBtn = this.container.querySelector('[data-action="pause"]');
        const stopBtn = this.container.querySelector('[data-action="stop"]');
        const loopBtn = this.container.querySelector('[data-action="toggle-loop"]');

        playBtn.disabled = isPlaying || isLoading;
        pauseBtn.disabled = !isPlaying || isLoading;
        stopBtn.disabled = !isPlaying || isLoading;

        playBtn.className = `${btnBase} ${playBtn.disabled ? btnDisabled : btnPrimary}`;
        pauseBtn.className = `${btnBase} ${pauseBtn.disabled ? btnDisabled : btnPrimary}`;
        stopBtn.className = `${btnBase} ${stopBtn.disabled ? btnDisabled : btnPrimary}`;
        loopBtn.className = `${btnBase} ${loopPlayback ? btnToggled : btnPrimary}`;

        const bpmSlider = this.container.querySelector('#bpm-slider');
        bpmSlider.disabled = isPlaying || isLoading;
        if (bpmSlider.value != globalBPM) {
            bpmSlider.value = globalBPM;
        }
        this.container.querySelector('#bpm-value').textContent = globalBPM;
        
        const volumeSlider = this.container.querySelector('#master-volume');
        if (volumeSlider.value != masterVolume) {
            volumeSlider.value = masterVolume;
        }
    }

    handleClick(event) {
        const button = event.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        logEvent('debug', 'PlaybackControlsView', 'handleClick', 'Events', `Button clicked: ${action}`);

        switch (action) {
            case 'play': this.callbacks.onPlay?.(); break;
            case 'pause': this.callbacks.onPause?.(); break;
            case 'stop': this.callbacks.onStop?.(); break;
            case 'toggle-loop':
                this.callbacks.onToggleLoop?.();
                break;
        }
    }

    handleInput(event) {
        if (!event.target.dataset.action) return;
        const action = event.target.dataset.action;
        
        if (action === 'bpm-change') {
            const newBPM = parseInt(event.target.value, 10);
            this.container.querySelector('#bpm-value').textContent = newBPM;
            this.callbacks.onBPMChange?.(newBPM);
        } else if (action === 'volume-change') {
            this.callbacks.onMasterVolumeChange?.(parseFloat(event.target.value));
        }
    }
}