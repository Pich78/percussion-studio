// file: src/view/InstrumentMixerView.js (Complete, Corrected Version)

export class InstrumentMixerView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
    }

    render(state) {
        // CRITICAL FIX: If rhythm or its properties don't exist, render nothing.
        const { rhythm } = state;
        if (!rhythm || !rhythm.instrument_kit || !rhythm.mixer) {
            this.container.innerHTML = '';
            return;
        }

        const { instrument_kit, mixer } = rhythm;
        let html = '<div class="instrument-mixer">';
        
        for (const [symbol, instrumentId] of Object.entries(instrument_kit)) {
            const trackState = mixer[instrumentId] || { volume: 1.0, muted: false };
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
        this.container.querySelectorAll('.mixer-track').forEach(track => {
            const instrumentId = track.dataset.instrumentId;
            track.querySelector('.volume-slider')?.addEventListener('input', (event) => {
                this.callbacks.onVolumeChange?.(instrumentId, parseFloat(event.target.value));
            });
            track.querySelector('.mute-checkbox')?.addEventListener('change', (event) => {
                this.callbacks.onToggleMute?.(instrumentId, event.target.checked);
            });
        });
    }
}