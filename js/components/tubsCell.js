import { StrokeType } from '../types.js';
import { STROKE_COLORS } from '../constants.js';

export const TubsCell = ({
  stroke,
  isCurrentStep,
  isValid = true,
  trackIndex,
  stepIndex,
  measureIndex,
  instrumentDef
}) => {
  const baseClasses = "w-10 h-10 border border-gray-700 flex items-center justify-center text-sm select-none transition-all duration-75 relative";

  // Interaction states
  const cursorClass = isValid ? "cursor-pointer" : "cursor-not-allowed opacity-50";
  const hoverClass = isValid ? "hover:border-gray-500 hover:bg-gray-800" : "";

  // Active/Playing state
  const activeClass = isCurrentStep ? "ring-2 ring-white z-10 scale-105 shadow-lg shadow-cyan-500/50" : "";

  // Visual styling based on stroke type
  const colorClass = STROKE_COLORS[stroke] || STROKE_COLORS[StrokeType.None];

  // Ghost effect for empty cells on current step
  const stepHighlight = isCurrentStep && stroke === StrokeType.None ? "bg-gray-800" : "";

  // Data attributes are crucial for the Event Delegation in TubsGrid
  return `
    <div 
      class="${baseClasses} ${colorClass} ${activeClass} ${stepHighlight} ${cursorClass} ${hoverClass}"
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
          // Determine color class for SVG (using current text color logic or just forcing white/black)
          // For now, let's just use the SVG image. 
          // We might want to apply the stroke color to the SVG using CSS filters or mask, 
          // but for now simple image replacement is the goal.
          // Assuming SVGs are in data/assets/icons/
          return `<img src="data/assets/icons/${soundDef.svg}" class="w-8 h-8 pointer-events-none select-none" alt="${stroke}" />`;
        }
      }

      // Fallback to text
      return stroke;
    })()}
    </div>
  `;
};