/* 
  js/components/pieMenu.js
  Provides a contextual radial menu triggered by hovering grid cells.
*/

import { StrokeType } from '../types.js';
import { state } from '../store.js';

/**
 * Calculates the position for each slice in a radial menu
 * @param {number} totalItems - Total number of items
 * @param {number} index - Current item index
 * @param {number} radius - Radius of the menu
 * @returns {Object} { x, y } coordinates relative to center
 */
const getSlicePosition = (totalItems, index, radius) => {
    // Start at top (-90 degrees)
    const angleOffset = -Math.PI / 2;
    // Distribute evenly
    const angleStrides = (Math.PI * 2) / totalItems;
    const angle = angleOffset + (index * angleStrides);

    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
    };
};

/**
 * Renders the global Pie Menu component
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Is the menu currently open
 * @param {number} props.x - Center X coordinate (viewport)
 * @param {number} props.y - Center Y coordinate (viewport)
 * @param {Object} props.instrumentDef - The instrument definition object with allowed sounds
 * @param {number} props.trackIndex - Context: track index
 * @param {number} props.stepIndex - Context: step index
 * @param {number} props.measureIndex - Context: measure index
 * @returns {string} HTML string
 */
export const PieMenu = ({
    isOpen,
    x, y,
    instrumentDef,
    trackIndex,
    stepIndex,
    measureIndex
}) => {
    if (!isOpen || !instrumentDef || !instrumentDef.sounds) return '';

    // Create an array of options. We always add the "Rest/None" option to the list.
    const options = [
        ...instrumentDef.sounds,
        { letter: StrokeType.None, name: 'Rest', isRest: true, svg: 'rest.svg' } // Synthesized Rest option
    ];

    const totalItems = options.length;

    // Size heuristics based on number of items
    const radius = totalItems <= 4 ? 45 : (totalItems <= 6 ? 55 : 65);
    const itemSize = totalItems <= 4 ? 40 : 36;

    const slicesHtml = options.map((sound, i) => {
        const pos = getSlicePosition(totalItems, i, radius);

        // Render either the SVG icon or text fallback
        let iconHtml;
        if (sound.svg) {
            iconHtml = `<img src="data/assets/icons/${sound.svg}?v=5" class="w-6 h-6 drop-shadow-md pointer-events-none select-none" alt="${sound.name || sound.letter}" />`;
        } else {
            iconHtml = `<span class="font-bold text-sm text-white">${sound.letter}</span>`;
        }

        const isRestHoverClass = sound.isRest ? 'hover:bg-red-500/80 hover:scale-110' : 'hover:bg-cyan-500 hover:scale-110';

        return `
            <button 
                class="absolute flex items-center justify-center rounded-full bg-gray-800 border border-gray-600 shadow-xl transition-all duration-150 transform -translate-x-1/2 -translate-y-1/2 ${isRestHoverClass}"
                style="
                    left: ${pos.x}px; 
                    top: ${pos.y}px; 
                    width: ${itemSize}px; 
                    height: ${itemSize}px;
                "
                data-action="pie-menu-select"
                data-stroke="${sound.letter}"
                title="${sound.name || 'Rest'}"
            >
                ${iconHtml}
            </button>
        `;
    }).join('');

    // The container acts as the hover bridge between the cell and the floating items.
    // It needs to be slightly larger than the radius to catch the mouse.
    const hitAreaSize = (radius + itemSize) * 2;

    return `
        <div 
            id="pie-menu-container"
            class="fixed z-50 pointer-events-auto transition-opacity duration-150 animate-in fade-in zoom-in-95"
            style="
                left: ${x}px; 
                top: ${y}px; 
                transform: translate(-50%, -50%);
            "
        >
            <!-- Hit Area Container / Backdrop -->
            <div 
                class="absolute rounded-full bg-gray-950/80 backdrop-blur-sm border border-gray-700/50 shadow-2xl"
                style="
                    width: ${hitAreaSize}px;
                    height: ${hitAreaSize}px;
                    left: -${hitAreaSize / 2}px;
                    top: -${hitAreaSize / 2}px;
                "
                data-role="pie-menu-bridge"
            ></div>
            
            <!-- Central Node (Optional, maybe an indicator of instrument) -->
            <div class="absolute w-4 h-4 rounded-full bg-gray-700/50 border border-gray-500/50 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            <!-- Slices -->
            ${slicesHtml}
        </div>
    `;
};
