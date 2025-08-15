// file: src/view/PlaybackControlsView.js (Complete, Final UI Version)

export class PlaybackControlsView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        // Bind event handlers
        this.handlePlayClick = this.handlePlayClick.bind(this);
        this.handlePauseClick = this.handlePauseClick.bind(this);
        this.handleStopClick = this.handleStopClick.bind(this);
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
        this.handleLoopToggle = this.handleLoopToggle.bind(this);
    }

    render(state) {
        const { isPlaying, isLoading, masterVolume, loopPlayback } = state;

        // Determine the disabled state for each button
        const playBtnDisabled = isPlaying || isLoading;
        const pauseBtnDisabled = !isPlaying || isLoading;
        const stopBtnDisabled = !isPlaying || isLoading;
        const loopBtnToggled = loopPlayback ? 'toggled' : '';

        const html = `
            <div class="playback-controls">
                <button id="play-btn" ${playBtnDisabled ? 'disabled' : ''}>Play</button>
                <button id="pause-btn" ${pauseBtnDisabled ? 'disabled' : ''}>Pause</button>
                <button id="stop-btn" ${stopBtnDisabled ? 'disabled' : ''}>Stop</button>
                <button id="loop-btn" class="${loopBtnToggled}">Loop</button>
                
                <div class="control-group">
                    <label for="master-volume">Master Volume</label>
                    <input type="range" id="master-volume" min="0" max="1" step="0.01" value="${masterVolume}">
                </div>
            </div>
        `;
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.container.querySelector('#play-btn')?.addEventListener('click', this.handlePlayClick);
        this.container.querySelector('#pause-btn')?.addEventListener('click', this.handlePauseClick);
        this.container.querySelector('#stop-btn')?.addEventListener('click', this.handleStopClick);
        this.container.querySelector('#loop-btn')?.addEventListener('click', this.handleLoopToggle);
        this.container.querySelector('#master-volume')?.addEventListener('input', this.handleVolumeChange);
    }

    // --- Event Handlers ---
    handlePlayClick() { this.callbacks.onPlay?.(); }
    handlePauseClick() { this.callbacks.onPause?.(); }
    handleStopClick() { this.callbacks.onStop?.(); }
    handleVolumeChange(event) {
        this.callbacks.onMasterVolumeChange?.(parseFloat(event.target.value));
    }
    handleLoopToggle(event) {
        const isCurrentlyLooping = event.target.classList.contains('toggled');
        // The callback should signal the *new desired state*, which is the opposite of the current one.
        this.callbacks.onToggleLoop?.(!isCurrentlyLooping);
    }
}