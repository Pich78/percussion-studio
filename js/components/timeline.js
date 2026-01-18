

import { PlusIcon as PlusIconSvg } from '../icons/plusIcon.js';
import { TrashIcon as TrashIconSvg } from '../icons/trashIcon.js';
import { DocumentDuplicateIcon as DuplicateIconSvg } from '../icons/documentDuplicateIcon.js';
import { ArrowTrendingUpIcon as TrendUpSvg } from '../icons/arrowTrendingUpIcon.js';
import { ArrowTrendingDownIcon as TrendDownSvg } from '../icons/arrowTrendingDownIcon.js';
import { MinusIcon as MinusSvg } from '../icons/minusIcon.js';
import { Bars3Icon as DragHandleSvg } from '../icons/bars3Icon.js';
import { ChevronDownIcon } from '../icons/chevronDownIcon.js';
import { ORISHAS_LIST, TOQUE_CLASSIFICATIONS, ORISHA_COLORS, CLASSIFICATION_COLORS } from '../constants.js';
import { state } from '../store.js';

export const Timeline = ({
  sections,
  globalBpm,
  activeSectionId,
  rhythmName,
  orisha = [],
  classification = null,
  description = '',
  isBata = false,
  readOnly = false
}) => {

  const renderHeader = () => `
    <div class="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900 sticky top-0 z-10 gap-2">
      <input 
          value="${rhythmName}" 
          data-action="update-rhythm-name"
          class="bg-transparent border-b border-transparent hover:border-gray-700 focus:border-cyan-500 focus:outline-none text-cyan-400 font-bold text-sm w-full transition-colors truncate placeholder-gray-600"
          placeholder="Rhythm Name"
          title="Rename Rhythm"
          ${readOnly ? 'disabled readonly' : ''}
      />
      ${!readOnly ? `
      <button 
        data-action="add-section"
        class="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border border-transparent hover:border-gray-700 flex-shrink-0"
        title="Add Section"
      >
        ${PlusIconSvg('w-5 h-5')}
      </button>
      ` : ''}
    </div>
  `;

  const renderMetadataSection = () => {
    const dropdownOpen = state.uiState.metadataEditor?.orishaDropdownOpen || false;

    // Build Orisha badges for selected ones
    const orishaBadges = orisha.map(o => {
      const colors = ORISHA_COLORS[o] || { border: 'border-stone-500', text: 'text-stone-400', bg: 'bg-stone-800' };
      return `
        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${colors.border} ${colors.text}">
          ${o}
          ${!readOnly ? `
            <button data-action="remove-rhythm-orisha" data-orisha="${o}" class="hover:text-white">×</button>
          ` : ''}
        </span>
      `;
    }).join('');

    return `
      <div class="px-4 py-3 border-b border-gray-800 space-y-3">
        <!-- Batà Toggle Switch -->
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-gray-400">Batà Rhythm</label>
          <button 
            data-action="toggle-bata-rhythm-mode"
            class="w-10 h-5 rounded-full relative transition-colors ${isBata ? 'bg-amber-600' : 'bg-gray-700'}"
            title="${isBata ? 'Disable Batà Metadata' : 'Enable Batà Metadata'}"
            ${readOnly ? 'disabled' : ''}
          >
            <div class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isBata ? 'translate-x-5' : ''}"></div>
          </button>
        </div>

        ${isBata ? `
          <!-- Orisha Multi-Select -->
          <div class="space-y-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
            <div class="relative">
              <button 
                data-action="toggle-metadata-orisha-dropdown"
                class="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded hover:border-gray-600 text-gray-300 transition-colors"
                ${readOnly ? 'disabled' : ''}
              >
                <span>${orisha.length > 0 ? `${orisha.length} selected` : 'Select Orishas...'}</span>
                <span class="transition-transform ${dropdownOpen ? 'rotate-180' : ''}">${ChevronDownIcon('w-3 h-3')}</span>
              </button>
              ${dropdownOpen && !readOnly ? `
                <div class="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
                  ${ORISHAS_LIST.map(o => {
      const isSelected = orisha.includes(o);
      const colors = ORISHA_COLORS[o] || { text: 'text-gray-300' };
      return `
                      <div 
                        data-action="toggle-rhythm-orisha" 
                        data-orisha="${o}"
                        class="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-gray-800 ${isSelected ? 'bg-gray-800' : ''}"
                      >
                        <span class="${isSelected ? 'text-amber-500' : 'text-gray-500'}">
                          ${isSelected ? '✓' : '○'}
                        </span>
                        <span class="${colors.text}">${o}</span>
                      </div>
                    `;
    }).join('')}
                </div>
              ` : ''}
            </div>
            ${orisha.length > 0 ? `
              <div class="flex flex-wrap gap-1 mt-1">${orishaBadges}</div>
            ` : ''}
          </div>

          <!-- Classification Badges -->
          <div class="flex gap-1 animate-in slide-in-from-top-2 fade-in duration-200">
            ${TOQUE_CLASSIFICATIONS.map(c => {
      const isActive = classification === c;
      const colors = CLASSIFICATION_COLORS[c] || CLASSIFICATION_COLORS['Generic'];
      return `
                <button 
                  data-action="set-rhythm-classification"
                  data-classification="${c}"
                  class="px-2 py-1 text-[10px] uppercase font-bold rounded border transition-all flex-1
                    ${isActive
          ? `${colors.text} ${colors.border} bg-gray-800`
          : 'text-gray-500 border-gray-700 hover:border-gray-600 hover:text-gray-400'
        }"
                  ${readOnly ? 'disabled' : ''}
                >
                  ${c}
                </button>
              `;
    }).join('')}
          </div>

          <!-- Description -->
          <div class="space-y-1.5 animate-in slide-in-from-top-3 fade-in duration-200">
            <textarea 
              data-action="update-rhythm-description"
              placeholder="Rhythm description..."
              class="w-full px-2 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded resize-none text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-600"
              rows="2"
              ${readOnly ? 'disabled' : ''}
            >${description}</textarea>
          </div>
        ` : ''}
      </div>
    `;
  };

  const renderSectionItem = (section, index) => {
    const isActive = section.id === activeSectionId;
    const effectiveBpm = section.bpm ?? globalBpm;
    const accel = section.tempoAcceleration || 0;
    const isCustomBpm = section.bpm !== undefined;

    // Accel Icon Logic
    let AccelIcon = MinusSvg;
    let accelColorClass = 'text-gray-500 border-gray-800/50 opacity-70 bg-gray-950/30';

    if (accel > 0) {
      AccelIcon = TrendUpSvg;
      accelColorClass = 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30';
    } else if (accel < 0) {
      AccelIcon = TrendDownSvg;
      accelColorClass = 'bg-rose-900/20 text-rose-400 border-rose-500/30';
    }

    return `
      <div 
        draggable="true"
        data-role="timeline-item"
        data-section-id="${section.id}"
        data-index="${index}"
        class="
          group relative flex gap-2 p-2 rounded-lg cursor-pointer border transition-all select-none
          ${isActive
        ? 'bg-gray-800 border-cyan-500 text-white shadow-lg shadow-cyan-900/10'
        : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:bg-gray-800 hover:border-gray-700'}
        "
        onclick="document.dispatchEvent(new CustomEvent('timeline-select', { detail: '${section.id}' }))"
      >
        <!-- Drag Handle -->
        ${!readOnly ? `
        <div class="flex items-center justify-center cursor-move text-gray-600 hover:text-gray-400 flex-shrink-0">
          ${DragHandleSvg('w-4 h-4 rotate-90 pointer-events-none')}
        </div>
        ` : ''}

        <!-- Content Container -->
        <div class="flex flex-col gap-1 flex-1 min-w-0 pointer-events-none">
          
          <!-- Line 1: Name - TimeSig - Steps - Repeats -->
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold truncate flex-1 leading-tight" title="${section.name}">
              ${section.name}
            </span>
            
            <div class="flex items-center gap-1.5 flex-shrink-0 text-[10px] font-mono opacity-80">
              <span title="Time Signature">${section.timeSignature}</span>
              <span class="opacity-30">|</span>
              <span title="Steps">${section.steps}s</span>
              <div 
                class="flex items-center px-1.5 py-0.5 rounded ml-1 ${isActive ? 'bg-cyan-900/40 text-cyan-200' : 'bg-gray-950/50 text-gray-400'}"
                title="Repetitions"
              >
                <span class="opacity-70 mr-0.5">x</span>
                <span class="font-bold">${section.repetitions || 1}</span>
              </div>
            </div>
          </div>

          <!-- Line 2: Tempo - Accel ..... Actions -->
          <div class="flex items-center justify-between h-5">
            
            <!-- Left: Tempo & Accel -->
            <div class="flex items-center gap-1">
              <!-- Tempo -->
              <span 
                  class="text-[9px] font-mono px-1 py-0.5 rounded border flex items-center gap-1 ${isCustomBpm
        ? 'bg-amber-900/20 text-amber-400 border-amber-500/30'
        : 'bg-gray-950/30 text-gray-500 border-gray-800/50 opacity-70'
      }"
                  title="${isCustomBpm ? "Custom Tempo" : "Global Tempo"}"
              >
                  ♩=${effectiveBpm}
              </span>
              
              <!-- Accel -->
              <span class="text-[9px] font-mono px-1 py-0.5 rounded border flex items-center gap-0.5 ${accelColorClass}"
                title="Accel/Decel %"
              >
                ${AccelIcon('w-2.5 h-2.5')}
                ${Math.abs(accel)}%
              </span>
            </div>

            <!-- Right: Actions (Pointer events re-enabled for buttons) -->
            ${!readOnly ? `
            <div class="flex items-center gap-1 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity pointer-events-auto">
              <button 
                data-action="duplicate-section"
                data-id="${section.id}"
                class="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-white transition-colors"
                title="Duplicate"
              >
                ${DuplicateIconSvg('w-3.5 h-3.5 pointer-events-none')}
              </button>
              
              ${sections.length > 1 ? `
                <button 
                  data-action="delete-section"
                  data-id="${section.id}"
                  class="p-1 rounded hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  ${TrashIconSvg('w-3.5 h-3.5 pointer-events-none')}
                </button>
              ` : ''}
            </div>
            ` : ''}

          </div>
        </div>
      </div>
    `;
  };

  return `
    <div class="w-72 bg-gray-900 border-r border-gray-800 flex flex-col h-full flex-shrink-0">
      ${renderHeader()}
      ${renderMetadataSection()}
      <!-- Sections List -->
      <div 
        id="timeline-list"
        class="p-2 overflow-y-auto flex-1 space-y-1 custom-scrollbar"
      >
        ${sections.map((s, i) => renderSectionItem(s, i)).join('')}
      </div>
    </div>
  `;
};