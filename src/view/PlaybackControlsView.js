// file: src/view/PlaybackControlsView.js (Complete)

export class PlaybackControlsView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.handlePlayPauseClick = this.handlePlayPauseClick.bind(this);
        this.handleStopClick = this.handleStopClick.bind(this);
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
        this.handleLoopToggle = this.handleLoopToggle.bind(this);
    }

    render(state) {
        const { isPlaying, isLoading, masterVolume, loopPlayback } = state;
        const playPauseText = isPlaying ? 'Pause' : 'Play';
        const playButtonDisabled = isLoading;
        const stopButtonDisabled = isLoading;

        const html = `
            <div class="playback-controls">
                <button id="play-pause-btn" ${playButtonDisabled ? 'disabled' : ''}>${playPauseText}</button>
                <button id="stop-btn" ${stopButtonDisabled ? 'disabled' : ''}>Stop</button>
                <div class="control-group">
                    <label for="master-volume">Master Volume:</label>
                    <input type="range" id="master-volume" min="0" max="1" step="0.01" value="${masterVolume}">
                </div>
                <div class="control-group">
                    <label for="loop-checkbox">Loop:</label>
                    <input type="checkbox" id="loop-checkbox" ${loopPlayback ? 'checked' : ''}>
                </div>
            </div>
        `;
        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.container.querySelector('#play-pause-btn')?.addEventListener('click', this.handlePlayPauseClick);
        this.container.querySelector('#stop-btn')?.addEventListener('click', this.handleStopClick);
        this.container.querySelector('#master-volume')?.addEventListener('input', this.handleVolumeChange);
        this.container.querySelector('#loop-checkbox')?.addEventListener('change', this.handleLoopToggle);
    }

    handlePlayPauseClick() {
        const playPauseBtn = this.container.querySelector('#play-pause-btn');
        if (playPauseBtn?.textContent === 'Play') {
            this.callbacks.onPlay?.();
        } else {
            this.callbacks.onPause?.();
        }
    }

    handleStopClick() {
        this.callbacks.onStop?.();
    }

    handleVolumeChange(event) {
        const volume = parseFloat(event.target.value);
        this.callbacks.onMasterVolumeChange?.(volume);
    }

    handleLoopToggle(event) {
        const isEnabled = event.target.checked;
        this.callbacks.onToggleLoop?.(isEnabled);
    }
}