import { state, playback } from './store.js';
import { INITIAL_TOQUE, VALID_INSTRUMENT_STROKES } from './constants.js';
import { InstrumentName, StrokeType } from './types.js';
import { renderApp, refreshGrid } from './ui/renderer.js';
import { stopPlayback } from './services/sequencer.js';
import { audioEngine } from './services/audioEngine.js';

export const actions = {
    updateActiveSection: (id) => {
        state.activeSectionId = id;
        playback.activeSectionId = id;
        playback.repetitionCounter = 1;
        const section = state.toque.sections.find(s => s.id === id);
        if (section) playback.currentPlayheadBpm = section.bpm ?? state.toque.globalBpm;
        renderApp();
    },

    createNewRhythm: () => {
        stopPlayback();
        const newId = crypto.randomUUID();
        state.toque = {
            ...INITIAL_TOQUE,
            id: crypto.randomUUID(),
            name: "New Rhythm",
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
        const newSec = {
            id: crypto.randomUUID(),
            name: `Section ${state.toque.sections.length + 1}`,
            timeSignature: '4/4',
            steps: 16,
            subdivision: 4,
            repetitions: 1,
            tracks: [
                { id: crypto.randomUUID(), instrument: InstrumentName.Conga, volume: 1.0, muted: false, strokes: Array(16).fill(StrokeType.None) },
                { id: crypto.randomUUID(), instrument: InstrumentName.Tumbadora, volume: 1.0, muted: false, strokes: Array(16).fill(StrokeType.None) }
            ]
        };
        state.toque.sections.push(newSec);
        actions.updateActiveSection(newSec.id);
    },

    deleteSection: (id) => {
        if (state.toque.sections.length <= 1) return;
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
            copy.tracks.forEach(t => t.id = crypto.randomUUID());
            state.toque.sections.push(copy);
            actions.updateActiveSection(copy.id);
        }
    },

    handleUpdateStroke: (trackIdx, stepIdx) => {
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        const track = section.tracks[trackIdx];
        const nextStroke = track.strokes[stepIdx] === state.selectedStroke ? StrokeType.None : state.selectedStroke;

        if (nextStroke !== StrokeType.None) {
            const allowed = VALID_INSTRUMENT_STROKES[track.instrument] || [];
            if (!allowed.includes(nextStroke)) return;
        }

        track.strokes[stepIdx] = nextStroke;
        refreshGrid();
        audioEngine.playStroke(track.instrument, nextStroke, 0, track.volume);
    },

    resizeTracks: (section) => {
        const newSteps = section.steps;
        section.tracks.forEach(track => {
            if (newSteps > track.strokes.length) {
                const diff = newSteps - track.strokes.length;
                track.strokes.push(...Array(diff).fill(StrokeType.None));
            } else {
                track.strokes.length = newSteps;
            }
        });
    }
};