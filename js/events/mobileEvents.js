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
    // BataExplorer actions
    'close-bata-explorer', 'close-bata-explorer-bg', 'toggle-filter-dropdown',
    'toggle-orisha-filter', 'remove-orisha-filter', 'toggle-type-filter',
    'remove-type-filter', 'clear-bata-filters', 'select-toque', 'close-toque-details',
    'load-toque-confirm'
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

    // Mute/Track controls
    'toggle-mute': (e, target) => {
        const section = getActiveSection(state);
        const tIdx = parseInt(target.dataset.trackIndex);
        const track = section?.measures[0]?.tracks[tIdx];
        if (track) {
            const newMutedState = !track.muted;
            actions.setGlobalMute(track.instrument, newMutedState);
        }
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
            'p1': 'mobile-player',
            'p1a': 'mobile-player-mixer',
            'p1b': 'mobile-player-knob',
            'p1c': 'mobile-player-focus',
            'p2': 'mobile-dashboard',
            'p2a': 'mobile-dashboard-stack',
            'p2b': 'mobile-dashboard-split-card',
            'p2c': 'mobile-dashboard-playlist',
            'p3': 'mobile-toolbar',
            'p3a': 'mobile-toolbar-chips',
            'p3b': 'mobile-toolbar-gestures'
        };
        const mappedViewId = VIEW_MAP[viewId];
        if (mappedViewId) {
            viewManager.setActiveView(mappedViewId);
        }
        state.uiState.modalOpen = false;
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
                // During touch drag: update state + audio directly, skip full re-render
                // (mirrors the BPM slider pattern for smooth mobile interaction)
                commit('ensureMixEntry', { symbol: track.instrument });
                commit('setMixVolume', { symbol: track.instrument, volume: newVolume });
                audioEngine.setInstrumentVolume(track.instrument, newVolume);
                commit('propagateMixToTracks', {
                    symbol: track.instrument,
                    volume: state.mix[track.instrument].volume,
                    muted: state.mix[track.instrument].muted
                });

                // Direct DOM update for visual feedback (no re-render)
                const volContainer = target.closest('.group\\/vol');
                if (volContainer) {
                    updateVolumeSliderVisuals(volContainer, newVolume);
                }
            }
            return;
        }

        if (action === 'update-global-bpm') {
            state.toque.globalBpm = Number(target.value);
            const section = getActiveSection(state);
            if (!section?.bpm) playback.currentPlayheadBpm = state.toque.globalBpm;
            const display = document.getElementById('header-global-bpm');
            if (display) display.innerHTML = `${state.toque.globalBpm} <span class="text-[8px] text-gray-600">BPM</span>`;

            // Direct DOM update for BPM slider visual feedback
            const bpmContainer = target.closest('.group\\/bpm');
            if (bpmContainer) {
                updateBpmSliderVisuals(bpmContainer, state.toque.globalBpm);
            }
        }
    });

    // Change handler (BPM / Volume finalize on touchend)
    root.addEventListener('change', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (action === 'update-global-bpm') {
            state.toque.globalBpm = Number(target.value);
            const section = getActiveSection(state);
            if (!section?.bpm) playback.currentPlayheadBpm = state.toque.globalBpm;
            eventBus.emit('render');
        }
        if (action === 'update-volume') {
            // Full re-render on drag end to sync all visuals
            eventBus.emit('render');
        }
    });

    // BPM slider touch drag tracking for smooth mobile interaction
    let activeBpmContainer = null;
    let activeBpmInput = null;

    // Volume slider touch drag tracking
    let activeVolContainer = null;
    let activeVolInput = null;

    // Circular tempo knob drag tracking
    let activeKnobEl = null;

    // ─── Knob math helpers ──────────────────────────────────────
    const KNOB_START_ANGLE = 135;  // degrees (bottom-left)
    const KNOB_ARC_SPAN = 270;    // 270° arc
    const BPM_MIN = 40;
    const BPM_MAX = 240;

    /**
     * Convert a screen touch/mouse position to a BPM value based on
     * the angle relative to the knob center.
     */
    function knobPositionToBpm(clientX, clientY, knobEl) {
        const rect = knobEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clientX - cx;
        const dy = clientY - cy;

        // atan2 gives angle in radians from positive-x axis; convert to degrees
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        // Normalize to 0–360
        if (angle < 0) angle += 360;

        // Map from our arc range (135°–405°) to a 0–1 fraction
        // The arc goes clockwise from 135° (bottom-left) to 405° (= 45° bottom-right)
        let mapped = angle;
        // Angles 0–45° correspond to 360–405° in our arc
        if (mapped < KNOB_START_ANGLE) mapped += 360;

        let fraction = (mapped - KNOB_START_ANGLE) / KNOB_ARC_SPAN;
        fraction = Math.max(0, Math.min(1, fraction));

        return Math.round(BPM_MIN + fraction * (BPM_MAX - BPM_MIN));
    }

    /**
     * Apply a new BPM from knob interaction (direct DOM + state update, no re-render)
     */
    function applyKnobBpm(bpm) {
        state.toque.globalBpm = bpm;
        const section = getActiveSection(state);
        if (!section?.bpm) playback.currentPlayheadBpm = bpm;
        // Update BPM display
        const display = document.getElementById('header-global-bpm');
        if (display) display.textContent = bpm;
        // Update the hidden range input for consistency
        const rangeInput = document.querySelector('#tempo-knob input[data-action="update-global-bpm"]');
        if (rangeInput) rangeInput.value = bpm;
    }

    root.addEventListener('touchstart', (e) => {
        // 0. Check for Circular Tempo Knob
        const knobEl = e.target.closest('#tempo-knob');
        if (knobEl) {
            activeKnobEl = knobEl;
            window.__bpmDragging = true;
            const touch = e.touches[0];
            const newBpm = knobPositionToBpm(touch.clientX, touch.clientY, knobEl);
            applyKnobBpm(newBpm);
            e.preventDefault();
            return;
        }

        // 1. Check for BPM Slider
        const bpmContainer = e.target.closest('.group\\/bpm');
        if (bpmContainer) {
            const bpmInput = bpmContainer.querySelector('input[data-action="update-global-bpm"]');
            if (bpmInput) {
                activeBpmContainer = bpmContainer;
                activeBpmInput = bpmInput;
                window.__bpmDragging = true;

                const touch = e.touches[0];
                const rect = bpmContainer.getBoundingClientRect();
                let percentage = (touch.clientX - rect.left) / rect.width;
                percentage = Math.max(0, Math.min(1, percentage));
                const newBpm = Math.round(40 + percentage * 200);

                bpmInput.value = newBpm;
                bpmInput.dispatchEvent(new Event('input', { bubbles: true }));
                updateBpmSliderVisuals(bpmContainer, newBpm);

                e.preventDefault();
                return;
            }
        }

        // 2. Check for Volume Slider
        const volContainer = e.target.closest('.group\\/vol');
        if (volContainer) {
            const volInput = volContainer.querySelector('input[data-action="update-volume"]');
            if (volInput) {
                activeVolContainer = volContainer;
                activeVolInput = volInput;
                window.__volumeDragging = true;

                const touch = e.touches[0];
                const rect = volContainer.getBoundingClientRect();
                let percentage = (touch.clientX - rect.left) / rect.width;
                percentage = Math.max(0, Math.min(1, percentage));
                // Volume is 0 to 1
                const newVol = parseFloat(percentage.toFixed(2));

                volInput.value = newVol;
                volInput.dispatchEvent(new Event('input', { bubbles: true }));
                updateVolumeSliderVisuals(volContainer, newVol);

                e.preventDefault();
                return;
            }
        }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        // Handle Knob Drag
        if (activeKnobEl) {
            const touch = e.touches[0];
            const newBpm = knobPositionToBpm(touch.clientX, touch.clientY, activeKnobEl);
            applyKnobBpm(newBpm);
        }

        // Handle BPM Drag
        if (activeBpmInput && activeBpmContainer) {
            const touch = e.touches[0];
            const rect = activeBpmContainer.getBoundingClientRect();
            let percentage = (touch.clientX - rect.left) / rect.width;
            percentage = Math.max(0, Math.min(1, percentage));
            const newBpm = Math.round(40 + percentage * 200);

            activeBpmInput.value = newBpm;
            activeBpmInput.dispatchEvent(new Event('input', { bubbles: true }));
            updateBpmSliderVisuals(activeBpmContainer, newBpm);
        }

        // Handle Volume Drag
        if (activeVolInput && activeVolContainer) {
            const touch = e.touches[0];
            const rect = activeVolContainer.getBoundingClientRect();
            let percentage = (touch.clientX - rect.left) / rect.width;
            percentage = Math.max(0, Math.min(1, percentage));
            const newVol = parseFloat(percentage.toFixed(2));

            activeVolInput.value = newVol;
            activeVolInput.dispatchEvent(new Event('input', { bubbles: true }));
            updateVolumeSliderVisuals(activeVolContainer, newVol);
        }
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (activeKnobEl) {
            window.__bpmDragging = false;
            activeKnobEl = null;
            // Full re-render to update the SVG knob arc visuals
            eventBus.emit('render');
        }
        if (activeBpmInput) {
            window.__bpmDragging = false;
            activeBpmInput = null;
            activeBpmContainer = null;
        }
        if (activeVolInput) {
            window.__volumeDragging = false;
            // Dispatch change event to trigger full re-render
            activeVolInput.dispatchEvent(new Event('change', { bubbles: true }));
            activeVolInput = null;
            activeVolContainer = null;
        }
    });

    // ─── Mouse events for tempo knob (desktop) ──────────────────────────
    let mouseKnobEl = null;

    root.addEventListener('mousedown', (e) => {
        const knobEl = e.target.closest('#tempo-knob');
        if (knobEl) {
            mouseKnobEl = knobEl;
            window.__bpmDragging = true;
            const newBpm = knobPositionToBpm(e.clientX, e.clientY, knobEl);
            applyKnobBpm(newBpm);
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (mouseKnobEl) {
            const newBpm = knobPositionToBpm(e.clientX, e.clientY, mouseKnobEl);
            applyKnobBpm(newBpm);
        }
    });

    document.addEventListener('mouseup', () => {
        if (mouseKnobEl) {
            window.__bpmDragging = false;
            mouseKnobEl = null;
            eventBus.emit('render');
        }
    });

    /**
     * Update BPM slider visuals directly (no re-render)
     * @param {HTMLElement} container - The slider container
     * @param {number} bpm - The new BPM value
     */
    function updateBpmSliderVisuals(container, bpm) {
        const percentage = ((bpm - 40) / 200) * 100;
        // Update fill bar
        const fillBar = container.querySelector('div[class*="bg-gradient"]');
        if (fillBar) fillBar.style.width = `${percentage}%`;
        // Update handle position (6px offset for 3x3 handle on mobile)
        const handle = container.querySelector('div[class*="bg-white"]');
        if (handle) handle.style.left = `calc(${percentage}% - 6px)`;
    }

    /**
     * Update Volume slider visuals directly (no re-render)
     * @param {HTMLElement} container - The slider container
     * @param {number} volume - The new volume value (0-1)
     */
    function updateVolumeSliderVisuals(container, volume) {
        const percentage = Math.round(volume * 100);
        // Update fill bar
        const fillBar = container.querySelector('div[class*="bg-gradient"]');
        if (fillBar) fillBar.style.width = `${percentage}%`;
        // Update handle position (8px offset for 4x4 handle - see trackRow.js)
        const handle = container.querySelector('div[class*="bg-white"]');
        if (handle) handle.style.left = `calc(${percentage}% - 8px)`;
        // Update percentage text
        const percentLabel = container.querySelector('span[class*="font-medium"]');
        if (percentLabel) percentLabel.textContent = `${percentage}%`;
    }

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
};
