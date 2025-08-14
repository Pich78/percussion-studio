// file: src/controller/PlaybackController.js

/**
 * Handles user intent related to playback, acting as a bridge between the
 * UI and the audio engine.
 */
export class PlaybackController {
    /**
     * @param {AudioScheduler} audioScheduler The application's audio scheduler.
     * @param {AudioPlayer} audioPlayer The application's audio player.
     */
    constructor(audioScheduler, audioPlayer) {
        this.audioScheduler = audioScheduler;
        this.audioPlayer = audioPlayer;
    }

    /** Initiates playback via the scheduler. */
    play() {
        this.audioScheduler.play();
    }

    /** Pauses playback via the scheduler. */
    pause() {
        this.audioScheduler.pause();
    }

    /** Stops playback and resets the position via the scheduler. */
    stop() {
        this.audioScheduler.stop();
    }

    /**
     * Sets the looping behavior on the scheduler.
     * @param {boolean} isEnabled
     */
    toggleLoop(isEnabled) {
        this.audioScheduler.loop = isEnabled;
    }

    /**
     * Changes the global volume via the audio player.
     * @param {number} volume
     */
    setMasterVolume(volume) {
        this.audioPlayer.setMasterVolume(volume);
    }

    // Note: toggleMetronome and setInstrumentVolume are more complex
    // and will be implemented later as they affect the rhythm data itself.
}