// file: src/view/PlaybackControlsView.js (Complete, Refactored Version)

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
        const buttonsDisabled = isLoading;

        // Use CSS classes and the 'hidden' attribute for state changes
        const playBtnHidden = isPlaying;
        const pauseBtnHidden = !isPlaying;
        const loopBtnToggled = loopPlayback ? 'toggled' : '';

        const html = `
            <div class="playback-controls">
                <button id="play-btn" ${buttonsDisabled ? 'disabled' : ''} ${playBtnHidden ? 'hidden' : ''}>Play</button>
                <button id="pause-btn" ${buttonsDisabled ? 'disabled' : ''} ${pauseBtnHidden ? 'hidden' : ''}>Pause</button>
                <button id="stop-btn" ${buttonsDisabled ? 'disabled' : ''}>Stop</button>
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
    handlePlayClick() {
        this.callbacks.onPlay?.();
    }
    handlePauseClick() {
        this.callbacks.onPause?.();
    }
    handleStopClick() {
        this.callbacks.onStop?.();
    }
    handleVolumeChange(event) {
        this.callbacks.onMasterVolumeChange?.(parseFloat(event.target.value));
    }
    handleLoopToggle(event) {
        // Toggle the current state. The new state will be set by the App.
        this.callbacks.onToggleLoop?.(!this.isLooping());
    }
    // Helper to read the current loop state from the DOM
    isLooping() {
        return this.container.querySelector('#loop-btn')?.classList.contains('toggled');
    }
}