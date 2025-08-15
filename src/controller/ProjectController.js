// file: src/controller/ProjectController.js (Complete, Corrected Version)

import { DataAccessLayer } from '../dal/DataAccessLayer.js';
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
            sound_kit: {},
            patterns: {
                'untitled_pattern': {
                    metadata: { name: 'Untitled Pattern', resolution: 16, metric: '4/4' },
                    pattern_data: [{}]
                }
            },
            playback_flow: [{ pattern: 'untitled_pattern', repetitions: 1 }],
            instrumentDefs: {},
            soundPacks: {}
        };
    }

    async loadRhythm(id) {
        const rhythmData = await this.dal.getRhythm(id);
        
        const patternIds = [...new Set(rhythmData.playback_flow.map(item => item.pattern))];
        const patternPromises = patternIds.map(id => this.dal.getPattern(id));
        const patterns = await Promise.all(patternPromises);

        // Placeholder for a manifest-driven system.
        const instDefIds = ['drum_kick', 'drum_snare', 'drum_hihat']; 
        const instDefPromises = instDefIds.map(id => this.dal.getInstrumentDef(id));
        const instrumentDefs = await Promise.all(instDefPromises);

        const soundKit = rhythmData.sound_kit;
        const soundPackSymbols = Object.keys(soundKit);
        const soundPackPromises = soundPackSymbols.map(symbol => {
            const packName = soundKit[symbol];
            return this.dal.getSoundPack(symbol, packName);
        });
        const soundPacks = await Promise.all(soundPackPromises);

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
                        id: `${symbol}_${soundDef.letter}`,
                        path: `/percussion-studio/data/sounds/${packName}/${wavFile}`
                    });
                }
            });
        });

        await this.audioPlayer.loadSounds(soundList);
        
        const resolvedRhythm = {
            ...rhythmData,
            patterns: {},
            instrumentDefs: {}, // Changed from `instruments` to match documentation
            soundPacks: {}
        };
        patternIds.forEach((id, i) => { resolvedRhythm.patterns[id] = patterns[i]; });
        
        instrumentDefs.forEach(def => {
            const defId = instDefIds.find(id => def.symbol && id.includes(def.symbol.toLowerCase()));
            if(defId) resolvedRhythm.instrumentDefs[defId] = def;
        });

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