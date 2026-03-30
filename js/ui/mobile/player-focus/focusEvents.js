/**
 * js/ui/mobile/player-focus/focusEvents.js
 *
 * Focus Mode (P1c) — double-tap-to-solo interaction.
 *
 * Strategy:
 *   • Listen for taps on elements with data-role="focus-track-tap" on the root.
 *   • Track last-tap timestamp per track index; a second tap within DOUBLE_TAP_MS
 *     counts as a double-tap.
 *   • On double-tap: toggle solo for that track index using trackMixer.
 *   • Uses trackMixer.toggleSolo() for unified mute/solo state machine.
 */

import { state } from '../../../store.js';
import { getActiveSection } from '../../../store/stateSelectors.js';
import { trackMixer } from '../../../services/trackMixer.js';

/** Maximum ms between two taps to count as a double-tap */
const DOUBLE_TAP_MS = 350;

/** Map<trackIndex, timestampMs> — last tap time for each tap target */
const _lastTap = new Map();

/**
 * Handle a tap on a focus-mode track tap target.
 * @param {number} trackIdx
 */
const handleFocusTap = (trackIdx) => {
    const now = Date.now();
    const lastTime = _lastTap.get(trackIdx) || 0;
    const isDoubleTap = (now - lastTime) <= DOUBLE_TAP_MS;
    _lastTap.set(trackIdx, now);

    if (!isDoubleTap) return;

    const activeSection = getActiveSection(state);
    if (!activeSection) return;

    const tracks = activeSection.measures[0]?.tracks;
    if (!tracks || tracks.length < 2) return;

    const tappedTrack = tracks[trackIdx];
    if (!tappedTrack) return;

    trackMixer.toggleSolo(trackIdx, tappedTrack, tappedTrack.instrument);
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

    root.addEventListener('touchend', (e) => {
        const target = e.target.closest('[data-role="focus-track-tap"]');
        if (!target) return;
        const trackIdx = parseInt(target.dataset.trackIndex, 10);
        if (!isNaN(trackIdx)) {
            e.preventDefault();
            handleFocusTap(trackIdx);
        }
    }, { passive: false });

    root.addEventListener('click', (e) => {
        const target = e.target.closest('[data-role="focus-track-tap"]');
        if (!target) return;
        const trackIdx = parseInt(target.dataset.trackIndex, 10);
        if (!isNaN(trackIdx)) {
            handleFocusTap(trackIdx);
        }
    });
};
