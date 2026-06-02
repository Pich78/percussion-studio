/**
 * js/ui/playheadUtils.js
 * 
 * Shared playback visualization utilities — playhead rendering and measure scrolling.
 * Extracted from renderer.js to allow views to import these directly
 * without creating circular dependencies.
 */

import { getActiveSection, getMixVolume, isInstrumentMuted } from '../store/stateSelectors.js';
import { autoScrollGrid } from '../components/tubsGrid.js';
import { state, playback } from '../store.js';

/**
 * Render the playhead bar at the given step position within a measure.
 * Creates a unified visual bar spanning all track rows.
 */
export const updateVisualStep = (step, measureIndex = 0) => {
    // Remove previous playhead indicators
    document.querySelectorAll('.playhead-indicator').forEach(el => el.remove());

    // Reset step marker styling
    document.querySelectorAll('[data-step-marker]').forEach(el => {
        el.classList.remove('text-cyan-400', 'font-bold', 'scale-110');
        el.classList.add('text-gray-500');
    });

    // Get the measure container
    const measureContainer = document.querySelector(`.measure-container[data-measure-index="${measureIndex}"]`);
    if (!measureContainer) return;

    // Get active section info
    const activeSection = getActiveSection(state);
    if (!activeSection) return;

    // Find a reference cell to calculate dimensions (use first track, first cell)
    const referenceCell = measureContainer.querySelector(`[data-role="tubs-cell"][data-step-index="0"]`);
    if (!referenceCell) return;

    // Find all track rows - they contain the cells
    const trackRows = measureContainer.querySelectorAll('.flex.items-center.group');
    if (trackRows.length === 0) return;

    // Calculate cell size from reference cell
    const cellSizePx = referenceCell.offsetWidth;
    const playheadLeftPx = step * cellSizePx;

    // Get the first and last track row to determine total height and position
    const firstRow = trackRows[0];
    const lastRow = trackRows[trackRows.length - 1];

    // Find the cells container in the first row (the grid area, not the sticky label)
    const firstCellsContainer = firstRow.querySelector('.flex.bg-gray-900\\/30');
    if (!firstCellsContainer) return;

    // Get positions relative to measure container
    const measureRect = measureContainer.getBoundingClientRect();
    const referenceRect = referenceCell.getBoundingClientRect();
    const firstContainerRect = firstCellsContainer.getBoundingClientRect();
    const lastContainerRect = lastRow.querySelector('.flex.bg-gray-900\\/30')?.getBoundingClientRect() || firstContainerRect;

    const topOffset = firstContainerRect.top - measureRect.top;
    const totalHeight = (lastContainerRect.bottom - firstContainerRect.top);
    const startLeft = referenceRect.left - measureRect.left;

    // Create unified playhead bar
    const playhead = document.createElement('div');
    playhead.className = 'playhead-indicator absolute pointer-events-none z-30';
    playhead.style.left = `${startLeft + playheadLeftPx}px`;
    playhead.style.top = `${topOffset}px`;
    playhead.style.width = `${cellSizePx}px`;
    playhead.style.height = `${totalHeight}px`;
    playhead.innerHTML = '<div class="w-full h-full bg-white/25 ring-2 ring-inset ring-white rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.6)]"></div>';

    measureContainer.style.position = 'relative';
    measureContainer.appendChild(playhead);

    // Highlight the step marker in the ruler
    const marker = document.querySelector(`[data-step-marker="${step}"][data-measure-index="${measureIndex}"]`);
    if (marker) {
        marker.classList.remove('text-gray-500');
        marker.classList.add('text-cyan-400', 'font-bold', 'scale-110');
    }
    autoScrollGrid(step);
};

/**
 * Scroll the viewport so the given measure is centered vertically.
 * Only scrolls if the measure is not already visible.
 */
export const scrollToMeasure = (measureIndex) => {
    const scrollContainer = document.getElementById('tubs-scroll-container');
    if (!scrollContainer) return;

    setTimeout(() => {
        const measureElement = document.querySelector(`[data-measure-index="${measureIndex}"]`);
        if (!measureElement) return;

        // Check if measure is already visible
        const containerRect = scrollContainer.getBoundingClientRect();
        const measureRect = measureElement.getBoundingClientRect();

        const isVisible = (
            measureRect.top >= containerRect.top &&
            measureRect.bottom <= containerRect.bottom
        );

        if (isVisible) return;

        const measureTop = measureElement.offsetTop;

        // Scroll to the measure's top edge — matches scroll-snap-align: start on each measure
        scrollContainer.scrollTo({
            top: measureTop,
            behavior: 'smooth'
        });
    }, 10);
};

/**
 * Update all BPM slider UI elements to reflect the current live BPM.
 * Called on step 0 (repetition boundaries) from all view onStep handlers.
 */
