/**
 * js/services/trackMixer.js
 *
 * Read-only mute/solo read-model over state.soloTrack + state.mix.
 *
 * States per track: Normal | Muted | Soloed
 * - Mute and Solo are mutually exclusive
 * - Only one track can be soloed at a time
 * - Volume 0 is treated as Muted
 *
 * IMPORTANT: this module exposes ONLY getters. All write paths live in
 * actions/mixerActions.js (toggleTrackMute / toggleTrackSolo / resetMix);
 * solo changes flow through the setSoloTrack mutation, mute/volume through
 * the setMix* mutations. Services never import actions, and callers own
 * repaints — no UI events are emitted from here.
 */

import { state } from '../store.js';
import { isInstrumentMuted } from '../store/stateSelectors.js';

class TrackMixer {
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
}

export const trackMixer = new TrackMixer();
