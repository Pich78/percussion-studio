/**
 * js/ui/mobile/player-focus/focusEvents.js
 *
 * Focus Mode (P1c) — double-tap-to-solo interaction.
 *
 * Strategy:
 *   • Listen for taps on elements with data-role="focus-track-tap" on the root.
 *   • Track last-tap timestamp per track index; a second tap within DOUBLE_TAP_MS
 *     counts as a double-tap.
 *   • On double-tap: toggle solo for that track index across the active section.
 *     - ENTER solo  → mute all OTHER tracks, unmute the tapped one.
 *     - EXIT solo   → unmute ALL tracks (restore full mix).
 *   • Uses actions.setGlobalMute so the audio engine is updated in real-time.
 *   • After mute changes, emits 'render' so the focus indicator re-evaluates.
 */

import { state } from '../../../store.js';
import { getActiveSection } from '../../../store/stateSelectors.js';
import { actions } from '../../../actions.js';
import { eventBus } from '../../../services/eventBus.js';

/** Maximum ms between two taps to count as a double-tap */
const DOUBLE_TAP_MS = 350;

/** Map<trackIndex, timestampMs> — last tap time for each tap target */
const _lastTap = new Map();

/**
 * Determine whether any track is currently soloed.
 * We define "soloed" as: exactly one track is unmuted, all others are muted.
 *
 * @param {object[]} tracks - Array of track objects from the active section
 * @returns {{ soloed: boolean, soloedInstrument: string|null }}
 */
const getSoloState = (tracks) => {
    const unmuted = tracks.filter(t => !t.muted);
    if (unmuted.length === 1 && tracks.length > 1) {
        return { soloed: true, soloedInstrument: unmuted[0].instrument };
    }
    return { soloed: false, soloedInstrument: null };
};

/**
 * Solo a specific instrument: mute everything else, unmute the target.
 * @param {object[]} tracks
 * @param {string} targetInstrument
 */
const soloTrack = (tracks, targetInstrument) => {
    tracks.forEach(t => {
        actions.setGlobalMute(t.instrument, t.instrument !== targetInstrument);
    });
};

/**
 * Exit solo: unmute all tracks.
 * @param {object[]} tracks
 */
const exitSolo = (tracks) => {
    tracks.forEach(t => {
        if (t.muted) actions.setGlobalMute(t.instrument, false);
    });
};

/**
 * Handle a tap on a focus-mode track tap target.
 * @param {number} trackIdx
 */
const handleFocusTap = (trackIdx) => {
    const now = Date.now();
    const lastTime = _lastTap.get(trackIdx) || 0;
    const isDoubleTap = (now - lastTime) <= DOUBLE_TAP_MS;
    _lastTap.set(trackIdx, now);

    if (!isDoubleTap) return; // wait for second tap

    // Second tap confirmed — execute solo toggle
    const activeSection = getActiveSection(state);
    if (!activeSection) return;

    const tracks = activeSection.measures[0]?.tracks;
    if (!tracks || tracks.length < 2) return;

    const tappedTrack = tracks[trackIdx];
    if (!tappedTrack) return;

    const { soloed, soloedInstrument } = getSoloState(tracks);

    if (soloed && soloedInstrument === tappedTrack.instrument) {
        // Already soloed on this track → exit solo (unmute all)
        exitSolo(tracks);
    } else {
        // Solo this track (mute all others)
        soloTrack(tracks, tappedTrack.instrument);
    }

    // Trigger full re-render so the focus indicator updates
    eventBus.emit('render');
};

/**
 * Set up the Focus Mode double-tap event listeners.
 * Attaches to the root element using event delegation.
 * Safe to call multiple times — uses the window.__focusModeEventsAttached guard.
 */
export const setupFocusModeEvents = () => {
    if (window.__focusModeEventsAttached) return;
    window.__focusModeEventsAttached = true;

    const root = document.getElementById('root');
    if (!root) return;

    // Touch tap (mobile)
    root.addEventListener('touchend', (e) => {
        const target = e.target.closest('[data-role="focus-track-tap"]');
        if (!target) return;
        const trackIdx = parseInt(target.dataset.trackIndex, 10);
        if (!isNaN(trackIdx)) {
            e.preventDefault(); // prevent ghost click
            handleFocusTap(trackIdx);
        }
    }, { passive: false });

    // Click / mouse (desktop preview)
    root.addEventListener('click', (e) => {
        const target = e.target.closest('[data-role="focus-track-tap"]');
        if (!target) return;
        const trackIdx = parseInt(target.dataset.trackIndex, 10);
        if (!isNaN(trackIdx)) {
            handleFocusTap(trackIdx);
        }
    });
};

/**
 * Reset the focus mode state — should be called when leaving the Focus Mode view
 * so that solo mutes don't linger in other views.
 */
export const resetFocusMode = () => {
    window.__focusModeEventsAttached = false;
    _lastTap.clear();

    // Unmute all tracks when leaving the view
    const activeSection = getActiveSection(state);
    if (!activeSection) return;
    const tracks = activeSection.measures[0]?.tracks;
    if (!tracks) return;

    const { soloed } = getSoloState(tracks);
    if (soloed) {
        exitSolo(tracks);
        eventBus.emit('render');
    }
};