export const updateBpmUi = () => {
    const bpmVal = playback.currentPlayheadBpm;
    const bpmText = Math.round(bpmVal);
    const pct = ((bpmVal - 40) / 200) * 100;

    // Update all range input values first
    document.querySelectorAll('input[data-action="update-global-bpm"]').forEach(input => {
        input.value = bpmText;
    });

    // Update .group/bpm slider visuals (dynamic offset based on actual handle width)
    document.querySelectorAll('.group\\/bpm').forEach(container => {
        const fillBar = container.querySelector('div[class*="bg-gradient"]');
        const handle = container.querySelector('div[class*="bg-white"]');
        if (fillBar) fillBar.style.width = pct + '%';
        if (handle) handle.style.left = 'calc(' + pct + '% - ' + (handle.offsetWidth / 2) + 'px)';
    });

    // Portrait dual-mode BPM slider
    const portraitFill = document.getElementById('portrait-bpm-fill');
    const portraitThumb = document.getElementById('portrait-bpm-thumb');
    const portraitLabel = document.getElementById('portrait-bpm-label');
    if (portraitFill) portraitFill.style.width = pct + '%';
    if (portraitThumb) portraitThumb.style.left = 'calc(' + pct + '% - ' + (portraitThumb.offsetWidth / 2) + 'px)';
    if (portraitLabel) portraitLabel.innerHTML = bpmText + ' <span class="text-[10px]">bpm</span>';

    // BPM text displays
    const headerLive = document.getElementById('header-live-bpm');
    const headerGlobal = document.getElementById('header-global-bpm');
    if (headerLive) headerLive.textContent = bpmText;
    if (headerGlobal) headerGlobal.innerHTML = bpmText + ' <span class="text-[9px] text-gray-600">BPM</span>';

    // Dual-mode BPM badges
    const bpmEl = document.getElementById('dual-mode-live-bpm-landscape');
    const bpmElPortrait = document.getElementById('dual-mode-live-bpm-portrait');
    if (bpmEl) bpmEl.innerHTML = '♩' + bpmText;
    if (bpmElPortrait) bpmElPortrait.textContent = '' + bpmText;

    // BPM modal (bpmModal.js) — different dimensions (w-7 handle, px-1 container)
    const modalValue = document.getElementById('bpm-modal-value');
    const modalFill = document.getElementById('bpm-modal-fill');
    const modalThumb = document.getElementById('bpm-modal-thumb');
    if (modalValue) modalValue.textContent = bpmText + ' BPM';
    if (modalFill) modalFill.style.width = pct + '%';
    if (modalThumb) modalThumb.style.left = 'calc(' + pct + '% - 10px)';
};

/**
 * Update all volume slider UI elements to reflect state.mix[symbol].volume
 * for the active section. Called on step 0 (repetition boundaries) from all
 * view onStep handlers as the single reconciliation point — guarantees the
 * slider position is always a faithful reflection of the source of truth.
 *
 * Mirrors updateBpmUi() but for per-instrument volume.
 */
export const updateVolumeUi = () => {
    const activeSection = getActiveSection(state);
    if (!activeSection) return;
    const tracks = activeSection.measures[0]?.tracks || [];
    if (tracks.length === 0) return;

    tracks.forEach((track, tIdx) => {
        const vol = getMixVolume(state, track.instrument);
        const muted = isInstrumentMuted(state, track.instrument);
        const pct = Math.round(vol * 100);

        // Range input value (the source the browser-native thumb is bound to)
        const rangeInput = document.querySelector(
            `input[data-action="update-volume"][data-track-index="${tIdx}"]`
        );
        if (rangeInput) rangeInput.value = vol;

        // .group/vol slider visuals (desktop mixer, mobile mixer modal, etc.)
        const containers = document.querySelectorAll(`.group\\/vol`);
        containers.forEach(container => {
            // Only update the container that hosts the matching track's input.
            const input = container.querySelector('input[data-action="update-volume"]');
            if (!input || parseInt(input.dataset.trackIndex, 10) !== tIdx) return;

            const fillBar = container.querySelector('div[class*="bg-gradient"]');
            const handle = container.querySelector('div[class*="bg-white"]');
            const percentLabel = container.querySelector('span[class*="font-medium"]');
            if (fillBar) fillBar.style.width = pct + '%';
            if (handle) handle.style.left = 'calc(' + pct + '% - ' + (handle.offsetWidth / 2) + 'px)';
            if (percentLabel) percentLabel.textContent = pct + '%';
        });

        // Portrait dual-mode volume slider (portrait.js) — direct id lookup
        const portraitFill = document.getElementById(`portrait-vol-fill-${tIdx}`);
        const portraitThumb = document.getElementById(`portrait-vol-thumb-${tIdx}`);
        if (portraitFill) portraitFill.style.width = pct + '%';
        if (portraitThumb) portraitThumb.style.left = 'calc(' + pct + '% - ' + (portraitThumb.offsetWidth / 2) + 'px)';

        // Mute button visual state (mixerModal.js etc.)
        const muteBtn = document.querySelector(
            `button[data-action="toggle-mute"][data-track-index="${tIdx}"][data-measure-index="0"]`
        );
        if (muteBtn) {
            if (muted) {
                muteBtn.classList.add('bg-red-900/30', 'text-red-500', 'border-red-900/50');
                muteBtn.classList.remove('bg-gray-800', 'text-gray-400', 'border-gray-700', 'hover:text-gray-200');
                muteBtn.setAttribute('title', 'Unmute');
            } else {
                muteBtn.classList.remove('bg-red-900/30', 'text-red-500', 'border-red-900/50');
                muteBtn.classList.add('bg-gray-800', 'text-gray-400', 'border-gray-700', 'hover:text-gray-200');
                muteBtn.setAttribute('title', 'Mute');
            }
        }
    });
};
