/* 
  js/components/tubsGrid.js
  Renders the main grid and the Add/Edit Instrument Modal.
  REFACTORED: Now composes smaller modular components.
*/

import { state } from '../store.js';

// Import modular components
import { SectionSettings } from './grid/sectionSettings.js';
import { MeasureRenderer, AddMeasureButton } from './grid/measureRenderer.js';
import { InstrumentModal } from './modals/instrumentModal.js';
import { RhythmModal } from './modals/rhythmModal.js';

// User Guide Modal (still inline for now - simple structure)
import { XMarkIcon } from '../icons/xMarkIcon.js';

/**
 * Render the User Guide modal
 * @param {object} uiState - UI state object
 * @returns {string} HTML string
 */
const renderUserGuideModal = (uiState) => {
  return `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" data-action="close-modal-bg">
          <div class="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                  <h3 class="text-lg font-bold text-white">
                      User Guide
                  </h3>
                  <button data-action="close-modal" class="text-gray-500 hover:text-white">
                      ${XMarkIcon('w-6 h-6')}
                  </button>
              </div>
              
              <div class="p-6 overflow-y-auto flex-1 prose prose-invert max-w-none custom-scrollbar">
                  ${uiState.userGuideContent || '<div class="text-center text-gray-500 py-8">Loading...</div>'}
              </div>
              
              <div class="p-4 border-t border-gray-800 bg-gray-950 flex justify-end">
                  <button 
                      data-action="close-modal"
                      class="px-4 py-2 text-gray-400 hover:text-white font-medium"
                  >
                      Close
                  </button>
              </div>
          </div>
      </div>
    `;
};

/**
 * Render the appropriate modal based on modal type
 * @param {object} uiState - UI state object
 * @param {boolean} isMobile - Mobile mode flag
 * @returns {string} HTML string
 */
const renderModal = (uiState, isMobile) => {
  if (!uiState.modalOpen) return '';

  switch (uiState.modalType) {
    case 'rhythm':
      return RhythmModal(uiState, isMobile);
    case 'instrument':
      return InstrumentModal(uiState);
    case 'userGuide':
      return renderUserGuideModal(uiState);
    default:
      return '';
  }
};

/**
 * Main TubsGrid component
 * Renders the section settings, measures with tracks, and modals
 */
export const TubsGrid = ({
  section,
  globalBpm,
  currentStep,
  selectedStroke,
  uiState,
  readOnly = false,
  isMobile = false,
  mobileCellSize = null
}) => {
  // Safety check: if section is null, return placeholder
  if (!section) {
    return `<div class="p-8 text-center text-gray-500">No active section loaded.</div>`;
  }

  // Calculate cell sizes based on mobile/desktop
  const cellSizePx = isMobile && mobileCellSize ? mobileCellSize : 40;

  // Determine icon size based on cell size
  const getIconSize = () => {
    if (cellSizePx >= 36) return 32;
    if (cellSizePx >= 28) return 24;
    return 16;
  };
  const iconSizePx = getIconSize();

  // Determine font size based on cell size
  const getFontSize = () => {
    if (cellSizePx >= 36) return '0.875rem';
    if (cellSizePx >= 28) return '0.75rem';
    return '0.625rem';
  };
  const fontSizePx = getFontSize();

  // Render all measures
  const measuresHtml = section.measures.map((measure, measureIdx) => {
    return MeasureRenderer({
      measure,
      measureIdx,
      section,
      currentStep,
      selectedStroke,
      cellSizePx,
      iconSizePx,
      fontSizePx,
      readOnly
    });
  }).join('');

  // Container classes differ between mobile and desktop
  const containerClasses = isMobile
    ? 'flex flex-col gap-2 overflow-x-auto overflow-y-auto pb-4 w-full custom-scrollbar relative outline-none ring-0'
    : 'flex flex-col gap-4 overflow-x-auto overflow-y-auto pb-8 w-full custom-scrollbar relative bg-gray-900/20 p-4 rounded-xl border border-gray-800';

  return `
        <div 
            id="tubs-scroll-container"
            class="${containerClasses}"
        >
            ${SectionSettings(section, globalBpm, readOnly)}
            ${measuresHtml}
            ${AddMeasureButton(readOnly)}
        </div>
        
        ${renderModal(uiState, isMobile)}
    `;
};

/**
 * Auto-scroll the grid to keep the current step visible during playback
 * @param {number} currentStep - Current playback step
 */
export const autoScrollGrid = (currentStep) => {
  const container = document.getElementById('tubs-scroll-container');
  if (!container) return;

  const stepElement = container.querySelector(`[data-step-marker="${currentStep}"]`);

  if (stepElement) {
    if (container.scrollWidth <= container.clientWidth) return;

    const containerRect = container.getBoundingClientRect();
    const stepRect = stepElement.getBoundingClientRect();

    const stickyHeaderWidth = 181; // w-44 + borders
    const viewableWidth = containerRect.width - stickyHeaderWidth;
    const viewableCenter = stickyHeaderWidth + (viewableWidth / 2);

    const currentStepLeftPos = (stepRect.left - containerRect.left) + container.scrollLeft;
    const targetScrollLeft = currentStepLeftPos - viewableCenter + (stepRect.width / 2);

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
  }
};