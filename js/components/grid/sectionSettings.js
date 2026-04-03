/*
  js/components/grid/sectionSettings.js
  Renders the section settings bar (name, meter, BPM, repetitions).
  Extracted from tubsGrid.js for modularity.
*/

import { LockClosedIcon } from '../../icons/lockClosedIcon.js';
import { LockOpenIcon } from '../../icons/lockOpenIcon.js';
import { ChartBarIcon } from '../../icons/chartBarIcon.js';

/**
 * Render the section settings panel
 * @param {object} section - The active section
 * @param {number} globalBpm - Global BPM value
 * @param {boolean} readOnly - Whether in read-only mode
 * @returns {string} HTML string
 */
export const SectionSettings = (section, globalBpm, readOnly = false) => {
  if (readOnly) return '';

  const isCustomBpm = section.bpm !== undefined;

  // Check if current meter matches a predefined option
  const predefinedMeters = [
    { steps: 4, subdivision: 4, label: '4/4 (4)' },
    { steps: 8, subdivision: 4, label: '4/4 (8)' },
    { steps: 16, subdivision: 4, label: '4/4 (16)' },
    { steps: 6, subdivision: 3, label: '6/8 (6)' },
    { steps: 12, subdivision: 3, label: '6/8 (12)' },
    { steps: 24, subdivision: 3, label: '6/8 (24)' }
  ];
  const isCustom = section.isCustomOverride || !predefinedMeters.some(
    m => m.steps === section.steps && m.subdivision === section.subdivision
  );

  // Play mode logic
  const currentPlayMode = section.playMode || 'loop';
  const isAdlib = currentPlayMode === 'adlib';
  const isPlayOnce = currentPlayMode === 'once';
  const isLoop = currentPlayMode === 'loop';
  const hasPlayedOnce = isPlayOnce && section._playedOnce;
  const showRepetitions = isLoop;

  return `
    <div class="sticky left-0 z-30 flex items-center gap-6 mb-2 px-4 py-2 bg-gray-950/95 backdrop-blur border border-gray-800 w-fit rounded-lg shadow-lg">
      <!-- Name -->
      <div class="flex flex-col">
          <label class="text-[10px] text-gray-500 uppercase font-bold">Name</label>
          <input 
            type="text" 
            value="${section.name}"
            data-action="update-section-name"
            class="bg-transparent border-b border-gray-600 text-cyan-400 font-bold focus:outline-none focus:border-cyan-400 w-48 text-sm"
          />
      </div>

      <!-- Meter -->
      <div class="flex flex-col">
         <label class="text-[10px] text-gray-500 uppercase font-bold">Meter</label>
         <select 
          data-action="update-meter"
          class="bg-gray-900 border border-gray-700 text-xs rounded px-2 py-1 text-white h-[26px]"
         >
           <option value="4-4" ${section.steps === 4 && section.subdivision === 4 ? 'selected' : ''}>4/4 (4)</option>
           <option value="8-4" ${section.steps === 8 && section.subdivision === 4 ? 'selected' : ''}>4/4 (8)</option>
           <option value="16-4" ${section.steps === 16 && section.subdivision === 4 ? 'selected' : ''}>4/4 (16)</option>
           <option value="6-3" ${section.steps === 6 && section.subdivision === 3 ? 'selected' : ''}>6/8 (6)</option>
           <option value="12-3" ${section.steps === 12 && section.subdivision === 3 ? 'selected' : ''}>6/8 (12)</option>
           <option value="24-3" ${section.steps === 24 && section.subdivision === 3 ? 'selected' : ''}>6/8 (24)</option>
           <option value="custom" ${isCustom ? 'selected' : ''}>Custom</option>
         </select>
      </div>
      
      ${isCustom ? `
      <!-- Custom Steps Input -->
      <div class="flex flex-col">
         <label class="text-[10px] text-gray-500 uppercase font-bold">Steps</label>
         <input 
           type="number"
           min="1"
           max="64"
           value="${section.steps}"
           data-action="update-custom-steps"
           class="bg-gray-900 border border-amber-700 text-xs rounded px-2 py-0.5 text-amber-400 w-14 h-[26px]"
           title="Number of steps/beats"
         />
      </div>
      ` : ''}

      <!-- Play Mode -->
      <div class="flex flex-col">
          <label class="text-[10px] text-gray-500 uppercase font-bold">Play Mode</label>
          <div class="relative" id="play-mode-dropdown-container">
              <button 
                type="button"
                data-action="${hasPlayedOnce ? 'reset-played-once' : 'toggle-play-mode-dropdown'}"
                class="bg-gray-900 border border-gray-700 text-xs rounded px-2 py-1 text-white h-[26px] min-w-[140px] w-full flex items-center justify-between hover:border-gray-600 transition-colors ${hasPlayedOnce ? 'opacity-50' : ''}"
                title="${hasPlayedOnce ? 'Click to reset and play again' : ''}"
              >
                  <span>${hasPlayedOnce ? 'Played' : isAdlib ? 'Play Forever' : isPlayOnce ? 'Play Once' : 'Repetitions'}</span>
                  ${!hasPlayedOnce ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 ml-2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>` : ''}
              </button>
              <div 
                data-role="play-mode-dropdown"
                class="hidden absolute top-full left-0 mt-1 w-full bg-gray-900 border border-gray-700 rounded shadow-lg z-50 overflow-hidden"
              >
                  <button type="button" data-action="select-play-mode" data-value="adlib" class="w-full text-left px-2 py-1.5 text-xs text-white hover:bg-gray-800 transition-colors ${isAdlib ? 'bg-gray-800 text-cyan-400' : ''}">Play Forever</button>
                  <button type="button" data-action="select-play-mode" data-value="once" class="w-full text-left px-2 py-1.5 text-xs text-white hover:bg-gray-800 transition-colors ${isPlayOnce ? 'bg-gray-800 text-cyan-400' : ''}">Play Once</button>
                  <button type="button" data-action="select-play-mode" data-value="loop" class="w-full text-left px-2 py-1.5 text-xs text-white hover:bg-gray-800 transition-colors ${isLoop ? 'bg-gray-800 text-cyan-400' : ''}">Repetitions</button>
              </div>
          </div>
      </div>

      <!-- Repeats (only for loop mode) -->
      ${showRepetitions ? `
      <div class="flex flex-col">
          <label class="text-[10px] text-gray-500 uppercase font-bold">Repeats</label>
          <div class="flex items-center gap-1">
            <input 
              type="number"
              min="1"
              max="99"
              value="${section.repetitions || 1}"
              data-action="update-repetitions"
              class="bg-gray-900 border ${section.randomRepetitions ? 'border-dashed border-cyan-700' : 'border-gray-700'} text-xs rounded px-2 py-0.5 text-white w-14 h-[26px]"
            />
            <button
              data-action="toggle-random-repetitions"
              class="p-1 rounded text-sm leading-none ${section.randomRepetitions ? 'text-cyan-400 bg-cyan-900/30 border border-cyan-700/50' : 'text-gray-600 hover:text-gray-400 border border-transparent'}"
              title="${section.randomRepetitions ? 'Random: 1-' + (section.repetitions || 1) : 'Enable random repetitions'}"
            >🎲</button>
          </div>
      </div>
      ` : ''}

      <div class="w-px h-8 bg-gray-800 mx-1"></div>
      
      <!-- Tempo -->
      <div class="flex flex-col">
        <label class="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
           Tempo (${isCustomBpm ? 'Custom' : 'Global'})
        </label>
        <div class="flex items-center gap-2 h-[26px]">
          <button 
            data-action="toggle-bpm-override"
            class="p-1 rounded ${isCustomBpm ? 'text-amber-400 hover:text-amber-300' : 'text-gray-500 hover:text-gray-300'}"
            title="${isCustomBpm ? "Use Global BPM" : "Override BPM"}"
          >
            ${isCustomBpm ? LockOpenIcon('w-3.5 h-3.5') : LockClosedIcon('w-3.5 h-3.5')}
          </button>
          
          ${isCustomBpm ? `
            <input 
              type="number" 
              min="40"
              max="300"
              value="${section.bpm}" 
              data-action="update-bpm"
              class="bg-gray-900 border border-amber-900/50 text-amber-400 text-xs rounded px-2 py-0.5 w-14 font-bold focus:outline-none focus:border-amber-500"
            />
          ` : `
            <span class="text-xs text-gray-500 font-mono px-2 py-0.5 border border-transparent opacity-60">
              ${globalBpm}
            </span>
          `}
        </div>
      </div>

      <!-- Accel/Decel % -->
      <div class="flex flex-col">
        <label class="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
           Accel/Decel %
        </label>
        <div class="flex items-center gap-1 h-[26px]">
          ${ChartBarIcon(`w-3.5 h-3.5 ${!showRepetitions || (section.repetitions || 1) <= 1 ? 'text-gray-700' : 'text-gray-500'}`)}
          <input 
             type="number"
             step="0.1"
             max="10"
             min="-10"
             value="${section.tempoAcceleration || 0}"
             data-action="update-acceleration"
             class="bg-gray-900 border text-xs rounded px-2 py-0.5 w-16 h-[26px] focus:outline-none ${!showRepetitions || (section.repetitions || 1) <= 1
       ? 'border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
       : 'border-gray-700 text-white focus:border-cyan-500'
     }"
             title="${!showRepetitions
       ? 'Acceleration not available for Play Forever or Play Once'
       : (section.repetitions || 1) <= 1
       ? 'Acceleration requires more than 1 repetition'
       : 'Percentage of tempo change per repetition (e.g. 1.0 = +1%)'}"
             ${!showRepetitions || (section.repetitions || 1) <= 1 ? 'disabled' : ''}
          />
          <span class="text-xs ${!showRepetitions || (section.repetitions || 1) <= 1 ? 'text-gray-700' : 'text-gray-500'}">%</span>
        </div>
      </div>
    </div>
  `;
};
