/*
  js/events/mobileEvents.js
  Mobile-specific event handler setup.
  REFACTORED: Now delegates to modular handler functions.
*/

import { state, playback, commit } from '../store.js';
import { getActiveSection, formatRhythmName } from '../store/stateSelectors.js';
import { actions } from '../actions.js';
import { togglePlay, stopPlayback } from '../services/sequencer.js';
import { eventBus } from '../services/eventBus.js';
import { viewManager } from '../views/viewManager.js';
import { audioEngine } from '../services/audioEngine.js';
import { trackMixer } from '../services/trackMixer.js';
import { setupPointerDrags, consumeSliderClickGuard } from '../ui/pointerDrag.js';
import { updateVolumeSliderVisuals, updateBpmSliderVisuals } from '../ui/sliderVisuals.js';
import { getValidInstrumentSteps } from '../utils/gridUtils.js';

// Import modular handlers
import * as playbackHandlers from './handlers/playbackEvents.js';
import * as menuHandlers from './handlers/menuEvents.js';
import * as modalHandlers from './handlers/modalEvents.js';
import * as bataHandlers from './handlers/bataExplorerEvents.js';

/**
 * List of actions allowed on mobile (subset of desktop)
 */
const MOBILE_ALLOWED_ACTIONS = [
    'toggle-play', 'stop', 'toggle-menu', 'close-menu', 'load-rhythm',
    'select-rhythm-confirm', 'toggle-mute', 'update-global-bpm', 'toggle-folder',
    'update-volume', 'close-modal', 'close-modal-bg', 'open-structure', 'open-view-mode', 'select-view-mode',
    'toggle-user-guide-submenu', 'open-user-guide', 'share-rhythm', 'toggle-count-in',
    // Player view section navigation
    'player-prev-section', 'player-next-section', 'toggle-mixer-sheet',
    // Section dropdown
    'toggle-section-dropdown', 'select-section-item',
    // Dashboard (P2) grid overlay
    'toggle-grid-overlay',
    // Dashboard Playlist (P2c) actions
    'playlist-select-section', 'playlist-play-pause-active',
    // P3 Toolbar Actions
    'toggle-toolbar-drawer',
    'chip-toggle-popover', 'chip-close-popover', 'chip-update-rep', 'chip-toggle-random', 'chip-select-section',
    'toggle-gestures-bpm', 'toggle-gestures-mixer', 'toggle-gestures-sections',
    // Dimension B Action
    'toggle-dim-b-mode',
    // BataExplorer actions
    'close-bata-explorer', 'close-bata-explorer-bg', 'toggle-filter-dropdown',
    'toggle-orisha-filter', 'remove-orisha-filter', 'toggle-type-filter',
    'remove-type-filter', 'clear-bata-filters', 'select-toque', 'close-toque-details',
    'load-toque-confirm',
    // Dual Mode actions
    'dual-mode-toggle-popover', 'dual-mode-close-popover',
    'dual-mode-bpm-step', 'dual-mode-vol-step', 'dual-mode-solo',
    'dual-mode-select-section', 'dual-mode-rep-step', 'dual-mode-set-reps', 'dual-mode-toggle-random',
    'dual-mode-cycle-colour', 'dual-mode-prev-section', 'dual-mode-next-section',
    'dual-mode-set-accel-unit', 'dual-mode-set-accel-tenth'
];

/**
 * Handle mobile share rhythm (uses native share API if available)
 */
