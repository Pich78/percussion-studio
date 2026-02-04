import { state } from '../store.js';
import { TubsGrid, autoScrollGrid } from '../components/tubsGrid.js';
import { MobileLayout, calculateMobileCellSize } from './mobile/layout.js';
import { DesktopLayout } from './desktop/layout.js';

const root = document.getElementById('root');

export const renderApp = () => {
  // Capture focus state before rendering
  const activeElement = document.activeElement;
  let focusId = null;
  let selectionStart = 0;
  let selectionEnd = 0;

  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') && root.contains(activeElement)) {
    focusId = activeElement.id;
    selectionStart = activeElement.selectionStart;
    selectionEnd = activeElement.selectionEnd;
  }

  if (!state.toque) {
    root.innerHTML = '<div class="flex h-full items-center justify-center text-gray-500">Loading Rhythm...</div>';
    return;
  }

  // Dispatch to correct layout
  if (window.IS_MOBILE_VIEW) {
    root.innerHTML = MobileLayout();
  } else {
    root.innerHTML = DesktopLayout();
  }

  // Restore focus if applicable
  if (focusId) {
    const newActiveElement = document.getElementById(focusId);
    if (newActiveElement) {
      newActiveElement.focus();
      // Restore cursor position for text inputs
      if (typeof newActiveElement.setSelectionRange === 'function') {
        try {
          newActiveElement.setSelectionRange(selectionStart, selectionEnd);
        } catch (e) {
          // Ignore errors for inputs that don't support selection (e.g. number)
        }
      }
    }
  }

  // Render static playhead when not playing (unified bar across all tracks)
  // This ensures the playhead remains visible when pausing (state.isPlaying becomes false -> renderApp called)
  if (!state.isPlaying && state.currentStep >= 0) {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      updateVisualStep(state.currentStep, state.currentMeasure || 0);
    }, 0);
  }
};

export const refreshGrid = () => {
  const activeSection = state.toque.sections.find(s => s.id === state.activeSectionId) || state.toque.sections[0];
  const container = document.getElementById('grid-container');
  const isMobile = window.IS_MOBILE_VIEW;

  if (container) {
    // Save scroll position
    const scrollContainer = document.getElementById('tubs-scroll-container');
    const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
    const scrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;

    // Calculate cell size fresh for mobile (pure functional - no caching)
    let mobileCellSize = null;
    if (isMobile && activeSection) {
      const viewportWidth = window.innerWidth;
      const computedStyle = getComputedStyle(document.documentElement);
      const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
      const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;
      mobileCellSize = calculateMobileCellSize(
        viewportWidth,
        activeSection.steps || 12,
        activeSection.subdivision || 4,
        safeAreaLeft,
        safeAreaRight
      );
    }

    container.innerHTML = TubsGrid({
      section: activeSection,
      globalBpm: state.toque.globalBpm,
      currentStep: state.currentStep,
      selectedStroke: state.selectedStroke,
      uiState: state.uiState,
      readOnly: isMobile,
      isMobile: isMobile,
      mobileCellSize
    });

    // Restore scroll position
    const newScrollContainer = document.getElementById('tubs-scroll-container');
    if (newScrollContainer) {
      newScrollContainer.scrollTop = scrollTop;
      newScrollContainer.scrollLeft = scrollLeft;
    }

    // Render static playhead when not playing (unified bar across all tracks)
    if (!state.isPlaying && state.currentStep >= 0) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        updateVisualStep(state.currentStep, state.currentMeasure || 0);
      }, 0);
    }
  }
};

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
  const activeSection = state?.toque?.sections?.find(s => s.id === state?.activeSectionId);
  if (!activeSection) return;

  // Find a reference cell to calculate dimensions (use first track, first cell)
  const referenceCell = measureContainer.querySelector(`[data-role="tubs-cell"][data-step-index="0"]`);
  if (!referenceCell) return;

  // Get the tracks container (parent of all track rows)
  // Find all track rows - they contain the cells
  const trackRows = measureContainer.querySelectorAll('.flex.items-center.group');
  if (trackRows.length === 0) return;

  // Calculate cell size from reference cell
  // We strictly enforce 1 cell = 1 step visually
  const cellSizePx = referenceCell.offsetWidth;

  // Calculate the horizontal position for the playhead bar
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

  // Calculate the top position and total height of all tracks
  const topOffset = firstContainerRect.top - measureRect.top;
  const totalHeight = (lastContainerRect.bottom - firstContainerRect.top);

  // Calculate start position relative to measure container
  // We use referenceRect.left (the actual cell start) instead of firstContainerRect.left
  // to implicitly account for any padding on the container (e.g., p-1 class)
  const startLeft = referenceRect.left - measureRect.left;

  // Create unified playhead bar
  const playhead = document.createElement('div');
  playhead.className = 'playhead-indicator absolute pointer-events-none z-30';
  playhead.style.left = `${startLeft + playheadLeftPx}px`;
  playhead.style.top = `${topOffset}px`;
  playhead.style.width = `${cellSizePx}px`;
  playhead.style.height = `${totalHeight}px`;
  playhead.innerHTML = '<div class="w-full h-full bg-white/25 ring-2 ring-inset ring-white rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.6)]"></div>';

  // Ensure measure container has relative positioning
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

// Scroll the current measure to the center of the viewport
export const scrollToMeasure = (measureIndex) => {
  const scrollContainer = document.getElementById('tubs-scroll-container');
  if (!scrollContainer) return;

  // Allow DOM to update first if needed
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

    // Calculate position to center the measure
    const containerHeight = scrollContainer.clientHeight;
    // We need relative position within the container logic for scrollTo
    // offsetTop is relative to the offsetParent. Assuming the container is the offsetParent (relative/absolute)
    // If not, we might need a different approach, but let's stick to the previous calculation logic if it worked for centering,
    // just applying it conditionally.
    // Actually, offsetTop is simpler and matches the previous logic.
    const measureTop = measureElement.offsetTop;
    const measureHeight = measureElement.offsetHeight;

    // Scroll to center the measure
    const scrollTo = measureTop - (containerHeight / 2) + (measureHeight / 2);

    scrollContainer.scrollTo({
      top: scrollTo,
      behavior: 'smooth'
    });
  }, 10);
};