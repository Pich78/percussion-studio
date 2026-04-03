/**
 * js/services/trackMixer.js
 *
 * Singleton service for track mute/solo state machine.
 * Handles all mute and solo logic for tracks.
 *
 * States per track: Normal | Muted | Soloed
 * - Mute and Solo are mutually exclusive
 * - Only one track can be soloed at a time
 *
 * Volume 0 is treated as Muted.
 */

import { state, commit } from '../store.js';
import { audioEngine } from './audioEngine.js';
import { eventBus } from './eventBus.js';

class TrackMixer {
    constructor() {
        // State is stored in store.js (state.soloTrack, state.mix)
    }

    // ─── Getters ─────────────────────────────────────────────────────

    getSoloTrack() {
        return state.soloTrack;
    }

    isTrackSoloed(trackIndex) {
        return state.soloTrack === trackIndex;
    }

    isTrackMuted(trackIndex, track) {
        if (!track) return false;
        return (track.muted || track.volume === 0);
    }

    isTrackEffectivelyMuted(trackIndex, track) {
        if (!track) return false;
        const isSolo = state.soloTrack === trackIndex;
        const isMuted = track.muted || track.volume === 0;
        // Muted if: explicitly muted OR (solo active AND not this track)
        return isMuted || (state.soloTrack !== null && state.soloTrack !== undefined && !isSolo);
    }

    // ─── Actions ─────────────────────────────────────────────────────

    toggleMute(trackIndex, track, instrument) {
        const isSolo = state.soloTrack === trackIndex;
        const isMuted = track.muted || track.volume === 0;

        if (isSolo) {
            state.soloTrack = null;
            this._setMuteAndVolume(instrument, true, 0);
        } else if (isMuted) {
            this._setMuteAndVolume(instrument, false, 1.0);
        } else {
            this._setMuteAndVolume(instrument, true, 0);
        }

        eventBus.emit('render');
    }

    toggleSolo(trackIndex, track, instrument) {
        const isSolo = state.soloTrack === trackIndex;
        const isMuted = track.muted || track.volume === 0;

        if (isSolo) {
            state.soloTrack = null;
            eventBus.emit('render');
        } else if (isMuted) {
            state.soloTrack = trackIndex;
            this._setMuteAndVolume(instrument, false, 1.0);
        } else {
            state.soloTrack = trackIndex;
            eventBus.emit('render');
        }
    }

    setVolume(trackIndex, track, instrument, volume) {
        const isSolo = state.soloTrack === trackIndex;
        const isMuted = track.muted || track.volume === 0;

        if (volume === 0 && !isSolo) {
            this._setMuteAndVolume(instrument, true, 0);
        } else if (volume > 0 && isMuted) {
            this._setMuteAndVolume(instrument, false, volume);
        } else {
            commit('ensureMixEntry', { symbol: instrument });
            commit('setMixVolume', { symbol: instrument, volume });
            audioEngine.setInstrumentVolume(instrument, volume);
            commit('propagateMixToTracks', {
                symbol: instrument,
                volume: state.mix[instrument].volume,
                muted: state.mix[instrument].muted
            });
        }

        eventBus.emit('render');
    }

    // ─── Internal ───────────────────────────────────────────────────

    _setMuteAndVolume(instrument, muted, volume) {
        commit('ensureMixEntry', { symbol: instrument });
        commit('setMixMuted', { symbol: instrument, muted });
        audioEngine.setInstrumentMuted(instrument, muted);
        commit('setMixVolume', { symbol: instrument, volume });
        audioEngine.setInstrumentVolume(instrument, volume);
        commit('propagateMixToTracks', {
            symbol: instrument,
            volume: state.mix[instrument].volume,
            muted: state.mix[instrument].muted
        });
    }

    // ─── Lifecycle ──────────────────────────────────────────────────

    reset() {
        state.soloTrack = null;

        if (state.mix) {
            Object.keys(state.mix).forEach(symbol => {
                state.mix[symbol].muted = false;
                state.mix[symbol].volume = 1.0;
            });
        }

        eventBus.emit('render');
    }
}

export const trackMixer = new TrackMixer();
