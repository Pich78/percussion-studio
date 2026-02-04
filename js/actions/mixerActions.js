/*
  js/actions/mixerActions.js
  Actions for volume and mute control (global mixer).
*/

import { state } from '../store.js';
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
    // 1. Update Global State
    if (!state.mix[instrumentSymbol]) {
        state.mix[instrumentSymbol] = { volume: 1.0, muted: false, lastVolume: 1.0 };
    }

    const mix = state.mix[instrumentSymbol];
    mix.volume = volume;

    // Track last known good volume (if not 0)
    if (volume > 0) mix.lastVolume = volume;

    // REAL-TIME: Update audio engine immediately
    audioEngine.setInstrumentVolume(instrumentSymbol, volume);

    // Sync Mute State
    let muteChanged = false;
    if (volume === 0 && !mix.muted) {
        mix.muted = true;
        muteChanged = true;
    } else if (volume > 0 && mix.muted) {
        mix.muted = false;
        muteChanged = true;
    }

    // 2. Propagate to ALL sections and measures
    if (state.toque && state.toque.sections) {
        state.toque.sections.forEach(section => {
            section.measures.forEach(measure => {
                measure.tracks.forEach(track => {
                    if (track.instrument === instrumentSymbol) {
                        track.volume = volume;
                        if (muteChanged) track.muted = mix.muted;
                    }
                });
            });
        });
    }

    // 3. Refresh Grid ONLY if mute state changed AND not currently dragging
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
    // 1. Update Global State
    if (!state.mix[instrumentSymbol]) {
        state.mix[instrumentSymbol] = { volume: 1.0, muted: false, lastVolume: 1.0 };
    }

    const mix = state.mix[instrumentSymbol];
    mix.muted = isMuted;

    // REAL-TIME: Update audio engine mute state immediately
    audioEngine.setInstrumentMuted(instrumentSymbol, isMuted);

    let targetVolume = mix.volume;

    if (isMuted) {
        // Store current volume before muting (if meaningful)
        if (mix.volume > 0) mix.lastVolume = mix.volume;
        targetVolume = 0;
    } else {
        // Restore last volume
        targetVolume = mix.lastVolume || 1.0;
    }

    mix.volume = targetVolume;

    // 2. Propagate
    if (state.toque && state.toque.sections) {
        state.toque.sections.forEach(section => {
            section.measures.forEach(measure => {
                measure.tracks.forEach(track => {
                    if (track.instrument === instrumentSymbol) {
                        track.muted = isMuted;
                        track.volume = targetVolume;
                    }
                });
            });
        });
    }

    // 3. Refresh Grid required to show visual feedback
    refreshGrid();
};
