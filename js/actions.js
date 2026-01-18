import { state, playback } from './store.js';
import { StrokeType } from './types.js';
import { renderApp, refreshGrid, scrollToMeasure } from './ui/renderer.js';
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

        // Reset Global Mix
        state.mix = {};

        try {
            // 1. Fetch Rhythm YAML
            const rhythmDef = await dataLoader.loadRhythmDefinition(rhythmId);
            if (!rhythmDef) return;

            console.log(`Loading Rhythm: ${rhythmDef.name}`);

            // 2. Pre-load Instruments and Audio Kits IN PARALLEL for faster startup
            // rhythmDef.sound_kit maps TrackID -> { instrument, pack }
            const trackConfig = rhythmDef.sound_kit;

            // Parallel loading: All instruments load concurrently instead of sequentially
            const loadPromises = Object.entries(trackConfig).map(async ([trackKey, config]) => {
                // A. Load Instrument Definition (for UI names/icons)
                let instDef = state.instrumentDefinitions[config.instrument];
                if (!instDef) {
                    console.log(`[LoadRhythm] Loading instrument definition for '${config.instrument}'`);
                    instDef = await dataLoader.loadInstrumentDefinition(config.instrument);
                    console.log(`[LoadRhythm] Loaded definition for '${config.instrument}':`, instDef);
                    console.log(`[LoadRhythm] Available sounds for '${config.instrument}':`, instDef?.sounds?.map(s => s.letter).join(', '));
                    state.instrumentDefinitions[config.instrument] = instDef;
                } else {
                    console.log(`[LoadRhythm] Using cached definition for '${config.instrument}'`);
                }

                // B. Load Audio Samples (can run in parallel with other instruments)
                const soundConfig = await dataLoader.loadSoundPackConfig(config.pack, config.instrument);
                if (soundConfig) {
                    await audioEngine.loadSoundPack(config.instrument, soundConfig);
                }
            });

            // Wait for ALL instruments to finish loading in parallel
            await Promise.all(loadPromises);

            // 3. Build Runtime Sections
            const sections = rhythmDef.playback_flow.map(flow => {
                const sub = flow.time_signature === '6/8' || flow.time_signature === '12/8' ? 3 : 4;

                // Check if new format (measures array) or old format (single pattern)
                const hasMeasures = flow.measures && Array.isArray(flow.measures);

                let measures = [];

                if (hasMeasures) {
                    // New format: multiple measures
                    measures = flow.measures.map(measureDef => {
                        const tracks = [];
                        for (const [trackKey, patternStr] of Object.entries(measureDef.pattern)) {
                            const conf = trackConfig[trackKey];
                            if (!conf) continue;

                            tracks.push({
                                id: crypto.randomUUID(),
                                instrument: conf.instrument,
                                pack: conf.pack,
                                volume: 1.0,
                                muted: false,
                                strokes: parsePatternString(patternStr, flow.steps)
                            });
                        }

                        return {
                            id: crypto.randomUUID(),
                            tracks: tracks
                        };
                    });
                } else {
                    // Old format: single pattern (backward compatibility)
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

                    // Wrap in measures array
                    measures = [{
                        id: crypto.randomUUID(),
                        tracks: tracks
                    }];
                }

                return {
                    id: crypto.randomUUID(),
                    name: flow.name,
                    timeSignature: flow.time_signature,
                    steps: flow.steps,
                    subdivision: sub,
                    repetitions: flow.repetitions,
                    measures: measures,
                    bpm: flow.bpm, // Optional override
                    tempoAcceleration: flow.tempo_acceleration || 0
                };
            });

            // 4. Update State
            // Check if we have additional metadata from the Bata Explorer for this rhythm
            const explorerMeta = state.uiState.bataExplorer?.metadata?.toques?.[rhythmId];

            // Determine Batà status and metadata
            // Priority: Explicit YAML > Explorer Metadata > Inferred from fields
            const isBata = rhythmDef.is_bata ||
                (!!explorerMeta) ||
                (!!(rhythmDef.orisha || rhythmDef.classification || rhythmDef.description));

            state.toque = {
                id: rhythmId,
                name: rhythmDef.name,
                globalBpm: rhythmDef.global_bpm,
                isBata: isBata,
                orisha: rhythmDef.orisha || explorerMeta?.associatedOrishas || [],
                classification: rhythmDef.classification || explorerMeta?.classification || null,
                description: rhythmDef.description || explorerMeta?.description || '',
                sections: sections
            };

            // Track rhythm source for sharing
            state.rhythmSource = 'repo';
            state.currentRhythmId = rhythmId;

            actions.updateActiveSection(sections[0].id);

        } catch (e) {
            console.error("Error loading rhythm:", e);
            alert("Failed to load rhythm. Check console.");
        }
    },

    /**
     * Loads a rhythm from a local file (using browser File API)
     * @param {File} file - The File object from file input
     */
    loadRhythmFromFile: async (file) => {
        stopPlayback();

        // Reset Global Mix
        state.mix = {};

        try {
            // 1. Read file content
            const content = await file.text();

            // 2. Parse YAML
            const rhythmDef = jsyaml.load(content);
            if (!rhythmDef) {
                throw new Error("Could not parse rhythm file");
            }

            console.log(`Loading Rhythm from file: ${rhythmDef.name}`);

            // 3. Pre-load Instruments and Audio Kits IN PARALLEL for faster startup
            const trackConfig = rhythmDef.sound_kit;

            // Parallel loading: All instruments load concurrently instead of sequentially
            const loadPromises = Object.entries(trackConfig).map(async ([trackKey, config]) => {
                // A. Load Instrument Definition
                let instDef = state.instrumentDefinitions[config.instrument];
                if (!instDef) {
                    console.log(`[LoadRhythmFromFile] Loading instrument definition for '${config.instrument}'`);
                    instDef = await dataLoader.loadInstrumentDefinition(config.instrument);
                    state.instrumentDefinitions[config.instrument] = instDef;
                }

                // B. Load Audio Samples (can run in parallel with other instruments)
                const soundConfig = await dataLoader.loadSoundPackConfig(config.pack, config.instrument);
                if (soundConfig) {
                    await audioEngine.loadSoundPack(config.instrument, soundConfig);
                }
            });

            // Wait for ALL instruments to finish loading in parallel
            await Promise.all(loadPromises);

            // 4. Build Runtime Sections
            const sections = rhythmDef.playback_flow.map(flow => {
                const sub = flow.time_signature === '6/8' || flow.time_signature === '12/8' ? 3 : 4;
                const hasMeasures = flow.measures && Array.isArray(flow.measures);

                let measures = [];

                if (hasMeasures) {
                    measures = flow.measures.map(measureDef => {
                        const tracks = [];
                        for (const [trackKey, patternStr] of Object.entries(measureDef.pattern)) {
                            const conf = trackConfig[trackKey];
                            if (!conf) continue;

                            tracks.push({
                                id: crypto.randomUUID(),
                                instrument: conf.instrument,
                                pack: conf.pack,
                                volume: 1.0,
                                muted: false,
                                strokes: parsePatternString(patternStr, flow.steps)
                            });
                        }

                        return {
                            id: crypto.randomUUID(),
                            tracks: tracks
                        };
                    });
                } else {
                    const tracks = [];
                    for (const [trackKey, patternStr] of Object.entries(flow.pattern)) {
                        const conf = trackConfig[trackKey];
                        if (!conf) continue;

                        tracks.push({
                            id: crypto.randomUUID(),
                            instrument: conf.instrument,
                            pack: conf.pack,
                            volume: 1.0,
                            muted: false,
                            strokes: parsePatternString(patternStr, flow.steps)
                        });
                    }

                    measures = [{
                        id: crypto.randomUUID(),
                        tracks: tracks
                    }];
                }

                return {
                    id: crypto.randomUUID(),
                    name: flow.name,
                    timeSignature: flow.time_signature,
                    steps: flow.steps,
                    subdivision: sub,
                    repetitions: flow.repetitions,
                    measures: measures,
                    bpm: flow.bpm,
                    tempoAcceleration: flow.tempo_acceleration || 0
                };
            });

            // 5. Update State
            state.toque = {
                id: crypto.randomUUID(),
                name: rhythmDef.name,
                globalBpm: rhythmDef.global_bpm,
                // If is_bata is explicit, use it. If not, check if any metadata fields exist to infer it.
                isBata: rhythmDef.is_bata || (!!(rhythmDef.orisha || rhythmDef.classification || rhythmDef.description)),
                orisha: rhythmDef.orisha || [],
                classification: rhythmDef.classification || null,
                description: rhythmDef.description || '',
                sections: sections
            };

            // Track rhythm source - local files cannot be shared via URL
            state.rhythmSource = 'local';
            state.currentRhythmId = null;

            actions.updateActiveSection(sections[0].id);

        } catch (e) {
            console.error("Error loading rhythm from file:", e);
            alert("Failed to load rhythm file. Check console for details.");
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
        // Reset Global Mix
        state.mix = {};

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
                measures: [{
                    id: crypto.randomUUID(),
                    tracks: []
                }]
            }]
        };

        // Track rhythm source - new rhythms cannot be shared via URL
        state.rhythmSource = 'new';
        state.currentRhythmId = null;

        actions.updateActiveSection(newId);
    },

    addSection: () => {
        if (!state.toque) return;

        // Create new section structure
        const newSec = {
            id: crypto.randomUUID(),
            name: `Section ${state.toque.sections.length + 1}`,
            timeSignature: '4/4',
            steps: 16,
            subdivision: 4,
            repetitions: 1,
            measures: [{
                id: crypto.randomUUID(),
                tracks: []
            }]
        };

        // If there are existing sections with tracks, copy the instrument structure
        if (state.toque.sections.length > 0) {
            const firstSection = state.toque.sections[0];
            if (firstSection.measures && firstSection.measures.length > 0) {
                const firstMeasure = firstSection.measures[0];
                if (firstMeasure.tracks && firstMeasure.tracks.length > 0) {
                    // Copy track structure (instrument, pack, volume, muted) but with empty strokes
                    newSec.measures[0].tracks = firstMeasure.tracks.map(track => ({
                        id: crypto.randomUUID(),
                        instrument: track.instrument,
                        pack: track.pack,
                        volume: track.volume,
                        muted: track.muted,
                        strokes: Array(newSec.steps).fill(StrokeType.None)
                    }));
                }
            }
        }

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
            // Regenerate measure and track IDs to avoid reference issues
            copy.measures.forEach(measure => {
                measure.id = crypto.randomUUID();
                measure.tracks.forEach(t => t.id = crypto.randomUUID());
            });
            state.toque.sections.push(copy);
            actions.updateActiveSection(copy.id);
        }
    },

    handleUpdateStroke: (trackIdx, stepIdx, measureIdx = 0) => {
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

                // Check if this instrument has this letter defined
                const isValid = instDef.sounds.some(s => s.letter.toUpperCase() === nextStroke.toUpperCase());

                if (!isValid) {
                    console.error(`[Validation Failed] Stroke '${nextStroke}' not found for '${track.instrument}'.`);
                    console.error(`Valid strokes: ${instDef.sounds.map(s => s.letter).join(', ')}`);
                    // Log definition deep copy to verify content
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
    },

    resizeTracks: (section) => {
        const newSteps = section.steps;
        section.measures.forEach(measure => {
            measure.tracks.forEach(track => {
                if (newSteps > track.strokes.length) {
                    const diff = newSteps - track.strokes.length;
                    for (let i = 0; i < diff; i++) track.strokes.push(StrokeType.None);
                } else {
                    track.strokes.length = newSteps;
                }
            });
        });
    },

    /**
     * Adds a track with a specific instrument symbol.
     * Loads necessary resources on the fly.
     */
    addTrack: async (instrumentSymbol, soundPack = "basic_bata") => {
        if (!state.toque) return;
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        if (!section) return;

        const pack = soundPack; // Use provided pack

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
    },

    /**
     * Adds a new measure to the active section
     */
    addMeasure: () => {
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        if (!section) return;

        // Create new measure with tracks matching existing ones
        const newMeasure = {
            id: crypto.randomUUID(),
            tracks: []
        };

        // If there are existing measures, clone track structure from first measure
        if (section.measures.length > 0) {
            const firstMeasure = section.measures[0];
            firstMeasure.tracks.forEach(track => {
                newMeasure.tracks.push({
                    id: crypto.randomUUID(),
                    instrument: track.instrument,
                    pack: track.pack,
                    volume: track.volume,
                    muted: track.muted,
                    strokes: Array(section.steps).fill(StrokeType.None)
                });
            });
        }

        const newIndex = section.measures.length;
        section.measures.push(newMeasure);
        refreshGrid();

        // Scroll to the new measure
        scrollToMeasure(newIndex);
    },

    /**
     * Deletes a measure from the active section
     */
    deleteMeasure: (measureIdx) => {
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        if (!section || section.measures.length <= 1) {
            alert("Cannot delete the last measure");
            return;
        }

        if (confirm("Delete this measure?")) {
            section.measures.splice(measureIdx, 1);
            refreshGrid();
        }
    },

    /**
     * Duplicates a measure in the active section
     */
    duplicateMeasure: (measureIdx) => {
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        if (!section) return;

        const sourceMeasure = section.measures[measureIdx];
        const newMeasure = {
            id: crypto.randomUUID(),
            tracks: sourceMeasure.tracks.map(track => ({
                id: crypto.randomUUID(),
                instrument: track.instrument,
                pack: track.pack,
                volume: track.volume,
                muted: track.muted,
                strokes: [...track.strokes] // Copy strokes array
            }))
        };

        // Insert after the source measure
        section.measures.splice(measureIdx + 1, 0, newMeasure);
        refreshGrid();
    },

    updateTrackInstrument: async (trackIdx, newSymbol, soundPack = "basic_bata") => {
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        if (!section || !section.measures[0]) return;

        const pack = soundPack; // Use provided pack

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
        // If not, default to 1.0 / unmuted.
        // Also update the global mix for this instrument if it didn't exist.
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
    },

    /**
     * Sets the global volume for a specific instrument type.
     * Updates ALL tracks of this instrument across ALL sections.
     * SYNC: If volume is 0, mute. If volume > 0, unmute.
     * NOW: Also updates audio engine in real-time for immediate effect.
     */
    setGlobalVolume: (instrumentSymbol, volume) => {
        // 1. Update Global State
        if (!state.mix[instrumentSymbol]) {
            state.mix[instrumentSymbol] = { volume: 1.0, muted: false, lastVolume: 1.0 };
        }

        const mix = state.mix[instrumentSymbol];
        mix.volume = volume;

        // Track last known good volume (if not 0)
        if (volume > 0) mix.lastVolume = volume;

        // REAL-TIME: Update audio engine immediately
        audioEngine.setInstrumentVolume(instrumentSymbol, volume);

        // Sync Mute State
        let muteChanged = false;
        if (volume === 0 && !mix.muted) {
            mix.muted = true;
            muteChanged = true;
        } else if (volume > 0 && mix.muted) {
            mix.muted = false;
            muteChanged = true;
        }

        // 2. Propagate to ALL sections and measures
        if (state.toque && state.toque.sections) {
            state.toque.sections.forEach(section => {
                section.measures.forEach(measure => {
                    measure.tracks.forEach(track => {
                        if (track.instrument === instrumentSymbol) {
                            track.volume = volume;
                            if (muteChanged) track.muted = mix.muted;
                        }
                    });
                });
            });
        }

        // 3. Refresh Grid ONLY if mute state changed (to update visual opacity/strikethrough)
        // This avoids refreshing on every drag pixel, but ensures visual sync when hitting 0.
        if (muteChanged) {
            refreshGrid();
        }
    },

    /**
     * Sets the global mute status for a specific instrument type.
     * SYNC: If muted, set volume to 0. If unmuted, restore last volume.
     * NOW: Also updates audio engine in real-time for immediate effect.
     */
    setGlobalMute: (instrumentSymbol, isMuted) => {
        // 1. Update Global State
        if (!state.mix[instrumentSymbol]) {
            state.mix[instrumentSymbol] = { volume: 1.0, muted: false, lastVolume: 1.0 };
        }

        const mix = state.mix[instrumentSymbol];
        mix.muted = isMuted;

        // REAL-TIME: Update audio engine mute state immediately
        audioEngine.setInstrumentMuted(instrumentSymbol, isMuted);

        let targetVolume = mix.volume;

        if (isMuted) {
            // Store current volume before muting (if meaningful)
            if (mix.volume > 0) mix.lastVolume = mix.volume;
            targetVolume = 0;
        } else {
            // Restore last volume
            targetVolume = mix.lastVolume || 1.0;
        }

        mix.volume = targetVolume;

        // 2. Propagate
        if (state.toque && state.toque.sections) {
            state.toque.sections.forEach(section => {
                section.measures.forEach(measure => {
                    measure.tracks.forEach(track => {
                        if (track.instrument === instrumentSymbol) {
                            track.muted = isMuted;
                            track.volume = targetVolume;
                        }
                    });
                });
            });
        }

        // 3. Refresh Grid required to show visual feedback (opacity/line-through) + Slider updates
        refreshGrid();
    }
};