/**
 * js/ui/mobile/practitioner/practitionerTrackRow.js
 *
 * A fork of js/components/grid/trackRow.js tailored for the Practitioner
 * landscape grid. The only difference is the sticky label column:
 * instead of showing instrument name + volume slider + mute/edit controls,
 * it shows ONLY the instrument name, centered, coloured, and clickable to
 * cycle the colour metric.
 *
 * The cells rendering (TubsCell) is identical to the standard TrackRow —
 * so the grid behaviour is exactly the same as the standard view.
 *
 * DO NOT modify trackRow.js; all Practitioner-specific changes live here.
 */

import { INSTRUMENT_COLORS } from '../../../constants.js';
import { TubsCell } from '../../../components/tubsCell.js';
import { StrokeType } from '../../../types.js';

/**
 * Render the grid cells — identical to the shared TrackRow implementation.
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
    selectedStroke,
    isPlaying
}) => {
    const divisor = track.trackSteps || section.subdivision || 4;
    const totalSteps = section.steps;

    if (divisor && divisor <= totalSteps) {
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
                        divisor,
                        gridSteps: totalSteps,
                        isPlaying,
                        isSnapOn: track.snapToGrid,
                        selectedStroke
                    }));
                }
            }

            const groupHoverClass = 'hover:bg-cyan-500/30 hover:ring-1 hover:ring-cyan-400/50 hover:rounded-sm z-0 hover:z-10 cursor-pointer';
            groups.push(`<div class="flex ${groupHoverClass} transition-all duration-100">${groupHtml.join('')}</div>`);
        }
        return groups.join('');
    } else {
        return track.strokes.map((stroke, stepIdx) => TubsCell({
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
            divisor,
            gridSteps: section.steps,
            isPlaying,
            selectedStroke
        })).join('');
    }
};

/**
 * Render a single track row for the Practitioner grid.
 *
 * The sticky label column contains ONLY the instrument name, centred,
 * styled with the instrument's accent colour, and clickable to cycle the
 * colour metric. No volume slider, no mute button — those live in the
 * Mixer chip popover instead.
 *
 * The cells area is 100 % identical to the standard TrackRow.
 */
export const PractitionerTrackRow = ({
    track,
    trackIdx,
    measureIdx,
    section,
    currentStep,
    selectedStroke,
    cellSizePx,
    iconSizePx,
    fontSizePx,
    instrumentDefinitions = {},
    isPlaying = false
}) => {
    const instDef = instrumentDefinitions[track.instrument];
    let isStrokeValid = true;

    if (instDef && selectedStroke !== StrokeType.None) {
        isStrokeValid = instDef.sounds.some(s => s.letter.toUpperCase() === selectedStroke.toUpperCase());
    }

    const borderColorClass = INSTRUMENT_COLORS[track.instrument] || 'border-l-4 border-gray-700';
    const displayName = instDef ? instDef.name : track.instrument;
    const nameColor = instDef?.color || '#d1d5db';
    const isMuted = track.muted || track.volume === 0;

    // ── Practitioner-specific sticky label: name only, centred ──────────────
    const labelHtml = `
    <div class="sticky left-0 z-20 flex-shrink-0 flex items-center ${borderColorClass} bg-gray-950 border-r border-gray-800 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
        <div class="w-44 flex items-center justify-center px-3 py-1.5">
            <button
                data-action="practitioner-cycle-colour"
                data-track-index="${trackIdx}"
                class="text-sm font-bold text-center leading-tight hover:opacity-75 active:opacity-50 transition-opacity cursor-pointer truncate w-full ${isMuted ? 'line-through opacity-40' : ''}"
                style="color: ${isMuted ? '#6b7280' : nameColor};"
                title="${displayName}${isMuted ? ' (muted)' : ' — tap to cycle colour'}"
            >
                ${displayName}
            </button>
        </div>
    </div>`;

    return `
    <div class="flex items-center group min-w-max transition-opacity duration-300 ${isMuted ? 'opacity-50' : 'opacity-100'}">
        ${labelHtml}

        <!-- Grid Cells — identical to standard TrackRow -->
        <div class="flex bg-gray-900/30 p-1 rounded-r-md ml-1 pointer-events-none">
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
                selectedStroke,
                isPlaying
            })}
        </div>
    </div>`;
};
