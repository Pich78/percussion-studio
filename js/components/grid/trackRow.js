/*
  js/components/grid/trackRow.js
  Renders a single track row with cells.
  Extracted from tubsGrid.js for modularity.
*/

import { INSTRUMENT_COLORS } from '../../constants.js';
import { TubsCell } from '../tubsCell.js';
import { state } from '../../store.js';
import { StrokeType } from '../../types.js';

// Icons
import { SpeakerXMarkIcon } from '../../icons/speakerXMarkIcon.js';
import { SpeakerWaveIcon } from '../../icons/speakerWaveIcon.js';
import { TrashIcon } from '../../icons/trashIcon.js';

/**
 * Render the track name display/button
 * @param {object} track - Track data
 * @param {number} trackIdx - Track index
 * @param {number} measureIdx - Measure index
 * @param {string} displayName - Display name
 * @param {boolean} readOnly - Whether in read-only mode
 * @returns {string} HTML string
 */
const renderTrackName = (track, trackIdx, measureIdx, displayName, readOnly) => {
  if (readOnly) {
    return `<span class="font-bold text-sm select-none text-left truncate w-20 text-gray-200 ${track.muted || track.volume === 0 ? 'text-gray-500 line-through' : ''}" title="${displayName}">${displayName}</span>`;
  }
  return `
        <button 
            class="font-bold text-sm cursor-pointer select-none hover:text-cyan-400 hover:underline text-left truncate w-20 ${track.muted || track.volume === 0 ? 'text-gray-500 line-through' : 'text-gray-200'}"
            data-action="open-edit-modal"
            data-track-index="${trackIdx}"
            data-measure-index="${measureIdx}"
            title="Change Instrument (${displayName})"
        >
            ${displayName}
        </button>
      `;
};

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
  readOnly
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
            isPlaying: state.isPlaying,
            isSnapOn: track.snapToGrid
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
        isPlaying: state.isPlaying
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
  readOnly
}) => {
  const instDef = state.instrumentDefinitions[track.instrument];
  let isStrokeValid = true;

  if (instDef && selectedStroke !== StrokeType.None) {
    isStrokeValid = instDef.sounds.some(s => s.letter.toUpperCase() === selectedStroke.toUpperCase());
  }

  const borderColor = INSTRUMENT_COLORS[track.instrument] || 'border-l-4 border-gray-700';
  const displayName = instDef ? instDef.name : track.instrument;

  // Get pack display name (format: basic_bata -> Basic Bata)
  const packName = track.pack ? track.pack.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Default';

  return `
        <div class="flex items-center group min-w-max transition-opacity duration-300 ${track.muted || track.volume === 0 ? 'opacity-50' : 'opacity-100'}">
          <!-- Instrument Label - Sticky -->
          <div class="sticky left-0 z-20 flex-shrink-0 flex items-center ${borderColor} bg-gray-950 border-r border-gray-800 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
            
            <!-- Instrument Info Block -->
            <div class="relative w-44 flex flex-col justify-center px-3 py-1.5">
              <!-- Row 1: Instrument Name -->
              <div class="flex items-center gap-1">
                ${readOnly || !state.isPlaying
      ? `<span class="font-bold text-sm select-none text-left truncate flex-1 text-gray-200 ${track.muted || track.volume === 0 ? 'text-gray-500 line-through' : ''}" title="${displayName}">${displayName}</span>`
      : `<button 
                      class="font-bold text-sm cursor-pointer select-none hover:text-cyan-400 text-left truncate ${track.muted || track.volume === 0 ? 'text-gray-500 line-through' : 'text-gray-200'}"
                      data-action="toggle-mute"
                      data-track-index="${trackIdx}"
                      data-measure-index="${measureIdx}"
                      title="Click to ${track.muted ? 'Unmute' : 'Mute'} (${displayName})"
                    >${displayName}</button>`
    }
              </div>
              
              <!-- Row 2: Context-Aware Controls -->
              <div class="flex items-center gap-1 mt-0.5 h-4">
                ${state.isPlaying ? `
                <!-- PLAYING: Mute + Volume -->
                <button 
                  data-action="toggle-mute" 
                  data-track-index="${trackIdx}" 
                  data-measure-index="${measureIdx}" 
                  class="flex-shrink-0 mr-2 ${track.muted ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}"
                  title="${track.muted ? 'Unmute' : 'Mute'}"
                >${track.muted ? SpeakerXMarkIcon('w-3.5 h-3.5') : SpeakerWaveIcon('w-3.5 h-3.5')}</button>
                
                <!-- Volume Slider with Handle and Percentage -->
                <div class="flex-1 relative h-5 flex items-center group/vol ml-1">
                  <!-- Background track -->
                  <div class="absolute left-0 right-0 h-2 bg-gray-800 rounded-full"></div>
                  <!-- Fill bar -->
                  <div class="absolute left-0 h-2 bg-gradient-to-r from-gray-500 to-gray-300 rounded-full pointer-events-none" style="width: ${(track.volume ?? 1.0) * 100}%"></div>
                  <!-- Percentage label -->
                  <span class="absolute left-1 text-[8px] font-medium text-white/90 pointer-events-none z-10" style="text-shadow: 0 1px 2px rgba(0,0,0,0.8)">${Math.round((track.volume ?? 1.0) * 100)}%</span>
                  <!-- Handle -->
                  <div class="absolute w-3 h-3 bg-white rounded-full shadow-md border border-gray-300 pointer-events-none transition-transform group-hover/vol:scale-110" style="left: calc(${(track.volume ?? 1.0) * 100}% - 6px)"></div>
                  <!-- Range input (visible cursor area) -->
                  <input type="range" min="0" max="1" step="0.01" value="${track.volume ?? 1.0}" 
                    data-action="update-volume" data-track-index="${trackIdx}" data-measure-index="${measureIdx}"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    title="Volume: ${Math.round((track.volume ?? 1.0) * 100)}%"/>
                </div>
                ` : `
                <!-- STOPPED: Edit Controls -->
                ${!readOnly ? `
                <button data-action="cycle-track-steps" data-track-index="${trackIdx}" data-measure-index="${measureIdx}"
                  class="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 px-1 py-0.5 rounded"
                  title="Subdivision: ${track.trackSteps || section.subdivision || 4}">÷${track.trackSteps || section.subdivision || 4}</button>
                <button data-action="toggle-track-snap" data-track-index="${trackIdx}" data-measure-index="${measureIdx}"
                  class="text-[11px] px-1 py-0.5 rounded ${track.snapToGrid ? 'text-amber-400 bg-amber-500/20' : 'text-gray-600 hover:text-gray-400 hover:bg-gray-700/50'}"
                  title="Snap: ${track.snapToGrid ? 'ON' : 'OFF'}">⊞</button>
                <button data-action="toggle-mute" data-track-index="${trackIdx}" data-measure-index="${measureIdx}"
                  class="px-1 py-0.5 rounded ${track.muted ? 'text-red-400 bg-red-500/20' : 'text-gray-600 hover:text-gray-400 hover:bg-gray-700/50'}"
                  title="${track.muted ? 'Unmute' : 'Mute'}">${track.muted ? SpeakerXMarkIcon('w-3.5 h-3.5') : SpeakerWaveIcon('w-3.5 h-3.5')}</button>
                <button data-action="open-pack-modal" data-track-index="${trackIdx}" data-measure-index="${measureIdx}"
                  class="text-[9px] text-gray-600 hover:text-cyan-400 hover:bg-cyan-500/20 px-1 py-0.5 rounded"
                  title="Sound Pack: ${packName}">📦</button>
                <button data-action="remove-track" data-track-index="${trackIdx}" data-measure-index="${measureIdx}"
                  class="text-gray-600 hover:text-red-400 hover:bg-red-500/20 px-1 py-0.5 rounded"
                  title="Remove Track">${TrashIcon('w-3.5 h-3.5')}</button>
                ` : `
                <button data-action="toggle-mute" data-track-index="${trackIdx}" data-measure-index="${measureIdx}"
                  class="${track.muted ? 'text-red-400' : 'text-gray-600 hover:text-gray-400'}"
                  title="${track.muted ? 'Unmute' : 'Mute'}">${track.muted ? SpeakerXMarkIcon('w-3.5 h-3.5') : SpeakerWaveIcon('w-3.5 h-3.5')}</button>
                `}
                `}
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
      readOnly
    })}
          </div>
        </div>
      `;
};
