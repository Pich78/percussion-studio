// file: src/audio/AudioScheduler.js (Corrected with Proper Timing Logic and Logging)

const getTime = () => new Date().toISOString();

export class AudioScheduler {
    constructor(audioPlayer, onUpdateCallback, onPlaybackEndedCallback) {
        this.audioPlayer = audioPlayer;
        this.onUpdateCallback = onUpdateCallback || (() => {});
        this.onPlaybackEndedCallback = onPlaybackEndedCallback || (() => {});

        this.rhythm = null;
        this.isPlaying = false;
        this.bpm = 120;

        this.currentTick = 0;
        this.tickMap = [];

        this.nextNoteTime = 0.0;
        this.loop = false;
        this.timerID = null;

        this.scheduleAheadTime = 0.1;
        this.lookahead = 25.0;
    }

    setBPM(newBPM) {
        console.log(`[${getTime()}][AudioScheduler][setBPM][BPM] Received new BPM value: ${newBPM}.`);
        this.bpm = newBPM;
        if (this.rhythm) {
            console.log(`[${getTime()}][AudioScheduler][setBPM][BPM] Rhythm is loaded, rebuilding tick map to apply new BPM.`);
            this.rebuildTickMap();
        }
    }

    setRhythm(resolvedRhythm) {
        this.rhythm = resolvedRhythm;
        this.bpm = this.rhythm.global_bpm || this.bpm;
        console.log(`[${getTime()}][AudioScheduler][setRhythm][BPM] Setting initial BPM from loaded rhythm file: ${this.bpm}.`);
        this.rebuildTickMap();
        this.resetPosition();
    }

    rebuildTickMap() {
        this.tickMap = [];
        if (!this.rhythm?.playback_flow?.length || !this.rhythm.patterns) {
            return;
        }
        console.log(`[${getTime()}][AudioScheduler][rebuildTickMap][BPM] Rebuilding tick map using current BPM: ${this.bpm}.`);

        const secondsPerBeat = 60.0 / this.bpm;

        this.rhythm.playback_flow.forEach(flowItem => {
            const pattern = this.rhythm.patterns[flowItem.pattern];
            if (!pattern || !pattern.pattern_data) return;

            const repetitions = flowItem.repetitions || 1;
            for (let r = 0; r < repetitions; r++) {
                pattern.pattern_data.forEach(measureData => {
                    const resolution = pattern.metadata.resolution || 16;
                    
                    // --- TIMING CALCULATION FIX ---
                    const metric = pattern.metadata.metric || '4/4';
                    const beatsPerMeasure = parseInt(metric.split('/')[0], 10) || 4;
                    const secondsPerMeasure = secondsPerBeat * beatsPerMeasure;
                    const secondsPerTick = secondsPerMeasure / resolution;
                    // --- END OF FIX ---
                    
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
                        this.tickMap.push({ instrumentsToPlay, secondsPerTick, tickInMeasure: t });
                    }
                });
            }
        });
        console.log(`[${getTime()}][AudioScheduler][rebuildTickMap][BPM] Tick map rebuild complete. Total ticks: ${this.tickMap.length}. Calculated secondsPerTick: ${this.tickMap[0]?.secondsPerTick || 'N/A'}`);
    }

    play() {
        if (this.isPlaying || this.tickMap.length === 0) return;
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

        const resolution = this.rhythm.patterns[this.rhythm.playback_flow[0].pattern].metadata.resolution;
        const currentMeasure = Math.floor(this.currentTick / resolution);
        
        this.onUpdateCallback(tickData.tickInMeasure, currentMeasure);
        this.nextNoteTime += tickData.secondsPerTick;
        this.currentTick++;

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