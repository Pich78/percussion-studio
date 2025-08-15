// file: src/view/InstrumentMixerView.js
// This view component manages the UI for the instrument mixer,
// allowing users to control the volume and mute state of each instrument.

export class InstrumentMixerView {
    /**
     * @param {HTMLElement} container - The DOM element to render the mixer view into.
     * @param {object} callbacks - An object containing callback functions for user interactions.
     * @param {function(string, number)} [callbacks.onVolumeChange] - Called when a volume slider is adjusted.
     * @param {function(string, boolean)} [callbacks.onToggleMute] - Called when a mute checkbox is toggled.
     */
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        // Use event delegation on the container for better performance,
        // as this single listener can handle events from all child elements.
        this.container.addEventListener('input', this.handleInput.bind(this));
        this.container.addEventListener('change', this.handleChange.bind(this));
    }

    /**
     * Renders the instrument mixer based on the current application state.
     * @param {object} state - The application state object.
     * @param {object} state.rhythm - The current rhythm object.
     * @param {object} state.rhythm.sound_kit - A map of symbols to instrument IDs.
     * @param {object} state.rhythm.mixer - A map of instrument IDs to their mixer state (volume, muted).
     */
    render(state) {
        const { rhythm } = state;
        
        // CRITICAL FIX: The data is expected to be under 'sound_kit' and 'mixer'.
        // This check prevents errors if the state object is not fully populated.
        if (!rhythm || !rhythm.sound_kit || !rhythm.mixer) {
            this.container.innerHTML = '';
            return;
        }

        const { sound_kit, mixer } = rhythm;
        let html = '<div class="instrument-mixer">';
        
        // Iterate over the instruments in the sound kit to build the UI for each track.
        for (const [symbol, instrumentId] of Object.entries(sound_kit)) {
            // Get the current state for the specific instrument, defaulting if not found.
            const trackState = mixer[instrumentId] || { volume: 1.0, muted: false };
            
            // Sanitize the ID to ensure it's a valid HTML ID for the mute checkbox.
            const muteId = `mute-${instrumentId.replace(/[^a-zA-Z0-9]/g, '-')}`; 
            
            html += `
                <div class="mixer-track" data-instrument-id="${instrumentId}">
                    <label title="${instrumentId}">${symbol}</label>
                    <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="${trackState.volume}" title="Volume">
                    <input type="checkbox" id="${muteId}" class="mute-checkbox" ${trackState.muted ? 'checked' : ''} title="Mute">
                    <label for="${muteId}" class="mute-label">M</label>
                </div>
            `;
        }

        html += '</div>';
        this.container.innerHTML = html;
    }

    // --- Delegated Event Handlers ---

    /**
     * Handles the 'input' event, typically for continuous changes like a slider.
     * @param {Event} event - The DOM event.
     */
    handleInput(event) {
        if (event.target.classList.contains('volume-slider')) {
            const trackElement = event.target.closest('.mixer-track');
            if (trackElement) {
                const instrumentId = trackElement.dataset.instrumentId;
                const newVolume = parseFloat(event.target.value);
                // Call the provided callback function if it exists.
                this.callbacks.onVolumeChange?.(instrumentId, newVolume);
            }
        }
    }

    /**
     * Handles the 'change' event, typically for discrete changes like a checkbox toggle.
     * @param {Event} event - The DOM event.
     */
    handleChange(event) {
        if (event.target.classList.contains('mute-checkbox')) {
            const trackElement = event.target.closest('.mixer-track');
            if (trackElement) {
                const instrumentId = trackElement.dataset.instrumentId;
                const isMuted = event.target.checked;
                // Call the provided callback function if it exists.
                this.callbacks.onToggleMute?.(instrumentId, isMuted);
            }
        }
    }
}
