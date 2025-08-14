// file: src/audio/AudioPlayer.js (Complete)

export class AudioPlayer {
    constructor(audioContext) {
        this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        this.soundBuffers = new Map();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
    }

    async loadSounds(soundList) {
        const loadPromises = soundList.map(async (sound) => {
            try {
                const response = await fetch(sound.path);
                if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.soundBuffers.set(sound.id, audioBuffer);
            } catch (error) {
                throw new Error(`Failed to fetch sound '${sound.path}': ${error.message}`);
            }
        });
        await Promise.all(loadPromises);
    }

    /**
     * Schedules a specific sound to be played at a precise future time.
     * @param {string} soundId The ID of the sound to play.
     * @param {number} absoluteTime The absolute time from the AudioContext's clock to play the sound.
     */
    playAt(soundId, absoluteTime) {
        // 1. Check if the requested sound has been loaded.
        if (!this.soundBuffers.has(soundId)) {
            console.warn(`AudioPlayer: Attempted to play sound "${soundId}" which is not loaded.`);
            return;
        }

        // 2. Create a new sound source node. This can only be played once.
        const source = this.audioContext.createBufferSource();

        // 3. Assign the decoded audio data to the source's buffer.
        source.buffer = this.soundBuffers.get(soundId);

        // 4. Connect the source to the master volume control.
        source.connect(this.masterGain);

        // 5. Schedule the sound to start playing at the specified absolute time.
        source.start(absoluteTime);
    }

    setMasterVolume(volume) {
        this.masterGain.gain.value = volume;
    }

    getAudioClockTime() {
        return this.audioContext.currentTime;
    }
}