// file: src/controller/ProjectController.js (Complete, Corrected Version)

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
        
        const instrumentIds = [...new Set(Object.values(rhythmData.instrument_kit))];
        const instrumentPromises = instrumentIds.map(instId => this.dal.getInstrument(instId));
        const instruments = await Promise.all(instrumentPromises);

        const soundList = [];
        instruments.forEach((instrumentData, index) => {
            const instrumentId = instrumentIds[index];
            instrumentData.sounds.forEach((sound, soundIndex) => {
                // CRITICAL FIX: The ID for the sound MUST match the instrumentId from the kit.
                // We assume for now the first sound ('o') is the primary sound.
                if (soundIndex === 0) {
                    soundList.push({
                        id: instrumentId,
                        path: `data/instruments/${instrumentId}/${sound.wav}`
                    });
                }
            });
        });
        
        await this.audioPlayer.loadSounds(soundList);
        
        const resolvedRhythm = {
            ...rhythmData,
            patterns: {},
            instruments: {}
        };
        patternIds.forEach((patternId, index) => {
            resolvedRhythm.patterns[patternId] = patterns[index];
        });
        instrumentIds.forEach((instrumentId, index) => {
            resolvedRhythm.instruments[instrumentId] = instruments[index];
        });

        this.audioScheduler.setRhythm(resolvedRhythm);
        return resolvedRhythm;
    }

    async saveProject(projectData, filename) {
        const rhythmFileContent = {
            global_bpm: projectData.global_bpm,
            instrument_kit: projectData.instrument_kit,
            playback_flow: projectData.playback_flow
        };
        const patternsToSave = Object.entries(projectData.patterns).map(([id, data]) => ({ id, data }));
        const instrumentsToSave = Object.entries(projectData.instruments || {}).map(([id, data]) => ({ id, data }));

        await this.dal.exportRhythmAsZip(
            rhythmFileContent,
            patternsToSave,
            instrumentsToSave,
            filename,
            JSZip
        );
    }
}