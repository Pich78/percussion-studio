// file: src/controller/ProjectController.js

export class ProjectController {
    constructor(dal, audioPlayer, audioScheduler) {
        this.dal = dal;
        this.audioPlayer = audioPlayer;
        this.audioScheduler = audioScheduler;
    }

    createNewRhythm() {
        return {
            global_bpm: 120,
            instrument_kit: {},
            patterns: { 'untitled_pattern': { metadata: { name: 'Untitled Pattern', resolution: 16, metric: '4/4' }, pattern_data: [{}] }},
            playback_flow: [{ pattern: 'untitled_pattern', repetitions: 1 }]
        };
    }

    /**
     * Orchestrates the entire process of loading, resolving, and preparing a rhythm.
     * @param {string} id The ID of the rhythm to load.
     * @returns {Promise<object>} A promise that resolves to the fully resolved rhythm object.
     */
    async loadRhythm(id) {
        // 1. Fetch the root rhythm file
        const rhythmData = await this.dal.getRhythm(id);
        
        // 2. Fetch all unique patterns specified in the playback_flow
        const patternIds = [...new Set(rhythmData.playback_flow.map(item => item.pattern))];
        const patternPromises = patternIds.map(patternId => this.dal.getPattern(patternId));
        const patterns = await Promise.all(patternPromises);
        
        // 3. Fetch all unique instruments specified in the kit
        const instrumentIds = Object.values(rhythmData.instrument_kit);
        const instrumentPromises = instrumentIds.map(instId => this.dal.getInstrument(instId));
        const instruments = await Promise.all(instrumentPromises);

        // 4. Collect all sound files that need to be loaded
        const soundList = [];
        instruments.forEach((instrument, index) => {
            const instrumentId = instrumentIds[index];
            instrument.sounds.forEach((sound, soundIndex) => {
                soundList.push({
                    // Create a unique ID for the sound, e.g., 'acoustic_kick_0'
                    id: `${instrumentId}_${soundIndex}`,
                    // Construct the full path to the sound file
                    path: `data/instruments/${instrumentId}/${sound.wav}`
                });
            });
        });
        
        // 5. Tell the AudioPlayer to load the sounds
        await this.audioPlayer.loadSounds(soundList);
        
        // 6. Assemble the final, "resolved" rhythm object
        const resolvedRhythm = {
            ...rhythmData,
            patterns: {},
        };
        patternIds.forEach((patternId, index) => {
            resolvedRhythm.patterns[patternId] = patterns[index];
        });

        // 7. Pass the fully loaded and resolved data to the scheduler
        this.audioScheduler.setRhythm(resolvedRhythm);

        // Return the resolved data for the app state
        return resolvedRhythm;
    }

    async saveProject(rhythmData, filename) {
        // Implementation to come...
    }
}