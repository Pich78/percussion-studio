// file: src/components/PlaybackControlsView/PlaybackControlsView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class PlaybackControlsView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        loadCSS('/percussion-studio/src/components/PlaybackControlsView/PlaybackControlsView.css');
        logEvent('info', 'PlaybackControlsView', 'constructor', 'Lifecycle', 'Component created.');
        
        // Use a single, delegated listener for all click events
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('input', this.handleInput.bind(this));
    }

    render(state) {
        logEvent('debug', 'PlaybackControlsView', 'render', 'State', 'Rendering with state:', state);
        const { isPlaying, isLoading, masterVolume, loopPlayback, globalBPM } = state;

        const btnBase = "pv2 ph3 br2 f6 fw5 bn pointer";
        const btnPrimary = "bg-blue hover-bg-dark-blue white";
        const btnSecondary = "bg-light-silver hover-bg-silver dark-gray";
        const btnToggled = "bg-dark-blue"; // Class for the active loop button
        const disabledState = "o-50 not-allowed";

        const html = `
            <div class="playback-controls flex items-center justify-between gap4 h-100">
                <div class="button-group flex items-center gap2">
                    <button data-action="play" class="${btnBase} ${btnPrimary} ${isPlaying || isLoading ? disabledState : ''}" ${isPlaying || isLoading ? 'disabled' : ''}>Play</button>
                    <button data-action="pause" class="${btnBase} ${btnSecondary} ${!isPlaying || isLoading ? disabledState : ''}" ${!isPlaying || isLoading ? 'disabled' : ''}>Pause</button>
                    <button data-action="stop" class="${btnBase} ${btnSecondary} ${!isPlaying || isLoading ? disabledState : ''}" ${!isPlaying || isLoading ? 'disabled' : ''}>Stop</button>
                </div>
                <div class="slider-group flex items-center gap3 flex-auto mh4">
                    <label for="bpm-slider" class="f6 b dark-gray">BPM</label>
                    <input type="range" id="bpm-slider" data-action="bpm-change" min="20" max="200" step="1" value="${globalBPM}" class="control-slider flex-auto" ${isPlaying || isLoading ? 'disabled' : ''}>
                    <span id="bpm-value" class="f4 b w3 tc">${globalBPM}</span>
                </div>
                <div class="misc-controls flex items-center gap4">
                    <button data-action="toggle-loop" class="${btnBase} ${btnSecondary} ${loopPlayback ? btnToggled : ''}">Loop</button>
                    <div class="flex items-center gap2">
                         <label for="master-volume" class="f6 b dark-gray">Volume</label>
                         <input type="range" id="master-volume" data-action="volume-change" min="0" max="1" step="0.01" value="${masterVolume}" class="control-slider w4">
                    </div>
                </div>
            </div>
        `;
        this.container.innerHTML = html;
    }

    handleClick(event) {
        const button = event.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        logEvent('debug', 'PlaybackControlsView', 'handleClick', 'Events', `Button clicked with action: ${action}`);

        switch (action) {
            case 'play': this.callbacks.onPlay?.(); break;
            case 'pause': this.callbacks.onPause?.(); break;
            case 'stop': this.callbacks.onStop?.(); break;
            case 'toggle-loop':
                // The new state is the opposite of the current visual state
                const isCurrentlyLooping = button.classList.contains('bg-dark-blue');
                this.callbacks.onToggleLoop?.(!isCurrentlyLooping);
                break;
        }
    }

    handleInput(event) {
        if (!event.target.dataset.action) return;

        const action = event.target.dataset.action;
        if (action === 'bpm-change') {
            const newBPM = parseInt(event.target.value, 10);
            this.container.querySelector('#bpm-value').textContent = newBPM; // Update UI immediately
            this.callbacks.onBPMChange?.(newBPM);
        } else if (action === 'volume-change') {
            this.callbacks.onMasterVolumeChange?.(parseFloat(event.target.value));
        }
    }
}