// file: src/audio/AudioScheduler.js (Complete, with setBPM)

export class AudioScheduler {
    constructor(audioPlayer, onUpdateCallback, onPlaybackEndedCallback) {
        this.audioPlayer = audioPlayer;
        this.onUpdateCallback = onUpdateCallback || (() => {});
        this.onPlaybackEndedCallback = onPlaybackEndedCallback || (() => {});

        this.rhythm = null;
        this.isPlaying = false;
        this.bpm = 120; // Default BPM

        this.currentTick = 0;
        this.tickMap = [];

        this.nextNoteTime = 0.0;
        this.loop = false;
        this.timerID = null;

        this.scheduleAheadTime = 0.1;
        this.lookahead = 25.0;
    }

    /**
     * Updates the playback tempo.
     * @param {number} newBPM The new tempo in beats per minute.
     */
    setBPM(newBPM) {
        this.bpm = newBPM;
        // If a rhythm is loaded, we need to rebuild the tick map with new timing info.
        if (this.rhythm) {
            this.setRhythm(this.rhythm);
        }
    }

    setRhythm(resolvedRhythm) {
        this.rhythm = resolvedRhythm;
        this.tickMap = [];

        if (!this.rhythm?.playback_flow?.length || !this.rhythm.patterns) {
            this.resetPosition();
            return;
        }

        // Use the rhythm's BPM if present, otherwise use the current BPM.
        this.bpm = this.rhythm.global_bpm || this.bpm;
        const secondsPerBeat = 60.0 / this.bpm;

        this.rhythm.playback_flow.forEach(flowItem => {
            const pattern = this.rhythm.patterns[flowItem.pattern];
            if (!pattern || !pattern.pattern_data) return;

            const repetitions = flowItem.repetitions || 1;
            for (let r = 0; r < repetitions; r++) {
                pattern.pattern_data.forEach(measureData => {
                    const resolution = pattern.metadata.resolution || 16;
                    const ticksPerBeat = resolution / 4.0;
                    const secondsPerTick = secondsPerBeat / ticksPerBeat;
                    
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

        this.onUpdateCallback(tickData.tickInMeasure);
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