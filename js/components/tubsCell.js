import { StrokeType } from '../types.js';
import { STROKE_COLORS } from '../constants.js';

export const TubsCell = ({
    stroke,
    isCurrentStep,
    isValid = true,
    trackIndex,
    stepIndex
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
      data-stroke="${stroke}"
      title="${!isValid ? "Stroke not allowed for this instrument" : ""}"
    >
      ${stroke === StrokeType.None ? '' : stroke}
    </div>
  `;
};