// file: src/audio/AudioScheduler.js

export class AudioScheduler {
    constructor(audioPlayer, onUpdateCallback, onPlaybackEndedCallback) {
        this.audioPlayer = audioPlayer;
        this.onUpdateCallback = onUpdateCallback || (() => {});
        this.onPlaybackEndedCallback = onPlaybackEndedCallback || (() => {});

        this.rhythm = null;
        this.isPlaying = false;
        
        // Internal state uses the generic term "tick"
        this.currentTick = 0;
        this.totalTicks = 0;
        
        this.nextNoteTime = 0.0;
        this.loop = false;
        this.timerID = null;
        
        // Lookahead scheduling constants
        this.scheduleAheadTime = 0.1; 
        this.lookahead = 25.0; 
    }

    setRhythm(resolvedRhythmData) {
        this.rhythm = resolvedRhythmData;
        
        let totalTicks = 0;
        if (this.rhythm.playback_flow && this.rhythm.patterns) {
            // This will become a flattened list of every single tick in the rhythm.
            this.tickMap = [];

            this.rhythm.playback_flow.forEach(flowItem => {
                const pattern = this.rhythm.patterns[flowItem.pattern];
                if (!pattern) {
                    throw new Error(`Pattern '${flowItem.pattern}' not found in rhythm data.`);
                }
                
                const resolution = pattern.metadata.resolution || 16;
                // Assuming 4/4 time, ticks per measure = resolution.
                // This will need to be updated later if we support other time signatures.
                const ticksPerMeasure = resolution; 
                const measuresInPattern = pattern.pattern_data.length;
                const repetitions = flowItem.repetitions || 1;

                const ticksForThisFlowItem = (measuresInPattern * ticksPerMeasure) * repetitions;
                totalTicks += ticksForThisFlowItem;

                // We can pre-calculate timing info for each tick here later if needed
                // For now, we only need the total count.
            });
        }
        this.totalTicks = totalTicks;

        this.resetPosition();
    }

    play() {
        // Implementation to come...
    }

    pause() {
        // Implementation to come...
    }

    stop() {
        this.pause();
        this.resetPosition();
    }

    resetPosition() {
        this.currentTick = 0;
    }
}