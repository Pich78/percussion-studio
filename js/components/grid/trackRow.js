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

    return `
        <div class="flex items-center group min-w-max transition-opacity duration-300 ${track.muted || track.volume === 0 ? 'opacity-50' : 'opacity-100'}">
          <!-- Instrument Label - Sticky -->
          <div class="sticky left-0 z-20 w-44 flex-shrink-0 pr-2 flex flex-col justify-center ${borderColor} pl-3 bg-gray-950 border-r border-gray-800 py-2 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
            
            <div class="flex items-center justify-between mb-1">
              ${renderTrackName(track, trackIdx, measureIdx, displayName, readOnly)}
              
              <div class="flex items-center gap-1">
                 ${!readOnly ? `
                 <!-- Subdivision Badge (click to cycle) -->
                 <button 
                   data-action="cycle-track-steps"
                   data-track-index="${trackIdx}"
                   data-measure-index="${measureIdx}"
                   class="px-1 py-0.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 
                          rounded text-[10px] font-mono font-bold border border-indigo-500/30
                          hover:border-indigo-400/50 transition-all"
                   title="Subdivision: ${track.trackSteps || section.subdivision || 4} steps (click to change)"
                 >
                   ÷${track.trackSteps || section.subdivision || 4}
                 </button>

                 <!-- Snap Toggle Button -->
                 <button
                   data-action="toggle-track-snap"
                   data-track-index="${trackIdx}"
                   data-measure-index="${measureIdx}"
                   class="px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${track.snapToGrid
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-gray-800 text-gray-500 border-gray-700 hover:text-gray-300'}"
                   title="Snap to Step: ${track.snapToGrid ? 'ON (Preserve Index)' : 'OFF (Preserve Time)'}"
                 >
                    ${track.snapToGrid ? 'S' : 'S'}
                 </button>
                 ` : ''}
                 <button data-action="toggle-mute" data-track-index="${trackIdx}" data-measure-index="${measureIdx}" class="text-gray-500 hover:text-white" title="${track.muted ? "Unmute" : "Mute"}">
                  ${track.muted ? SpeakerXMarkIcon('w-3.5 h-3.5') : SpeakerWaveIcon('w-3.5 h-3.5')}
                </button>
                ${!readOnly ? `
                <button data-action="remove-track" data-track-index="${trackIdx}" data-measure-index="${measureIdx}" class="text-gray-600 hover:text-red-500" title="Remove Track">
                  ${TrashIcon('w-3.5 h-3.5')}
                </button>
                ` : ''}
              </div>
            </div>
            
            <!-- Volume Slider Row -->
            <div class="flex items-center">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value="${track.volume ?? 1.0}" 
                data-action="update-volume"
                data-track-index="${trackIdx}"
                data-measure-index="${measureIdx}"
                class="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-cyan-400"
                title="Volume"
              />
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
