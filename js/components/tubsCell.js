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
  cellSize = 'normal' // 'normal' (40px), 'small' (32px), 'tiny' (24px)
}) => {
  // Dynamic sizing classes
  const sizeClasses = {
    normal: 'w-10 h-10 text-sm',
    small: 'w-8 h-8 text-xs',
    tiny: 'w-6 h-6 text-[10px]'
  };

  const iconSizeClasses = {
    normal: 'w-8 h-8',
    small: 'w-6 h-6',
    tiny: 'w-4 h-4'
  };

  const baseClasses = `${sizeClasses[cellSize] || sizeClasses.normal} border border-gray-700 flex items-center justify-center select-none transition-all duration-75 relative`;

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
          const iconSize = iconSizeClasses[cellSize] || iconSizeClasses.normal;
          return `<img src="data/assets/icons/${soundDef.svg}" class="${iconSize} pointer-events-none select-none" alt="${stroke}" />`;
        }
      }

      // Fallback to text
      return stroke;
    })()}
    </div>
  `;
};