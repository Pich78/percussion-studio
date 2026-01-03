/* 
  js/services/audioEngine.js
  Handles AudioContext, sample loading, and playback.
  Replaces synthesis with sample-based playback from loaded Sound Packs.
*/

import { StrokeType } from '../types.js';

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        // Cache structure: { 'ITO': { 'O': AudioBuffer, 'S': AudioBuffer, ... }, 'OKO': { ... } }
        this.buffers = {};
    }

    init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = 0.8;
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Loads audio samples for a specific instrument based on a Sound Pack config.
     * @param {string} symbol - The instrument symbol (e.g., 'ITO')
     * @param {object} soundConfig - The parsed YAML object from dataLoader (contains .files and ._basePath)
     */
    async loadSoundPack(symbol, soundConfig) {
        this.init();
        if (!this.buffers[symbol]) {
            this.buffers[symbol] = {};
        }

        const promises = Object.entries(soundConfig.files).map(async ([letter, filename]) => {
            // Normalize letter to uppercase for consistency
            const strokeKey = letter.toUpperCase();
            const url = `${soundConfig._basePath}${filename}`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

                this.buffers[symbol][strokeKey] = audioBuffer;
            } catch (error) {
                console.error(`Failed to load sample for ${symbol} [${strokeKey}]: ${url}`, error);
            }
        });

        await Promise.all(promises);
        console.log(`🔊 Loaded samples for ${symbol}`);
    }

    /**
     * Check if an instrument is a Batá drum
     */
    isBataDrum(instrumentSymbol) {
        return ['IYA', 'ITO', 'OKO'].includes(instrumentSymbol);
    }

    /**
     * Play a sound with shortened duration (for Presionado emulation)
     */
    playShortenedSound(buffer, time, volume, cutRatio = 0.08) {
        const playTime = Math.max(time, this.ctx.currentTime);

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.ctx.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        source.start(playTime);
        // Cut the sound short
        source.stop(playTime + (buffer.duration * cutRatio));
    }

    /**
     * Play multiple sounds layered together
     */
    playLayeredSounds(buffers, time, volume) {
        const playTime = Math.max(time, this.ctx.currentTime);

        buffers.forEach(buffer => {
            if (!buffer) return;

            const source = this.ctx.createBufferSource();
            source.buffer = buffer;

            const gainNode = this.ctx.createGain();
            gainNode.gain.value = volume;

            source.connect(gainNode);
            gainNode.connect(this.masterGain);

            source.start(playTime);
        });
    }

    /**
     * Emulate missing Batá drum sounds using available samples
     */
    emulateStroke(instrumentSymbol, stroke, time, volume) {
        const instBuffers = this.buffers[instrumentSymbol];
        if (!instBuffers) return;

        const openBuffer = instBuffers['O'];
        const slapBuffer = instBuffers['S'];
        const presionadoBuffer = instBuffers['P'];

        switch (stroke) {
            case 'R': // Mordito = Slap + Open
                if (slapBuffer && openBuffer) {
                    console.log(`[Emulation] ${instrumentSymbol} Mordito: Slap + Open`);
                    this.playLayeredSounds([slapBuffer, openBuffer], time, volume);
                }
                break;

            case 'P': // Presionado = Shortened Open
                if (openBuffer) {
                    console.log(`[Emulation] ${instrumentSymbol} Presionado: Shortened Open`);
                    this.playShortenedSound(openBuffer, time, volume, 0.08);
                }
                break;

            case 'H': // Half Mordito = Slap + Presionado (or Slap + Shortened Open)
                if (slapBuffer) {
                    if (presionadoBuffer) {
                        console.log(`[Emulation] ${instrumentSymbol} Half Mordito: Slap + Presionado`);
                        this.playLayeredSounds([slapBuffer, presionadoBuffer], time, volume);
                    } else if (openBuffer) {
                        console.log(`[Emulation] ${instrumentSymbol} Half Mordito: Slap + Shortened Open`);
                        // Play slap normally
                        const playTime = Math.max(time, this.ctx.currentTime);
                        const slapSource = this.ctx.createBufferSource();
                        slapSource.buffer = slapBuffer;
                        const slapGain = this.ctx.createGain();
                        slapGain.gain.value = volume;
                        slapSource.connect(slapGain);
                        slapGain.connect(this.masterGain);
                        slapSource.start(playTime);

                        // Play shortened open
                        this.playShortenedSound(openBuffer, time, volume, 0.08);
                    }
                }
                break;
        }
    }

    /**
     * Plays a specific stroke for an instrument.
     * @param {string} instrumentSymbol - e.g. 'ITO'
     * @param {string} stroke - The stroke letter (e.g. 'O', 'S', or StrokeType enum value)
     * @param {number} time - AudioContext time to play
     * @param {number} volume - 0.0 to 1.0
     */
    playStroke(instrumentSymbol, stroke, time = 0, volume = 1.0) {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        // Normalize stroke (handle Rest and Case)
        if (!stroke || stroke === StrokeType.None || stroke === '.' || stroke === ' ') return;
        const strokeKey = stroke.toUpperCase();

        // Check if instrument and sample exist
        const instBuffers = this.buffers[instrumentSymbol];
        if (!instBuffers) {
            // console.warn(`No buffers loaded for instrument: ${instrumentSymbol}`);
            return;
        }

        const buffer = instBuffers[strokeKey];
        if (!buffer) {
            // Try emulation for Batá drums
            if (this.isBataDrum(instrumentSymbol)) {
                this.emulateStroke(instrumentSymbol, strokeKey, time, volume);
                return;
            }
            // console.warn(`No sample found for ${instrumentSymbol} stroke: ${strokeKey}`);
            return;
        }

        // Safety check for invalid time
        const playTime = Math.max(time, this.ctx.currentTime);

        // Create Source
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        // Individual Gain (Volume)
        const gainNode = this.ctx.createGain();
        gainNode.gain.value = volume;

        // Graph: Source -> Gain -> Master
        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        source.start(playTime);
    }
}

export const audioEngine = new AudioEngine();