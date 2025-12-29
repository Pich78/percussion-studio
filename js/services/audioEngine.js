import { InstrumentName, StrokeType } from '../types.js';

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
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

    playStroke(instrument, stroke, time = 0, volume = 1.0) {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        // Safety check for invalid time
        const playTime = Math.max(time, this.ctx.currentTime);

        if (stroke === StrokeType.None) return;

        // --- INSTRUMENT BASE FREQUENCIES ---
        // Approximate pitches for synthesis
        let baseFreq = 200;
        let type = 'drum'; // 'drum' | 'wood' | 'metal' | 'shaker'

        switch (instrument) {
            case InstrumentName.Iya: baseFreq = 100; break;
            case InstrumentName.Itotele: baseFreq = 160; break;
            case InstrumentName.Okonkolo: baseFreq = 260; break;

            case InstrumentName.Tumbadora: baseFreq = 130; break;
            case InstrumentName.Conga: baseFreq = 190; break;
            case InstrumentName.Quinto: baseFreq = 280; break;

            case InstrumentName.Bongo: baseFreq = 350; break;
            case InstrumentName.Timbales: baseFreq = 300; type = 'metal'; break;

            case InstrumentName.Clave: baseFreq = 2200; type = 'wood'; break;
            case InstrumentName.Cata: baseFreq = 800; type = 'wood'; break;

            case InstrumentName.Cowbell: baseFreq = 600; type = 'metal'; break;
            case InstrumentName.Agogo: baseFreq = 900; type = 'metal'; break;

            case InstrumentName.Shaker:
            case InstrumentName.Maraca:
                type = 'shaker';
                break;
        }

        // --- SYNTHESIS LOGIC ---

        if (type === 'shaker') {
            this.playNoise(0.05, playTime, volume * 0.7);
            return;
        }

        if (type === 'wood') {
            // Clave sound: Sharp sine with quick decay
            this.playTone(baseFreq, 0.1, 'sine', playTime, volume);
            return;
        }

        if (type === 'metal') {
            if (instrument === InstrumentName.Cowbell || instrument === InstrumentName.Agogo) {
                // Metallic: Square/Triangle mix
                this.playTone(baseFreq, 0.3, 'square', playTime, volume * 0.4);
                this.playTone(baseFreq * 1.5, 0.2, 'triangle', playTime, volume * 0.3);
            } else {
                // Timbales (shell or head)
                if (stroke === StrokeType.Slap || stroke === StrokeType.Open) {
                    this.playTone(baseFreq, 0.15, 'triangle', playTime, volume);
                    this.playNoise(0.05, playTime, volume * 0.3);
                } else {
                    // Shell sound (Touch/Muff)
                    this.playTone(baseFreq * 2, 0.05, 'square', playTime, volume * 0.5);
                }
            }
            return;
        }

        // DRUMS (Congas, Bata, Bongo)
        switch (stroke) {
            case StrokeType.Open:
                this.playTone(baseFreq, 0.4, 'sine', playTime, volume);
                this.playTone(baseFreq * 1.5, 0.2, 'triangle', playTime, volume * 0.5); // overtone
                break;
            case StrokeType.Bass:
                if (instrument === InstrumentName.Iya || instrument === InstrumentName.Tumbadora) {
                    this.playTone(60, 0.6, 'sine', playTime, volume); // Deep bass
                } else {
                    this.playTone(baseFreq * 0.8, 0.5, 'sine', playTime, volume);
                }
                break;
            case StrokeType.Slap:
                this.playNoise(0.08, playTime, volume * 0.8);
                this.playTone(baseFreq * 2.8, 0.1, 'square', playTime, volume * 0.6);
                break;
            case StrokeType.Muff:
                this.playTone(baseFreq, 0.05, 'triangle', playTime, volume); // Very short
                break;
            case StrokeType.Touch:
                this.playNoise(0.02, playTime, volume * 0.4); // Tiny click
                break;
        }
    }

    playTone(freq, duration, type, startTime, volume) {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        // Envelope
        gain.gain.setValueAtTime(0.5 * volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
    }

    playNoise(duration, startTime, volume) {
        if (!this.ctx || !this.masterGain) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        // Bandpass filter to make it sound more like a skin hit
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;

        // Scale amplitude by volume
        gain.gain.setValueAtTime(0.5 * volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(startTime);
    }
}

export const audioEngine = new AudioEngine();