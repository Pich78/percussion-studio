/*
  js/events/desktopEvents.js
  Desktop event handler setup.
  REFACTORED: Now delegates to modular handler functions.
*/

import { state, playback } from '../store.js';
import { actions } from '../actions.js';
import { togglePlay, stopPlayback } from '../services/sequencer.js';
import { renderApp, refreshGrid } from '../ui/renderer.js';
import { StrokeType } from '../types.js';

// Import modular handlers
import * as playbackHandlers from './handlers/playbackEvents.js';
import * as menuHandlers from './handlers/menuEvents.js';
import * as gridHandlers from './handlers/gridEvents.js';
import * as modalHandlers from './handlers/modalEvents.js';
import * as bataHandlers from './handlers/bataExplorerEvents.js';
import * as timelineHandlers from './handlers/timelineEvents.js';

/**
 * Action routing map - maps action names to handler functions
 * Handlers receive (e, target) parameters
 */
const createActionRouter = () => {
    return {
        // Playback
        'toggle-play': () => togglePlay(),
        'stop': () => stopPlayback(),
        'toggle-count-in': playbackHandlers.handleToggleCountIn,

        // Menu
        'toggle-menu': menuHandlers.handleToggleMenu,
        'close-menu': (e, target) => menuHandlers.handleCloseMenu(e, target),
        'new-rhythm': menuHandlers.handleNewRhythm,
        'load-rhythm': menuHandlers.handleLoadRhythm,
        'download-rhythm': menuHandlers.handleDownloadRhythm,
        'share-rhythm': menuHandlers.handleShareRhythm,
        'toggle-user-guide-submenu': menuHandlers.handleToggleUserGuideSubmenu,
        'open-user-guide': (e, target) => modalHandlers.handleOpenUserGuide(target),
        'open-editing-options': () => {
            state.uiState.isMenuOpen = false;
            state.uiState.modalType = 'editingOptions';
            state.uiState.modalOpen = true;
            renderApp();
        },

        // Measures
        'add-measure': () => actions.addMeasure(),
        'delete-measure': (e, target) => actions.deleteMeasure(parseInt(target.dataset.measureIndex)),
        'duplicate-measure': (e, target) => actions.duplicateMeasure(parseInt(target.dataset.measureIndex)),

        // Sections
        'add-section': () => actions.addSection(),
        'delete-section': (e, target) => actions.deleteSection(target.dataset.id),
        'duplicate-section': (e, target) => actions.duplicateSection(target.dataset.id),

        // Mute/Track controls
        'toggle-mute': (e, target) => gridHandlers.handleToggleMute(target),
        'remove-track': (e, target) => gridHandlers.handleRemoveTrack(target),
        'cycle-track-steps': (e, target) => gridHandlers.handleCycleTrackSteps(target),
        'toggle-track-snap': (e, target) => gridHandlers.handleToggleTrackSnap(target),

        // Modals
        'open-add-modal': () => modalHandlers.handleOpenAddModal(),
        'open-edit-modal': (e, target) => modalHandlers.handleOpenEditModal(target),
        'open-pack-modal': (e, target) => modalHandlers.handleOpenPackModal(target),
        'close-modal': () => modalHandlers.handleCloseModal(),
        'close-modal-bg': (e, target) => { if (e.target === target) modalHandlers.handleCloseModal(); },
        'select-instrument': (e, target) => modalHandlers.handleSelectInstrument(target),
        'select-sound-pack': (e, target) => modalHandlers.handleSelectSoundPack(target),
        'confirm-instrument-selection': () => modalHandlers.handleConfirmInstrumentSelection(),
        'toggle-folder': (e, target) => modalHandlers.handleToggleFolder(target),
        'select-rhythm-confirm': (e, target) => modalHandlers.handleSelectRhythmConfirm(target),
        'trigger-file-input': () => modalHandlers.handleTriggerFileInput(),

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
        'close-toque-details-bg': (e, target) => { if (e.target === target) bataHandlers.handleCloseToqueDetails(); },
        'load-toque-confirm': (e, target) => bataHandlers.handleLoadToqueConfirm(target),

        // Timeline metadata
        'toggle-bata-rhythm-mode': () => timelineHandlers.handleToggleBataRhythmMode(),
        'toggle-metadata-orisha-dropdown': () => timelineHandlers.handleToggleMetadataOrishaDropdown(),
        'toggle-rhythm-orisha': (e, target) => timelineHandlers.handleToggleRhythmOrisha(target),
        'remove-rhythm-orisha': (e, target) => timelineHandlers.handleRemoveRhythmOrisha(target),
        'set-rhythm-classification': (e, target) => timelineHandlers.handleSetRhythmClassification(target),

        // Settings
        'toggle-bpm-override': () => {
            const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
            if (section) {
                section.bpm = (section.bpm !== undefined) ? undefined : state.toque.globalBpm;
                refreshGrid();
            }
        },
        'select-stroke': (e, target) => gridHandlers.handleSelectStroke(target),
        'clear-pattern': () => gridHandlers.handleClearPattern(),

        // Pie Menu
        'pie-menu-select': (e, target) => gridHandlers.handlePieMenuSelect(e, target)
    };
};

