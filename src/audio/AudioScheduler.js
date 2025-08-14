export class AudioScheduler {
    constructor(audioPlayer, onUpdateCallback, onPlaybackEndedCallback) {
        this.audioPlayer = audioPlayer;
        this.onUpdateCallback = onUpdateCallback || (() => {});
        this.onPlaybackEndedCallback = onPlaybackEndedCallback || (() => {});

        this.rhythm = null;
        this.isPlaying = false;
        
        this.currentTick = 0;
        this.totalTicks = 0;
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

        if (!this.rhythm.playback_flow || !this.rhythm.patterns) {
            this.totalTicks = 0;
            return;
        }
        
        this.rhythm.playback_flow.forEach(flowItem => {
            const pattern = this.rhythm.patterns[flowItem.pattern];
            if (!pattern) throw new Error(`Pattern '${flowItem.pattern}' not found in rhythm data.`);
            
            const repetitions = flowItem.repetitions || 1;
            for (let r = 0; r < repetitions; r++) {
                pattern.pattern_data.forEach(measure => {
                    this.tickMap.push({ pattern, measure });
                });
            }
        });
        
        const firstPattern = this.rhythm.patterns[this.rhythm.playback_flow[0].pattern];
        const resolution = firstPattern.metadata.resolution || 16;
        this.totalTicks = this.tickMap.length * resolution;

        this.resetPosition();
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        // Start the clock from the current time
        this.nextNoteTime = this.audioPlayer.getAudioClockTime();
        // Start the scheduling loop
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

    // The main scheduling loop
    scheduler() {
        // While there are notes that need to be scheduled in the immediate future...
        while (this.nextNoteTime < this.audioPlayer.getAudioClockTime() + this.scheduleAheadTime) {
            this.scheduleTick();
            this.advanceTick();
        }
        // Re-queue the scheduler to run again shortly.
        if (this.isPlaying) {
            this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
        }
    }

    // Schedules the notes for the current tick
    scheduleTick() {
        const ticksPerMeasure = this.tickMap[Math.floor(this.currentTick / 16)]?.pattern.metadata.resolution || 16;
        const measureIndex = Math.floor(this.currentTick / ticksPerMeasure);
        const tickInMeasure = this.currentTick % ticksPerMeasure;

        if (measureIndex >= this.tickMap.length) return;

        const currentMapEntry = this.tickMap[measureIndex];
        const measureData = currentMapEntry.measure;
        
        for (const instrumentSymbol in measureData) {
            const noteString = measureData[instrumentSymbol].replace(/\|/g, '');
            if (noteString[tickInMeasure] && noteString[tickInMeasure] !== '-') {
                const soundId = this.rhythm.instrument_kit[instrumentSymbol];
                if (soundId) {
                    this.audioPlayer.playAt(soundId, this.nextNoteTime);
                }
            }
        }
    }

    // Moves the scheduler to the next tick
    advanceTick() {
        const bpm = this.rhythm.global_bpm || 120;
        const currentPattern = this.tickMap[Math.floor(this.currentTick / 16)]?.pattern;
        const resolution = currentPattern?.metadata.resolution || 16;
        const secondsPerBeat = 60.0 / bpm;
        const secondsPerTick = secondsPerBeat / (resolution / 4.0);
        
        this.nextNoteTime += secondsPerTick;
        this.currentTick++;

        // Handle end of playback
        if (this.currentTick >= this.totalTicks) {
            if (this.loop) {
                this.currentTick = 0;
            } else {
                this.onPlaybackEndedCallback();
                this.stop();
            }
        }
        
        // This callback is for the UI to update its playback indicator
        const ticksPerBeat = resolution / 4.0;
        if (this.currentTick % ticksPerBeat === 0) {
           this.onUpdateCallback(this.currentTick / ticksPerBeat);
        }
    }
}