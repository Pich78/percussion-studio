/*
  js/utils/rhythmTransformers.js
  Pure functions for transforming rhythm data structures.
  No state dependencies - these are pure data transformations.
*/

import { StrokeType } from '../types.js';
import { parsePatternString } from './patternParser.js';

/**
 * Create an empty track structure
 * @param {string} instrumentSymbol - Instrument symbol e.g. 'ITO'
 * @param {string} pack - Sound pack name
 * @param {number} steps - Number of steps
 * @param {number} volume - Initial volume (0-1)
 * @param {boolean} muted - Initial mute state
 * @returns {object} Track object
 */
export const createEmptyTrack = (instrumentSymbol, pack, steps, volume = 1.0, muted = false) => ({
    id: crypto.randomUUID(),
    instrument: instrumentSymbol,
    pack: pack,
    volume: volume,
    muted: muted,
    strokes: Array(steps).fill(StrokeType.None)
});

/**
 * Create an empty measure structure
 * @param {object[]} trackTemplates - Optional array of track templates to clone
 * @param {number} steps - Number of steps for new tracks
 * @returns {object} Measure object
 */
export const createEmptyMeasure = (trackTemplates = [], steps = 16) => ({
    id: crypto.randomUUID(),
    tracks: trackTemplates.map(t => createEmptyTrack(t.instrument, t.pack, steps, t.volume, t.muted))
});

/**
 * Create an empty section structure
 * @param {number} sectionNumber - Section number for naming
 * @param {number} steps - Number of steps
 * @param {number} subdivision - Subdivision value
 * @param {object[]} trackTemplates - Optional track templates
 * @returns {object} Section object
 */
export const createEmptySection = (sectionNumber, steps = 16, subdivision = 4, trackTemplates = []) => ({
    id: crypto.randomUUID(),
    name: `Section ${sectionNumber}`,
    steps: steps,
    subdivision: subdivision,
    repetitions: 1,
    measures: [createEmptyMeasure(trackTemplates, steps)]
});

/**
 * Deep clone a section with new IDs
 * @param {object} source - Source section to clone
 * @returns {object} Cloned section
 */
export const cloneSection = (source) => {
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = crypto.randomUUID();
    copy.name = `${source.name} (Copy)`;
    // Regenerate measure and track IDs
    copy.measures.forEach(measure => {
        measure.id = crypto.randomUUID();
        measure.tracks.forEach(t => t.id = crypto.randomUUID());
    });
    return copy;
};

/**
 * Deep clone a measure with new IDs
 * @param {object} source - Source measure to clone
 * @returns {object} Cloned measure
 */
export const cloneMeasure = (source) => ({
    id: crypto.randomUUID(),
    tracks: source.tracks.map(track => ({
        id: crypto.randomUUID(),
        instrument: track.instrument,
        pack: track.pack,
        volume: track.volume,
        muted: track.muted,
        strokes: [...track.strokes]
    }))
});

/**
 * Build a track from pattern definition
 * @param {object} trackConfig - Config with instrument and pack
 * @param {string} patternStr - Pattern string
 * @param {number} steps - Number of steps
 * @returns {object} Track object
 */
export const buildTrackFromPattern = (trackConfig, patternStr, steps) => ({
    id: crypto.randomUUID(),
    instrument: trackConfig.instrument,
    pack: trackConfig.pack,
    volume: 1.0,
    muted: false,
    strokes: parsePatternString(patternStr, steps)
});

/**
 * Build measures from playback flow definition
 * @param {object} flow - Flow definition with pattern or measures
 * @param {object} trackConfig - Sound kit track configuration
 * @returns {object[]} Array of measure objects
 */
