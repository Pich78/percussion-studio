// file: src/controller/ProjectController.js (Complete)

import JSZip from "https://esm.sh/jszip@3.10.1";

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

    async loadRhythm(id) {
        const rhythmData = await this.dal.getRhythm(id);
        const patternIds = [...new Set(rhythmData.playback_flow.map(item => item.pattern))];
        const patternPromises = patternIds.map(patternId => this.dal.getPattern(patternId));
        const patterns = await Promise.all(patternPromises);
        
        const instrumentIds = Object.values(rhythmData.instrument_kit);
        const instrumentPromises = instrumentIds.map(instId => this.dal.getInstrument(instId));
        const instruments = await Promise.all(instrumentPromises);

        const soundList = [];
        instruments.forEach((instrument, index) => {
            const instrumentId = instrumentIds[index];
            instrument.sounds.forEach((sound, soundIndex) => {
                soundList.push({
                    id: `${instrumentId}_${soundIndex}`,
                    path: `data/instruments/${instrumentId}/${sound.wav}`
                });
            });
        });
        
        await this.audioPlayer.loadSounds(soundList);
        
        const resolvedRhythm = {
            ...rhythmData,
            patterns: {},
        };
        patternIds.forEach((patternId, index) => {
            resolvedRhythm.patterns[patternId] = patterns[index];
        });

        this.audioScheduler.setRhythm(resolvedRhythm);
        return resolvedRhythm;
    }

    /**
     * Gathers all project data and tells the DAL to export it as a ZIP file.
     * @param {object} projectData The full, resolved project data object.
     * @param {string} filename The name for the exported file (without extension).
     */
    async saveProject(projectData, filename) {
        // 1. Create the slim rhythm data for the .rthm.yaml file
        const rhythmFileContent = {
            global_bpm: projectData.global_bpm,
            instrument_kit: projectData.instrument_kit,
            playback_flow: projectData.playback_flow
        };

        // 2. Gather all patterns used in the project
        const patternsToSave = Object.entries(projectData.patterns).map(([id, data]) => ({ id, data }));

        // 3. Gather all instruments used in the project.
        // This assumes the full instrument data is available in the project state.
        const instrumentsToSave = Object.entries(projectData.instruments || {}).map(([id, data]) => ({ id, data }));

        // 4. Call the DAL to perform the export, injecting the JSZip dependency.
        await this.dal.exportRhythmAsZip(
            rhythmFileContent,
            patternsToSave,
            instrumentsToSave,
            filename,
            JSZip // Inject the real JSZip library
        );
    }
}