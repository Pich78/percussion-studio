// file: src/audio/AudioScheduler.js
console.log('AudioScheduler.js loaded');
const getTime = () => new Date().toISOString();

class AudioScheduler {
    constructor(audioPlayer) {
        this.audioPlayer = audioPlayer;

        this.onUpdateCallback = () => { };
        this.onPlaybackEndedCallback = () => { };

        this.rhythm = null;
        this.isPlaying = false;
        this.bpm = 120;

        this.currentTick = 0;
        this.tickMap = [];
        this.nextNoteTime = 0.0;
        this.loop = true;
        this.timerID = null;

        this.scheduleAheadTime = 0.1;
        this.lookahead = 25.0;
    }

    setBPM(newBPM) {
        // OPTIMIZATION: We no longer rebuild the map here.
        // We just update the value. The next 'advanceTick' will 
        // automatically use this new speed.
        this.bpm = newBPM;
    }

    setRhythm(resolvedRhythm) {
        this.rhythm = resolvedRhythm;
        // Only set BPM from rhythm if we haven't set one manually, 
        // or strictly reset it on load.
        this.bpm = this.rhythm.global_bpm || this.bpm;

        this.rebuildTickMap();
        this.resetPosition();
    }

    rebuildTickMap() {
        this.tickMap = [];
        if (!this.rhythm?.playback_flow?.length || !this.rhythm.patterns) {
            return;
        }

        // We no longer calculate 'secondsPerTick' here because that depends on BPM.
        // Instead, we calculate 'beatMultiplier' (how many beats does one tick represent?)

        this.rhythm.playback_flow.forEach(flowItem => {
            const pattern = this.rhythm.patterns[flowItem.pattern];
            if (!pattern || !pattern.pattern_data) return;

            const repetitions = flowItem.repetitions || 1;

            for (let r = 0; r < repetitions; r++) {
                pattern.pattern_data.forEach(measureData => {
                    const resolution = pattern.metadata.resolution || 16;
                    const metric = pattern.metadata.metric || '4/4';

                    // Simple logic: BPM is based on quarter notes (denominator 4).
                    const beatsPerMeasure = parseInt(metric.split('/')[0], 10) || 4;

                    // Calculate the mathematical fraction of a beat this tick represents.
                    // Example: 4/4 time, resolution 16. 
                    // beatsPerMeasure (4) / resolution (16) = 0.25 beats per tick.
                    const beatMultiplier = beatsPerMeasure / resolution;

                    for (let t = 0; t < resolution; t++) {
                        const instrumentsToPlay = [];

                        for (const instrumentSymbol in measureData) {
                            if (Object.prototype.hasOwnProperty.call(this.rhythm.sound_kit, instrumentSymbol)) {
                                const noteString = measureData[instrumentSymbol].replace(/\|/g, '');
                                const noteChar = noteString[t];
                                if (noteChar && noteChar !== '-') {
                                    const soundId = `${instrumentSymbol}_${noteChar}`;
                                    instrumentsToPlay.push(soundId);
                                }
                            }
                        }

                        this.tickMap.push({
                            instrumentsToPlay,
                            beatMultiplier, // STORE RATIO, NOT SECONDS
                            tickInMeasure: t
                        });
                    }
                });
            }
        });

        console.log(`[AudioScheduler] Map built. Total ticks: ${this.tickMap.length}`);
    }

    play() {
        if (this.isPlaying || this.tickMap.length === 0) return;

        // Resume AudioContext if needed (browser policy)
        if (this.audioPlayer.audioContext.state === 'suspended') {
            this.audioPlayer.audioContext.resume();
        }

        this.isPlaying = true;
        this.nextNoteTime = this.audioPlayer.getAudioClockTime();
        this.scheduler();
    }

    pause() {
        this.isPlaying = false;
        clearTimeout(this.timerID);
        this.timerID = null;
    }

    stop() {
        this.pause();
        this.resetPosition();
    }

    resetPosition() {
        this.currentTick = 0;
    }

    scheduler() {
        // While there are notes that will need to play before the next interval
        while (this.nextNoteTime < this.audioPlayer.getAudioClockTime() + this.scheduleAheadTime) {
            this.scheduleTick();
            this.advanceTick();
        }

        if (this.isPlaying) {
            this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
        }
    }

    scheduleTick() {
        const tickData = this.tickMap[this.currentTick];
        if (!tickData) return;

        tickData.instrumentsToPlay.forEach(soundId => {
            this.audioPlayer.playAt(soundId, this.nextNoteTime);
        });
    }

    advanceTick() {
        if (this.currentTick >= this.tickMap.length) return;

        const tickData = this.tickMap[this.currentTick];

        // --- REAL-TIME CALCULATION ---
        // Calculate the duration of this specific tick based on the CURRENT BPM.
        // This allows smooth accelerando/ritardando.
        const secondsPerBeat = 60.0 / this.bpm;
        const secondsPerTick = secondsPerBeat * tickData.beatMultiplier;

        // UI Callback
        const resolution = 16; // Simplified for demo
        const currentMeasure = Math.floor(this.currentTick / resolution);
        this.onUpdateCallback(tickData.tickInMeasure, currentMeasure);

        // Advance time
        this.nextNoteTime += secondsPerTick;
        this.currentTick++;

        // Loop Logic
        if (this.currentTick >= this.tickMap.length) {
            if (this.loop) {
                this.currentTick = 0;
            } else {
                this.onPlaybackEndedCallback();
                this.stop();
            }
        }
    }
}

window.AudioScheduler = AudioScheduler;