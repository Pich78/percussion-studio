import { InstrumentName, StrokeType } from '../types.js';
import { INSTRUMENT_COLORS, VALID_INSTRUMENT_STROKES } from '../constants.js';
import { TubsCell } from './tubsCell.js';

// Icons
import { SpeakerXMarkIcon } from '../icons/speakerXMarkIcon.js';
import { SpeakerWaveIcon } from '../icons/speakerWaveIcon.js';
import { LockClosedIcon } from '../icons/lockClosedIcon.js';
import { LockOpenIcon } from '../icons/lockOpenIcon.js';
import { ChartBarIcon } from '../icons/chartBarIcon.js';
import { TrashIcon } from '../icons/trashIcon.js';
import { PlusIcon } from '../icons/plusIcon.js';
import { XMarkIcon } from '../icons/xMarkIcon.js';

export const TubsGrid = ({
    section,
    globalBpm,
    currentStep,
    selectedStroke,
    uiState // { modalOpen, editingTrackIndex }
}) => {
    const groupSize = section.subdivision || 4;
    const isCustomBpm = section.bpm !== undefined;

    // -- HTML GENERATION HELPERS --

    const renderSectionSettings = () => `
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

      <!-- Time Sig -->
      <div class="flex flex-col">
         <label class="text-[10px] text-gray-500 uppercase font-bold">Time Sig</label>
         <select 
          data-action="update-time-sig"
          class="bg-gray-900 border border-gray-700 text-xs rounded px-2 py-1 text-white h-[26px]"
         >
           <option value="4/4" ${section.timeSignature === '4/4' ? 'selected' : ''}>Binary (4/4)</option>
           <option value="6/8" ${section.timeSignature === '6/8' ? 'selected' : ''}>Ternary (6/8)</option>
           <option value="12/8" ${section.timeSignature === '12/8' ? 'selected' : ''}>12/8</option>
         </select>
      </div>

      <!-- Steps -->
      <div class="flex flex-col">
         <label class="text-[10px] text-gray-500 uppercase font-bold">Steps</label>
         <input 
           type="number"
           min="4"
           max="64"
           value="${section.steps}"
           data-action="update-steps"
           class="bg-gray-900 border border-gray-700 text-xs rounded px-2 py-0.5 text-white w-14 h-[26px]"
         />
      </div>

      <!-- Repeats -->
      <div class="flex flex-col">
         <label class="text-[10px] text-gray-500 uppercase font-bold">Repeats</label>
         <input 
           type="number"
           min="1"
           max="99"
           value="${section.repetitions || 1}"
           data-action="update-repetitions"
           class="bg-gray-900 border border-gray-700 text-xs rounded px-2 py-0.5 text-white w-14 h-[26px]"
         />
      </div>

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
          ${ChartBarIcon('w-3.5 h-3.5 text-gray-500')}
          <input 
             type="number"
             step="0.1"
             max="10"
             min="-10"
             value="${section.tempoAcceleration || 0}"
             data-action="update-acceleration"
             class="bg-gray-900 border border-gray-700 text-xs rounded px-2 py-0.5 text-white w-16 h-[26px] focus:border-cyan-500 focus:outline-none"
             title="Percentage of tempo change per repetition (e.g. 1.0 = +1%)"
          />
          <span class="text-xs text-gray-500">%</span>
        </div>
      </div>
    </div>
  `;

    const renderTimelineHeader = () => `
    <div class="flex min-w-max">
      <!-- Sticky Label Spacer -->
      <div class="sticky left-0 z-20 w-36 flex-shrink-0 bg-gray-950 border-r border-gray-800 shadow-[4px_0_10px_rgba(0,0,0,0.5)]"></div> 
      
      <div class="flex gap-1 pl-1 ml-1">
        ${Array.from({ length: section.steps }).map((_, i) => `
          <div 
            data-step-marker="${i}"
            class="w-10 text-center text-xs font-mono mb-1 pt-2 transition-transform duration-75 flex-shrink-0
              ${i === currentStep ? 'text-cyan-400 font-bold scale-110' : 'text-gray-500'}
              ${i % groupSize === 0 ? 'border-l border-gray-700' : ''}
              ${i % groupSize === 0 && i !== 0 ? 'ml-1' : ''} 
            "
          >
            ${i + 1}
          </div>
        `).join('')}
      </div>
    </div>
  `;

    const renderTracks = () => section.tracks.map((track, trackIdx) => {
        // Check validity of current global stroke selection for this track
        const allowedStrokes = VALID_INSTRUMENT_STROKES[track.instrument] || [];
        const isStrokeValid = selectedStroke === StrokeType.None || allowedStrokes.includes(selectedStroke);
        const borderColor = INSTRUMENT_COLORS[track.instrument] || 'border-l-4 border-gray-700';

        return `
      <div class="flex items-center group min-w-max transition-opacity duration-300 ${track.muted ? 'opacity-50' : 'opacity-100'}">
        <!-- Instrument Label - Sticky -->
        <div class="sticky left-0 z-20 w-36 flex-shrink-0 pr-2 flex flex-col justify-center ${borderColor} pl-3 bg-gray-950 border-r border-gray-800 py-2 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
          
          <div class="flex items-center justify-between mb-1">
            <button 
              class="font-bold text-sm cursor-pointer select-none hover:text-cyan-400 hover:underline text-left truncate w-20 ${track.muted ? 'text-gray-500 line-through' : 'text-gray-200'}"
              data-action="open-edit-modal"
              data-track-index="${trackIdx}"
              title="Change Instrument"
            >
              ${track.instrument}
            </button>
            
            <div class="flex items-center gap-1">
               <button data-action="toggle-mute" data-track-index="${trackIdx}" class="text-gray-500 hover:text-white" title="${track.muted ? "Unmute" : "Mute"}">
                ${track.muted ? SpeakerXMarkIcon('w-3.5 h-3.5') : SpeakerWaveIcon('w-3.5 h-3.5')}
              </button>
              <button data-action="remove-track" data-track-index="${trackIdx}" class="text-gray-600 hover:text-red-500" title="Remove Track">
                ${TrashIcon('w-3.5 h-3.5')}
              </button>
            </div>
          </div>
          
          <!-- Volume Slider -->
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value="${track.volume ?? 1.0}" 
            data-action="update-volume"
            data-track-index="${trackIdx}"
            class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-cyan-400"
            title="Volume"
          />
        </div>

        <!-- Grid Cells -->
        <div class="flex gap-1 bg-gray-900/30 p-1 rounded-r-md ml-1">
          ${track.strokes.map((stroke, stepIdx) => `
            <div class="${stepIdx % groupSize === 0 && stepIdx !== 0 ? "ml-1" : ""}"> 
              ${TubsCell({
            stroke,
            isCurrentStep: currentStep === stepIdx,
            isValid: isStrokeValid,
            trackIndex: trackIdx,
            stepIndex: stepIdx,
            isActive: stroke !== StrokeType.None
        })}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    }).join('');

    const renderModal = () => {
        if (!uiState.modalOpen) return '';

        const instruments = Object.values(InstrumentName).map(inst => `
      <button
          data-action="select-instrument"
          data-instrument="${inst}"
          class="
              flex items-center gap-3 px-3 py-2 rounded-lg border bg-gray-900/50 hover:bg-gray-800 transition-all text-left
              ${INSTRUMENT_COLORS[inst] || 'border-gray-700'}
              border-l-[6px] 
          "
      >
          <span class="font-medium text-gray-200 pointer-events-none">${inst}</span>
      </button>
    `).join('');

        return `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" data-action="close-modal-bg">
          <div class="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onclick="event.stopPropagation()">
              <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                  <h3 class="text-lg font-bold text-white">
                      ${uiState.editingTrackIndex !== null ? 'Change Instrument' : 'Add Instrument'}
                  </h3>
                  <button data-action="close-modal" class="text-gray-500 hover:text-white">
                      ${XMarkIcon('w-6 h-6')}
                  </button>
              </div>
              
              <div class="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[60vh]">
                  ${instruments}
              </div>
              
              <div class="p-4 border-t border-gray-800 bg-gray-950 flex justify-end">
                  <button 
                      data-action="close-modal"
                      class="px-4 py-2 text-gray-400 hover:text-white font-medium"
                  >
                      Cancel
                  </button>
              </div>
          </div>
      </div>
    `;
    };

    // -- MAIN RETURN --
    return `
    <div 
      id="tubs-scroll-container"
      class="flex flex-col gap-4 overflow-x-auto pb-8 w-full custom-scrollbar relative bg-gray-900/20 p-4 rounded-xl border border-gray-800"
    >
      ${renderSectionSettings()}
      ${renderTimelineHeader()}
      ${renderTracks()}
      
      <!-- Add Instrument Button -->
      <div class="sticky left-0 z-20 w-36 pt-2">
          <button 
              data-action="open-add-modal"
              class="w-full py-2 border border-dashed border-gray-700 rounded text-gray-500 hover:text-white hover:border-gray-500 hover:bg-gray-900 flex items-center justify-center gap-2 text-xs font-bold transition-all uppercase tracking-wide"
          >
              ${PlusIcon('w-4 h-4')}
              Add Track
          </button>
      </div>
    </div>
    
    ${renderModal()}
  `;
};

// -- HELPER FOR AUTO-SCROLL --
export const autoScrollGrid = (currentStep) => {
    const container = document.getElementById('tubs-scroll-container');
    if (!container) return;

    const stepElement = container.querySelector(`[data-step-marker="${currentStep}"]`);

    if (stepElement) {
        if (container.scrollWidth <= container.clientWidth) return;

        const containerRect = container.getBoundingClientRect();
        const stepRect = stepElement.getBoundingClientRect();

        const stickyHeaderWidth = 144; // w-36
        const viewableWidth = containerRect.width - stickyHeaderWidth;
        const viewableCenter = stickyHeaderWidth + (viewableWidth / 2);

        const currentStepLeftPos = (stepRect.left - containerRect.left) + container.scrollLeft;
        const targetScrollLeft = currentStepLeftPos - viewableCenter + (stepRect.width / 2);

        container.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
        });
    }
};