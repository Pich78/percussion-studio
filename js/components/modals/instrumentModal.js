/*
  js/components/modals/instrumentModal.js
  Renders the add/edit instrument modal.
  Extracted from tubsGrid.js for modularity.
*/

import { INSTRUMENT_COLORS } from '../../constants.js';
import { state } from '../../store.js';
import { dataLoader } from '../../services/dataLoader.js';

// Icons
import { SpeakerWaveIcon } from '../../icons/speakerWaveIcon.js';
import { XMarkIcon } from '../../icons/xMarkIcon.js';

/**
 * Render the instrument selection list
 * @param {string|null} selectedInstrument - Currently selected instrument
 * @returns {string} HTML string
 */
const renderInstrumentList = (selectedInstrument) => {
  if (!dataLoader.manifest || !dataLoader.manifest.instruments) {
    return '<div class="text-center text-gray-500 py-8">Loading instruments...</div>';
  }

  return Object.keys(dataLoader.manifest.instruments).map(symbol => {
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
                ${isSelected ? 'ring-2 ring-amber-400 bg-amber-900/30' : ''}
              "
            >
              <span class="font-medium ${isSelected ? 'text-amber-300' : 'text-gray-200'} pointer-events-none">${state.instrumentDefinitions[symbol]?.name || symbol}</span>
            </button>
          `;
  }).join('');
};

/**
 * Render the sound pack selection list
 * @param {string|null} selectedInstrument - Currently selected instrument
 * @param {string|null} selectedPack - Currently selected sound pack
 * @returns {string} HTML string
 */
const renderSoundPackList = (selectedInstrument, selectedPack) => {
  if (!selectedInstrument) {
    return '<div class="text-center text-gray-500 py-8">Select an instrument to view sound packs</div>';
  }

  if (!dataLoader.manifest || !dataLoader.manifest.sound_packs) {
    return '<div class="text-center text-gray-500">No sound packs found.</div>';
  }

  return Object.keys(dataLoader.manifest.sound_packs).map(pack => {
    const isSelected = selectedPack === pack;
    return `
            <button
              data-action="select-sound-pack"
              data-pack="${pack}"
              class="
                flex items-center gap-3 px-3 py-3 rounded-lg border bg-gray-900/50 hover:bg-gray-800 transition-all text-left
                ${isSelected ? 'ring-2 ring-amber-400 bg-amber-900/30 border-amber-400' : 'border-gray-700 hover:border-amber-500 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]'}
              "
            >
              ${SpeakerWaveIcon(`w-5 h-5 ${isSelected ? 'text-amber-300' : 'text-gray-500'}`)}
              <span class="font-medium ${isSelected ? 'text-amber-300' : 'text-gray-200'} pointer-events-none">${pack}</span>
            </button>
          `;
  }).join('');
};

/**
 * Render the instrument modal
 * @param {object} uiState - UI state object
 * @returns {string} HTML string
 */
export const InstrumentModal = (uiState) => {
  const title = uiState.editingTrackIndex !== null ? 'Change Instrument' : 'Add Instrument';
  const selectedInstrument = uiState.pendingInstrument;
  const selectedPack = uiState.pendingSoundPack;

  const content = `
        <div class="p-6 grid grid-cols-2 gap-6 overflow-y-auto max-h-[60vh]">
          <!-- Left Column: Instruments -->
          <div class="border-r border-gray-800 pr-4">
            <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Instrument Type</h4>
            <div class="grid grid-cols-1 gap-2">
              ${renderInstrumentList(selectedInstrument)}
            </div>
          </div>
          
          <!-- Right Column: Sound Packs -->
          <div class="pl-2">
            <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Sound Pack</h4>
            <div class="grid grid-cols-1 gap-3">
              ${renderSoundPackList(selectedInstrument, selectedPack)}
            </div>
          </div>
        </div>
      `;

  const canConfirm = uiState.pendingInstrument && uiState.pendingSoundPack;

  return `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" data-action="close-modal-bg">
          <div class="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                <button 
                    data-action="close-modal"
                    class="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors"
                >
                    Cancel
                </button>
                <button 
                    data-action="confirm-instrument-selection"
                    class="px-4 py-2 rounded font-medium transition-all
                      ${canConfirm
      ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer'
      : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'}"
                    ${!canConfirm ? 'disabled' : ''}
                >
                    OK
                </button>
              </div>
          </div>
      </div>
    `;
};
