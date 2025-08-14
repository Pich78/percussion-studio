// file: src/audio/AudioScheduler.js

export class AudioScheduler {
    constructor(audioPlayer, onUpdateCallback, onPlaybackEndedCallback) {
        this.audioPlayer = audioPlayer;
        this.onUpdateCallback = onUpdateCallback || (() => {});
        this.onPlaybackEndedCallback = onPlaybackEndedCallback || (() => {});

        this.rhythm = null;
        this.isPlaying = false;
        
        this.current16thNote = 0;
        this.nextNoteTime = 0.0;
        this.loop = false;
        this.timerID = null;
        
        // Timing constants
        this.secondsPer16thNote = 0.0;
        this.total16thNotes = 0;
        this.scheduleAheadTime = 0.1; 
        this.lookahead = 25.0; 
    }

    /**
     * Provides the full, concrete rhythm data to be played. It calculates and
     * caches timing information needed for playback.
     * @param {object} resolvedRhythmData The parsed rhythm object.
     */
    setRhythm(resolvedRhythmData) {
        this.rhythm = resolvedRhythmData;
        
        // --- Calculate timing constants ---
        const beatsPerMinute = this.rhythm.global_bpm || 120;
        const secondsPerBeat = 60.0 / beatsPerMinute;
        // For now, we assume 16th note resolution (4 subdivisions per beat)
        this.secondsPer16thNote = secondsPerBeat / 4.0;

        // --- Calculate total length ---
        let totalNotes = 0;
        if (this.rhythm.playback_flow && this.rhythm.patterns) {
            this.rhythm.playback_flow.forEach(flowItem => {
                const pattern = this.rhythm.patterns[flowItem.pattern];
                if (pattern && pattern.pattern_data) {
                    // Assuming 16 steps per measure
                    const notesPerMeasure = 16;
                    const measuresInPattern = pattern.pattern_data.length;
                    const repetitions = flowItem.repetitions || 1;
                    totalNotes += (measuresInPattern * notesPerMeasure) * repetitions;
                }
            });
        }
        this.total16thNotes = totalNotes;

        // Reset playback position
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
        this.current16thNote = 0;
    }
}