/**
 * Handle tubs-cell click (grid cell interaction)
 */
const handleTubsCellClick = (target) => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    if (!section) return;

    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    const rawStepIdx = parseInt(target.dataset.stepIndex);
    const track = section.measures[measureIdx]?.tracks[trackIdx];
    if (!track) return;

    let targetStepIdx = rawStepIdx;

    // Snap Input Logic
    if (track.snapToGrid) {
        const divisor = track.trackSteps || section.subdivision || 4;
        const groupSize = section.steps / divisor;
        targetStepIdx = Math.floor(rawStepIdx / groupSize) * groupSize;
        if (targetStepIdx >= section.steps) targetStepIdx = section.steps - groupSize;
    }

    actions.handleUpdateStroke(trackIdx, targetStepIdx, measureIdx);
};

/**
 * Handle tubs-cell right-click (clear stroke OR open pie menu)
 */
const handleTubsCellRightClick = (e, target) => {
    e.preventDefault();
    if (state.uiState.pieMenu.editingMode === 'pie-menu' && state.uiState.pieMenu.pieMenuTrigger === 'right-click') {
        gridHandlers.handleCellRightClickOpenPieMenu(e, target);
        return;
    }

    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    const stepIdx = parseInt(target.dataset.stepIndex);

    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    if (section) {
        const track = section.measures[measureIdx]?.tracks[trackIdx];
        if (track) {
            track.strokes[stepIdx] = StrokeType.None;
            refreshGrid();
        }
    }
};

