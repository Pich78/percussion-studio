/* 
  js/components/tubsGrid.js
  Renders the main grid and the Add/Edit Instrument Modal.
  Updated to support Dynamic Data Loading.
*/

import { StrokeType } from '../types.js';
import { INSTRUMENT_COLORS } from '../constants.js'; // Colors still hardcoded for now
import { TubsCell } from './tubsCell.js?v=2';
import { state } from '../store.js';
import { dataLoader } from '../services/dataLoader.js'; // To access manifest

// Icons
import { SpeakerXMarkIcon } from '../icons/speakerXMarkIcon.js';
import { SpeakerWaveIcon } from '../icons/speakerWaveIcon.js';
import { LockClosedIcon } from '../icons/lockClosedIcon.js';
import { LockOpenIcon } from '../icons/lockOpenIcon.js';
import { ChartBarIcon } from '../icons/chartBarIcon.js';
import { TrashIcon } from '../icons/trashIcon.js';
import { PlusIcon } from '../icons/plusIcon.js';
import { XMarkIcon } from '../icons/xMarkIcon.js';
import { FolderOpenIcon } from '../icons/folderOpenIcon.js';
import { DocumentDuplicateIcon } from '../icons/documentDuplicateIcon.js';
import { MusicalNoteIcon } from '../icons/musicalNoteIcon.js';

