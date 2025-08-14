// file: src/audio/AudioPlayer.js

export class AudioPlayer {
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
        // Create an array of promises, one for each sound to load.
        const loadPromises = soundList.map(async (sound) => {
            try {
                // 1. Fetch the audio file as a raw binary buffer.
                const response = await fetch(sound.path);
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();

                // 2. Use the Web Audio API to decode the binary data into a playable format.
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                
                // 3. Store the decoded, playable buffer in our Map.
                this.soundBuffers.set(sound.id, audioBuffer);
            } catch (error) {
                // Prepend the error message with more context and re-throw.
                throw new Error(`Failed to fetch sound '${sound.path}': ${error.message}`);
            }
        });

        // Promise.all waits for all the individual load promises to complete.
        // If any one of them fails, Promise.all will reject immediately.
        await Promise.all(loadPromises);
    }

    playAt(soundId, absoluteTime) {
        // Implementation to come...
    }

    setMasterVolume(volume) {
        this.masterGain.gain.value = volume;
    }

    getAudioClockTime() {
        return this.audioContext.currentTime;
    }
}