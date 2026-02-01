/*
  js/events/handlers/playbackEvents.js
  Event handlers for playback controls (play, stop, count-in, BPM).
*/

import { state, playback } from '../../store.js';
import { togglePlay, stopPlayback } from '../../services/sequencer.js';
import { renderApp } from '../../ui/renderer.js';

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
    renderApp();
};

/**
 * Handle global BPM input change
 * @param {HTMLInputElement} target - The input element
 */
export const handleGlobalBpmInput = (target) => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    state.toque.globalBpm = Number(target.value);
    if (section && !section.bpm) {
        playback.currentPlayheadBpm = state.toque.globalBpm;
    }
    const display = document.getElementById('header-global-bpm');
    if (display) {
        display.innerHTML = `${state.toque.globalBpm} <span class="text-[9px] text-gray-600">BPM</span>`;
    }
};

/**
 * Handle global BPM change (on blur/enter)
 * @param {HTMLInputElement} target - The input element
 */
export const handleGlobalBpmChange = (target) => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    state.toque.globalBpm = Number(target.value);
    if (section && !section.bpm) {
        playback.currentPlayheadBpm = state.toque.globalBpm;
    }
    renderApp();
};

/**
 * Handle section BPM input
 * @param {HTMLInputElement} target - The input element
 */
export const handleSectionBpmInput = (target) => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    if (section) {
        section.bpm = Number(target.value);
        playback.currentPlayheadBpm = section.bpm;
    }
};

/**
 * Handle section BPM change (on blur/enter)
 * @param {HTMLInputElement} target - The input element
 */
export const handleSectionBpmChange = (target) => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    if (section) {
        section.bpm = Number(target.value);
        playback.currentPlayheadBpm = section.bpm;
    }
};

/**
 * Handle BPM override toggle
 */
export const handleToggleBpmOverride = () => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    if (section) {
        section.bpm = (section.bpm !== undefined) ? undefined : state.toque.globalBpm;
    }
};

/**
 * Handle tempo acceleration input
 * @param {HTMLInputElement} target - The input element
 */
export const handleAccelerationInput = (target) => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    if (section) {
        section.tempoAcceleration = parseFloat(target.value);
    }
};

/**
 * Handle tempo acceleration change
 * @param {HTMLInputElement} target - The input element
 */
export const handleAccelerationChange = (target) => {
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    if (section) {
        section.tempoAcceleration = parseFloat(target.value);
        renderApp();
    }
};
