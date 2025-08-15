// file: src/controller/ProjectController.js (Complete, Final Refactored Version)

import { DataAccessLayer } from '../dal/DataAccessLayer.js';
import JSZip from "https://esm.sh/jszip@3.10.1";

export class ProjectController {
    constructor(dal, audioPlayer, audioScheduler) {
        this.dal = dal;
        this.audioPlayer = audioPlayer;
        this.audioScheduler = audioScheduler;
    }

    /**
     * Creates a new, blank project state that conforms to the new data architecture.
     */
    createNewRhythm() {
        return {
            global_bpm: 120,
            sound_kit: {}, // Starts with an empty sound kit
            patterns: {
                'untitled_pattern': {
                    metadata: { name: 'Untitled Pattern', resolution: 16, metric: '4/4' },
                    pattern_data: [{}] // Starts with one empty measure
                }
            },
            playback_flow: [{ pattern: 'untitled_pattern', repetitions: 1 }],
            // The resolved instrument data will be populated here during runtime
            instrumentDefs: {},
            soundPacks: {}
        };
    }

    /**
     * Orchestrates the entire process of loading, dynamically resolving dependencies,
     * and preparing a rhythm for playback.
     */
    async loadRhythm(id) {
        const rhythmData = await this.dal.getRhythm(id);
        
        // Fetch all patterns
        const patternIds = [...new Set(rhythmData.playback_flow.map(item => item.pattern))];
        const patternPromises = patternIds.map(id => this.dal.getPattern(id));
        const patterns = await Promise.all(patternPromises);

        // Fetch all instrument definitions. In a real app, this would use the manifest.
        // For now, we hardcode the ones we know we need for our test data.
        const instDefIds = ['drum_kick', 'drum_snare', 'drum_hihat']; 
        const instDefPromises = instDefIds.map(id => this.dal.getInstrumentDef(id));
        const instrumentDefs = await Promise.all(instDefPromises);

        // Fetch the specific sound packs required by this rhythm's sound_kit
        const soundKit = rhythmData.sound_kit;
        const soundPackSymbols = Object.keys(soundKit);
        const soundPackPromises = soundPackSymbols.map(symbol => {
            const packName = soundKit[symbol];
            return this.dal.getSoundPack(symbol, packName);
        });
        const soundPacks = await Promise.all(soundPackPromises);

        // Collect all sound files that need to be loaded by the AudioPlayer
        const soundList = [];
        soundPacks.forEach((pack, index) => {
            const symbol = soundPackSymbols[index];
            const packName = soundKit[symbol];
            const instDef = instrumentDefs.find(def => def.symbol === symbol);
            if (!instDef) return;

            instDef.sounds.forEach(soundDef => {
                const wavFile = pack.sound_files[soundDef.letter];
                if (wavFile) {
                    soundList.push({
                        id: `${symbol}_${soundDef.letter}`, // e.g., KCK_o
                        path: `/percussion-studio/data/sounds/${packName}/${wavFile}`
                    });
                }
            });
        });

        await this.audioPlayer.loadSounds(soundList);
        
        // Assemble the final, "resolved" rhythm object for the application state
        const resolvedRhythm = {
            ...rhythmData,
            patterns: {},
            instrumentDefs: {},
            soundPacks: {}
        };
        patternIds.forEach((id, i) => { resolvedRhythm.patterns[id] = patterns[i]; });
        instDefIds.forEach((id, i) => { resolvedRhythm.instrumentDefs[id] = instrumentDefs[i]; });
        soundPackSymbols.forEach((symbol, i) => {
            const packName = soundKit[symbol];
            resolvedRhythm.soundPacks[`${symbol}.${packName}`] = soundPacks[i];
        });

        this.audioScheduler.setRhythm(resolvedRhythm);
        return resolvedRhythm;
    }

    async saveProject(projectData, filename) {
        const rhythmFileContent = {
            global_bpm: projectData.global_bpm,
            sound_kit: projectData.sound_kit,
            playback_flow: projectData.playback_flow
        };
        const patternsToSave = Object.entries(projectData.patterns).map(([id, data]) => ({ id, data }));

        await this.dal.exportRhythmAsZip(rhythmFileContent, patternsToSave, filename, JSZip);
    }
}