const handleMobileShareRhythm = () => {
    if (state.rhythmSource === 'repo' && state.currentRhythmId) {
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?rhythm=${encodeURIComponent(state.currentRhythmId)}`;

        if (navigator.share) {
            navigator.share({
                title: state.toque?.name || 'Percussion Studio Rhythm',
                text: `Check out this rhythm: ${state.toque?.name}`,
                url: shareUrl
            }).catch((err) => {
                if (err.name === 'AbortError') return;
                navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
            });
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert(`Link copied to clipboard!\n\n${shareUrl}`);
            }).catch(() => {
                prompt('Copy this link:', shareUrl);
            });
        }
    }
    commit('setMenuOpen', { isOpen: false });
    eventBus.emit('render');
};

/**
 * Handle select rhythm confirm (mobile-specific with loading screen)
 */
const handleMobileSelectRhythmConfirm = (target) => {
    const rhythmId = target.dataset.rhythmId;
    const rhythmName = formatRhythmName(rhythmId);

    commit('setModal', { open: false });
    commit('setLoadingRhythm', { isLoading: true, name: rhythmName });
    eventBus.emit('render');

    actions.loadRhythm(rhythmId).then(() => {
        commit('setLoadingRhythm', { isLoading: false });
        eventBus.emit('render');
    }).catch(() => {
        commit('setLoadingRhythm', { isLoading: false });
        eventBus.emit('render');
    });
};

/**
 * Handle load toque confirm (mobile-specific with loading screen)
 */
const handleMobileLoadToqueConfirm = (target) => {
    const toqueId = target.dataset.toqueId;
    const rhythmName = formatRhythmName(toqueId);

    state.uiState.bataExplorer.isOpen = false;
    commit('setLoadingRhythm', { isLoading: true, name: rhythmName });
    eventBus.emit('render');

    actions.loadRhythm(toqueId).then(() => {
        state.uiState.bataExplorer.selectedToqueId = null;
        state.uiState.bataExplorer.selectedOrishas = [];
        state.uiState.bataExplorer.selectedTypes = [];
        state.uiState.bataExplorer.searchTerm = '';
        commit('setLoadingRhythm', { isLoading: false });
        eventBus.emit('render');
    }).catch(() => {
        commit('setLoadingRhythm', { isLoading: false });
        eventBus.emit('render');
    });
};

/**
 * Create mobile action router
 */
const createMobileActionRouter = () => ({
    // Playback
    'toggle-play': () => togglePlay(),
    'stop': () => stopPlayback(),
    'toggle-count-in': playbackHandlers.handleToggleCountIn,

    // Section dropdown
    'toggle-section-dropdown': () => {
        state.uiState.sectionDropdownOpen = !state.uiState.sectionDropdownOpen;
        eventBus.emit('render');
    },
    'select-section-item': (e, target) => {
        const sectionId = target.dataset.sectionId;
        if (sectionId) {
            state.uiState.sectionDropdownOpen = false;
            document.dispatchEvent(new CustomEvent('timeline-select', { detail: sectionId }));
        }
    },

    // Menu
    'toggle-menu': () => {
        state.uiState.isMenuOpen = !state.uiState.isMenuOpen;
        state.uiState.userGuideSubmenuOpen = false;
        state.uiState.sectionDropdownOpen = false;
        eventBus.emit('render');
    },
    'close-menu': (e, target) => {
        if (target.tagName === 'DIV' && e.target !== target) return;
        state.uiState.isMenuOpen = false;
        state.uiState.userGuideSubmenuOpen = false;
        state.uiState.sectionDropdownOpen = false;
        eventBus.emit('render');
    },
    'toggle-user-guide-submenu': menuHandlers.handleToggleUserGuideSubmenu,
    'open-user-guide': (e, target) => modalHandlers.handleOpenUserGuide(target, true), // isMobile = true
    'share-rhythm': handleMobileShareRhythm,

    // Load rhythm
    'load-rhythm': menuHandlers.handleLoadRhythm,
    'toggle-folder': (e, target) => modalHandlers.handleToggleFolder(target),
    'select-rhythm-confirm': (e, target) => handleMobileSelectRhythmConfirm(target),

    // Bata Explorer
    'close-bata-explorer': () => bataHandlers.handleCloseBataExplorer(),
    'close-bata-explorer-bg': (e, target) => { if (e.target === target) bataHandlers.handleCloseBataExplorer(); },
    'toggle-filter-dropdown': (e, target) => bataHandlers.handleToggleFilterDropdown(target),
    'toggle-orisha-filter': (e, target) => bataHandlers.handleToggleOrishaFilter(target),
    'remove-orisha-filter': (e, target) => bataHandlers.handleRemoveOrishaFilter(target),
    'toggle-type-filter': (e, target) => bataHandlers.handleToggleTypeFilter(target),
    'remove-type-filter': (e, target) => bataHandlers.handleRemoveTypeFilter(target),
    'clear-bata-filters': () => bataHandlers.handleClearBataFilters(),
    'select-toque': (e, target) => bataHandlers.handleSelectToque(target),
    'close-toque-details': () => bataHandlers.handleCloseToqueDetails(),
    'load-toque-confirm': (e, target) => handleMobileLoadToqueConfirm(target),

    // Mute/Track controls - delegates to trackMixer
    'toggle-mute': (e, target) => {
        const section = getActiveSection(state);
        const tIdx = parseInt(target.dataset.trackIndex);
        const mIdx = parseInt(target.dataset.measureIndex || 0);
        const track = section?.measures[mIdx]?.tracks[tIdx];
        if (!track) return;

        trackMixer.toggleMute(tIdx, track, track.instrument);
        eventBus.emit('render');
    },

    // Structure modal
    'open-structure': () => {
        state.uiState.isMenuOpen = false;
        state.uiState.modalType = 'structure';
        state.uiState.modalOpen = true;
        eventBus.emit('render');
    },

    // View Mode modal
    'open-view-mode': () => {
        state.uiState.isMenuOpen = false;
        state.uiState.modalType = 'viewMode';
        state.uiState.modalOpen = true;
        eventBus.emit('render');
    },

    // Select a view mode — switch views for implemented proposals
    'select-view-mode': (e, target) => {
        const viewId = target.dataset.viewId;
        const VIEW_MAP = {
            'standard': 'mobile-grid',
            'dim-d': 'mobile-dual-mode'
        };
        const mappedViewId = VIEW_MAP[viewId];
        if (mappedViewId) {
            viewManager.setActiveView(mappedViewId);
        }
        state.uiState.modalOpen = false;
        eventBus.emit('render');
    },

    // Dimension B specific toggles
    'toggle-dim-b-mode': (e, target) => {
        const mode = target.dataset.mode;
        if (mode === 'play' || mode === 'view') {
            state.uiState.dimensionBMode = mode;
            if (mode === 'view' && state.isPlaying) {
                stopPlayback();
            }
            eventBus.emit('render');
        }
    },

    // ── Dual Mode actions ─────────────────────────────────────────────────

    // Toggle a chip popover (BPM / Mixer / Section)
    'dual-mode-toggle-popover': (e, target) => {
        const popoverId = target.dataset.popoverId;
        if (state.uiState.dualModePopover === popoverId) {
            state.uiState.dualModePopover = null;
            if (popoverId === 'prac-section') {
                state.uiState.dualModePortraitSectionModal = false;
            }
        } else {
            state.uiState.dualModePopover = popoverId;
            if (popoverId === 'prac-section') {
                state.uiState.dualModePortraitSectionModal = true;
            }
        }
        eventBus.emit('render');
    },

    // Close any open chip popover
    'dual-mode-close-popover': () => {
        state.uiState.dualModePopover = null;
        state.uiState.dualModePortraitSectionModal = false;
        eventBus.emit('render');
    },

    // Step BPM up/down from the dual-mode BPM chip modal
    'dual-mode-bpm-step': (e, target) => {
        const delta = parseInt(target.dataset.delta, 10);
        if (!isNaN(delta)) {
            const newBpm = Math.max(40, Math.min(240, Math.round(playback.currentPlayheadBpm || 120) + delta));
            state.toque.globalBpm = newBpm;
            playback.currentPlayheadBpm = newBpm;
            playback.userHasOverriddenBpm = true;
            eventBus.emit('render');
        }
    },

    // Step volume up/down from the dual-mode Mixer chip modal.
    // Routes through the central setMixVolume action — state.mix is the
    // single source of truth, so the slider position updates on the
    // next render without any manual DOM patching.
    'dual-mode-vol-step': (e, target) => {
        const trackIdx = parseInt(target.dataset.trackIndex, 10);
        const delta = parseFloat(target.dataset.delta);
        if (isNaN(trackIdx) || isNaN(delta)) return;
        const section = getActiveSection(state);
        const track = section?.measures[0]?.tracks[trackIdx];
        if (!track) return;
        const currentVolume = state.mix[track.instrument]?.volume ?? 1.0;
        const newVolume = Math.max(0, Math.min(1, currentVolume + delta));
        actions.setMixVolume(track.instrument, newVolume);
    },

    // Toggle solo on a track - delegates to trackMixer
    'dual-mode-solo': (e, target) => {
        const section = getActiveSection(state);
        const trackIdx = parseInt(target.dataset.trackIndex, 10);
        const track = section?.measures[0]?.tracks[trackIdx];
        if (isNaN(trackIdx) || !track) return;

        trackMixer.toggleSolo(trackIdx, track, track.instrument);
        eventBus.emit('render');
    },

    // Select a section via the dual-mode chips modal
    'dual-mode-select-section': (e, target) => {
        const sectionId = target.dataset.sectionId;
        if (sectionId) {
            document.dispatchEvent(new CustomEvent('timeline-select', { detail: sectionId }));
            state.uiState.dualModePopover = null;
            state.uiState.dualModePortraitSectionModal = false;
        }
    },

    // Navigate to the previous section (top-bar chevron and swipe right)
    'dual-mode-prev-section': () => {
        if (!state.toque) return;
        const sections = state.toque.sections;
        const idx = sections.findIndex(s => s.id === state.activeSectionId);
        if (idx > 0) {
            document.dispatchEvent(new CustomEvent('timeline-select', { detail: sections[idx - 1].id }));
        }
    },

    // Navigate to the next section (top-bar chevron and swipe left)
    'dual-mode-next-section': () => {
        if (!state.toque) return;
        const sections = state.toque.sections;
        const idx = sections.findIndex(s => s.id === state.activeSectionId);
        if (idx < sections.length - 1) {
            document.dispatchEvent(new CustomEvent('timeline-select', { detail: sections[idx + 1].id }));
        }
    },

    // Step repetitions for a section from the dual-mode section modal
    'dual-mode-rep-step': (e, target) => {
        const sectionId = target.dataset.sectionId;
        const delta = parseInt(target.dataset.delta, 10);
        const section = state.toque.sections.find(s => s.id === sectionId);
        if (section) {
            section.repetitions = Math.max(1, (section.repetitions || 1) + delta);
            eventBus.emit('render');
        }
    },

    // Toggle random repetitions switch
    'dual-mode-toggle-random': (e, target) => {
        const sectionId = target.dataset.sectionId;
        const section = state.toque.sections.find(s => s.id === sectionId);
        if (section) {
            section.random = !section.random;
            eventBus.emit('render');
        }
    },

    // Set acceleration value via dual wheel (units)
    'dual-mode-set-accel-unit': (e, target) => {
        const sectionId = target.dataset.sectionId;
        const section = state.toque.sections.find(s => s.id === sectionId);
        if (section) {
            const unit = parseInt(target.value, 10) || 0;
            const currentTenth = Math.round(Math.abs(((section.tempoAcceleration || 0) - Math.trunc(section.tempoAcceleration || 0)) * 10));
            const sign = unit < 0 ? -1 : 1;
            section.tempoAcceleration = Math.max(-10, Math.min(10, sign * (Math.abs(unit) + currentTenth / 10)));
            eventBus.emit('render');
        }
    },

    // Set acceleration value via dual wheel (tenths)
    'dual-mode-set-accel-tenth': (e, target) => {
        const sectionId = target.dataset.sectionId;
        const section = state.toque.sections.find(s => s.id === sectionId);
        if (section) {
            const tenth = parseInt(target.value, 10) || 0;
            const currentUnit = Math.trunc(section.tempoAcceleration || 0);
            const sign = currentUnit < 0 ? -1 : 1;
            section.tempoAcceleration = Math.max(-10, Math.min(10, sign * (Math.abs(currentUnit) + tenth / 10)));
            eventBus.emit('render');
        }
    },

    // Cycle subdivision on the landscape grid by tapping instrument name
    'dual-mode-cycle-colour': (e, target) => {
        const section = getActiveSection(state);
        const trackIdx = parseInt(target.dataset.trackIndex);
        const measureIdx = parseInt(target.dataset.measureIndex || 0);
        const track = section.measures[measureIdx].tracks[trackIdx];

        const currentSteps = track.trackSteps || section.subdivision || 4;
        const validOptions = getValidInstrumentSteps(section.steps);
        const currentIndex = validOptions.indexOf(currentSteps);
        const nextIndex = (currentIndex + 1) % validOptions.length;
        const newSteps = validOptions[nextIndex];

        actions.updateTrackSteps(trackIdx, measureIdx, newSteps);
        eventBus.emit('render');
    },

    // Toolbar drawer toggle (P3 view)
    'toggle-toolbar-drawer': () => {
        const drawer = document.getElementById('toolbar-drawer');
        const chevron = document.getElementById('drawer-chevron');
        if (drawer) {
            const isClosed = drawer.classList.contains('translate-y-[calc(100%-48px)]');
            if (isClosed) {
                drawer.classList.remove('translate-y-[calc(100%-48px)]');
                drawer.classList.add('translate-y-0');
                if (chevron) chevron.classList.add('rotate-180');
            } else {
                drawer.classList.remove('translate-y-0');
                drawer.classList.add('translate-y-[calc(100%-48px)]');
                if (chevron) chevron.classList.remove('rotate-180');
            }
        }
    },

    // Toolbar Gestures toggle panels (P3b view)
    'toggle-gestures-bpm': () => {
        const sheet = document.getElementById('gestures-bpm-sheet');
        if (sheet) {
            const isOpen = !sheet.classList.contains('translate-y-full');
            if (isOpen) {
                sheet.classList.add('translate-y-full');
                sheet.style.pointerEvents = 'none';
            } else {
                sheet.classList.remove('translate-y-full');
                sheet.style.pointerEvents = 'auto';
            }
        }
    },
    'toggle-gestures-mixer': () => {
        const sheet = document.getElementById('gestures-mixer-sheet');
        if (sheet) {
            const isOpen = !sheet.classList.contains('translate-x-full');
            if (isOpen) {
                sheet.classList.add('translate-x-full');
                sheet.style.pointerEvents = 'none';
            } else {
                sheet.classList.remove('translate-x-full');
                sheet.style.pointerEvents = 'auto';
            }
        }
    },
    'toggle-gestures-sections': () => {
        const sheet = document.getElementById('gestures-sections-sheet');
        if (sheet) {
            const isOpen = !sheet.classList.contains('-translate-x-full');
            if (isOpen) {
                sheet.classList.add('-translate-x-full');
                sheet.style.pointerEvents = 'none';
            } else {
                sheet.classList.remove('-translate-x-full');
                sheet.style.pointerEvents = 'auto';
            }
        }
    },

    // Toolbar P3a chips popovers
    'chip-toggle-popover': (e, target) => {
        const popoverId = target.dataset.popoverId;
        if (state.uiState.activeChipPopover === popoverId) {
            state.uiState.activeChipPopover = null;
        } else {
            state.uiState.activeChipPopover = popoverId;
        }
        eventBus.emit('render');
    },
    'chip-close-popover': () => {
        state.uiState.activeChipPopover = null;
        eventBus.emit('render');
    },
    'chip-update-rep': (e, target) => {
        const delta = parseInt(target.dataset.delta, 10);
        const section = getActiveSection(state);
        const currentReps = section.repetitions || 1;
        actions.updateSectionSettings(section.id, { repetitions: Math.max(1, currentReps + delta) });
    },
    'chip-toggle-random': () => {
        // Placeholder for random sequence UI
        eventBus.emit('render');
    },
    'chip-select-section': (e, target) => {
        const sectionId = target.dataset.sectionId;
        if (sectionId) {
            document.dispatchEvent(new CustomEvent('timeline-select', { detail: sectionId }));
            state.uiState.activeChipPopover = null;
        }
    },

    // Mixer sheet toggle (P1a view)
    'toggle-mixer-sheet': () => {
        const sheet = document.getElementById('mixer-sheet');
        if (sheet) {
            const isOpen = !sheet.classList.contains('translate-y-full');
            if (isOpen) {
                sheet.classList.add('translate-y-full');
                sheet.style.pointerEvents = 'none';
            } else {
                sheet.classList.remove('translate-y-full');
                sheet.style.pointerEvents = 'auto';
            }
        }
    },

    // Dashboard (P2) grid overlay toggle
    'toggle-grid-overlay': (e, target) => {
        // If a section id is provided, switch to that section first
        const sectionId = target?.dataset?.sectionId;
        if (sectionId) {
            document.dispatchEvent(new CustomEvent('timeline-select', { detail: sectionId }));
        }
        state.uiState.dashboardGridOpen = !state.uiState.dashboardGridOpen;
        eventBus.emit('render');
    },

    // Dashboard Playlist (P2c) actions
    'playlist-select-section': (e, target) => {
        const sectionId = target.dataset.sectionId;
        if (sectionId && sectionId !== state.activeSectionId) {
            document.dispatchEvent(new CustomEvent('timeline-select', { detail: sectionId }));
        } else if (sectionId === state.activeSectionId) {
            // If tapping already active section, toggle playback
            togglePlay();
        }
    },
    'playlist-play-pause-active': () => {
        togglePlay();
    },

    // Player view: previous section
    'player-prev-section': () => {
        const sections = state.toque.sections;
        const currentIdx = sections.findIndex(s => s.id === state.activeSectionId);
        if (currentIdx > 0) {
            document.dispatchEvent(new CustomEvent('timeline-select', { detail: sections[currentIdx - 1].id }));
        } else if (sections.length > 1) {
            // Wrap to last
            document.dispatchEvent(new CustomEvent('timeline-select', { detail: sections[sections.length - 1].id }));
        }
    },

    // Player view: next section
    'player-next-section': () => {
        const sections = state.toque.sections;
        const currentIdx = sections.findIndex(s => s.id === state.activeSectionId);
        if (currentIdx < sections.length - 1) {
            document.dispatchEvent(new CustomEvent('timeline-select', { detail: sections[currentIdx + 1].id }));
        } else if (sections.length > 1) {
            // Wrap to first
            document.dispatchEvent(new CustomEvent('timeline-select', { detail: sections[0].id }));
        }
    },

    // Close modal
    'close-modal': () => modalHandlers.handleCloseModal(),
    'close-modal-bg': (e, target) => { if (e.target === target) modalHandlers.handleCloseModal(); },
});

export const setupMobileEvents = () => {
    const root = document.getElementById('root');
    const actionRouter = createMobileActionRouter();

    // Click handler
    root.addEventListener('click', (e) => {
        // Resume Audio Context (Mobile Fix)
        audioEngine.init();
        audioEngine.resume();

        // Consume the release-tap after a slider drag (armed by the
        // pointer drag machinery) so it can't close an open popover
        // via the backdrop common-ancestor click.
        if (consumeSliderClickGuard()) {
            return;
        }

        const target = e.target.closest('[data-action], [data-role]');
        if (!target) return;

        const action = target.dataset.action;

        // Check if action is allowed on mobile
        if (!MOBILE_ALLOWED_ACTIONS.includes(action)) return;

        // Route to handler if exists
        if (action && actionRouter[action]) {
            actionRouter[action](e, target);
        }
    });

    // Input handler (volume, BPM, search)
    root.addEventListener('input', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (!action) return;

        if (action === 'bata-search-input') {
            bataHandlers.handleBataSearchInput(target);
            return;
        }

        if (action === 'update-volume') {
            const section = getActiveSection(state);
            const tIdx = parseInt(target.dataset.trackIndex);
            const newVolume = parseFloat(target.value);
            const track = section?.measures[0]?.tracks[tIdx];
            if (track) {
                // Mark drag in progress so setMixVolume suppresses grid-refresh
                window.__volumeDragging = true;

                // Route through the central setMixVolume action —
                // state.mix[symbol].volume is the single source of truth
                // for both the slider and the audio engine gain node.
                actions.setMixVolume(track.instrument, newVolume);

                // Direct DOM update for instant visual feedback (no re-render
                // during drag). On touchend/mouseup the document-level handler
                // emits a single grid-refresh that rebuilds every surface
                // from state.mix — the slider is then provably in sync.
                const volContainer = target.closest('.group\\/vol');
                if (volContainer) {
                    updateVolumeSliderVisuals(volContainer, newVolume);
                }
                const pct = Math.round(newVolume * 100);
                const portraitFill = document.getElementById(`portrait-vol-fill-${tIdx}`);
                const portraitThumb = document.getElementById(`portrait-vol-thumb-${tIdx}`);
                if (portraitFill) portraitFill.style.width = `${pct}%`;
                if (portraitThumb) portraitThumb.style.left = `calc(${pct}% - 8px)`;

                // Direct DOM update of the outside pct text — mirrors the
                // desktop pattern in gridEvents.js:144-146. The input handler
                // is the single update point for this surface, called on every
                // input event (drag tick, keyboard, programmatic dispatch).
                const outsidePct = volContainer?.parentElement?.querySelector('[data-role="volume-pct-outside"]');
                if (outsidePct) outsidePct.textContent = `${pct}%`;
            }
            return;
        }

        if (action === 'update-global-bpm') {
            const newBpm = Number(target.value);
            state.toque.globalBpm = newBpm;
            playback.currentPlayheadBpm = newBpm;
            playback.userHasOverriddenBpm = true;
            const display = document.getElementById('header-global-bpm');
            if (display) display.innerHTML = `${newBpm} <span class="text-[8px] text-gray-600">BPM</span>`;

            // Direct DOM update for BPM slider visual feedback
            const bpmContainer = target.closest('.group\\/bpm');
            if (bpmContainer) {
                updateBpmSliderVisuals(bpmContainer, newBpm);
            }

            // Update portrait BPM slider if present
            const portraitFill = document.getElementById('portrait-bpm-fill');
            const portraitThumb = document.getElementById('portrait-bpm-thumb');
            const portraitLabel = document.getElementById('portrait-bpm-label');
            const pct = ((newBpm - 40) / 200) * 100;
            if (portraitFill) portraitFill.style.width = pct + '%';
            if (portraitThumb) portraitThumb.style.left = 'calc(' + pct + '% - ' + (portraitThumb.offsetWidth / 2) + 'px)';
            if (portraitLabel) portraitLabel.innerHTML = newBpm + ' <span class="text-[10px]">bpm</span>';

            // Update BPM modal if open (bpmModal.js)
            const modalValue = document.getElementById('bpm-modal-value');
            const modalFill = document.getElementById('bpm-modal-fill');
            const modalThumb = document.getElementById('bpm-modal-thumb');
            if (modalValue) modalValue.textContent = newBpm + ' BPM';
            if (modalFill) modalFill.style.width = pct + '%';
            if (modalThumb) modalThumb.style.left = 'calc(' + pct + '% - ' + (modalThumb.offsetWidth / 2) + 'px)';
        }
    });

    // Change handler (BPM / Volume finalize on touchend, Native Select Wheel)
    root.addEventListener('change', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (action === 'update-global-bpm') {
            const newBpm = Number(target.value);
            state.toque.globalBpm = newBpm;
            playback.currentPlayheadBpm = newBpm;
            playback.userHasOverriddenBpm = true;
            eventBus.emit('render');
        }
        if (action === 'update-volume') {
            // Volume was already written to state.mix on every input event.
            // The change event here just signals the drag ended — clear
            // the dragging flag and emit a single grid-refresh so every
            // surface rebuilds from state.mix (the source of truth).
            window.__volumeDragging = false;
            eventBus.emit('grid-refresh');
        }
        if (action === 'dual-mode-set-reps') {
            const sectionId = target.dataset.sectionId;
            const reps = parseInt(target.value, 10);
            const section = state.toque.sections.find(s => s.id === sectionId);
            if (section && !isNaN(reps)) {
                section.repetitions = Math.max(1, reps);
                eventBus.emit('render');
            }
        }
    });

    // Timeline section select
    document.addEventListener('timeline-select', (e) => {
        actions.updateActiveSection(e.detail);
        state.uiState.isMenuOpen = false;
        state.uiState.modalOpen = false;
        eventBus.emit('render');
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

    // Orientation change / resize handler
    // Re-render when viewport dimensions change (e.g., rotation from portrait to landscape)
    let resizeTimeout = null;
    window.addEventListener('resize', () => {
        // Debounce to avoid multiple rapid re-renders during rotation animation
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            eventBus.emit('render');
        }, 100);
    });

    // Unified slider drag machinery (Pointer Events)
    setupPointerDrags(root);
};
