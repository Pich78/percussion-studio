/**
 * js/ui/renderer.js
 * 
 * Core rendering engine — subscribes to event bus events and delegates
 * layout rendering to the active view via the view provider.
 * 
 * Playback visualization (updateVisualStep, scrollToMeasure) has been
 * extracted to playheadUtils.js to allow views to import them directly
 * without circular dependencies.
 */

import { state } from '../store.js';
import { getActiveSection } from '../store/stateSelectors.js';
import { TubsGrid, autoScrollGrid } from '../components/tubsGrid.js';
import { MobileLayout, calculateMobileCellSize } from './mobile/layout.js';
import { DesktopLayout } from './desktop/layout.js';
import { eventBus } from '../services/eventBus.js';
import { updateVisualStep, scrollToMeasure } from './playheadUtils.js';

// Re-export playhead utilities for backward compatibility
export { updateVisualStep, scrollToMeasure };

// ─── View Provider ──────────────────────────────────────────────────────────
// Set at runtime by app.js after views are registered.
// Avoids circular dependency (renderer → viewManager → views → renderer).
let _viewProvider = null;

/**
 * Set the view provider (viewManager). Called by app.js after views are registered.
 * @param {object} provider - Object with getActiveView() method
 */
export const setViewProvider = (provider) => {
  _viewProvider = provider;
};

const root = document.getElementById('root');

// ─── Event Bus Subscriptions ────────────────────────────────────────────────

eventBus.on('render', () => renderApp());

eventBus.on('grid-refresh', () => refreshGrid());

eventBus.on('scroll-to-measure', ({ measure }) => scrollToMeasure(measure));

eventBus.on('step', (payload) => {
  const view = _viewProvider?.getActiveView();
  if (view && view.onStep) {
    view.onStep(payload);
  } else {
    // Fallback before view provider is wired
    updateVisualStep(payload.step, payload.measure);
    scrollToMeasure(payload.measure);
    const repEl = document.getElementById('header-rep-count');
    if (repEl) repEl.textContent = payload.rep;
  }
});

// ─── Rendering ──────────────────────────────────────────────────────────────

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

  // Save scroll position before re-render
  const scrollContainerBefore = document.getElementById('tubs-scroll-container');
  const savedScrollTop = scrollContainerBefore ? scrollContainerBefore.scrollTop : 0;
  const savedScrollLeft = scrollContainerBefore ? scrollContainerBefore.scrollLeft : 0;

  // Delegate to active view's layout, with fallback for early boot
  const view = _viewProvider?.getActiveView();
  if (view) {
    root.innerHTML = view.layout();
  } else if (window.IS_MOBILE_VIEW) {
    root.innerHTML = MobileLayout();
  } else {
    root.innerHTML = DesktopLayout();
  }

  // Restore scroll position after re-render
  const scrollContainerAfter = document.getElementById('tubs-scroll-container');
  if (scrollContainerAfter && (savedScrollTop > 0 || savedScrollLeft > 0)) {
    scrollContainerAfter.scrollTop = savedScrollTop;
    scrollContainerAfter.scrollLeft = savedScrollLeft;
  }

  // Restore focus if applicable
  if (focusId) {
    const newActiveElement = document.getElementById(focusId);
    if (newActiveElement) {
      newActiveElement.focus();
      if (typeof newActiveElement.setSelectionRange === 'function') {
        try {
          newActiveElement.setSelectionRange(selectionStart, selectionEnd);
        } catch (e) {
          // Ignore errors for inputs that don't support selection (e.g. number)
        }
      }
    }
  }

  // Render static playhead when not playing
  if (!state.isPlaying && state.currentStep >= 0) {
    setTimeout(() => {
      updateVisualStep(state.currentStep, state.currentMeasure || 0);
    }, 0);
  }
};

export const refreshGrid = () => {
  const activeSection = getActiveSection(state) || state.toque.sections[0];
  const container = document.getElementById('grid-container');
  const isMobile = window.IS_MOBILE_VIEW;

  if (container) {
    // Save scroll position
    const scrollContainer = document.getElementById('tubs-scroll-container');
    const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
    const scrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;

    // Calculate cell size fresh for mobile
    let mobileCellSize = null;
    if (isMobile && activeSection) {
      const viewportWidth = window.innerWidth;
      const computedStyle = getComputedStyle(document.documentElement);
      const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
      const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;
      mobileCellSize = calculateMobileCellSize(
        viewportWidth,
        activeSection.steps || 12,
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
      mobileCellSize,
      instrumentDefinitions: state.instrumentDefinitions,
      isPlaying: state.isPlaying
    });

    // Restore scroll position
    const newScrollContainer = document.getElementById('tubs-scroll-container');
    if (newScrollContainer) {
      newScrollContainer.scrollTop = scrollTop;
      newScrollContainer.scrollLeft = scrollLeft;
    }

    // Render static playhead when not playing
    if (!state.isPlaying && state.currentStep >= 0) {
      setTimeout(() => {
        updateVisualStep(state.currentStep, state.currentMeasure || 0);
      }, 0);
    }
  }
};