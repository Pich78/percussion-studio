/*
  js/components/grid/trackRow.js
  Renders a single track row with cells.
  Extracted from tubsGrid.js for modularity.
*/

import { INSTRUMENT_COLORS } from '../../constants.js';
import { TubsCell } from '../tubsCell.js';
import { StrokeType } from '../../types.js';
import { state } from '../../store.js';
import { isInstrumentMuted, getMixVolume } from '../../store/stateSelectors.js';

// Icons
import { TrashIcon } from '../../icons/trashIcon.js';

/**
 * Render the grid cells for a track
 * @param {object} params - Render parameters
 * @returns {string} HTML string
 */
const renderTrackCells = ({
  track,
  trackIdx,
  measureIdx,
  section,
  currentStep,
  isStrokeValid,
  instDef,
  cellSizePx,
  iconSizePx,
  fontSizePx,
  readOnly,
  selectedStroke,
  isPlaying
}) => {
  const divisor = track.trackSteps || section.subdivision || 4;
  const totalSteps = section.steps;

  if (divisor && divisor <= totalSteps) {
    // Grouped Mode
    const groupSize = totalSteps / divisor;
    const groups = [];

    for (let i = 0; i < divisor; i++) {
      const startIdx = Math.round(i * groupSize);
      const endIdx = Math.round((i + 1) * groupSize);

      const groupHtml = [];
      for (let s = startIdx; s < endIdx; s++) {
        if (s < track.strokes.length) {
          groupHtml.push(TubsCell({
            stroke: track.strokes[s],
            dynamic: track.dynamics ? track.dynamics[s] : '-',
            currentGlobalStep: currentStep,
            isValid: isStrokeValid,
            trackIndex: trackIdx,
            stepIndex: s,
            measureIndex: measureIdx,
            instrumentDef: instDef,
            cellSizePx,
            iconSizePx,
            fontSizePx,
            divisor: divisor,
            gridSteps: totalSteps,
            isPlaying,
            isSnapOn: track.snapToGrid,
            selectedStroke
          }));
        }
      }

      const groupHoverClass = 'hover:bg-cyan-500/30 hover:ring-1 hover:ring-cyan-400/50 hover:rounded-sm z-0 hover:z-10 cursor-pointer';

      groups.push(`
                <div class="flex ${groupHoverClass} transition-all duration-100">
                    ${groupHtml.join('')}
                </div>
            `);
    }
    return groups.join('');
  } else {
    // Fallback / Flat Mode
    return track.strokes.map((stroke, stepIdx) => {
      return TubsCell({
        stroke,
        dynamic: track.dynamics ? track.dynamics[stepIdx] : '-',
        currentGlobalStep: currentStep,
        isValid: isStrokeValid,
        trackIndex: trackIdx,
        stepIndex: stepIdx,
        measureIndex: measureIdx,
        instrumentDef: instDef,
        cellSizePx,
        iconSizePx,
        fontSizePx,
        divisor: divisor,
        gridSteps: section.steps,
        isPlaying,
        selectedStroke
      });
    }).join('');
  }
};

/**
 * Render a single track row
 * @param {object} params - Render parameters
 * @returns {string} HTML string
 */
export const TrackRow = ({
  track,
  trackIdx,
  measureIdx,
  section,
  currentStep,
  selectedStroke,
  cellSizePx,
  iconSizePx,
  fontSizePx,
  readOnly,
  instrumentDefinitions = {},
  isPlaying = false
}) => {
  const instDef = instrumentDefinitions[track.instrument];
  let isStrokeValid = true;

  if (instDef && selectedStroke !== StrokeType.None) {
    isStrokeValid = instDef.sounds.some(s => s.letter.toUpperCase() === selectedStroke.toUpperCase());
  }

  const borderColor = INSTRUMENT_COLORS[track.instrument] || 'border-l-4 border-gray-700';
  const displayName = instDef ? instDef.name : track.instrument;

  // Visual "muted/zeroed-out" styling is derived from state.mix[symbol],
  // not from a per-track field.
  const isMutedOrZero = isInstrumentMuted(state, track.instrument) || getMixVolume(state, track.instrument) === 0;

  // Get pack display name (format: basic_bata -> Basic Bata)
  const packName = track.pack ? track.pack.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Default';

  return `
        <div class="flex items-center group min-w-max transition-opacity duration-300 ${isMutedOrZero ? 'opacity-50' : 'opacity-100'}">
          <!-- Instrument Label - Sticky -->
          <div class="sticky left-0 z-20 flex-shrink-0 flex items-center ${borderColor} bg-gray-950 border-r border-gray-800 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
            
            <!-- Instrument Info Block -->
            <div class="relative w-44 flex flex-col justify-center px-3 py-1.5">
              <!-- Row 1: Instrument Name -->
              <div class="flex items-center gap-1">
                <span class="font-bold text-sm select-none text-left truncate flex-1 text-gray-200 ${isMutedOrZero ? 'text-gray-500 line-through' : ''}" title="${displayName}">${displayName}</span>
              </div>
              
              <!-- Row 2: Edit Controls (only when stopped and editable; mute/volume are in the Mixer modal) -->
              <div class="flex items-center gap-1 mt-0.5 h-4">
                ${!isPlaying && !readOnly ? `
                <button data-action="cycle-track-steps" data-track-index="${trackIdx}" data-measure-index="${measureIdx}"
                  class="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 px-1 py-0.5 rounded"
                  title="Subdivision: ${track.trackSteps || section.subdivision || 4}">÷${track.trackSteps || section.subdivision || 4}</button>
                <button data-action="toggle-track-snap" data-track-index="${trackIdx}" data-measure-index="${measureIdx}"
                  class="text-[11px] px-1 py-0.5 rounded ${track.snapToGrid ? 'text-amber-400 bg-amber-500/20' : 'text-gray-600 hover:text-gray-400 hover:bg-gray-700/50'}"
                  title="Snap: ${track.snapToGrid ? 'ON' : 'OFF'}">⊞</button>
                <button data-action="open-pack-modal" data-track-index="${trackIdx}" data-measure-index="${measureIdx}"
                  class="text-[9px] text-gray-600 hover:text-cyan-400 hover:bg-cyan-500/20 px-1 py-0.5 rounded"
                  title="Sound Pack: ${packName}">📦</button>
                <button data-action="remove-track" data-track-index="${trackIdx}" data-measure-index="${measureIdx}"
                  class="text-gray-600 hover:text-red-400 hover:bg-red-500/20 px-1 py-0.5 rounded"
                  title="Remove Track">${TrashIcon('w-3.5 h-3.5')}</button>
                ` : ''}
              </div>
            </div>
          </div>


          <!-- Grid Cells - Visual Subdivision Only -->
          <div class="flex bg-gray-900/30 p-1 rounded-r-md ml-1 ${readOnly ? 'pointer-events-none' : ''}">
            ${renderTrackCells({
      track,
      trackIdx,
      measureIdx,
      section,
      currentStep,
      isStrokeValid,
      instDef,
      cellSizePx,
      iconSizePx,
      fontSizePx,
      readOnly,
      selectedStroke,
      isPlaying
    })}
          </div>
        </div>
      `;
};
