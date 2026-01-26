import { state } from '../store.js';
import { TubsGrid, autoScrollGrid } from '../components/tubsGrid.js';
import { MobileLayout } from './mobile/layout.js';
import { DesktopLayout } from './desktop/layout.js';

const root = document.getElementById('root');

export const renderApp = () => {
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

    container.innerHTML = TubsGrid({
      section: activeSection,
      globalBpm: state.toque.globalBpm,
      currentStep: state.currentStep,
      selectedStroke: state.selectedStroke,
      uiState: state.uiState,
      readOnly: isMobile,
      isMobile: isMobile,
      mobileCellSize: isMobile ? state.uiState.mobileCellSize : null
    });

    // Restore scroll position
    const newScrollContainer = document.getElementById('tubs-scroll-container');
    if (newScrollContainer) {
      newScrollContainer.scrollTop = scrollTop;
      newScrollContainer.scrollLeft = scrollLeft;
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

  // Get all cells for this measure
  const cells = document.querySelectorAll(`[data-role="tubs-cell"][data-measure-index="${measureIndex}"]`);

  cells.forEach(cell => {
    const trackIndex = parseInt(cell.dataset.trackIndex);
    const cellStepIndex = parseInt(cell.dataset.stepIndex);

    // Get track to determine its subdivision
    const activeSection = state?.toque?.sections?.find(s => s.id === state?.activeSectionId);
    if (!activeSection) return;

    const track = activeSection?.measures?.[measureIndex]?.tracks?.[trackIndex];
    if (!track) return;

    const trackSteps = track.trackSteps || activeSection.steps;
    const gridSteps = activeSection.steps;
    const cellsPerStep = gridSteps / trackSteps;

    // Calculate which global steps this cell covers
    const globalStepStart = cellStepIndex * cellsPerStep;
    const globalStepEnd = globalStepStart + cellsPerStep - 1;

    // Check if current step falls within this cell
    if (step >= globalStepStart && step <= globalStepEnd) {
      // Calculate offset within the cell
      const cellWidth = cell.offsetWidth;
      const cellSizePx = cellWidth / cellsPerStep;
      const offsetPx = (step - globalStepStart) * cellSizePx;

      // Create playhead indicator element
      const playhead = document.createElement('div');
      playhead.className = 'playhead-indicator absolute top-0 h-full pointer-events-none z-30';
      playhead.style.left = `${offsetPx}px`;
      playhead.style.width = `${cellSizePx}px`;
      playhead.innerHTML = '<div class="w-full h-full bg-white/25 ring-2 ring-inset ring-white rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.6)]"></div>';

      // Ensure cell has relative positioning for the absolute playhead
      cell.style.position = 'relative';
      cell.appendChild(playhead);
    }
  });

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