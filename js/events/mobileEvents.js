/*
  js/events/mobileEvents.js
  Mobile-specific event handler setup.
  REFACTORED: Now delegates to modular handler functions.
*/

import { state, playback } from '../store.js';
import { actions } from '../actions.js';
import { togglePlay, stopPlayback } from '../services/sequencer.js';
import { renderApp } from '../ui/renderer.js';
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
    'update-volume', 'close-modal', 'close-modal-bg', 'open-structure',
    'toggle-user-guide-submenu', 'open-user-guide', 'share-rhythm', 'toggle-count-in',
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
    state.uiState.isMenuOpen = false;
    renderApp();
};

/**
 * Handle select rhythm confirm (mobile-specific with loading screen)
 */
const handleMobileSelectRhythmConfirm = (target) => {
    const rhythmId = target.dataset.rhythmId;
    const rhythmName = rhythmId.split('/').pop().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    state.uiState.modalOpen = false;
    state.uiState.isLoadingRhythm = true;
    state.uiState.loadingRhythmName = rhythmName;
    renderApp();

    actions.loadRhythm(rhythmId).then(() => {
        state.uiState.isLoadingRhythm = false;
        state.uiState.loadingRhythmName = null;
        renderApp();
    }).catch(() => {
        state.uiState.isLoadingRhythm = false;
        state.uiState.loadingRhythmName = null;
        renderApp();
    });
};

/**
 * Handle load toque confirm (mobile-specific with loading screen)
 */
const handleMobileLoadToqueConfirm = (target) => {
    const toqueId = target.dataset.toqueId;
    const rhythmName = toqueId.split('/').pop().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    state.uiState.bataExplorer.isOpen = false;
    state.uiState.isLoadingRhythm = true;
    state.uiState.loadingRhythmName = rhythmName;
    renderApp();

    actions.loadRhythm(toqueId).then(() => {
        state.uiState.bataExplorer.selectedToqueId = null;
        state.uiState.bataExplorer.selectedOrishas = [];
        state.uiState.bataExplorer.selectedTypes = [];
        state.uiState.bataExplorer.searchTerm = '';
        state.uiState.isLoadingRhythm = false;
        state.uiState.loadingRhythmName = null;
        renderApp();
    }).catch(() => {
        state.uiState.isLoadingRhythm = false;
        state.uiState.loadingRhythmName = null;
        renderApp();
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

    // Menu
    'toggle-menu': () => {
        state.uiState.isMenuOpen = !state.uiState.isMenuOpen;
        state.uiState.userGuideSubmenuOpen = false;
        renderApp();
    },
    'close-menu': (e, target) => {
        if (target.tagName === 'DIV' && e.target !== target) return;
        state.uiState.isMenuOpen = false;
        state.uiState.userGuideSubmenuOpen = false;
        renderApp();
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
        const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
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
        renderApp();
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
            const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
            const tIdx = parseInt(target.dataset.trackIndex);
            const newVolume = parseFloat(target.value);
            const track = section?.measures[0]?.tracks[tIdx];
            if (track) {
                actions.setGlobalVolume(track.instrument, newVolume);
            }
            return;
        }

        if (action === 'update-global-bpm') {
            state.toque.globalBpm = Number(target.value);
            const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
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

    // Change handler (BPM finalize)
    root.addEventListener('change', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (action === 'update-global-bpm') {
            state.toque.globalBpm = Number(target.value);
            const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
            if (!section?.bpm) playback.currentPlayheadBpm = state.toque.globalBpm;
            renderApp();
        }
    });

    // BPM slider touch drag tracking for smooth mobile interaction
    let activeBpmContainer = null;
    let activeBpmInput = null;

    root.addEventListener('touchstart', (e) => {
        const bpmContainer = e.target.closest('.group\\/bpm');
        if (!bpmContainer) return;

        const bpmInput = bpmContainer.querySelector('input[data-action="update-global-bpm"]');
        if (!bpmInput) return;

        activeBpmContainer = bpmContainer;
        activeBpmInput = bpmInput;

        // Set global flag to prevent refreshGrid during drag
        window.__bpmDragging = true;

        // Get first touch position
        const touch = e.touches[0];
        const rect = bpmContainer.getBoundingClientRect();
        let percentage = (touch.clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        const newBpm = Math.round(40 + percentage * 200); // 40-240 BPM range
        bpmInput.value = newBpm;
        bpmInput.dispatchEvent(new Event('input', { bubbles: true }));

        // Direct DOM update for immediate visual feedback
        updateBpmSliderVisuals(bpmContainer, newBpm);

        // Prevent default to avoid scroll interference
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!activeBpmInput || !activeBpmContainer) return;

        const touch = e.touches[0];
        const rect = activeBpmContainer.getBoundingClientRect();
        let percentage = (touch.clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        const newBpm = Math.round(40 + percentage * 200); // 40-240 BPM range

        // Update the input value
        activeBpmInput.value = newBpm;

        // Trigger the input event to update state
        activeBpmInput.dispatchEvent(new Event('input', { bubbles: true }));

        // Direct DOM update for immediate visual feedback
        updateBpmSliderVisuals(activeBpmContainer, newBpm);
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (activeBpmInput) {
            window.__bpmDragging = false;
            activeBpmInput = null;
            activeBpmContainer = null;
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

    // Timeline section select
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
