/*
  js/actions/trackActions.js
  Actions for track operations (add, update, stroke handling).
*/

import { state } from '../store.js';
import { refreshGrid } from '../ui/renderer.js';
import { audioEngine } from '../services/audioEngine.js';
import { dataLoader } from '../services/dataLoader.js';
import { StrokeType } from '../types.js';
import { getActiveSection, getInstrumentDefinition, getMixSettings } from '../store/stateSelectors.js';
import { isValidStroke } from '../utils/patternParser.js';

/**
 * Handle updating a stroke at a specific position
 * @param {number} trackIdx - Track index
 * @param {number} stepIdx - Step index
 * @param {number} measureIdx - Measure index (default 0)
 */
export const handleUpdateStroke = (trackIdx, stepIdx, measureIdx = 0) => {
    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
    const measure = section.measures[measureIdx];
    const track = measure.tracks[trackIdx];
    const nextStroke = track.strokes[stepIdx] === state.selectedStroke ? StrokeType.None : state.selectedStroke;

    // Dynamic Validation against Loaded Instrument Definition
    if (nextStroke !== StrokeType.None) {
        console.log(`[Action] Validating stroke '${nextStroke}' for instrument '${track.instrument}'`);
        console.log(`[Action] Track pack: '${track.pack}'`);

        const instDef = state.instrumentDefinitions[track.instrument];
        if (instDef) {
            console.log(`[Action] Found instrument definition for '${track.instrument}'`);
            console.log(`[Action] Definition has ${instDef.sounds?.length || 0} sounds defined`);
            console.log(`[Action] Checking each sound:`);
            instDef.sounds?.forEach((s, idx) => {
                const matches = s.letter.toUpperCase() === nextStroke.toUpperCase();
                console.log(`  [${idx}] letter='${s.letter}' (uppercase='${s.letter.toUpperCase()}') vs stroke='${nextStroke}' (uppercase='${nextStroke.toUpperCase()}') => ${matches ? 'MATCH' : 'no match'}`);
            });

            if (!isValidStroke(nextStroke, instDef)) {
                console.error(`[Validation Failed] Stroke '${nextStroke}' not found for '${track.instrument}'.`);
                console.error(`Valid strokes: ${instDef.sounds.map(s => s.letter).join(', ')}`);
                try { console.error('Instrument Definition:', JSON.parse(JSON.stringify(instDef))); } catch (e) { }
                console.error(`[DEBUG] All loaded instrument definitions:`, Object.keys(state.instrumentDefinitions));
                return; // Ignore invalid stroke
            } else {
                console.log(`[Validation Passed] Stroke '${nextStroke}' is valid.`);
            }
        } else {
            console.error(`[Validation Error] No instrument definition found for '${track.instrument}'`);
            console.error(`[DEBUG] Available definitions:`, Object.keys(state.instrumentDefinitions));
        }
    }

    track.strokes[stepIdx] = nextStroke;
    refreshGrid();

    // Play sound immediately for UI feedback
    audioEngine.playStrokeNow(track.instrument, nextStroke, track.volume);
};

/**
 * Handle updating a stroke directly without checking state.selectedStroke
 * @param {number} trackIdx - Track index
 * @param {number} stepIdx - Step index
 * @param {number} measureIdx - Measure index
 * @param {string} strokeLetter - The specific stroke to apply
 */
export const handleUpdateStrokeDirectly = (trackIdx, stepIdx, measureIdx, strokeLetter) => {
    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
    if (!section) return;
    const measure = section.measures[measureIdx];
    if (!measure || !measure.tracks[trackIdx]) return;

    const track = measure.tracks[trackIdx];

    // We already validate when creating the pie menu, so we can just apply it.
    track.strokes[stepIdx] = strokeLetter;

    refreshGrid();

    // Play sound immediately for UI feedback
    if (strokeLetter !== StrokeType.None) {
        audioEngine.playStrokeNow(track.instrument, strokeLetter, track.volume);
    }
};

/**
 * Updates the subdivision step count for a specific track
 * @param {number} trackIdx - Track index
 * @param {number} measureIdx - Measure index
 * @param {number} newTrackSteps - New subdivision count for this track
 */
