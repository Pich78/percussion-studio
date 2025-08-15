// file: src/controller/PlaybackController.js (Complete, with Instrument Volume)

export class PlaybackController {
    constructor(audioScheduler, audioPlayer) {
        this.audioScheduler = audioScheduler;
        this.audioPlayer = audioPlayer;
        this.appState = null; // Will be given the state by the App
    }
    
    // The App will use this method to provide the controller with the current state
    setStateProvider(stateProvider) {
        this.appState = stateProvider;
    }

    play() { this.audioScheduler.play(); }
    pause() { this.audioScheduler.pause(); }
    stop() { this.audioScheduler.stop(); }
    toggleLoop(isEnabled) { this.audioScheduler.loop = isEnabled; }
    setMasterVolume(volume) { this.audioPlayer.setMasterVolume(volume); }

    /**
     * Changes the volume for all sounds associated with a given instrument.
     * @param {string} instrumentId The ID of the instrument (e.g., 'test_kick').
     * @param {number} volume The new volume level (0-1).
     */
    setInstrumentVolume(instrumentId, volume) {
        if (!this.appState?.rhythm) return;

        const { instrumentDefsBySymbol, sound_kit } = this.appState.rhythm;
        
        // Find the symbol (e.g., 'KCK') that maps to this instrumentId
        const symbol = Object.keys(sound_kit).find(key => sound_kit[key] === instrumentId);
        if (!symbol) return;
        
        // Find the definition for this instrument to know its sound letters (e.g., 'o', 'p')
        const instDef = instrumentDefsBySymbol[symbol];
        if (!instDef) return;

        // For each sound this instrument can make, tell the AudioPlayer to change its volume
        instDef.sounds.forEach(sound => {
            const soundId = `${symbol}_${sound.letter}`; // e.g., 'KCK_o'
            this.audioPlayer.setSoundVolume(soundId, volume);
        });
    }

    /**
     * Toggles the mute state for an instrument.
     * @param {string} instrumentId The ID of the instrument.
     * @param {boolean} isMuted The new mute state.
     */
    toggleInstrumentMute(instrumentId, isMuted) {
        const newVolume = isMuted ? 0 : this.appState.rhythm.mixer[instrumentId].volume;
        this.setInstrumentVolume(instrumentId, newVolume);
    }
}