/*
  js/actions/mixerActions.js
  Actions for volume and mute control (global mixer).

  These are the ONLY write paths for state.mix[symbol].volume and
  state.mix[symbol].muted. All volume slider and mute button events
  (desktop and mobile) route through these functions.

  The single source of truth is state.mix[symbol]:
    - volume: 0.0-1.0, the slider value, also drives the audio engine's
      per-instrument gain node
    - muted: explicit mute flag, coupled to volume: volume === 0 implies
      muted, and toggling mute snaps volume to 0 (storing the prior
      volume in lastVolume for restore).
    - lastVolume: stored prior volume, used to restore on unmute.

  Track objects do NOT carry volume or muted fields anymore. UI elements
  read state.mix directly via the getMixVolume / isInstrumentMuted
  selectors in stateSelectors.js.
*/

import { state, commit } from '../store.js';
import { eventBus } from '../services/eventBus.js';
import { audioEngine } from '../services/audioEngine.js';

/**
 * Set the volume for an instrument in the global mix.
 * Single source of truth: state.mix[symbol].volume.
 *
 * @param {string} instrumentSymbol - Instrument symbol e.g. 'ITO'
 * @param {number} volume - Volume level 0.0 to 1.0
 */
export const setMixVolume = (instrumentSymbol, volume) => {
    // 1. Ensure mix entry exists
    commit('ensureMixEntry', { symbol: instrumentSymbol });

    // 2. Track previous mute state for change detection
    const wasMuted = state.mix[instrumentSymbol].muted;

    // 3. Update mix state via commit
    commit('setMixVolume', { symbol: instrumentSymbol, volume });

    // 4. REAL-TIME: Update audio engine gain node immediately
    audioEngine.setInstrumentVolume(instrumentSymbol, state.mix[instrumentSymbol].volume);

    // 5. Detect mute state change (setMixVolume couples volume<->muted)
    const mix = state.mix[instrumentSymbol];
    const muteChanged = mix.muted !== wasMuted;

    // 6. Refresh Grid only if mute state changed AND not currently dragging
    // (Dragging will refresh on mouseup/touchend to avoid breaking the drag)
    if (muteChanged && !window.__volumeDragging) {
        eventBus.emit('grid-refresh');
    }
};

/**
 * Set the muted flag for an instrument in the global mix.
 * Single source of truth: state.mix[symbol].muted.
 * SYNC: If muted, set volume to 0 (storing prior volume in lastVolume).
 *       If unmuted, restore from lastVolume.
 *
 * @param {string} instrumentSymbol - Instrument symbol e.g. 'ITO'
 * @param {boolean} muted - True to mute
 */
export const setMixMuted = (instrumentSymbol, muted) => {
    // 1. Ensure mix entry exists
    commit('ensureMixEntry', { symbol: instrumentSymbol });

    // 2. Update mute state via commit
    commit('setMixMuted', { symbol: instrumentSymbol, muted });

    // 3. REAL-TIME: Update audio engine mute + volume state
    const mix = state.mix[instrumentSymbol];
    audioEngine.setInstrumentMuted(instrumentSymbol, muted);
    audioEngine.setInstrumentVolume(instrumentSymbol, mix.volume);

    // 4. Refresh grid for visual feedback (mute toggle is a discrete event)
    eventBus.emit('grid-refresh');
};

// ─── Backward-compatible aliases ────────────────────────────────────────────
// These names predate the BPM-style refactor; keep them so legacy callers
// in events and tests still work. New code should call setMixVolume /
// setMixMuted directly.

/** @deprecated Use setMixVolume */
export const setGlobalVolume = setMixVolume;

/** @deprecated Use setMixMuted */
export const setGlobalMute = setMixMuted;
