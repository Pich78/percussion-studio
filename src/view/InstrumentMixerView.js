// file: src/view/InstrumentMixerView.js (Complete)

export class InstrumentMixerView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
    }

    render(state) {
        const { instrument_kit, mixer } = state.rhythm;
        if (!instrument_kit || !mixer) {
            this.container.innerHTML = '';
            return;
        }

        let html = '<div class="instrument-mixer">';
        
        // Loop through the kit to maintain a consistent order
        for (const [symbol, instrumentId] of Object.entries(instrument_kit)) {
            const trackState = mixer[instrumentId] || { volume: 1.0, muted: false }; // Default state

            html += `
                <div class="mixer-track" data-instrument-id="${instrumentId}">
                    <label>${symbol}</label>
                    <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="${trackState.volume}">
                    <label for="mute-${instrumentId}">Mute</label>
                    <input type="checkbox" id="mute-${instrumentId}" class="mute-checkbox" ${trackState.muted ? 'checked' : ''}>
                </div>
            `;
        }

        html += '</div>';
        this.container.innerHTML = html;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const tracks = this.container.querySelectorAll('.mixer-track');
        tracks.forEach(track => {
            const instrumentId = track.dataset.instrumentId;

            const volumeSlider = track.querySelector('.volume-slider');
            if (volumeSlider) {
                volumeSlider.addEventListener('input', (event) => {
                    const volume = parseFloat(event.target.value);
                    this.callbacks.onVolumeChange?.(instrumentId, volume);
                });
            }

            const muteCheckbox = track.querySelector('.mute-checkbox');
            if (muteCheckbox) {
                muteCheckbox.addEventListener('change', (event) => {
                    const isMuted = event.target.checked;
                    this.callbacks.onToggleMute?.(instrumentId, isMuted);
                });
            }
        });
    }
}