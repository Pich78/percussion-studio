// file: src/view/PlaybackControlsView.js

export class PlaybackControlsView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {}; // Ensure callbacks is an object
        // Bind 'this' for event handlers to ensure they can access this.callbacks
        this.handlePlayPauseClick = this.handlePlayPauseClick.bind(this);
        this.handleStopClick = this.handleStopClick.bind(this);
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
        this.handleLoopToggle = this.handleLoopToggle.bind(this);
    }

    render(state) {
        const { isPlaying, isLoading, masterVolume, loopPlayback } = state;

        // Determine button text and disabled state
        const playPauseText = isPlaying ? 'Pause' : 'Play';
        const playButtonDisabled = isLoading;
        const stopButtonDisabled = isLoading;

        const html = `
            <div class="playback-controls">
                <button id="play-pause-btn" ${playButtonDisabled ? 'disabled' : ''}>${playPauseText}</button>
                <button id="stop-btn" ${stopButtonDisabled ? 'disabled' : ''}>Stop</button>
                
                <div class="control-group">
                    <label for="master-volume">Master Volume</label>
                    <input type="range" id="master-volume" min="0" max="1" step="0.01" value="${masterVolume}">
                </div>

                <div class="control-group">
                    <label for="loop-checkbox">Loop</label>
                    <input type="checkbox" id="loop-checkbox" ${loopPlayback ? 'checked' : ''}>
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        // After rendering, attach event listeners
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Use querySelector on the container to avoid conflicts with other parts of the page
        const playPauseBtn = this.container.querySelector('#play-pause-btn');
        if (playPauseBtn) playPauseBtn.addEventListener('click', this.handlePlayPauseClick);

        const stopBtn = this.container.querySelector('#stop-btn');
        if (stopBtn) stopBtn.addEventListener('click', this.handleStopClick);
        
        const volumeSlider = this.container.querySelector('#master-volume');
        if (volumeSlider) volumeSlider.addEventListener('input', this.handleVolumeChange);

        const loopCheckbox = this.container.querySelector('#loop-checkbox');
        if (loopCheckbox) loopCheckbox.addEventListener('change', this.handleLoopToggle);
    }

    // --- Event Handlers ---

    handlePlayPauseClick() {
        // This logic is based on the button's text, which reflects the *current* state.
        const playPauseBtn = this.container.querySelector('#play-pause-btn');
        if (!playPauseBtn) return;

        if (playPauseBtn.textContent === 'Play') {
            this.callbacks.onPlay?.();
        } else {
            this.callbacks.onPause?.();
        }
    }

    handleStopClick() {
        this.callbacks.onStop?.();
    }

    handleVolumeChange(event) {
        // Convert the string value from the slider to a number
        const volume = parseFloat(event.target.value);
        this.callbacks.onMasterVolumeChange?.(volume);
    }

    handleLoopToggle(event) {
        const isEnabled = event.target.checked;
        this.callbacks.onToggleLoop?.(isEnabled);
    }
}