/**
 * js/ui/sliderVisuals.js
 *
 * Shared direct-DOM visual updaters for sliders (no re-render).
 * Used by the unified pointer drag machinery (js/services/pointerDrag.js)
 * to keep the fill/handle/percentage in lock-step with the cursor during a
 * drag. The state (state.mix, playback) remains the single source of truth;
 * these functions only mirror it onto the DOM for snappiness. A single
 * grid-refresh/render on drag end rebuilds every surface from state.
 */

/**
 * Update the fill bar, handle and inside percentage of a .group/vol volume
 * slider container.
 * @param {HTMLElement} container - The .group/vol slider container
 * @param {number} volume - 0.0-1.0
 */
export const updateVolumeSliderVisuals = (container, volume) => {
    if (!container) return;
    const percentage = Math.round(volume * 100);
    // Update fill bar
    const fillBar = container.querySelector('div[class*="bg-gradient"]');
    if (fillBar) fillBar.style.width = `${percentage}%`;
    // Update handle position (8px offset for the 16x16 handle, see mixerModal.js)
    const handle = container.querySelector('div[class*="bg-white"]');
    if (handle) handle.style.left = `calc(${percentage}% - 8px)`;
    // Update inside percentage text
    const percentLabel = container.querySelector('span[class*="font-medium"]');
    if (percentLabel) percentLabel.textContent = `${percentage}%`;
};

/**
 * Update the fill bar and handle of a .group/bpm BPM slider container.
 * @param {HTMLElement} container - The .group/bpm slider container
 * @param {number} bpm - 40-240
 */
export const updateBpmSliderVisuals = (container, bpm) => {
    if (!container) return;
    const percentage = ((bpm - 40) / 200) * 100;
    // Update fill bar
    const fillBar = container.querySelector('div[class*="bg-gradient"]');
    if (fillBar) fillBar.style.width = `${percentage}%`;
    // Update handle position (dynamic offset based on actual handle width)
    const handle = container.querySelector('div[class*="bg-white"]');
    if (handle) handle.style.left = `calc(${percentage}% - ${handle.offsetWidth / 2}px)`;
};
