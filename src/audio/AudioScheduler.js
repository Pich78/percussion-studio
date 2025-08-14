// file: src/audio/AudioScheduler.js (Complete)

export class AudioScheduler {
    constructor(audioPlayer, onUpdateCallback, onPlaybackEndedCallback) {
        this.audioPlayer = audioPlayer;
        this.onUpdateCallback = onUpdateCallback || (() => {});
        this.onPlaybackEndedCallback = onPlaybackEndedCallback || (() => {});

        this.rhythm = null;
        this.isPlaying = false;

        this.currentTick = 0;
        this.tickMap = [];

        this.nextNoteTime = 0.0;
        this.loop = false;
        this.timerID = null;

        this.scheduleAheadTime = 0.1;
        this.lookahead = 25.0;
    }

    setRhythm(resolvedRhythmData) {
        this.rhythm = resolvedRhythmData;
        this.tickMap = [];

        if (!this.rhythm?.playback_flow?.length || !this.rhythm.patterns) {
            this.resetPosition();
            return;
        }

        const bpm = this.rhythm.global_bpm || 120;
        const secondsPerBeat = 60.0 / bpm;

        this.rhythm.playback_flow.forEach(flowItem => {
            const pattern = this.rhythm.patterns[flowItem.pattern];
            if (!pattern) throw new Error(`Pattern '${flowItem.pattern}' not found in rhythm data.`);

            const repetitions = flowItem.repetitions || 1;
            for (let r = 0; r < repetitions; r++) {
                pattern.pattern_data.forEach(measureData => {
                    const resolution = pattern.metadata.resolution || 16;
                    const ticksPerBeat = resolution / 4.0;
                    const secondsPerTick = secondsPerBeat / ticksPerBeat;
                    const isBeat = (tick) => (tick % ticksPerBeat) === 0;

                    for (let t = 0; t < resolution; t++) {
                        const instrumentsToPlay = [];
                        for (const instrumentSymbol in measureData) {
                            const noteString = measureData[instrumentSymbol].replace(/\|/g, '');
                            if (noteString[t] && noteString[t] !== '-') {
                                const soundId = this.rhythm.instrument_kit[instrumentSymbol];
                                if (soundId) {
                                    instrumentsToPlay.push(soundId);
                                }
                            }
                        }
                        this.tickMap.push({ instrumentsToPlay, secondsPerTick, isBeat: isBeat(t) });
                    }
                });
            }
        });
        
        this.resetPosition();
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

        if (tickData.isBeat) {
            const totalBeats = this.tickMap.filter(t => t.isBeat).length;
            const currentBeatNumber = this.tickMap.slice(0, this.currentTick + 1).filter(t => t.isBeat).length;
            this.onUpdateCallback(currentBeatNumber);
        }

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