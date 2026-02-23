import { STROKE_PALETTE } from '../constants.js';
import { TrashIcon } from '../icons/trashIcon.js';
import { DynamicType } from '../types.js';

const DYNAMIC_OPTIONS = [
  { type: DynamicType.Ghost, label: 'Ghost', iconClass: 'scale-50 opacity-40', style: '' },
  { type: DynamicType.Soft, label: 'Soft', iconClass: 'scale-75 opacity-70', style: '' },
  { type: DynamicType.Normal, label: 'Normal', iconClass: '', style: '' },
  { type: DynamicType.Loud, label: 'Loud', iconClass: 'scale-[1.2] text-orange-400 brightness-110', style: 'box-shadow: 0 0 10px 2px rgba(251,146,60,0.8);' },
  { type: DynamicType.Accent, label: 'Accent', iconClass: 'scale-[1.4] text-red-500 brightness-125', style: 'box-shadow: 0 0 12px 3px rgba(239,68,68,0.9);' }
];

export const Controls = ({ selectedStroke, selectedDynamic = DynamicType.Normal }) => {

  const renderPalette = () => {
    return STROKE_PALETTE.map((item) => {
      const isSelected = selectedStroke === item.type;

      const activeClass = isSelected
        ? 'ring-2 ring-white scale-105 z-10 shadow-lg opacity-100 grayscale-0 bg-gray-800'
        : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0 hover:bg-gray-800';

      const content = item.svg
        ? `<img src="data/assets/icons/${item.svg}?v=5" class="w-6 h-6 mb-1 pointer-events-none select-none" alt="${item.label}" />`
        : `<span class="text-lg font-bold mb-1 pointer-events-none select-none">${item.type}</span>`;

      return `
        <button
          data-action="select-stroke"
          data-stroke="${item.type}"
          class="
            flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-all border border-transparent
            ${activeClass}
          "
          title="${item.label}"
        >
          <div class="w-8 h-8 flex items-center justify-center rounded-full">
             ${content}
          </div>
          <span class="text-[10px] font-bold uppercase text-gray-400 tracking-wider">${item.label}</span>
        </button>
      `;
    }).join('');
  };

  const renderDynamics = () => {
    return DYNAMIC_OPTIONS.map((item) => {
      const isSelected = selectedDynamic === item.type;

      const activeClass = isSelected
        ? 'bg-gray-700 text-white shadow-inner ring-1 ring-gray-600'
        : 'text-gray-400 hover:text-white hover:bg-gray-800';

      return `
        <button
          data-action="select-dynamic"
          data-dynamic="${item.type}"
          class="flex flex-col items-center justify-center px-4 py-2 rounded-md transition-all ${activeClass}"
          title="${item.label}"
        >
          <div class="h-4 flex items-center justify-center mb-1">
            <div class="w-3 h-3 rounded-full bg-current ${item.iconClass}" style="${item.style}"></div>
          </div>
          <span class="text-[9px] font-bold uppercase tracking-wider">${item.label}</span>
        </button>
      `;
    }).join('');
  };

  return `
    <div class="bg-gray-950 border-t border-gray-800 flex flex-col shadow-[0_-5px_15px_rgba(0,0,0,0.3)] z-20">
      
      <!-- Top Row: Dynamics Separator -->
      <div class="flex justify-center border-b border-gray-800/50 bg-gray-900/30">
        <div class="flex p-1.5 gap-1">
          ${renderDynamics()}
        </div>
      </div>

      <!-- Bottom Row: Main Controls -->
      <div class="p-3 flex items-center justify-between gap-4">
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

        <!-- Right: Spacer -->
        <div class="w-24"></div> 
      </div>
    </div>
  `;
};