export const TubsGrid = ({
  section,
  globalBpm,
  currentStep,
  selectedStroke,
  uiState,
  readOnly = false
}) => {
  // Safety check: if section is null (e.g. before load), return placeholder
  if (!section) return `<div class="p-8 text-center text-gray-500">No active section loaded.</div>`;

  const groupSize = section.subdivision || 4;
  const isCustomBpm = section.bpm !== undefined;

  // -- HTML GENERATION HELPERS --

  const renderSectionSettings = () => {
    if (readOnly) return '';
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
  };

  const renderTimelineHeader = () => `
    <div class="flex min-w-max">
      <!-- Sticky Label Spacer -->
      <div class="sticky left-0 z-20 w-36 flex-shrink-0 bg-gray-950 border-r border-gray-800 shadow-[4px_0_10px_rgba(0,0,0,0.5)]"></div> 
      
      <div class="flex gap-1 pl-1 ml-1">
        ${Array.from({ length: section.steps }).map((_, i) => {
    const isGroupStart = i % groupSize === 0 && i !== 0;
    const separator = isGroupStart
      ? `<div class="w-px bg-gray-700 h-5 mt-3 flex-shrink-0"></div>`
      : '';

    return `
          ${separator}
          <div 
            data-step-marker="${i}"
            class="w-10 text-center text-xs font-mono mb-1 pt-2 transition-transform duration-75 flex-shrink-0
              ${i === currentStep ? 'text-cyan-400 font-bold scale-110' : 'text-gray-500'}
            "
          >
            ${i + 1}
          </div>
        `;
  }).join('')}
      </div>
    </div>
  `;

  const renderMeasures = () => section.measures.map((measure, measureIdx) => {
    const measureLabel = `Measure ${measureIdx + 1}`;

    const renderTracksForMeasure = () => measure.tracks.map((track, trackIdx) => {
      // DYNAMIC VALIDATION: Check loaded definition
      const instDef = state.instrumentDefinitions[track.instrument];
      let isStrokeValid = true;

      if (instDef && selectedStroke !== StrokeType.None) {
        // Does this instrument support this letter?
        isStrokeValid = instDef.sounds.some(s => s.letter.toUpperCase() === selectedStroke.toUpperCase());
      }

      const borderColor = INSTRUMENT_COLORS[track.instrument] || 'border-l-4 border-gray-700';

      // Get Display Name (from def or fallback to symbol)
      const displayName = instDef ? instDef.name : track.instrument;

      // Conditional Track Name Rendering
      const renderTrackName = () => {
        if (readOnly) {
          return `<span class="font-bold text-sm select-none text-left truncate w-20 text-gray-200 ${track.muted ? 'text-gray-500 line-through' : ''}" title="${displayName}">${displayName}</span>`;
        }
        return `
            <button 
                class="font-bold text-sm cursor-pointer select-none hover:text-cyan-400 hover:underline text-left truncate w-20 ${track.muted ? 'text-gray-500 line-through' : 'text-gray-200'}"
                data-action="open-edit-modal"
                data-track-index="${trackIdx}"
                data-measure-index="${measureIdx}"
                title="Change Instrument (${displayName})"
            >
                ${displayName}
            </button>
          `;
      };

      return `
        <div class="flex items-center group min-w-max transition-opacity duration-300 ${track.muted ? 'opacity-50' : 'opacity-100'}">
          <!-- Instrument Label - Sticky -->
          <div class="sticky left-0 z-20 w-36 flex-shrink-0 pr-2 flex flex-col justify-center ${borderColor} pl-3 bg-gray-950 border-r border-gray-800 py-2 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
            
            <div class="flex items-center justify-between mb-1">
              ${renderTrackName()}
              
              <div class="flex items-center gap-1">
                 <button data-action="toggle-mute" data-track-index="${trackIdx}" data-measure-index="${measureIdx}" class="text-gray-500 hover:text-white" title="${track.muted ? "Unmute" : "Mute"}">
                  ${track.muted ? SpeakerXMarkIcon('w-3.5 h-3.5') : SpeakerWaveIcon('w-3.5 h-3.5')}
                </button>
                ${!readOnly ? `
                <button data-action="remove-track" data-track-index="${trackIdx}" data-measure-index="${measureIdx}" class="text-gray-600 hover:text-red-500" title="Remove Track">
                  ${TrashIcon('w-3.5 h-3.5')}
                </button>
                ` : ''}
              </div>
            </div>
            
            <!-- Volume Slider -->
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value="${track.volume ?? 1.0}" 
              data-action="update-volume"
              data-track-index="${trackIdx}"
              data-measure-index="${measureIdx}"
              class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-cyan-400"
              title="Volume"
            />
          </div>

          <!-- Grid Cells -->
          <div class="flex gap-1 bg-gray-900/30 p-1 rounded-r-md ml-1 ${readOnly ? 'pointer-events-none' : ''}">
            ${track.strokes.map((stroke, stepIdx) => {
        const isGroupStart = stepIdx % groupSize === 0 && stepIdx !== 0;
        // Invisible separator to maintain alignment with header
        const separator = isGroupStart
          ? `<div class="w-px bg-transparent h-10 flex-shrink-0"></div>`
          : '';

        return `
              ${separator}
              <div> 
                ${TubsCell({
          stroke,
          isCurrentStep: currentStep === stepIdx,
          isValid: isStrokeValid,
          trackIndex: trackIdx,
          stepIndex: stepIdx,
          measureIndex: measureIdx,
          isActive: stroke !== StrokeType.None,
          instrumentDef: instDef
        })}
              </div>
            `;
      }).join('')}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="measure-container mb-6" data-measure-index="${measureIdx}">
        <!-- Measure Label with Actions -->
        <div class="sticky left-0 z-20 mb-2 flex items-center gap-2">
          <div class="px-2 py-1 bg-gray-800/80 backdrop-blur border-l-4 border-cyan-500 rounded">
            <span class="text-xs font-bold text-cyan-400 uppercase tracking-wide">${measureLabel}</span>
          </div>
          ${!readOnly ? `
          <div class="flex items-center gap-1">
            <button 
              data-action="duplicate-measure" 
              data-measure-index="${measureIdx}"
              class="p-1 text-gray-500 hover:text-cyan-400 transition-colors"
              title="Duplicate Measure"
            >
              ${DocumentDuplicateIcon('w-3.5 h-3.5')}
            </button>
            <button 
              data-action="delete-measure" 
              data-measure-index="${measureIdx}"
              class="p-1 text-gray-500 hover:text-red-500 transition-colors"
              title="Delete Measure"
            >
              ${TrashIcon('w-3.5 h-3.5')}
            </button>
          </div>
          ` : ''}
        </div>
        
        <!-- Tracks for this measure -->
        ${renderTracksForMeasure()}
        
        <!-- Add Track Button (per measure) -->
        ${!readOnly ? `
        <div class="sticky left-0 z-20 w-36 pt-2">
          <button 
            data-action="open-add-modal"
            class="w-full py-2 border border-dashed border-gray-700 rounded text-gray-500 hover:text-white hover:border-gray-500 hover:bg-gray-900 flex items-center justify-center gap-2 text-xs font-bold transition-all uppercase tracking-wide"
          >
            ${PlusIcon('w-4 h-4')}
            Add Track
          </button>
        </div>
        ` : ''}
        
        <!-- Measure Separator -->
        ${measureIdx < section.measures.length - 1 ? '<div class="h-px bg-gray-700/50 my-4"></div>' : ''}
      </div>
    `;
  }).join('') + `
    <!-- Add Measure Button -->
    ${!readOnly ? `
    <div class="sticky left-0 z-20 mt-4 w-fit">
      <button 
        data-action="add-measure"
        class="px-4 py-2 border border-dashed border-cyan-700 rounded text-cyan-500 hover:text-white hover:border-cyan-500 hover:bg-cyan-900/20 flex items-center gap-2 text-xs font-bold transition-all uppercase tracking-wide"
      >
        ${PlusIcon('w-4 h-4')}
        Add Measure
      </button>
    </div>
    ` : ''}
  `;

  const renderModal = () => {
    if (!uiState.modalOpen) return '';

    let title = '';
    let content = '';

    if (uiState.modalType === 'rhythm') {
      title = 'Load Rhythm';

      // 1. Build Tree
      const buildTree = (ids) => {
        const tree = {};
        ids.forEach(id => {
          const parts = id.split('/');
          let current = tree;
          parts.forEach((part, idx) => {
            if (!current[part]) {
              current[part] = idx === parts.length - 1 ? id : {}; // Leaf = id (string), Node = object
            }
            if (typeof current[part] === 'object') {
              current = current[part];
            }
          });
        });
        return tree;
      };

      // 2. Recursive Render
      const renderTree = (node, depth = 0) => {
        return Object.entries(node).map(([key, value]) => {
          const isLeaf = typeof value === 'string';
          const paddingLeft = depth * 1.5; // indentation in rem

          if (isLeaf) {
            // It's a rhythm button
            // Prettify name
            const name = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return `
              <button
                  data-action="select-rhythm-confirm"
                  data-rhythm-id="${value}"
                  class="
                      flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-all text-left group w-full mb-2
                  "
                  style="margin-left: ${paddingLeft}rem; width: calc(100% - ${paddingLeft}rem);"
              >
                  ${MusicalNoteIcon('w-5 h-5 text-amber-500 group-hover:text-amber-400')}
                  <span class="font-medium text-gray-200 pointer-events-none group-hover:text-white">${name}</span>
              </button>
            `;
          } else {
            // It's a Folder
            const folderName = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return `
              <div class="mb-2">
                <div 
                  class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2"
                  style="margin-left: ${paddingLeft}rem;"
                >
                  ${FolderOpenIcon('w-4 h-4 text-gray-600')}
                  ${folderName}
                </div>
                ${renderTree(value, depth + 1)}
              </div>
            `;
          }
        }).join('');
      };

      const rhythms = dataLoader.manifest && dataLoader.manifest.rhythms
        ? renderTree(buildTree(Object.keys(dataLoader.manifest.rhythms)))
        : '<div class="text-center text-gray-500 py-8">No rhythms found.</div>';

      content = `
            <div class="p-6 overflow-y-auto max-h-[60vh]">
                ${rhythms}
            </div>
        `;
    } else {
      // INSTRUMENT MODAL - Two Column Layout
      title = uiState.editingTrackIndex !== null ? 'Change Instrument' : 'Add Instrument';

      const selectedInstrument = uiState.pendingInstrument;

      // Left Column: Instruments
      const instruments = dataLoader.manifest && dataLoader.manifest.instruments
        ? Object.keys(dataLoader.manifest.instruments).map(symbol => {
          const colorClass = INSTRUMENT_COLORS[symbol] || 'border-gray-700';
          const isSelected = selectedInstrument === symbol;
          return `
            <button
              data-action="select-instrument"
              data-instrument="${symbol}"
              class="
                flex items-center gap-3 px-3 py-2 rounded-lg border bg-gray-900/50 hover:bg-gray-800 transition-all text-left
                ${colorClass}
                border-l-[6px]
                ${isSelected ? 'ring-2 ring-cyan-400 bg-gray-800' : ''}
              "
            >
              <span class="font-medium ${isSelected ? 'text-cyan-400' : 'text-gray-200'} pointer-events-none">${state.instrumentDefinitions[symbol]?.name || symbol}</span>
            </button>
          `;
        }).join('')
        : '<div class="text-center text-gray-500 py-8">Loading instruments...</div>';

      // Right Column: Sound Packs
      let soundPacks = '';
      if (selectedInstrument) {
        const selectedPack = uiState.pendingSoundPack;
        soundPacks = dataLoader.manifest && dataLoader.manifest.sound_packs
          ? Object.keys(dataLoader.manifest.sound_packs).map(pack => {
            const isSelected = selectedPack === pack;
            return `
              <button
                data-action="select-sound-pack"
                data-pack="${pack}"
                class="
                  flex items-center gap-3 px-3 py-3 rounded-lg border bg-gray-900/50 hover:bg-gray-800 transition-all text-left
                  ${isSelected ? 'ring-2 ring-cyan-400 bg-gray-800 border-cyan-400' : 'border-gray-700 hover:border-amber-500 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]'}
                "
              >
                ${SpeakerWaveIcon(`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-gray-500'}`)}
                <span class="font-medium ${isSelected ? 'text-cyan-400' : 'text-gray-200'} pointer-events-none">${pack}</span>
              </button>
            `;
          }).join('')
          : '<div class="text-center text-gray-500">No sound packs found.</div>';
      } else {
        soundPacks = '<div class="text-center text-gray-500 py-8">Select an instrument to view sound packs</div>';
      }

      content = `
        <div class="p-6 grid grid-cols-2 gap-6 overflow-y-auto max-h-[60vh]">
          <!-- Left Column: Instruments -->
          <div class="border-r border-gray-800 pr-4">
            <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Instrument Type</h4>
            <div class="grid grid-cols-1 gap-2">
              ${instruments}
            </div>
          </div>
          
          <!-- Right Column: Sound Packs -->
          <div class="pl-2">
            <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Sound Pack</h4>
            <div class="grid grid-cols-1 gap-3">
              ${soundPacks}
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" data-action="close-modal-bg">
          <div class="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl ${uiState.modalType === 'instrument' ? 'max-w-4xl' : 'max-w-lg'} w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                  <h3 class="text-lg font-bold text-white">
                      ${title}
                  </h3>
                  <button data-action="close-modal" class="text-gray-500 hover:text-white">
                      ${XMarkIcon('w-6 h-6')}
                  </button>
              </div>
              
              ${content}
              
              <div class="p-4 border-t border-gray-800 bg-gray-950 flex justify-end items-center gap-3">
                  ${uiState.modalType === 'instrument' ? `
                    <button 
                        data-action="close-modal"
                        class="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        data-action="confirm-instrument-selection"
                        class="px-4 py-2 rounded font-medium transition-all
                          ${uiState.pendingInstrument && uiState.pendingSoundPack
          ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer'
          : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'}"
                        ${!uiState.pendingInstrument || !uiState.pendingSoundPack ? 'disabled' : ''}
                    >
                        OK
                    </button>
                  ` : `
                    <button 
                        data-action="close-modal"
                        class="px-4 py-2 text-gray-400 hover:text-white font-medium"
                    >
                        Cancel
                    </button>
                  `}
              </div>
          </div>
      </div>
    `;
  };

  // -- MAIN RETURN --
  return `
    <div 
      id="tubs-scroll-container"
      class="flex flex-col gap-4 overflow-x-auto overflow-y-auto pb-8 w-full custom-scrollbar relative bg-gray-900/20 p-4 rounded-xl border border-gray-800"
    >
      ${renderSectionSettings()}
      ${renderTimelineHeader()}
      ${renderMeasures()}
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