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

  Actions NEVER emit UI events ('render' / 'grid-refresh'): they mutate
  state and drive the audio engine only. Repaint policy belongs to the
  interaction layer (events/ui), which knows the gesture context — drag
  ticks suppress repaints by construction, discrete gestures refresh
  explicitly. Both actions return { muteChanged } so callers can react
  to mute-coupling transitions without the action doing UI work.
*/

import { state, commit } from '../store.js';
import { audioEngine } from '../services/audioEngine.js';

/**
 * Set the volume for an instrument in the global mix.
 * Single source of truth: state.mix[symbol].volume.
 * Emits no UI events; returns { muteChanged } for callers that repaint.
 *
 * @param {string} instrumentSymbol - Instrument symbol e.g. 'ITO'
 * @param {number} volume - Volume level 0.0 to 1.0
 * @returns {{ muteChanged: boolean }} True if the mute coupling flipped
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

    // 5. Report mute state transition (setMixVolume couples volume<->muted)
    return { muteChanged: state.mix[instrumentSymbol].muted !== wasMuted };
};

/**
 * Set the muted flag for an instrument in the global mix.
 * Single source of truth: state.mix[symbol].muted.
 * SYNC: If muted, set volume to 0 (storing prior volume in lastVolume).
 *       If unmuted, restore from lastVolume.
 * Emits no UI events; returns { muteChanged } for callers that repaint.
 *
 * @param {string} instrumentSymbol - Instrument symbol e.g. 'ITO'
 * @param {boolean} muted - True to mute
 * @returns {{ muteChanged: boolean }} True if the flag flipped
 */
export const setMixMuted = (instrumentSymbol, muted) => {
    // 1. Ensure mix entry exists
    commit('ensureMixEntry', { symbol: instrumentSymbol });

    // 2. Track previous mute state for change detection
    const wasMuted = state.mix[instrumentSymbol].muted;

    // 3. Update mute state via commit
    commit('setMixMuted', { symbol: instrumentSymbol, muted });

    // 4. REAL-TIME: Update audio engine mute + volume state
    const mix = state.mix[instrumentSymbol];
    audioEngine.setInstrumentMuted(instrumentSymbol, muted);
    audioEngine.setInstrumentVolume(instrumentSymbol, mix.volume);

    // 5. Report transition; repaints are the caller's decision
    return { muteChanged: mix.muted !== wasMuted };
};

// ─── Backward-compatible aliases ────────────────────────────────────────────
// These names predate the BPM-style refactor; keep them so legacy callers
// in events and tests still work. New code should call setMixVolume /
// setMixMuted directly.

/** @deprecated Use setMixVolume */
export const setGlobalVolume = setMixVolume;

/** @deprecated Use setMixMuted */
export const setGlobalMute = setMixMuted;