export const updateTrackSteps = (trackIdx, measureIdx, newTrackSteps) => {
    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
    if (!section) return;

    const measure = section.measures[measureIdx];
    if (!measure || !measure.tracks[trackIdx]) return;

    const track = measure.tracks[trackIdx];

    // Update the visual subdivision preference
    track.trackSteps = newTrackSteps;

    // No array resizing or stroke moving! 
    // We just change the visual grouping.

    refreshGrid();
};

/**
 * Adds a track with a specific instrument symbol.
 * Loads necessary resources on the fly.
 * @param {string} instrumentSymbol - Instrument symbol e.g. 'ITO'
 * @param {string} soundPack - Sound pack name
 */
export const addTrack = async (instrumentSymbol, soundPack = "basic_bata") => {
    if (!state.toque) return;
    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
    if (!section) return;

    const pack = soundPack;

    // 1. Load Definition if missing
    if (!state.instrumentDefinitions[instrumentSymbol]) {
        const instDef = await dataLoader.loadInstrumentDefinition(instrumentSymbol);
        state.instrumentDefinitions[instrumentSymbol] = instDef;
    }

    // 2. Load Audio if missing
    const soundConfig = await dataLoader.loadSoundPackConfig(pack, instrumentSymbol);
    if (soundConfig) {
        await audioEngine.loadSoundPack(instrumentSymbol, soundConfig);
    }

    // 3. Add to all measures in section
    section.measures.forEach(measure => {
        // Apply Global Mix
        let vol = 1.0;
        let mut = false;

        if (state.mix[instrumentSymbol]) {
            vol = state.mix[instrumentSymbol].volume;
            mut = state.mix[instrumentSymbol].muted;
        } else {
            // Initialize global mix for this new instrument if not present
            state.mix[instrumentSymbol] = { volume: 1.0, muted: false };
        }

        measure.tracks.push({
            id: crypto.randomUUID(),
            instrument: instrumentSymbol,
            pack: pack,
            volume: vol,
            muted: mut,
            strokes: Array(section.steps).fill(StrokeType.None)
        });
    });

    refreshGrid();
};

/**
 * Update a track's instrument
 * @param {number} trackIdx - Track index to update
 * @param {string} newSymbol - New instrument symbol
 * @param {string} soundPack - Sound pack name
 */
export const updateTrackInstrument = async (trackIdx, newSymbol, soundPack = "basic_bata") => {
    const section = state.toque.sections.find(s => s.id === state.activeSectionId);
    if (!section || !section.measures[0]) return;

    const pack = soundPack;

    // Load resources
    if (!state.instrumentDefinitions[newSymbol]) {
        console.log(`[UpdateTrackInstrument] Loading definition for '${newSymbol}'`);
        const instDef = await dataLoader.loadInstrumentDefinition(newSymbol);
        console.log(`[UpdateTrackInstrument] Loaded definition for '${newSymbol}':`, instDef);
        console.log(`[UpdateTrackInstrument] Available sounds:`, instDef?.sounds?.map(s => s.letter).join(', '));
        state.instrumentDefinitions[newSymbol] = instDef;
    } else {
        console.log(`[UpdateTrackInstrument] Using cached definition for '${newSymbol}'`);
        console.log(`[UpdateTrackInstrument] Cached sounds:`, state.instrumentDefinitions[newSymbol]?.sounds?.map(s => s.letter).join(', '));
    }

    const soundConfig = await dataLoader.loadSoundPackConfig(pack, newSymbol);
    if (soundConfig) {
        await audioEngine.loadSoundPack(newSymbol, soundConfig);
    }

    // Apply Global Mix settings if available for the new instrument
    if (!state.mix[newSymbol]) {
        state.mix[newSymbol] = { volume: 1.0, muted: false };
    }
    const mixSettings = state.mix[newSymbol];

    // Update all measures
    section.measures.forEach(measure => {
        if (measure.tracks[trackIdx]) {
            measure.tracks[trackIdx].instrument = newSymbol;
            measure.tracks[trackIdx].pack = pack;
            measure.tracks[trackIdx].volume = mixSettings.volume;
            measure.tracks[trackIdx].muted = mixSettings.muted;
        }
    });

    refreshGrid();
};
