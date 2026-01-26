import { StrokeType } from '../types.js';
import { getCellBackgroundClass, getGuideNumber, getGuideNumberSize } from '../utils/gridUtils.js';

/**
 * Renders a single cell in the TUBS grid with elastic step support
 * @param {Object} params - Cell parameters
 * @param {string} params.stroke - The stroke type
 * @param {number} params.currentGlobalStep - The global playhead step (-1 if not playing)
 * @param {boolean} params.isValid - Whether the stroke is valid for this instrument
 * @param {number} params.trackIndex - Track index
 * @param {number} params.stepIndex - Step index within this track's pattern
 * @param {number} params.measureIndex - Measure index
 * @param {Object} params.instrumentDef - Instrument definition
 * @param {number} params.cellSizePx - Base cell size in pixels
 * @param {number} params.iconSizePx - Icon size in pixels
 * @param {string} params.fontSizePx - Font size
 * @param {number} params.trackSteps - Number of steps for this track
 * @param {number} params.gridSteps - Global grid step count
 * @param {boolean} params.isPlaying - Whether playback is active
 */
export const TubsCell = ({
  stroke,
  currentGlobalStep = -1,
  isValid = true,
  trackIndex,
  stepIndex,
  measureIndex,
  instrumentDef,
  cellSizePx = 40,
  iconSizePx = 32,
  fontSizePx = '0.875rem',
  trackSteps,
  gridSteps,
  isPlaying = false
}) => {
  // Calculate how many grid cells this step spans
  const cellsPerStep = gridSteps / trackSteps;
  const stepWidthPx = cellSizePx * cellsPerStep;

  // Calculate which global steps this elastic cell covers
  const globalStepStart = stepIndex * cellsPerStep;
  const globalStepEnd = globalStepStart + cellsPerStep - 1;

  // Is the playhead currently within this elastic cell?
  const isPlayheadInCell = currentGlobalStep >= globalStepStart && currentGlobalStep <= globalStepEnd;

  // Position of playhead within this cell (in pixels from left)
  const playheadOffsetPx = isPlayheadInCell ? (currentGlobalStep - globalStepStart) * cellSizePx : -1;

  // Rhythmic background color
  const rhythmicBg = getCellBackgroundClass(stepIndex, trackSteps);

  // Guide number for empty cells
  const guideNumber = getGuideNumber(stepIndex, trackSteps);
  const guideNumberSize = getGuideNumberSize(trackSteps);

  const isRest = stroke === StrokeType.None;

  // Base classes
  const baseClasses = `flex items-center justify-center select-none transition-all duration-75 relative border-r border-gray-600`;

  // First cell gets left border too
  const borderLeft = stepIndex === 0 ? 'border-l border-gray-600' : '';

  // Interaction states (only when not playing)
  const cursorClass = isValid ? "cursor-pointer" : "cursor-not-allowed opacity-50";

  // Hover class - more visible highlight when editing
  const hoverClass = isValid && !isPlaying ? "hover:bg-cyan-500/30 hover:ring-1 hover:ring-cyan-400/50" : "";



  // Render playhead indicator - Now handled at grid level as unified bar
  // Both during playback (updateVisualStep) and when paused (renderStaticPlayhead in tubsGrid)
  const renderPlayhead = () => {
    // Always return empty - unified bar is rendered at grid level
    return '';
  };

  // Render subtle step indicator lines within elastic cells
  const renderStepIndicators = () => {
    // Only show indicators if this cell spans multiple grid steps
    if (cellsPerStep <= 1) return '';

    // Create subtle vertical lines for each internal step boundary
    const indicators = [];
    for (let i = 1; i < cellsPerStep; i++) {
      const leftPos = i * cellSizePx;
      indicators.push(`
        <div 
          class="absolute top-0 h-full pointer-events-none z-10"
          style="left: ${leftPos}px; width: 1px;"
        >
          <div class="w-full h-full border-l border-dashed border-gray-500/30"></div>
        </div>
      `);
    }
    return indicators.join('');
  };

  // Data attributes for event delegation
  return `
    <button 
      class="${baseClasses} ${borderLeft} ${rhythmicBg} ${cursorClass} ${hoverClass}"
      style="width: ${stepWidthPx}px; height: ${cellSizePx}px;"
      data-role="tubs-cell"
      data-track-index="${trackIndex}"
      data-step-index="${stepIndex}"
      data-measure-index="${measureIndex || 0}"
      data-stroke="${stroke}"
      title="${!isValid ? "Stroke not allowed for this instrument" : ""}"
    >
      <!-- Step Indicator Lines (subtle underlying grid) -->
      ${renderStepIndicators()}
      
      <!-- Playhead Indicator -->
      ${renderPlayhead()}

      <!-- Guide Number: Visible when empty, hidden when symbol present -->
      <div class="
        absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-all duration-200
        ${isRest ? 'opacity-30' : 'opacity-0 scale-50'}
      ">
        <span class="${guideNumberSize} font-bold text-slate-400">${guideNumber}</span>
      </div>

      <!-- Symbol Wrapper: Anchored to start, minimum cell size -->
      <div 
        class="absolute top-0 left-0 h-full flex items-center justify-center pointer-events-none"
        style="width: ${cellSizePx}px;"
      >
        ${(() => {
      if (isRest) return '';

      // Try to find SVG in instrument definition
      if (instrumentDef && instrumentDef.sounds) {
        const soundDef = instrumentDef.sounds.find(s => s.letter === stroke);
        if (soundDef && soundDef.svg) {
          return `<img src="data/assets/icons/${soundDef.svg}?v=5" style="width: ${iconSizePx}px; height: ${iconSizePx}px" class="pointer-events-none select-none drop-shadow-md" alt="${stroke}" />`;
        }
      }

      // Fallback to plain text (white) - log error for missing SVG
      console.error(`Missing SVG for stroke "${stroke}" in instrument "${instrumentDef?.symbol || 'unknown'}"`);
      return `<span class="font-bold text-white rounded px-1">${stroke}</span>`;
    })()}
      </div>
    </button>
  `;
};
