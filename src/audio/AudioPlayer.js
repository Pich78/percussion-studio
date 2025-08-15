// file: src/audio/AudioPlayer.js (Complete, with Individual Volume)

export class AudioPlayer {
    constructor(audioContext) {
        this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        
        this.soundBuffers = new Map();
        this.soundGains = new Map(); // NEW: To store a GainNode for each sound

        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
    }

    async loadSounds(soundList) {
        const loadPromises = soundList.map(async (sound) => {
            try {
                const response = await fetch(sound.path);
                if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                
                this.soundBuffers.set(sound.id, audioBuffer);

                // NEW: Create a dedicated GainNode for this sound
                const gainNode = this.audioContext.createGain();
                gainNode.connect(this.masterGain); // Connect individual gain to master gain
                this.soundGains.set(sound.id, gainNode);

            } catch (error) {
                throw new Error(`Failed to fetch sound '${sound.path}': ${error.message}`);
            }
        });
        await Promise.all(loadPromises);
    }

    /**
     * Sets the volume for a specific, individual sound.
     * @param {string} soundId The ID of the sound (e.g., 'KCK_o').
     * @param {number} volume The new volume (0-1).
     */
    setSoundVolume(soundId, volume) {
        if (this.soundGains.has(soundId)) {
            this.soundGains.get(soundId).gain.value = volume;
        }
    }

    playAt(soundId, absoluteTime) {
        if (!this.soundBuffers.has(soundId) || !this.soundGains.has(soundId)) {
            console.warn(`AudioPlayer: Attempted to play sound "${soundId}" which is not loaded.`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = this.soundBuffers.get(soundId);
        
        // CRITICAL CHANGE: Connect the source to its dedicated GainNode, not the master.
        const soundGainNode = this.soundGains.get(soundId);
        source.connect(soundGainNode);

        source.start(absoluteTime);
    }

    setMasterVolume(volume) {
        this.masterGain.gain.value = volume;
    }



    getAudioClockTime() {
        return this.audioContext.currentTime;
    }
}