export const setupDesktopEvents = () => {
    const root = document.getElementById('root');
    const actionRouter = createActionRouter();

    // Click handler
    root.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action], [data-role]');
        if (!target) return;

        const action = target.dataset.action;

        // Route to handler if exists
        if (action && actionRouter[action]) {
            actionRouter[action](e, target);
            return;
        }

        // Special case: tubs-cell click
        if (target.dataset.role === 'tubs-cell') {
            handleTubsCellClick(target);
        }
    });

    // Context menu (right-click)
    root.addEventListener('contextmenu', (e) => {
        const target = e.target.closest('[data-role="tubs-cell"]');
        if (target) {
            handleTubsCellRightClick(e, target);
        }
    });

    // Mouse events for Long-Press Pie Menu support
    root.addEventListener('mousedown', (e) => {
        const cell = e.target.closest('[data-role="tubs-cell"]');

        if (state.uiState.pieMenu.isOpen) {
            const pieMenuContainer = e.target.closest('#pie-menu-container');
            // If we click outside the pie menu entirely
            if (!pieMenuContainer) {
                gridHandlers.closePieMenu();
                // If we clicked a cell while closing the menu, we don't want to start a new long press.
                return;
            }
        }

        if (cell) {
            gridHandlers.handleCellMouseDown(e, cell);
        }
    });

    root.addEventListener('mouseup', () => {
        gridHandlers.cancelPieMenuPress();
    });

    root.addEventListener('mouseover', (e) => {
        const cell = e.target.closest('[data-role="tubs-cell"]');
        if (cell) {
            gridHandlers.handleCellMouseEnter(e, cell);
            return;
        }
        const pieMenuBridge = e.target.closest('[data-role="pie-menu-bridge"]');
        if (pieMenuBridge || e.target.closest('#pie-menu-container')) {
            gridHandlers.handlePieMenuMouseEnter();
        }
    });

    root.addEventListener('mouseout', (e) => {
        const related = e.relatedTarget;

        const cell = e.target.closest('[data-role="tubs-cell"]');
        if (cell && (!related || !cell.contains(related))) {
            gridHandlers.handleCellMouseLeave(e, cell);
            gridHandlers.cancelPieMenuPress(); // double check to cancel press too
        }

        const pieContainer = e.target.closest('#pie-menu-container');
        if (pieContainer && (!related || !pieContainer.contains(related))) {
            gridHandlers.handlePieMenuMouseLeave();
        }
    });

    root.addEventListener('wheel', (e) => {
        const target = e.target.closest('[data-role="tubs-cell"]') || e.target.closest('[data-role="track-row"]');
        if (target) {
            gridHandlers.handleCellMouseWheel(e, target);
        }
    }, { passive: false });

    // Volume slider drag tracking (document-level for consistent drag)
    let activeVolumeSlider = null;
    let activeVolumeContainer = null;
    let activeVolumeInput = null;

    // BPM slider drag tracking (document-level for smooth drag like volume)
    let activeBpmContainer = null;
    let activeBpmInput = null;

    // Use capture phase to intercept before native range input behavior
    root.addEventListener('mousedown', (e) => {
        // Check for BPM slider container first (group/bpm class)
        const bpmContainer = e.target.closest('.group\\/bpm');
        if (bpmContainer) {
            const bpmInput = bpmContainer.querySelector('input[data-action="update-global-bpm"]');
            if (bpmInput) {
                activeBpmContainer = bpmContainer;
                activeBpmInput = bpmInput;

                // Set global flag to prevent refreshGrid during drag
                window.__bpmDragging = true;

                // Immediately calculate and update position on first click
                const rect = bpmContainer.getBoundingClientRect();
                let percentage = (e.clientX - rect.left) / rect.width;
                percentage = Math.max(0, Math.min(1, percentage));
                const newBpm = Math.round(40 + percentage * 200); // 40-240 BPM range
                bpmInput.value = newBpm;
                bpmInput.dispatchEvent(new Event('input', { bubbles: true }));

                // Direct DOM update for immediate visual feedback
                updateBpmSliderVisuals(bpmContainer, newBpm);

                // Prevent text selection and native range behavior
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }

        // Target the entire volume slider container for easier clicking
        const container = e.target.closest('.group\\/vol');
        if (!container) return;

        const input = container.querySelector('input[data-action="update-volume"]');
        if (!input) return;

        activeVolumeContainer = container;
        activeVolumeInput = input;

        // Set global flag to prevent refreshGrid during drag
        window.__volumeDragging = true;

        // Immediately calculate and update position on first click
        const rect = container.getBoundingClientRect();
        let percentage = (e.clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        input.value = percentage;
        input.dispatchEvent(new Event('input', { bubbles: true }));

        // Prevent text selection and native range behavior
        e.preventDefault();
        e.stopPropagation();
    }, true); // Capture phase

    document.addEventListener('mousemove', (e) => {
        // Handle BPM slider drag
        if (activeBpmInput && activeBpmContainer) {
            const rect = activeBpmContainer.getBoundingClientRect();
            let percentage = (e.clientX - rect.left) / rect.width;
            percentage = Math.max(0, Math.min(1, percentage));
            const newBpm = Math.round(40 + percentage * 200); // 40-240 BPM range

            // Update the input value
            activeBpmInput.value = newBpm;

            // Trigger the input event to update state
            activeBpmInput.dispatchEvent(new Event('input', { bubbles: true }));

            // Direct DOM update for immediate visual feedback
            updateBpmSliderVisuals(activeBpmContainer, newBpm);
            return;
        }

        // Handle volume slider drag
        if (!activeVolumeInput || !activeVolumeContainer) return;

        const rect = activeVolumeContainer.getBoundingClientRect();
        let percentage = (e.clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));

        // Update the input value
        activeVolumeInput.value = percentage;

        // Trigger the input event to update state and visuals
        activeVolumeInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    document.addEventListener('mouseup', () => {
        // Handle BPM slider release
        if (activeBpmInput) {
            window.__bpmDragging = false;
            activeBpmInput = null;
            activeBpmContainer = null;
        }

        // Handle volume slider release
        if (activeVolumeInput) {
            // Clear drag state
            window.__volumeDragging = false;
            activeVolumeInput = null;
            activeVolumeContainer = null;
            // Refresh grid to sync any mute state changes that were deferred
            refreshGrid();
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
        // Update handle position (8px offset for 4x4 handle)
        const handle = container.querySelector('div[class*="bg-white"]');
        if (handle) handle.style.left = `calc(${percentage}% - 8px)`;
    }

    // Input handler for sliders and text inputs
    root.addEventListener('input', (e) => {
        const target = e.target;
        const action = target.dataset.action;

        if (action === 'bata-search-input') {
            bataHandlers.handleBataSearchInput(target);
            return;
        }

        if (action === 'update-global-bpm') {
            playbackHandlers.handleGlobalBpmInput(target);
            return;
        }

        if (action === 'update-volume') {
            gridHandlers.handleVolumeInput(target);
            return;
        }

        if (action === 'update-rhythm-description') {
            timelineHandlers.handleUpdateRhythmDescription(target);
            return;
        }

        if (action === 'update-acceleration') {
            playbackHandlers.handleAccelerationInput(target);
            return;
        }

        if (action === 'update-pie-timing') {
            const key = target.dataset.target;
            state.uiState.pieMenu[key] = Math.max(0, parseInt(target.value) || 0);
            renderApp();
            return;
        }
    });

    // Change handler for select/number inputs
    root.addEventListener('change', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        const section = state.toque?.sections.find(s => s.id === state.activeSectionId);

        if (action === 'update-pie-behavior') {
            const setting = target.dataset.setting;
            state.uiState.pieMenu[setting] = target.checked;
            renderApp();
            return;
        }

        if (action === 'load-rhythm-file' && target.files[0]) {
            actions.loadRhythmFromFile(target.files[0]).then(() => {
                state.uiState.modalOpen = false;
                renderApp();
            });
            return;
        }

        if (action === 'update-section-name') {
            timelineHandlers.handleUpdateSectionName(target);
            return;
        }

        if (action === 'update-meter') {
            timelineHandlers.handleUpdateMeter(target);
            return;
        }

        if (action === 'update-custom-steps') {
            timelineHandlers.handleUpdateCustomSteps(target);
            return;
        }

        if (action === 'update-custom-subdivision' && section) {
            const newSubdivision = Math.max(1, Math.min(12, parseInt(target.value) || 1));
            section.subdivision = newSubdivision;
            refreshGrid();
            renderApp();
            return;
        }

        if (action === 'update-track-steps') {
            const trackIdx = parseInt(target.dataset.trackIndex);
            const measureIdx = parseInt(target.dataset.measureIndex || 0);
            const newSteps = parseInt(target.value);
            actions.updateTrackSteps(trackIdx, measureIdx, newSteps);
            return;
        }

        if (action === 'update-repetitions') {
            timelineHandlers.handleUpdateRepetitions(target);
            return;
        }

        if (action === 'update-bpm' && section) {
            section.bpm = Number(target.value);
            playback.currentPlayheadBpm = section.bpm;
            return;
        }

        if (action === 'update-global-bpm') {
            playbackHandlers.handleGlobalBpmChange(target);
            return;
        }

        if (action === 'update-acceleration' && section) {
            playbackHandlers.handleAccelerationChange(target);
            return;
        }

        if (action === 'update-rhythm-name') {
            timelineHandlers.handleUpdateRhythmName(target);
            return;
        }

        if (action === 'update-editing-mode') {
            state.uiState.pieMenu.editingMode = target.value;
            renderApp();
            return;
        }

        if (action === 'update-pie-trigger') {
            state.uiState.pieMenu.pieMenuTrigger = target.value;
            renderApp();
            return;
        }
    });

    // Keydown handler
    root.addEventListener('keydown', (e) => {
        const target = e.target;
        const action = target.dataset.action;

        if (action === 'update-rhythm-name' && e.key === 'Enter') {
            timelineHandlers.handleRhythmNameKeydown(e, target);
        }
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Spacebar to toggle play (unless in input field)
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

    // Timeline section select
    document.addEventListener('timeline-select', (e) => {
        timelineHandlers.handleTimelineSelect(e.detail);
    });

    // Drag and drop for timeline
    timelineHandlers.setupDragAndDrop(root);
};