export const buildMeasuresFromFlow = (flow, trackConfig) => {
    const hasMeasures = flow.measures && Array.isArray(flow.measures);

    if (hasMeasures) {
        // New format: multiple measures
        return flow.measures.map(measureDef => {
            const tracks = [];
            for (const [trackKey, patternStr] of Object.entries(measureDef.pattern)) {
                const conf = trackConfig[trackKey];
                if (!conf) continue;
                tracks.push(buildTrackFromPattern(conf, patternStr, flow.steps));
            }
            return {
                id: crypto.randomUUID(),
                tracks: tracks
            };
        });
    } else {
        // Old format: single pattern
        const tracks = [];
        for (const [trackKey, patternStr] of Object.entries(flow.pattern)) {
            const conf = trackConfig[trackKey];
            if (!conf) continue;
            tracks.push(buildTrackFromPattern(conf, patternStr, flow.steps));
        }
        return [{
            id: crypto.randomUUID(),
            tracks: tracks
        }];
    }
};

/**
 * Build runtime section from playback flow definition
 * @param {object} flow - Flow definition from YAML
 * @param {object} trackConfig - Sound kit track configuration
 * @returns {object} Runtime section object
 */
export const buildSectionFromFlow = (flow, trackConfig) => {
    // Use explicit subdivision if present, otherwise derive from steps
    const sub = flow.subdivision || ([6, 12, 24].includes(flow.steps) ? 3 : 4);

    return {
        id: crypto.randomUUID(),
        name: flow.name,
        steps: flow.steps,
        subdivision: sub,
        repetitions: flow.repetitions,
        measures: buildMeasuresFromFlow(flow, trackConfig),
        bpm: flow.bpm,
        tempoAcceleration: flow.tempo_acceleration || 0
    };
};

/**
 * Build all runtime sections from rhythm definition
 * @param {object} rhythmDef - Full rhythm definition from YAML
 * @returns {object[]} Array of runtime section objects
 */
export const buildRuntimeSections = (rhythmDef) => {
    const trackConfig = rhythmDef.sound_kit;
    return rhythmDef.playback_flow.map(flow => buildSectionFromFlow(flow, trackConfig));
};

/**
 * Determine if a rhythm is Batá based on its properties
 * @param {object} rhythmDef - Rhythm definition
 * @param {object} explorerMeta - Optional explorer metadata
 * @returns {boolean} True if rhythm is Batá
 */
export const isBataRhythm = (rhythmDef, explorerMeta = null) => {
    return rhythmDef.is_bata ||
        (!!explorerMeta) ||
        (!!(rhythmDef.orisha || rhythmDef.classification || rhythmDef.description));
};

/**
 * Build toque state object from rhythm definition
 * @param {string} rhythmId - The rhythm ID
 * @param {object} rhythmDef - Rhythm definition from YAML
 * @param {object[]} sections - Built runtime sections
 * @param {object} explorerMeta - Optional explorer metadata
 * @returns {object} Toque state object
 */
export const buildToqueState = (rhythmId, rhythmDef, sections, explorerMeta = null) => ({
    id: rhythmId,
    name: rhythmDef.name,
    globalBpm: rhythmDef.global_bpm,
    isBata: isBataRhythm(rhythmDef, explorerMeta),
    orisha: rhythmDef.orisha || explorerMeta?.associatedOrishas || [],
    classification: rhythmDef.classification || explorerMeta?.classification || null,
    description: rhythmDef.description || explorerMeta?.description || '',
    sections: sections
});

/**
 * Resize track strokes array to match new step count
 * @param {object} track - Track to resize
 * @param {number} newSteps - New step count
 * @returns {object} Modified track (mutates in place for performance)
 */
export const resizeTrackStrokes = (track, newSteps) => {
    if (newSteps > track.strokes.length) {
        const diff = newSteps - track.strokes.length;
        for (let i = 0; i < diff; i++) track.strokes.push(StrokeType.None);
    } else {
        track.strokes.length = newSteps;
    }
    return track;
};

/**
 * Find closest valid divisor for track steps
 * @param {number} currentSteps - Current track steps
 * @param {number} newSectionSteps - New section step count
 * @returns {number} Closest valid divisor
 */
export const findClosestDivisor = (currentSteps, newSectionSteps) => {
    const validDivisors = [];
    for (let i = 1; i <= newSectionSteps; i++) {
        if (newSectionSteps % i === 0) validDivisors.push(i);
    }
    return validDivisors.reduce((prev, curr) =>
        Math.abs(curr - currentSteps) < Math.abs(prev - currentSteps) ? curr : prev
    );
};
