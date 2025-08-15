// file: src/controller/ProjectController.js (Complete, Corrected Version)

import { DataAccessLayer } from '../dal/DataAccessLayer.js';
import JSZip from "https://esm.sh/jszip@3.10.1";

export class ProjectController {
    constructor(dal, audioPlayer, audioScheduler) {
        this.dal = dal;
        this.audioPlayer = audioPlayer;
        this.audioScheduler = audioScheduler;
        this.manifest = null;
    }

    async loadManifest() {
        if (!this.manifest) {
            this.manifest = await this.dal.getManifest();
        }
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
        await this.loadManifest();
        const rhythmData = await this.dal.getRhythm(id);
        
        const patternIds = [...new Set(rhythmData.playback_flow.map(item => item.pattern))];
        const patternPromises = patternIds.map(id => this.dal.getPattern(id));
        const patterns = await Promise.all(patternPromises);

        const instDefPromises = this.manifest.instrument_defs.map(id => this.dal.getInstrumentDef(id));
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
            soundPacks: {},
            instrumentDefsBySymbol: {} // CRITICAL FIX: Create the object the view needs
        };
        
        instrumentDefs.forEach(def => {
            if (def.symbol) {
                resolvedRhythm.instrumentDefsBySymbol[def.symbol] = def;
            }
        });

        patternIds.forEach((id, i) => { resolvedRhythm.patterns[id] = patterns[i]; });
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