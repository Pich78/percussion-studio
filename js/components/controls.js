import { STROKE_PALETTE, STROKE_COLORS } from '../constants.js';
import { TrashIcon } from '../icons/trashIcon.js';

export const Controls = ({ selectedStroke }) => {

    const renderPalette = () => {
        return STROKE_PALETTE.map((item) => {
            const isSelected = selectedStroke === item.type;
            const colorClass = STROKE_COLORS[item.type];

            const activeClass = isSelected
                ? 'ring-2 ring-white scale-110 z-10 shadow-lg opacity-100 grayscale-0'
                : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0';

            return `
        <button
          data-action="select-stroke"
          data-stroke="${item.type}"
          class="
            w-10 h-10 rounded flex items-center justify-center font-bold text-sm transition-all
            ${colorClass}
            ${activeClass}
          "
          title="${item.label}"
        >
          ${item.type}
        </button>
      `;
        }).join('');
    };

    return `
    <div class="bg-gray-950 border-t border-gray-800 p-3 flex items-center justify-between gap-4 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] z-20">
      
      <!-- Left: Clear -->
      <div>
        <button 
          data-action="clear-pattern"
          class="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-400 hover:bg-gray-900 rounded-lg transition-colors" 
          title="Clear Pattern"
        >
          ${TrashIcon('w-5 h-5')}
          <span class="text-xs font-bold uppercase hidden md:inline">Clear</span>
        </button>
      </div>

      <!-- Center: Palette -->
      <div class="flex gap-2 p-1.5 bg-gray-900 rounded-lg border border-gray-800">
        ${renderPalette()}
      </div>

      <!-- Right: Spacer (was AI tools) -->
      <div class="w-24"></div> 
    </div>
  `;
};