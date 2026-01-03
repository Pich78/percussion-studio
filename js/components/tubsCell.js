import { StrokeType } from '../types.js';
import { STROKE_COLORS } from '../constants.js';

export const TubsCell = ({
  stroke,
  isCurrentStep,
  isValid = true,
  trackIndex,
  stepIndex,
  measureIndex,
  instrumentDef,
  cellSizePx = 40,  // Cell size in pixels
  iconSizePx = 32,  // Icon size in pixels
  fontSizePx = '0.875rem' // Font size
}) => {
  const baseClasses = `border border-gray-700 flex items-center justify-center select-none transition-all duration-75 relative`;

  // Interaction states
  const cursorClass = isValid ? "cursor-pointer" : "cursor-not-allowed opacity-50";
  const hoverClass = isValid ? "hover:border-gray-500 hover:bg-gray-800" : "";

  // Active/Playing state
  const activeClass = isCurrentStep ? "ring-2 ring-white z-10 scale-105 shadow-lg shadow-cyan-500/50" : "";

  // Visual styling based on stroke type
  const colorClass = STROKE_COLORS[stroke] || STROKE_COLORS[StrokeType.None];

  // Ghost effect for empty cells on current step
  const stepHighlight = isCurrentStep && stroke === StrokeType.None ? "bg-gray-800" : "";

  // Inline styles for dynamic sizing
  const cellStyle = `width: ${cellSizePx}px; height: ${cellSizePx}px; font-size: ${fontSizePx}`;

  // Data attributes are crucial for the Event Delegation in TubsGrid
  return `
    <div 
      class="${baseClasses} ${colorClass} ${activeClass} ${stepHighlight} ${cursorClass} ${hoverClass}"
      style="${cellStyle}"
      data-role="tubs-cell"
      data-track-index="${trackIndex}"
      data-step-index="${stepIndex}"
      data-measure-index="${measureIndex || 0}"
      data-stroke="${stroke}"
      title="${!isValid ? "Stroke not allowed for this instrument" : ""}"
    >
      ${(() => {
      if (stroke === StrokeType.None) return '';

      // Try to find SVG in instrument definition
      if (instrumentDef && instrumentDef.sounds) {
        const soundDef = instrumentDef.sounds.find(s => s.letter === stroke);
        if (soundDef && soundDef.svg) {
          return `<img src="data/assets/icons/${soundDef.svg}" style="width: ${iconSizePx}px; height: ${iconSizePx}px" class="pointer-events-none select-none" alt="${stroke}" />`;
        }
      }

      // Fallback to text
      return stroke;
    })()}
    </div>
  `;
};