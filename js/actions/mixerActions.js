/*
  js/actions/mixerActions.js
  Actions for volume and mute control (global mixer).
*/

import { state, commit } from '../store.js';
import { refreshGrid } from '../ui/renderer.js';
import { audioEngine } from '../services/audioEngine.js';

/**
 * Sets the global volume for a specific instrument type.
 * Updates ALL tracks of this instrument across ALL sections.
 * SYNC: If volume is 0, mute. If volume > 0, unmute.
 * NOW: Also updates audio engine in real-time for immediate effect.
 * 
 * @param {string} instrumentSymbol - Instrument symbol e.g. 'ITO'
 * @param {number} volume - Volume level 0.0 to 1.0
 */
export const setGlobalVolume = (instrumentSymbol, volume) => {
    // 1. Ensure mix entry exists
    commit('ensureMixEntry', { symbol: instrumentSymbol });

    // 2. Track previous mute state for change detection
    const wasMuted = state.mix[instrumentSymbol].muted;

    // 3. Update mix state via commit
    commit('setMixVolume', { symbol: instrumentSymbol, volume });

    // 4. REAL-TIME: Update audio engine immediately
    audioEngine.setInstrumentVolume(instrumentSymbol, volume);

    // 5. Detect mute state change
    const mix = state.mix[instrumentSymbol];
    const muteChanged = mix.muted !== wasMuted;

    // 6. Propagate to all tracks
    commit('propagateMixToTracks', {
        symbol: instrumentSymbol,
        volume: mix.volume,
        muted: mix.muted
    });

    // 7. Refresh Grid ONLY if mute state changed AND not currently dragging
    // (Dragging will refresh on mouseup to avoid breaking the drag)
    if (muteChanged && !window.__volumeDragging) {
        refreshGrid();
    }
};

/**
 * Sets the global mute status for a specific instrument type.
 * SYNC: If muted, set volume to 0. If unmuted, restore last volume.
 * NOW: Also updates audio engine in real-time for immediate effect.
 * 
 * @param {string} instrumentSymbol - Instrument symbol e.g. 'ITO'
 * @param {boolean} isMuted - True to mute
 */
export const setGlobalMute = (instrumentSymbol, isMuted) => {
    // 1. Ensure mix entry exists
    commit('ensureMixEntry', { symbol: instrumentSymbol });

    // 2. Update mute state via commit
    commit('setMixMuted', { symbol: instrumentSymbol, muted: isMuted });

    // 3. REAL-TIME: Update audio engine mute state immediately
    audioEngine.setInstrumentMuted(instrumentSymbol, isMuted);

    // 4. Get resolved volume for propagation
    const mix = state.mix[instrumentSymbol];

    // 5. Propagate to all tracks
    commit('propagateMixToTracks', {
        symbol: instrumentSymbol,
        volume: mix.volume,
        muted: mix.muted
    });

    // 6. Refresh Grid required to show visual feedback
    refreshGrid();
};
