import { state, playback } from './store.js';
import { actions } from './actions.js';
import { togglePlay, stopPlayback } from './services/sequencer.js';
import { renderApp, refreshGrid } from './ui/renderer.js';
import { Controls } from './components/controls.js';
import { StrokeType } from './types.js';

export const setupEventListeners = () => {
    const root = document.getElementById('root');

    root.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action], [data-role]');
        if (!target) return;
        const action = target.dataset.action;

        if (action === 'toggle-play') togglePlay();
        if (action === 'stop') stopPlayback();

        if (action === 'toggle-menu') {
            state.uiState.isMenuOpen = !state.uiState.isMenuOpen;
            renderApp();
        }
        if (action === 'close-menu') {
            state.uiState.isMenuOpen = false;
            renderApp();
        }
        if (action === 'new-rhythm') {
            if (confirm("Create new rhythm? Unsaved changes lost.")) actions.createNewRhythm();
            state.uiState.isMenuOpen = false;
            renderApp();
        }
        if (action === 'load-rhythm') {
            state.uiState.modalType = 'rhythm';
            state.uiState.modalOpen = true;
            state.uiState.isMenuOpen = false;
            renderApp();
        }

        if (action === 'add-section') actions.addSection();
        if (action === 'delete-section') actions.deleteSection(target.dataset.id);
        if (action === 'duplicate-section') actions.duplicateSection(target.dataset.id);

        if (target.dataset.role === 'tubs-cell') {
            actions.handleUpdateStroke(parseInt(target.dataset.trackIndex), parseInt(target.dataset.stepIndex));
        }

        if (action === 'toggle-mute') {
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            const tIdx = parseInt(target.dataset.trackIndex);
            section.tracks[tIdx].muted = !section.tracks[tIdx].muted;
            refreshGrid();
        }
        if (action === 'remove-track') {
            if (confirm("Remove track?")) {
                const section = state.toque.sections.find(s => s.id === state.activeSectionId);
                section.tracks.splice(parseInt(target.dataset.trackIndex), 1);
                refreshGrid();
            }
        }

        // Modals
        if (action === 'open-add-modal') {
            state.uiState.editingTrackIndex = null;
            state.uiState.modalType = 'instrument';
            state.uiState.modalOpen = true;
            refreshGrid();
        }
        if (action === 'open-edit-modal') {
            state.uiState.editingTrackIndex = parseInt(target.dataset.trackIndex);
            state.uiState.modalType = 'instrument';
            state.uiState.modalOpen = true;
            refreshGrid();
        }
        if (action === 'close-modal' || (action === 'close-modal-bg' && e.target === target)) {
            state.uiState.modalOpen = false;
            refreshGrid();
        }
        if (action === 'select-instrument') {
            const inst = target.dataset.instrument;
            if (state.uiState.editingTrackIndex === null) {
                // Add new track - use actions.addTrack to properly load definitions
                actions.addTrack(inst).then(() => {
                    state.uiState.modalOpen = false;
                    renderApp();
                });
            } else {
                // Edit existing track - use actions.updateTrackInstrument to properly load definitions
                actions.updateTrackInstrument(state.uiState.editingTrackIndex, inst).then(() => {
                    state.uiState.modalOpen = false;
                    renderApp();
                });
            }
        }
        if (action === 'select-rhythm-confirm') {
            const rhythmId = target.dataset.rhythmId;
            if (confirm("Load this rhythm? Unsaved changes will be lost.")) {
                actions.loadRhythm(rhythmId).then(() => {
                    state.uiState.modalOpen = false;
                    renderApp();
                });
            }
        }

        // Settings
        if (action === 'toggle-bpm-override') {
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            section.bpm = (section.bpm !== undefined) ? undefined : state.toque.globalBpm;
            refreshGrid();
        }
        if (action === 'select-stroke') {
            state.selectedStroke = target.dataset.stroke;
            document.querySelector('#root > div > div:last-child').outerHTML = Controls({ selectedStroke: state.selectedStroke });
        }
        if (action === 'clear-pattern') {
            if (confirm("Clear all notes in this section?")) {
                const section = state.toque.sections.find(s => s.id === state.activeSectionId);
                section.tracks.forEach(t => t.strokes.fill(StrokeType.None));
                stopPlayback();
                refreshGrid();
            }
        }
    });

    root.addEventListener('contextmenu', (e) => {
        const target = e.target.closest('[data-role="tubs-cell"]');
        if (target) {
            e.preventDefault();
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            section.tracks[parseInt(target.dataset.trackIndex)].strokes[parseInt(target.dataset.stepIndex)] = StrokeType.None;
            refreshGrid();
        }
    });

    root.addEventListener('input', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (!action) return;

        // Safety check for state.toque
        if (!state.toque) return;

        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        if (!section) return;

        if (action === 'update-global-bpm') {
            state.toque.globalBpm = Number(target.value);
            if (!section.bpm) playback.currentPlayheadBpm = state.toque.globalBpm;

            // Direct DOM update for performance
            const display = document.getElementById('header-global-bpm');
            if (display) display.innerHTML = `${state.toque.globalBpm} <span class="text-[9px] text-gray-600">BPM</span>`;
        }

        if (action === 'update-volume') {
            section.tracks[parseInt(target.dataset.trackIndex)].volume = parseFloat(target.value);
        }

        if (action === 'update-bpm') {
            section.bpm = Number(target.value);
            playback.currentPlayheadBpm = section.bpm;
        }

        if (action === 'update-acceleration') {
            section.tempoAcceleration = parseFloat(target.value);
        }
    });

    root.addEventListener('change', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (!action) return;
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);

        if (action === 'update-global-bpm') {
            state.toque.globalBpm = Number(target.value);
            if (!section.bpm) playback.currentPlayheadBpm = state.toque.globalBpm;
            renderApp();
        }
        if (action === 'update-section-name') {
            section.name = target.value;
            renderApp();
        }
        if (action === 'update-time-sig') {
            section.timeSignature = target.value;
            if (section.timeSignature === '6/8') { section.steps = 12; section.subdivision = 3; }
            if (section.timeSignature === '4/4') { section.steps = 16; section.subdivision = 4; }
            if (section.timeSignature === '12/8') { section.steps = 24; section.subdivision = 3; }
            actions.resizeTracks(section);
            refreshGrid();
            renderApp();
        }
        if (action === 'update-steps') {
            section.steps = Number(target.value);
            actions.resizeTracks(section);
            refreshGrid();
            renderApp();
        }
        if (action === 'update-repetitions') {
            section.repetitions = Math.max(1, Number(target.value));
            renderApp();
        }
        if (action === 'update-bpm') {
            section.bpm = Number(target.value);
            playback.currentPlayheadBpm = section.bpm;
        }
        if (action === 'update-acceleration') {
            section.tempoAcceleration = parseFloat(target.value);
            renderApp();
        }
        if (action === 'update-volume') {
            section.tracks[parseInt(target.dataset.trackIndex)].volume = parseFloat(target.value);
        }
        if (action === 'update-rhythm-name') {
            state.toque.name = target.value;
        }
    });

    document.addEventListener('timeline-select', (e) => actions.updateActiveSection(e.detail));

    // Drag and Drop
    let draggedIndex = null;
    root.addEventListener('dragstart', (e) => {
        const item = e.target.closest('[data-role="timeline-item"]');
        if (item) {
            draggedIndex = parseInt(item.dataset.index);
            e.dataTransfer.effectAllowed = 'move';
        } else {
            e.preventDefault();
        }
    });
    root.addEventListener('dragover', (e) => e.preventDefault());
    root.addEventListener('drop', (e) => {
        const item = e.target.closest('[data-role="timeline-item"]');
        if (item && draggedIndex !== null) {
            const targetIndex = parseInt(item.dataset.index);
            if (draggedIndex !== targetIndex) {
                const moved = state.toque.sections.splice(draggedIndex, 1)[0];
                state.toque.sections.splice(targetIndex, 0, moved);
                renderApp();
            }
            draggedIndex = null;
        }
    });
};