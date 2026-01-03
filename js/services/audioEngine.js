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
            this.masterGain.gain.value = 0.8;

            // Check if this is iOS
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

            if (isIOS && this.ctx.createMediaStreamDestination) {
                // iOS: Route Web Audio through an HTML5 audio element for proper speaker output
                console.log('🍎 iOS detected: routing Web Audio through HTML5 audio element');
                this.setupiOSAudioRouting();
            } else {
                // Non-iOS: Connect directly to destination
                this.masterGain.connect(this.ctx.destination);
            }
        }
    }

    /**
     * Sets up iOS audio routing by connecting Web Audio API to an HTML5 audio element.
     * HTML5 audio elements on iOS use the "playback" audio session category, 
     * which properly routes to speakers (unlike Web Audio's default "ambient" category).
     */
    setupiOSAudioRouting() {
        // Create a MediaStreamDestination - this captures Web Audio output as a stream
        this.mediaStreamDest = this.ctx.createMediaStreamDestination();
        this.masterGain.connect(this.mediaStreamDest);

        // Create an HTML5 audio element and feed it the stream
        this.iosAudioBridge = document.createElement('audio');
        this.iosAudioBridge.setAttribute('playsinline', 'true');
        this.iosAudioBridge.setAttribute('webkit-playsinline', 'true');
        this.iosAudioBridge.srcObject = this.mediaStreamDest.stream;

        // Set up the unlock handler for first user interaction
        const startAudioBridge = async () => {
            try {
                if (this.ctx.state === 'suspended') {
                    await this.ctx.resume();
                }
                await this.iosAudioBridge.play();
                console.log('🔊 iOS audio bridge started - speaker output enabled!');

                // Remove listeners after successful start
                document.removeEventListener('touchstart', startAudioBridge, true);
                document.removeEventListener('touchend', startAudioBridge, true);
                document.removeEventListener('click', startAudioBridge, true);
            } catch (err) {
                console.warn('iOS audio bridge start failed, will retry:', err.message);
            }
        };

        // Listen for first user interaction to start the audio bridge
        document.addEventListener('touchstart', startAudioBridge, true);
        document.addEventListener('touchend', startAudioBridge, true);
        document.addEventListener('click', startAudioBridge, true);
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