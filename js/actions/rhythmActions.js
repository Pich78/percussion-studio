/*
  js/actions/rhythmActions.js
  Actions for loading and creating rhythms.
*/

import { state, commit } from '../store.js';
import { stopPlayback } from '../services/sequencer.js';
import { audioEngine } from '../services/audioEngine.js';
import { dataLoader } from '../services/dataLoader.js';
import {
    buildRuntimeSections,
    buildToqueState
} from '../utils/rhythmTransformers.js';
import { getExplorerRhythmMeta } from '../store/stateSelectors.js';
import { updateActiveSection } from './sectionActions.js';

/**
 * Load all instruments for a rhythm in parallel
 * @param {object} trackConfig - Sound kit configuration
 */
const loadInstrumentsInParallel = async (trackConfig) => {
    const loadPromises = Object.entries(trackConfig).map(async ([trackKey, config]) => {
        // A. Load Instrument Definition (for UI names/icons)
        let instDef = state.instrumentDefinitions[config.instrument];
        if (!instDef) {
            console.log(`[LoadRhythm] Loading instrument definition for '${config.instrument}'`);
            instDef = await dataLoader.loadInstrumentDefinition(config.instrument);
            console.log(`[LoadRhythm] Loaded definition for '${config.instrument}':`, instDef);
            console.log(`[LoadRhythm] Available sounds for '${config.instrument}':`, instDef?.sounds?.map(s => s.letter).join(', '));
            commit('setInstrumentDefinition', { symbol: config.instrument, definition: instDef });
        } else {
            console.log(`[LoadRhythm] Using cached definition for '${config.instrument}'`);
        }

        // B. Load Audio Samples
        const soundConfig = await dataLoader.loadSoundPackConfig(config.pack, config.instrument);
        if (soundConfig) {
            await audioEngine.loadSoundPack(config.instrument, soundConfig);
        }
    });

    await Promise.all(loadPromises);
};

/**
 * Loads a rhythm from the manifest ID
 * @param {string} rhythmId - The rhythm ID from manifest
 */
export const loadRhythm = async (rhythmId) => {
    stopPlayback();
    commit('resetMix');

    try {
        // 1. Fetch Rhythm YAML
        const rhythmDef = await dataLoader.loadRhythmDefinition(rhythmId);
        if (!rhythmDef) return;

        console.log(`Loading Rhythm: ${rhythmDef.name}`);

        // 2. Pre-load Instruments and Audio Kits IN PARALLEL
        await loadInstrumentsInParallel(rhythmDef.sound_kit);

        // 3. Build Runtime Sections
        const sections = buildRuntimeSections(rhythmDef);

        // 4. Check for additional metadata from Bata Explorer
        const explorerMeta = getExplorerRhythmMeta(state, rhythmId);

        // 5. Update State via commit
        commit('setToque', { toque: buildToqueState(rhythmId, rhythmDef, sections, explorerMeta) });
        commit('setRhythmSource', { source: 'repo', rhythmId });

        updateActiveSection(sections[0].id);

    } catch (e) {
        console.error("Error loading rhythm:", e);
        alert("Failed to load rhythm. Check console.");
    }
};

/**
 * Loads a rhythm from a local file (using browser File API)
 * Uses the same buildToqueState path as loadRhythm (Pattern I fix)
 * @param {File} file - The File object from file input
 */
export const loadRhythmFromFile = async (file) => {
    stopPlayback();
    commit('resetMix');

    try {
        // 1. Read file content
        const content = await file.text();

        // 2. Parse YAML
        const rhythmDef = jsyaml.load(content);
        if (!rhythmDef) {
            throw new Error("Could not parse rhythm file");
        }

        console.log(`Loading Rhythm from file: ${rhythmDef.name}`);

        // 3. Pre-load Instruments and Audio Kits IN PARALLEL
        await loadInstrumentsInParallel(rhythmDef.sound_kit);

        // 4. Build Runtime Sections
        const sections = buildRuntimeSections(rhythmDef);

        // 5. Update State — uses buildToqueState() like loadRhythm (Pattern I fix)
        const localId = `local/${crypto.randomUUID()}`;
        commit('setToque', { toque: buildToqueState(localId, rhythmDef, sections) });
        commit('setRhythmSource', { source: 'local' });

        updateActiveSection(sections[0].id);

    } catch (e) {
        console.error("Error loading rhythm from file:", e);
        alert("Failed to load rhythm file. Check console for details.");
    }
};

/**
 * Creates a new blank rhythm
 */
export const createNewRhythm = () => {
    stopPlayback();
    const newId = crypto.randomUUID();

    commit('resetMix');

    commit('setToque', {
        toque: {
            id: crypto.randomUUID(),
            name: "New Rhythm",
            globalBpm: 120,
            sections: [{
                id: newId,
                name: "Section 1",
                steps: 16,
                subdivision: 4,
                repetitions: 1,
                measures: [{
                    id: crypto.randomUUID(),
                    tracks: []
                }]
            }]
        }
    });

    commit('setRhythmSource', { source: 'new' });
    updateActiveSection(newId);
};
