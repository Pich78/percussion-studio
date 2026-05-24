/*
  js/events/handlers/playbackEvents.js
  Event handlers for playback controls (play, stop, count-in, BPM).
*/

import { state, playback } from '../../store.js';
import { getActiveSection } from '../../store/stateSelectors.js';
import { togglePlay, stopPlayback } from '../../services/sequencer.js';
import { eventBus } from '../../services/eventBus.js';

/**
 * Handle play/pause toggle
 */
export const handleTogglePlay = () => {
    togglePlay();
};

/**
 * Handle stop playback
 */
export const handleStop = () => {
    stopPlayback();
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
 * Handle section BPM input
 * @param {HTMLInputElement} target - The input element
 */
export const handleSectionBpmInput = (target) => {
    const section = getActiveSection(state);
    if (section) {
        section.bpm = Number(target.value);
        playback.currentPlayheadBpm = section.bpm;
        playback.userHasOverriddenBpm = true;
    }
};

/**
 * Handle section BPM change (on blur/enter)
 * @param {HTMLInputElement} target - The input element
 */
export const handleSectionBpmChange = (target) => {
    const section = getActiveSection(state);
    if (section) {
        section.bpm = Number(target.value);
        playback.currentPlayheadBpm = section.bpm;
        playback.userHasOverriddenBpm = true;
    }
};

/**
 * Handle BPM override toggle
 */
export const handleToggleBpmOverride = () => {
    const section = getActiveSection(state);
    if (section) {
        section.bpm = (section.bpm !== undefined) ? undefined : playback.currentPlayheadBpm;
    }
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
