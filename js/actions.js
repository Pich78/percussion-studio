import { state, playback } from './store.js';
import { StrokeType } from './types.js';
import { renderApp, refreshGrid } from './ui/renderer.js';
import { stopPlayback } from './services/sequencer.js';
import { audioEngine } from './services/audioEngine.js';
import { dataLoader } from './services/dataLoader.js';

// Helper: Parse ASCII pattern string (e.g. "||O-S-|---|") to Array
const parsePatternString = (str, steps) => {
    // Remove visual separators '|'
    const clean = str.replace(/\|/g, '');
    const strokes = [];

    for (let i = 0; i < clean.length; i++) {
        const char = clean[i];
        if (char === '-') {
            strokes.push(StrokeType.None);
        } else {
            strokes.push(char.toUpperCase()); // Keep letter
        }
    }

    // Pad or trim to fit steps
    if (strokes.length < steps) {
        const diff = steps - strokes.length;
        for (let k = 0; k < diff; k++) strokes.push(StrokeType.None);
    } else if (strokes.length > steps) {
        strokes.length = steps;
    }
    return strokes;
};

export const actions = {

    /**
     * Loads a rhythm from the manifest ID
     */
    loadRhythm: async (rhythmId) => {
        stopPlayback();

        try {
            // 1. Fetch Rhythm YAML
            const rhythmDef = await dataLoader.loadRhythmDefinition(rhythmId);
            if (!rhythmDef) return;

            console.log(`Loading Rhythm: ${rhythmDef.name}`);

            // 2. Pre-load Instruments and Audio Kits
            // rhythmDef.sound_kit maps TrackID -> { instrument, pack }
            const trackConfig = rhythmDef.sound_kit;

            for (const [trackKey, config] of Object.entries(trackConfig)) {
                // A. Load Instrument Definition (for UI names/icons)
                if (!state.instrumentDefinitions[config.instrument]) {
                    const instDef = await dataLoader.loadInstrumentDefinition(config.instrument);
                    state.instrumentDefinitions[config.instrument] = instDef;
                }

                // B. Load Audio Samples
                // We optimize by checking if audioEngine already has it? 
                // AudioEngine checks internally, but we need the config object.
                const soundConfig = await dataLoader.loadSoundPackConfig(config.pack, config.instrument);
                if (soundConfig) {
                    await audioEngine.loadSoundPack(config.instrument, soundConfig);
                }
            }

            // 3. Build Runtime Sections
            const sections = rhythmDef.playback_flow.map(flow => {
                const sub = flow.time_signature === '6/8' || flow.time_signature === '12/8' ? 3 : 4;

                // Build Tracks
                const tracks = [];
                for (const [trackKey, patternStr] of Object.entries(flow.pattern)) {
                    const conf = trackConfig[trackKey];
                    if (!conf) continue; // Should not happen if YAML is valid

                    tracks.push({
                        id: crypto.randomUUID(),
                        instrument: conf.instrument, // Symbol: 'ITO'
                        pack: conf.pack,             // Pack: 'basic_bata'
                        volume: 1.0,
                        muted: false,
                        strokes: parsePatternString(patternStr, flow.steps)
                    });
                }

                return {
                    id: crypto.randomUUID(),
                    name: flow.name,
                    timeSignature: flow.time_signature,
                    steps: flow.steps,
                    subdivision: sub,
                    repetitions: flow.repetitions,
                    tracks: tracks,
                    bpm: flow.bpm, // Optional override
                    tempoAcceleration: flow.tempo_acceleration || 0
                };
            });

            // 4. Update State
            state.toque = {
                id: rhythmId,
                name: rhythmDef.name,
                globalBpm: rhythmDef.global_bpm,
                sections: sections
            };

            actions.updateActiveSection(sections[0].id);

        } catch (e) {
            console.error("Error loading rhythm:", e);
            alert("Failed to load rhythm. Check console.");
        }
    },

    updateActiveSection: (id) => {
        state.activeSectionId = id;
        playback.activeSectionId = id;
        playback.repetitionCounter = 1;

        if (state.toque) {
            const section = state.toque.sections.find(s => s.id === id);
            if (section) playback.currentPlayheadBpm = section.bpm ?? state.toque.globalBpm;
        }
        renderApp();
    },

    createNewRhythm: () => {
        stopPlayback();
        const newId = crypto.randomUUID();
        // Create a blank slate
        state.toque = {
            id: crypto.randomUUID(),
            name: "New Rhythm",
            globalBpm: 120,
            sections: [{
                id: newId,
                name: "Section 1",
                timeSignature: '4/4',
                steps: 16,
                subdivision: 4,
                repetitions: 1,
                tracks: []
            }]
        };
        actions.updateActiveSection(newId);
    },

    addSection: () => {
        if (!state.toque) return;
        const newSec = {
            id: crypto.randomUUID(),
            name: `Section ${state.toque.sections.length + 1}`,
            timeSignature: '4/4',
            steps: 16,
            subdivision: 4,
            repetitions: 1,
            tracks: [] // Empty tracks initially
        };
        state.toque.sections.push(newSec);
        actions.updateActiveSection(newSec.id);
    },

    deleteSection: (id) => {
        if (!state.toque || state.toque.sections.length <= 1) return;
        state.toque.sections = state.toque.sections.filter(s => s.id !== id);
        if (state.activeSectionId === id) {
            actions.updateActiveSection(state.toque.sections[0].id);
        } else {
            renderApp();
        }
    },

    duplicateSection: (id) => {
        const src = state.toque.sections.find(s => s.id === id);
        if (src) {
            const copy = JSON.parse(JSON.stringify(src));
            copy.id = crypto.randomUUID();
            copy.name = `${src.name} (Copy)`;
            // Regenerate track IDs to avoid reference issues
            copy.tracks.forEach(t => t.id = crypto.randomUUID());
            state.toque.sections.push(copy);
            actions.updateActiveSection(copy.id);
        }
    },

    handleUpdateStroke: (trackIdx, stepIdx) => {
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        const track = section.tracks[trackIdx];
        const nextStroke = track.strokes[stepIdx] === state.selectedStroke ? StrokeType.None : state.selectedStroke;

        // Dynamic Validation against Loaded Instrument Definition
        if (nextStroke !== StrokeType.None) {
            console.log(`[Action] Validating stroke '${nextStroke}' for instrument '${track.instrument}'`);

            const instDef = state.instrumentDefinitions[track.instrument];
            if (instDef) {
                // Check if this instrument has this letter defined
                const isValid = instDef.sounds.some(s => s.letter.toUpperCase() === nextStroke.toUpperCase());

                if (!isValid) {
                    console.error(`[Validation Failed] Stroke '${nextStroke}' not found for '${track.instrument}'.`);
                    console.error(`Valid strokes: ${instDef.sounds.map(s => s.letter).join(', ')}`);
                    // Log definition deep copy to verify content
                    try { console.error('Instrument Definition:', JSON.parse(JSON.stringify(instDef))); } catch (e) { }
                    return; // Ignore invalid stroke
                } else {
                    console.log(`[Validation Passed] Stroke '${nextStroke}' is valid.`);
                }
            } else {
                console.error(`[Validation Error] No instrument definition found for '${track.instrument}'`);
            }
        }

        track.strokes[stepIdx] = nextStroke;
        refreshGrid();

        // Play sound
        audioEngine.playStroke(track.instrument, nextStroke, 0, track.volume);
    },

    resizeTracks: (section) => {
        const newSteps = section.steps;
        section.tracks.forEach(track => {
            if (newSteps > track.strokes.length) {
                const diff = newSteps - track.strokes.length;
                for (let i = 0; i < diff; i++) track.strokes.push(StrokeType.None);
            } else {
                track.strokes.length = newSteps;
            }
        });
    },

    /**
     * Adds a track with a specific instrument symbol.
     * Loads necessary resources on the fly.
     */
    addTrack: async (instrumentSymbol) => {
        if (!state.toque) return;
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        if (!section) return;

        const pack = "basic_bata"; // Default pack for now

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

        // 3. Add to state
        section.tracks.push({
            id: crypto.randomUUID(),
            instrument: instrumentSymbol,
            pack: pack,
            volume: 1.0,
            muted: false,
            strokes: Array(section.steps).fill(StrokeType.None)
        });

        refreshGrid();
    },

    updateTrackInstrument: async (trackIdx, newSymbol) => {
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        const track = section.tracks[trackIdx];
        const pack = "basic_bata"; // Default

        // Load resources
        if (!state.instrumentDefinitions[newSymbol]) {
            state.instrumentDefinitions[newSymbol] = await dataLoader.loadInstrumentDefinition(newSymbol);
        }
        const soundConfig = await dataLoader.loadSoundPackConfig(pack, newSymbol);
        await audioEngine.loadSoundPack(newSymbol, soundConfig);

        track.instrument = newSymbol;
        track.pack = pack;
        refreshGrid();
    }
};