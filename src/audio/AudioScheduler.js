// file: src/audio/AudioScheduler.js (Complete, Final Corrected Version)

export class AudioScheduler {
    constructor(audioPlayer, onUpdateCallback, onPlaybackEndedCallback) {
        this.audioPlayer = audioPlayer;
        this.onUpdateCallback = onUpdateCallback || (() => {});
        this.onPlaybackEndedCallback = onPlaybackEndedCallback || (() => {});

        this.rhythm = null;
        this.isPlaying = false;

        this.currentTick = 0;
        this.currentBeat = 0;
        this.tickMap = [];

        this.nextNoteTime = 0.0;
        this.loop = false;
        this.timerID = null;

        this.scheduleAheadTime = 0.1;
        this.lookahead = 25.0;
    }

    setRhythm(resolvedRhythm) {
        this.rhythm = resolvedRhythm;
        this.tickMap = [];

        if (!this.rhythm?.playback_flow?.length || !this.rhythm.patterns) {
            this.resetPosition();
            return;
        }

        const bpm = this.rhythm.global_bpm || 120;
        const secondsPerBeat = 60.0 / bpm;

        // CRITICAL FIX: This loop now correctly handles repetitions and measures.
        this.rhythm.playback_flow.forEach(flowItem => {
            const pattern = this.rhythm.patterns[flowItem.pattern];
            if (!pattern || !pattern.pattern_data) return;

            const repetitions = flowItem.repetitions || 1;
            for (let r = 0; r < repetitions; r++) {
                // Loop through each measure in the pattern_data array
                pattern.pattern_data.forEach(measureData => {
                    const resolution = pattern.metadata.resolution || 16;
                    const ticksPerBeat = resolution / 4.0;
                    const secondsPerTick = secondsPerBeat / ticksPerBeat;
                    const isBeat = (tick) => (tick % ticksPerBeat) === 0;

                    for (let t = 0; t < resolution; t++) {
                        const instrumentsToPlay = [];
                        // Iterate over the instruments in the sound_kit that are present in this measure
                        for (const instrumentSymbol in measureData) {
                            if (Object.prototype.hasOwnProperty.call(this.rhythm.sound_kit, instrumentSymbol)) {
                                const noteString = measureData[instrumentSymbol].replace(/\|/g, '');
                                const noteChar = noteString[t];
                                if (noteChar && noteChar !== '-') {
                                    // Construct the sound ID, e.g., "KCK_o"
                                    const soundId = `${instrumentSymbol}_${noteChar}`;
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
        this.currentBeat = 0;
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
            this.currentBeat++;
            this.onUpdateCallback(this.currentBeat);
        }

        this.nextNoteTime += tickData.secondsPerTick;
        this.currentTick++;

        if (this.currentTick >= this.tickMap.length) {
            if (this.loop) {
                this.currentTick = 0;
                this.currentBeat = 0;
            } else {
                this.onPlaybackEndedCallback();
                this.stop();
            }
        }
    }
}