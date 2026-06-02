/**
 * js/ui/desktop/mixerModal.js
 *
 * Desktop-only mixer modal: per-instrument mute + volume controls.
 * Mirrors the mobile dual-mode mixer (js/ui/mobile/dual-mode/mixerModal.js)
 * but uses the cyan slider theme that matches the desktop BPM slider,
 * and renders as a centered modal with a dark backdrop.
 *
 * Scope: per-instrument-type (per state.mix[symbol]); the same
 * data-action="update-volume" + data-action="toggle-mute" plumbing used
 * elsewhere in the desktop grid routes through the existing handlers.
 */

import { state } from '../../store.js';
import { trackMixer } from '../../services/trackMixer.js';
import { getMixVolume, isInstrumentMuted } from '../../store/stateSelectors.js';
import { SpeakerWaveIcon } from '../../icons/speakerWaveIcon.js';
import { SpeakerXMarkIcon } from '../../icons/speakerXMarkIcon.js';

export const renderMixerModal = (activeSection) => {
  if (!activeSection) return '';
  const tracks = activeSection.measures[0]?.tracks || [];

  const rows = tracks.map((track, tIdx) => {
    const def = state.instrumentDefinitions[track.instrument] || {};
    const vol = getMixVolume(state, track.instrument);
    const isMuted = isInstrumentMuted(state, track.instrument);
    const isEffectivelyMuted = trackMixer.isTrackEffectivelyMuted(tIdx, track);
    const nameColor = isEffectivelyMuted ? '#6b7280' : (def.color || '#d1d5db');
    const pct = Math.round(vol * 100);

    return `
      <div class="flex flex-col gap-2 ${tIdx > 0 ? 'pt-3 border-t border-gray-800' : ''}">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <button data-action="toggle-mute" data-track-index="${tIdx}" data-measure-index="0"
              class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors border
                     ${isMuted ? 'bg-red-900/30 text-red-500 border-red-900/50' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200'}"
              title="${isMuted ? 'Unmute' : 'Mute'}">
              ${isMuted ? SpeakerXMarkIcon('w-4 h-4 pointer-events-none') : SpeakerWaveIcon('w-4 h-4 pointer-events-none')}
            </button>
            <span class="text-xs font-bold uppercase tracking-wider truncate max-w-[180px] ${isEffectivelyMuted ? 'line-through' : ''}"
                  style="color: ${nameColor};">${def.name || track.instrument}</span>
          </div>
          <span data-role="volume-pct-outside" class="text-xl font-mono font-bold ${isEffectivelyMuted ? 'text-gray-600' : 'text-cyan-400'}">${pct}%</span>
        </div>

        <div class="relative w-full h-5 flex items-center group/vol cursor-pointer py-1 ${isEffectivelyMuted ? 'opacity-40' : ''}">
          <div class="absolute left-0 right-0 h-2 bg-gray-800 rounded-full"></div>
          <div class="absolute left-0 h-2 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
               style="width: ${pct}%"></div>
          <span class="absolute left-1 text-[8px] font-medium text-white/90 pointer-events-none z-10"
                style="text-shadow: 0 1px 2px rgba(0,0,0,0.8)">${pct}%</span>
          <div class="absolute w-4 h-4 bg-white rounded-full shadow-md border border-cyan-400 cursor-pointer z-[15] transition-transform group-hover/vol:scale-110"
               style="left: calc(${pct}% - 8px)"></div>
          <input type="range" min="0" max="1" step="0.01" value="${vol}"
            data-action="update-volume" data-track-index="${tIdx}" data-measure-index="0"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            title="Volume: ${pct}%" />
        </div>
      </div>`;
  }).join('');

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
         data-action="close-mixer-bg">
      <div class="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-96 max-w-full flex flex-col gap-4 p-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div class="flex justify-between items-center pb-2 border-b border-gray-800">
          <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Mixer</span>
          <div class="flex items-center gap-3">
            <span class="text-[10px] text-gray-500">Per-instrument volume</span>
            <button data-action="close-mixer" class="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-800" title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 pointer-events-none">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        ${tracks.length === 0 ? '<div class="text-center text-gray-500 text-sm py-4">No instruments in this section.</div>' : rows}
        <div class="flex justify-end pt-2 border-t border-gray-800">
          <button data-action="close-mixer" class="px-3 py-1.5 text-xs font-bold uppercase text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">Done</button>
        </div>
      </div>
    </div>`;
};
