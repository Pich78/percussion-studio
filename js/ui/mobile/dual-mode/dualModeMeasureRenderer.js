/**
 * js/ui/mobile/dual-mode/dualModeMeasureRenderer.js
 *
 * A fork of js/components/grid/measureRenderer.js for the Dual Mode
 * landscape grid. Uses DualModeTrackRow instead of the standard TrackRow.
 *
 * Differences from the standard MeasureRenderer:
 * - Uses DualModeTrackRow (name-only label column)
 * - Keeps the measure header (step numbers + measure label) unchanged
 * - No "Add Track" button (Dual Mode grid is always read-only)
 *
 * DO NOT modify measureRenderer.js; all Dual Mode-specific changes live here.
 */

import { DualModeTrackRow } from './dualModeTrackRow.js';

/**
 * Render the measure header with step numbers — identical to standard MeasureRenderer.
 */
const renderMeasureHeader = (measure, measureIdx, section) => {
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
           </div>
       </div>

       <!-- Step Numbers - aligned with grid cells -->
       <div class="flex bg-gray-900/20 p-1 rounded-r-md ml-1">
          ${Array.from({ length: stepCount }).map((_, i) => `
                <div 
                  data-step-marker="${i}" 
                  data-measure-index="${measureIdx}"
                  class="text-center text-[10px] font-mono text-gray-500 flex-shrink-0 flex items-center justify-center"
                  style="width: var(--cell-size, 40px); height: calc(var(--cell-size, 40px) * 0.6);"
                >
                  ${i + 1}
                </div>
              `).join('')}
       </div>
    </div>`;
};

/**
 * Render a single measure using the Dual Mode track row variant.
 *
 * @param {object} params
 * @param {object} params.measure        - Measure data
 * @param {number} params.measureIdx     - 0-based measure index
 * @param {object} params.section        - Parent section
 * @param {number} params.currentStep    - Current playhead step
 * @param {number} params.selectedStroke - Currently selected stroke type
 * @param {object} params.instrumentDefinitions - Instrument metadata map
 * @param {boolean} params.isPlaying     - Whether playback is active
 */
export const DualModeMeasureRenderer = ({
    measure,
    measureIdx,
    section,
    currentStep,
    selectedStroke,
    instrumentDefinitions = {},
    isPlaying = false
}) => {
    const tracksHtml = measure.tracks.map((track, trackIdx) =>
        DualModeTrackRow({
            track,
            trackIdx,
            measureIdx,
            section,
            currentStep,
            selectedStroke,
            instrumentDefinitions,
            isPlaying
        })
    ).join('');

    return `
    <div class="measure-container mb-6" data-measure-index="${measureIdx}" style="scroll-snap-align: start;">
        <!-- Measure Header -->
        ${renderMeasureHeader(measure, measureIdx, section)}

        <!-- Tracks (Dual Mode variant — name-only label) -->
        ${tracksHtml}

        <!-- Measure Separator -->
        ${measureIdx < section.measures.length - 1 ? '<div class="h-px bg-gray-700/50 my-4"></div>' : ''}
    </div>`;
};
