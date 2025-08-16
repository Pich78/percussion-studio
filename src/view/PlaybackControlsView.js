// file: src/view/PlaybackControlsView.js (Modified with new range)

const getTime = () => new Date().toISOString();

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
        this.handleBPMChange = this.handleBPMChange.bind(this);
    }

    render(state) {
        const { isPlaying, isLoading, masterVolume, loopPlayback, globalBPM } = state;
        console.log(`[${getTime()}][PlaybackControlsView][render][BPM] Rendering controls. Received globalBPM: ${globalBPM}. Full state props:`, state);


        const buttonsDisabled = isLoading;
        const playBtnDisabled = isPlaying || isLoading;
        const pauseBtnDisabled = !isPlaying || isLoading;
        const stopBtnDisabled = !isPlaying || isLoading;
        const bpmSliderDisabled = isPlaying || isLoading;
        const loopBtnToggled = loopPlayback ? 'toggled' : '';

        const html = `
            <div class="playback-controls">
                <!-- Button Group -->
                <div class="button-group">
                    <button id="play-btn" ${playBtnDisabled ? 'disabled' : ''}>Play</button>
                    <button id="pause-btn" ${pauseBtnDisabled ? 'disabled' : ''}>Pause</button>
                    <button id="stop-btn" ${stopBtnDisabled ? 'disabled' : ''}>Stop</button>
                    <button id="loop-btn" class="${loopBtnToggled}">Loop</button>
                </div>
                
                <!-- Slider Group -->
                <div class.slider-group">
                    <div class="control-group">
                        <label for="bpm-slider">BPM: <span id="bpm-value">${globalBPM}</span></label>
                        <!-- --- MODIFICATION START --- -->
                        <input type="range" id="bpm-slider" min="20" max="200" step="1" value="${globalBPM}" ${bpmSliderDisabled ? 'disabled' : ''}>
                        <!-- --- MODIFICATION END --- -->
                    </div>
                    
                    <div class="control-group">
                        <label for="master-volume">Master Volume</label>
                        <input type="range" id="master-volume" min="0" max="1" step="0.01" value="${masterVolume}">
                    </div>
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
        this.container.querySelector('#bpm-slider')?.addEventListener('input', this.handleBPMChange);
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
        this.callbacks.onToggleLoop?.(!isCurrentlyLooping);
    }
    handleBPMChange(event) {
        const newBPM = parseInt(event.target.value, 10);
        console.log(`[${getTime()}][PlaybackControlsView][handleBPMChange][BPM] Slider value changed. New value: ${newBPM}. Firing onBPMChange callback.`);
        // Update the numeric display in real-time
        this.container.querySelector('#bpm-value').textContent = newBPM;
        this.callbacks.onBPMChange?.(newBPM);
    }
}