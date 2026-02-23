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
 * @param {string} params.selectedStroke - Currently selected stroke type for cursor
 */
export const TubsCell = ({
  stroke,
  dynamic = '-',
  currentGlobalStep = -1,
  isValid = true,
  trackIndex,
  stepIndex,
  measureIndex,
  instrumentDef,
  cellSizePx = 40,
  iconSizePx = 32,
  fontSizePx = '0.875rem',
  divisor, // Visual subdivision divisor
  gridSteps,
  isPlaying = false,
  isSnapOn = false, // If true, disable individual cell hover
  selectedStroke = StrokeType.Open // Currently selected stroke for cursor display
}) => {
  // 1:1 Mapping - One Step = One Cell
  const stepWidthPx = cellSizePx;

  // Is the playhead exactly on this step?
  const isPlayheadInCell = currentGlobalStep === stepIndex;

  // Rhythmic background color (visual grouping)
  const rhythmicBg = getCellBackgroundClass(stepIndex, gridSteps, divisor);

  // Guide number for empty cells
  const guideNumber = getGuideNumber(stepIndex, gridSteps, divisor);
  const guideNumberSize = getGuideNumberSize(gridSteps);

  const isRest = stroke === StrokeType.None;

  // Determine Border Logic for Visual Grouping
  let borderClass = 'border-r border-gray-600'; // Default

  if (divisor) {
    const groupSize = gridSteps / divisor;
    // Only draw right border if it's the end of a group
    // Float precision safety
    const nextIndex = stepIndex + 1;
    const isGroupEnd = Math.abs((nextIndex % groupSize)) < 0.001 || Math.abs((nextIndex % groupSize) - groupSize) < 0.001;

    if (!isGroupEnd) {
      borderClass = 'border-r-0'; // Hide internal borders
      // Optional: Add very subtle separator?
      // borderClass = 'border-r border-gray-800/30'; 
    }
  }

  // Base classes
  const baseClasses = `flex items-center justify-center select-none transition-all duration-75 relative ${borderClass}`;

  // First cell gets left border too
  const borderLeft = stepIndex === 0 ? 'border-l border-gray-600' : '';

  // Interaction states (only when not playing)
  // Use stroke-invalid class for CSS-based cursor control (handled by dynamic style tag)
  const invalidClass = !isValid ? 'opacity-50 stroke-invalid' : '';

  // Hover class - more visible highlight when editing
  // If Snap is ON, individual cells should NOT light up (the group handles it)
  const hoverClass = isValid && !isPlaying && !isSnapOn ? "hover:bg-cyan-500/30 hover:ring-1 hover:ring-cyan-400/50" : "";



  // Render playhead indicator - Now handled at grid level as unified bar
  // Both during playback (updateVisualStep) and when paused (renderStaticPlayhead in tubsGrid)
  const renderPlayhead = () => {
    // Always return empty - unified bar is rendered at grid level
    return '';
  };

  // Data attributes for event delegation
  return `
    <button 
      class="${baseClasses} ${borderLeft} ${rhythmicBg} ${invalidClass} ${hoverClass}"
      style="width: ${stepWidthPx}px; height: ${cellSizePx}px;"
      data-role="tubs-cell"
      data-track-index="${trackIndex}"
      data-step-index="${stepIndex}"
      data-measure-index="${measureIndex || 0}"
      data-stroke="${stroke}"
      data-dynamic="${dynamic}"
      title="${!isValid ? "Stroke not allowed for this instrument" : ""}"
    >
      
      <!-- Playhead Indicator -->
      ${renderPlayhead()}

      <!-- Guide Number: Visible when empty AND not playing, hidden when symbol present or playing -->
      <div class="
        absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-all duration-200
        ${isRest && !isPlaying ? 'opacity-30' : 'opacity-0 scale-50'}
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

      // Map dynamics to visual hints
      let dynClasses = '';
      let dynStyle = '';
      if (dynamic === 'g') dynClasses = 'scale-50 opacity-40';
      else if (dynamic === 's') dynClasses = 'scale-75 opacity-70';
      else if (dynamic === 'l') {
        dynClasses = 'scale-[1.2] brightness-110';
        dynStyle = 'filter: drop-shadow(0 0 6px rgba(251,146,60,1)) drop-shadow(0 0 10px rgba(251,146,60,0.8));';
      }
      else if (dynamic === 'a') {
        dynClasses = 'scale-[1.4] brightness-125';
        dynStyle = 'filter: drop-shadow(0 0 8px rgba(239,68,68,1)) drop-shadow(0 0 15px rgba(239,68,68,1));';
      }

      // Try to find SVG in instrument definition
      if (instrumentDef && instrumentDef.sounds) {
        const soundDef = instrumentDef.sounds.find(s => s.letter === stroke);
        if (soundDef && soundDef.svg) {
          // Wrap in a span that handles the dynamic scaling/glowing so the image itself isn't distorted
          return `<img src="data/assets/icons/${soundDef.svg}?v=5" style="width: ${iconSizePx}px; height: ${iconSizePx}px; ${dynStyle}" class="pointer-events-none select-none drop-shadow-md transition-all duration-200 ${dynClasses}" alt="${stroke}${dynamic !== '-' ? dynamic : ''}" />`;
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
