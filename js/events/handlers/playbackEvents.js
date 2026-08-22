/*
  js/events/handlers/playbackEvents.js
  Event handlers for playback controls (play, stop, count-in, BPM).
*/

import { state, playback } from '../../store.js';
import { getActiveSection } from '../../store/stateSelectors.js';
import { togglePlay } from '../../services/sequencer.js';
import { eventBus } from '../../services/eventBus.js';

/**
 * Handle play/pause toggle
 */
export const handleTogglePlay = () => {
    togglePlay();
};

/**
 * Handle count-in toggle
 */
export const handleToggleCountIn = () => {
    state.countInEnabled = !state.countInEnabled;
    eventBus.emit('render');
};

/**
 * Handle global BPM input change
 * @param {HTMLInputElement} target - The input element
 */
export const handleGlobalBpmInput = (target) => {
    const newBpm = Number(target.value);
    state.toque.globalBpm = newBpm;
    playback.currentPlayheadBpm = newBpm;
    playback.userHasOverriddenBpm = true;
    const display = document.getElementById('header-global-bpm');
    if (display) {
        display.innerHTML = `${newBpm} <span class="text-[9px] text-gray-600">BPM</span>`;
    }
};

/**
 * Handle global BPM change (on blur/enter)
 * @param {HTMLInputElement} target - The input element
 */
export const handleGlobalBpmChange = (target) => {
    const newBpm = Number(target.value);
    state.toque.globalBpm = newBpm;
    playback.currentPlayheadBpm = newBpm;
    playback.userHasOverriddenBpm = true;
    eventBus.emit('render');
};

/**
 * Handle tempo acceleration input
 * @param {HTMLInputElement} target - The input element
 */
export const handleAccelerationInput = (target) => {
    const section = getActiveSection(state);
    if (section) {
        section.tempoAcceleration = parseFloat(target.value);
    }
};

/**
 * Handle tempo acceleration change
 * @param {HTMLInputElement} target - The input element
 */
export const handleAccelerationChange = (target) => {
    const section = getActiveSection(state);
    if (section) {
        section.tempoAcceleration = parseFloat(target.value);
        eventBus.emit('render');
    }
};
