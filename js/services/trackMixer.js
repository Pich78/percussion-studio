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
 *
 * IMPORTANT: Volume and mute state for an instrument live ONLY in
 * state.mix[symbol]. The track objects do NOT carry these fields anymore.
 * isTrackMuted / isTrackEffectivelyMuted read from state.mix via the
 * isInstrumentMuted selector. setVolume / toggleMute delegate to the
 * setMixVolume / setMixMuted actions.
 */

import { state, commit } from '../store.js';
import { audioEngine } from './audioEngine.js';
import { eventBus } from './eventBus.js';
import { isInstrumentMuted } from '../store/stateSelectors.js';
import { setMixVolume, setMixMuted } from '../actions/mixerActions.js';

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
        return isInstrumentMuted(state, track.instrument);
    }

    isTrackEffectivelyMuted(trackIndex, track) {
        if (!track) return false;
        const isSolo = state.soloTrack === trackIndex;
        const isMuted = isInstrumentMuted(state, track.instrument);
        // Muted if: explicitly muted OR (solo active AND not this track)
        return isMuted || (state.soloTrack !== null && state.soloTrack !== undefined && !isSolo);
    }

    // ─── Actions ─────────────────────────────────────────────────────

    toggleMute(trackIndex, track, instrument) {
        const isSolo = state.soloTrack === trackIndex;
        const isMuted = isInstrumentMuted(state, instrument);

        if (isSolo) {
            state.soloTrack = null;
            setMixMuted(instrument, true);
        } else if (isMuted) {
            setMixMuted(instrument, false);
        } else {
            setMixMuted(instrument, true);
        }

        eventBus.emit('render');
    }

    toggleSolo(trackIndex, track, instrument) {
        const isSolo = state.soloTrack === trackIndex;
        const isMuted = isInstrumentMuted(state, instrument);

        if (isSolo) {
            state.soloTrack = null;
            eventBus.emit('render');
        } else if (isMuted) {
            state.soloTrack = trackIndex;
            setMixMuted(instrument, false);
        } else {
            state.soloTrack = trackIndex;
            eventBus.emit('render');
        }
    }

    setVolume(trackIndex, track, instrument, volume) {
        const isSolo = state.soloTrack === trackIndex;
        const isMuted = isInstrumentMuted(state, instrument);

        if (volume === 0 && !isSolo) {
            setMixMuted(instrument, true);
        } else if (volume > 0 && isMuted) {
            // Was muted — restore by setting volume directly (also unmutes).
            setMixVolume(instrument, volume);
        } else {
            setMixVolume(instrument, volume);
        }

        eventBus.emit('render');
    }

    // ─── Lifecycle ──────────────────────────────────────────────────

    reset() {
        state.soloTrack = null;

        // Reset audio engine gain nodes so the audio side matches the
        // freshly-cleared state.mix. Without this, gains from a previous
        // rhythm would carry over and the user would hear the old volume
        // even though state.mix (and the slider) defaults to 1.0.
        audioEngine.resetInstrumentGains();

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
