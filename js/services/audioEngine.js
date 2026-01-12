/* 
  js/services/audioEngine.js
  Handles AudioContext, sample loading, and PRECISION playback.
  Uses per-instrument GainNodes for real-time volume control.
  Supports scheduled playback via absolute audio time.
*/

import { StrokeType } from '../types.js';

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        // Cache structure: { 'ITO': { 'O': AudioBuffer, 'S': AudioBuffer, ... }, ... }
        this.buffers = {};
        // Per-instrument GainNodes for real-time volume control
        // Structure: { 'ITO': GainNode, 'OKO': GainNode, ... }
        this.instrumentGains = {};
        // Mute state tracking (separate from gain value for restore)
        this.instrumentMuted = {};
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
     * Get the current audio context time (for precision scheduling)
     * @returns {number} Current time in seconds from audio context
     */
    getCurrentTime() {
        this.init();
        return this.ctx ? this.ctx.currentTime : 0;
    }

    /**
     * Creates or retrieves the GainNode for an instrument
     * @param {string} symbol - Instrument symbol (e.g., 'ITO')
     * @returns {GainNode}
     */
    getInstrumentGain(symbol) {
        if (!this.instrumentGains[symbol]) {
            this.init();
            const gainNode = this.ctx.createGain();
            gainNode.connect(this.masterGain);
            this.instrumentGains[symbol] = gainNode;
            this.instrumentMuted[symbol] = false;
        }
        return this.instrumentGains[symbol];
    }

    /**
     * Sets the volume for a specific instrument (real-time, affects playing sounds)
     * @param {string} symbol - Instrument symbol
     * @param {number} volume - 0.0 to 1.0
     */
    setInstrumentVolume(symbol, volume) {
        const gainNode = this.getInstrumentGain(symbol);
        // Use setValueAtTime for immediate, glitch-free change
        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    }

    /**
     * Mutes/unmutes an instrument (real-time)
     * @param {string} symbol - Instrument symbol
     * @param {boolean} muted - true to mute
     */
    setInstrumentMuted(symbol, muted) {
        this.instrumentMuted[symbol] = muted;
        // Note: We don't change the gain here - the mute state is checked at play time
        // This allows the original volume to be preserved
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

        // Ensure instrument has a GainNode
        this.getInstrumentGain(symbol);

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
     * @param {AudioBuffer} buffer
     * @param {number} time - Absolute audio context time
     * @param {string} symbol - Instrument symbol for routing through instrument gain
     * @param {number} volume - Track-level volume multiplier
     * @param {number} cutRatio - Fraction of buffer to play
     */
    playShortenedSound(buffer, time, symbol, volume = 1.0, cutRatio = 0.08) {
        const playTime = Math.max(time, this.ctx.currentTime);

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        // Per-note gain for track volume
        const noteGain = this.ctx.createGain();
        noteGain.gain.value = volume;

        // Route: Source -> NoteGain -> InstrumentGain -> MasterGain
        const instrumentGain = this.getInstrumentGain(symbol);
        source.connect(noteGain);
        noteGain.connect(instrumentGain);

        source.start(playTime);
        source.stop(playTime + (buffer.duration * cutRatio));
    }

    /**
     * Play multiple sounds layered together
     * @param {AudioBuffer[]} buffers
     * @param {number} time - Absolute audio context time
     * @param {string} symbol - Instrument symbol
     * @param {number} volume - Track-level volume
     */
    playLayeredSounds(buffers, time, symbol, volume = 1.0) {
        const playTime = Math.max(time, this.ctx.currentTime);
        const instrumentGain = this.getInstrumentGain(symbol);

        buffers.forEach(buffer => {
            if (!buffer) return;

            const source = this.ctx.createBufferSource();
            source.buffer = buffer;

            const noteGain = this.ctx.createGain();
            noteGain.gain.value = volume;

            source.connect(noteGain);
            noteGain.connect(instrumentGain);

            source.start(playTime);
        });
    }

    /**
     * Emulate missing Batá drum sounds using available samples
     * @param {string} instrumentSymbol
     * @param {string} stroke
     * @param {number} time - Absolute audio context time
     * @param {number} volume
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
                    this.playLayeredSounds([slapBuffer, openBuffer], time, instrumentSymbol, volume);
                }
                break;

            case 'P': // Presionado = Shortened Open
                if (openBuffer) {
                    this.playShortenedSound(openBuffer, time, instrumentSymbol, volume, 0.08);
                }
                break;

            case 'H': // Half Mordito = Slap + Presionado
                if (slapBuffer) {
                    if (presionadoBuffer) {
                        this.playLayeredSounds([slapBuffer, presionadoBuffer], time, instrumentSymbol, volume);
                    } else if (openBuffer) {
                        // Play slap normally
                        const playTime = Math.max(time, this.ctx.currentTime);
                        const source = this.ctx.createBufferSource();
                        source.buffer = slapBuffer;
                        const noteGain = this.ctx.createGain();
                        noteGain.gain.value = volume;
                        const instrumentGain = this.getInstrumentGain(instrumentSymbol);
                        source.connect(noteGain);
                        noteGain.connect(instrumentGain);
                        source.start(playTime);

                        // Play shortened open
                        this.playShortenedSound(openBuffer, time, instrumentSymbol, volume, 0.08);
                    }
                }
                break;
        }
    }

    /**
     * Plays a specific stroke for an instrument at a SCHEDULED TIME.
     * This is the primary method for precision playback.
     * 
     * @param {string} instrumentSymbol - e.g. 'ITO'
     * @param {string} stroke - The stroke letter (e.g. 'O', 'S')
     * @param {number} time - Absolute AudioContext time to play (use getCurrentTime() for "now")
     * @param {number} volume - 0.0 to 1.0 (track-level volume)
     */
    playStroke(instrumentSymbol, stroke, time = 0, volume = 1.0) {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        // Check mute state
        if (this.instrumentMuted[instrumentSymbol]) return;

        // Normalize stroke (handle Rest and Case)
        if (!stroke || stroke === StrokeType.None || stroke === '.' || stroke === ' ') return;
        const strokeKey = stroke.toUpperCase();

        // Check if instrument and sample exist
        const instBuffers = this.buffers[instrumentSymbol];
        if (!instBuffers) {
            return;
        }

        const buffer = instBuffers[strokeKey];
        if (!buffer) {
            // Try emulation for Batá drums
            if (this.isBataDrum(instrumentSymbol)) {
                this.emulateStroke(instrumentSymbol, strokeKey, time, volume);
                return;
            }
            return;
        }

        // Use provided time, or "now" as fallback
        // For scheduled playback, time should be > currentTime
        const playTime = time > 0 ? Math.max(time, this.ctx.currentTime) : this.ctx.currentTime;

        // Create Source
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        // Per-note gain for track-level volume
        const noteGain = this.ctx.createGain();
        noteGain.gain.value = volume;

        // Route through instrument gain for real-time global volume control
        const instrumentGain = this.getInstrumentGain(instrumentSymbol);
        source.connect(noteGain);
        noteGain.connect(instrumentGain);

        source.start(playTime);
    }

    /**
     * Convenience method: Play a stroke immediately (for UI preview clicks)
     */
    playStrokeNow(instrumentSymbol, stroke, volume = 1.0) {
        this.playStroke(instrumentSymbol, stroke, this.getCurrentTime(), volume);
    }
}

export const audioEngine = new AudioEngine();