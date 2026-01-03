import { state, playback } from '../store.js';
import { actions } from '../actions.js';
import { togglePlay, stopPlayback } from '../services/sequencer.js';
import { renderApp, refreshGrid } from '../ui/renderer.js';
import { audioEngine } from '../services/audioEngine.js';

export const setupMobileEvents = () => {
    const root = document.getElementById('root');

    root.addEventListener('click', (e) => {
        // --- Fullscreen & Wake Lock Logic ---
        // (Fullscreen removed by user request)

        // Resume Audio Context (Mobile Fix)
        audioEngine.init();
        audioEngine.resume();
        // ------------------------------------
        // ------------------------------------

        const target = e.target.closest('[data-action], [data-role]');
        if (!target) return;
        const action = target.dataset.action;

        // Allowed actions for mobile
        const allowedActions = [
            'toggle-play', 'stop', 'toggle-menu', 'close-menu', 'load-rhythm',
            'select-rhythm-confirm', 'toggle-mute', 'update-global-bpm',
            'update-volume', 'close-modal', 'close-modal-bg', 'open-structure'
        ];
        if (!allowedActions.includes(action)) return;

        if (action === 'toggle-play') togglePlay();
        if (action === 'stop') stopPlayback();

        if (action === 'toggle-menu') {
            state.uiState.isMenuOpen = !state.uiState.isMenuOpen;
            renderApp();
        }
        if (action === 'close-menu') {
            if (e.target !== target) return; // Prevent closing when clicking content
            state.uiState.isMenuOpen = false;
            renderApp();
        }

        if (action === 'load-rhythm') {
            state.uiState.modalType = 'rhythm';
            state.uiState.modalOpen = true;
            state.uiState.isMenuOpen = false;
            renderApp();
        }

        if (action === 'select-rhythm-confirm') {
            const rhythmId = target.dataset.rhythmId;
            // Mobile: Skip confirmation (Read-Only)
            actions.loadRhythm(rhythmId).then(() => {
                state.uiState.modalOpen = false;
                renderApp();
            });
        }

        if (action === 'toggle-mute') {
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            const tIdx = parseInt(target.dataset.trackIndex);
            // Apply to all measures
            const track = section.measures[0].tracks[tIdx];
            track.muted = !track.muted;

            section.measures.forEach(measure => {
                if (measure.tracks[tIdx]) measure.tracks[tIdx].muted = track.muted;
            });
            refreshGrid();
        }

        if (action === 'open-structure') {
            state.uiState.isMenuOpen = false;
            state.uiState.modalType = 'structure';
            state.uiState.modalOpen = true;
            renderApp();
        }

        if (action === 'close-modal' || (action === 'close-modal-bg' && e.target === target)) {
            state.uiState.modalOpen = false;
            renderApp();
        }
    });

    root.addEventListener('input', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (!action) return;

        // Only allow specific inputs
        if (action !== 'update-global-bpm' && action !== 'update-volume') return;

        const section = state.toque.sections.find(s => s.id === state.activeSectionId);

        if (action === 'update-global-bpm') {
            state.toque.globalBpm = Number(target.value);
            if (!section.bpm) playback.currentPlayheadBpm = state.toque.globalBpm;
            const display = document.getElementById('header-global-bpm');
            if (display) display.innerHTML = `${state.toque.globalBpm} <span class="text-[9px] text-gray-600">BPM</span>`;
        }

        if (action === 'update-volume') {
            const tIdx = parseInt(target.dataset.trackIndex);
            const newVolume = parseFloat(target.value);
            section.measures.forEach(measure => {
                if (measure.tracks[tIdx]) measure.tracks[tIdx].volume = newVolume;
            });
        }
    });

    root.addEventListener('change', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (action === 'update-global-bpm') {
            state.toque.globalBpm = Number(target.value);
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            if (!section.bpm) playback.currentPlayheadBpm = state.toque.globalBpm;
            renderApp();
        }
    });

    document.addEventListener('timeline-select', (e) => {
        actions.updateActiveSection(e.detail);
        state.uiState.isMenuOpen = false;
        state.uiState.modalOpen = false;
        renderApp();
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ') {
            const activeElement = document.activeElement;
            const isInputField = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable
            );
            if (!isInputField) {
                e.preventDefault();
                togglePlay();
            }
        }
    });
};
