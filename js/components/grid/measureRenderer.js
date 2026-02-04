/*
  js/components/grid/measureRenderer.js
  Renders a single measure with its tracks.
  Extracted from tubsGrid.js for modularity.
*/

import { TrackRow } from './trackRow.js';
import { PlusIcon } from '../../icons/plusIcon.js';
import { TrashIcon } from '../../icons/trashIcon.js';
import { DocumentDuplicateIcon } from '../../icons/documentDuplicateIcon.js';

/**
 * Render the measure header with step numbers
 * @param {object} measure - Measure data
 * @param {number} measureIdx - Measure index
 * @param {object} section - Section data
 * @param {number} cellSizePx - Cell size in pixels
 * @param {boolean} readOnly - Whether in read-only mode
 * @returns {string} HTML string
 */
const renderMeasureHeader = (measure, measureIdx, section, cellSizePx, readOnly) => {
  const measureLabel = `Measure ${measureIdx + 1}`;
  const stepCount = section.steps;

  return `
        <div class="flex min-w-max mb-1">
           <!-- Sticky Measure Label -->
           <div class="sticky left-0 z-20 flex-shrink-0 flex items-center border-l-4 border-transparent bg-gray-950 border-r border-gray-800 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
               <div class="w-44 flex items-center justify-between pr-1 px-3 py-1.5">
                   <div class="pl-1 py-0.5 border-l-2 border-cyan-500 rounded-sm ml-1">
                      <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-tighter whitespace-nowrap">${measureLabel}</span>
                   </div>
                   ${!readOnly ? `
                    <div class="flex items-center">
                      <button 
                        data-action="duplicate-measure" 
                        data-measure-index="${measureIdx}"
                        class="p-1 text-gray-500 hover:text-cyan-400 transition-colors"
                        title="Duplicate Measure"
                      >
                        ${DocumentDuplicateIcon('w-3 h-3')}
                      </button>
                      <button 
                        data-action="delete-measure" 
                        data-measure-index="${measureIdx}"
                        class="p-1 text-gray-500 hover:text-red-500 transition-colors"
                        title="Delete Measure"
                      >
                        ${TrashIcon('w-3 h-3')}
                      </button>
                    </div>
                    ` : ''}
               </div>
           </div>

           <!-- Step Numbers - aligned with grid cells -->
           <div class="flex bg-gray-900/20 p-1 rounded-r-md ml-1">
              ${Array.from({ length: stepCount }).map((_, i) => `
                    <div 
                      data-step-marker="${i}" 
                      data-measure-index="${measureIdx}"
                      class="text-center text-[10px] font-mono text-gray-500 flex-shrink-0 flex items-center justify-center"
                      style="width: ${cellSizePx}px; height: ${cellSizePx * 0.6}px;"
                    >
                      ${i + 1}
                    </div>
                  `).join('')}
           </div>
        </div>
       `;
};

/**
 * Render a single measure container
 * @param {object} params - Render parameters
 * @returns {string} HTML string
 */
export const MeasureRenderer = ({
  measure,
  measureIdx,
  section,
  currentStep,
  selectedStroke,
  cellSizePx,
  iconSizePx,
  fontSizePx,
  readOnly
}) => {
  // Render all tracks in this measure
  const tracksHtml = measure.tracks.map((track, trackIdx) => {
    return TrackRow({
      track,
      trackIdx,
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

  return `
      <div class="measure-container mb-6" data-measure-index="${measureIdx}">
        <!-- Measure Header -->
        ${renderMeasureHeader(measure, measureIdx, section, cellSizePx, readOnly)}
        
        <!-- Tracks for this measure -->
        ${tracksHtml}
        
        <!-- Add Track Button (per measure) -->
        ${!readOnly ? `
        <div class="sticky left-0 z-20 w-44 pt-2">
          <button 
            data-action="open-add-modal"
            class="w-full py-2 border border-dashed border-gray-700 rounded text-gray-500 hover:text-white hover:border-gray-500 hover:bg-gray-900 flex items-center justify-center gap-2 text-xs font-bold transition-all uppercase tracking-wide"
          >
            ${PlusIcon('w-4 h-4')}
            Add Track
          </button>
        </div>
        ` : ''}
        
        <!-- Measure Separator -->
        ${measureIdx < section.measures.length - 1 ? '<div class="h-px bg-gray-700/50 my-4"></div>' : ''}
      </div>
    `;
};

/**
 * Render the "Add Measure" button
 * @param {boolean} readOnly - Whether in read-only mode
 * @returns {string} HTML string
 */
export const AddMeasureButton = (readOnly) => {
  if (readOnly) return '';

  return `
    <div class="sticky left-0 z-20 mt-4 w-fit">
      <button 
        data-action="add-measure"
        class="px-4 py-2 border border-dashed border-cyan-700 rounded text-cyan-500 hover:text-white hover:border-cyan-500 hover:bg-cyan-900/20 flex items-center gap-2 text-xs font-bold transition-all uppercase tracking-wide"
      >
        ${PlusIcon('w-4 h-4')}
        Add Measure
      </button>
    </div>
    `;
};
