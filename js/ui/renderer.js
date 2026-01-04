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
      isMobile: isMobile
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
  document.querySelectorAll('.ring-2.ring-white').forEach(el => {
    el.classList.remove('ring-2', 'ring-white', 'z-10', 'shadow-lg', 'shadow-cyan-500/50');
  });
  document.querySelectorAll('.bg-gray-800').forEach(el => {
    if (el.innerText === '' || el.innerText === '.') el.classList.remove('bg-gray-800');
  });
  document.querySelectorAll('[data-step-marker]').forEach(el => {
    el.classList.remove('text-cyan-400', 'font-bold', 'scale-110');
    el.classList.add('text-gray-500');
  });

  // Select cells matching BOTH step index AND measure index
  const cells = document.querySelectorAll(`[data-step-index="${step}"][data-measure-index="${measureIndex}"]`);
  cells.forEach(cell => {
    cell.classList.add('ring-2', 'ring-white', 'z-10', 'shadow-lg', 'shadow-cyan-500/50');
    if (cell.innerText.trim() === '') cell.classList.add('bg-gray-800');
  });

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