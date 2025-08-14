// file: src/audio/AudioPlayer.js

/**
 * The low-level facade for the Web Audio API. It handles loading sounds
 * and scheduling them to be played at a precise time.
 */
export class AudioPlayer {
    /**
     * @param {AudioContext} [audioContext] Optional AudioContext for testing.
     */
    constructor(audioContext) {
        this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        this.soundBuffers = new Map();

        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
    }

    /**
     * Asynchronously loads and decodes audio files.
     * @param {Array<{id: string, path: string}>} soundList An array of objects with sound IDs and their paths.
     * @returns {Promise<void>} A promise that resolves when all sounds are loaded.
     */
    async loadSounds(soundList) {
        // Implementation to come...
    }

    /**
     * Schedules a specific sound to be played at a precise future time.
     * @param {string} soundId The ID of the sound to play.
     * @param {number} absoluteTime The absolute time from the AudioContext's clock to play the sound.
     */
    playAt(soundId, absoluteTime) {
        // Implementation to come...
    }

    /**
     * Adjusts the master gain node, affecting all audio output.
     * @param {number} volume A value from 0 (silent) to 1 (full volume).
     */
    setMasterVolume(volume) {
        // This is the line that makes the test pass.
        // `gain.value` is the property on a GainNode that controls its volume.
        this.masterGain.gain.value = volume;
    }

    /**
     * Returns the current, high-precision time of the AudioContext.
     * @returns {number} The current time in seconds.
     */
    getAudioClockTime() {
        return this.audioContext.currentTime;
    }
}