/*
  js/events/handlers/menuEvents.js
  Event handlers for menu interactions (new, load, download, share).
*/

import { state } from '../../store.js';
import { renderApp } from '../../ui/renderer.js';
import { actions } from '../../actions.js';
import { downloadRhythm } from '../../utils/rhythmExporter.js';

/**
 * Handle toggle menu
 */
export const handleToggleMenu = () => {
    state.uiState.isMenuOpen = !state.uiState.isMenuOpen;
    renderApp();
};

/**
 * Handle close menu (clicking background)
 * @param {Event} e - The click event
 * @param {HTMLElement} target - The backdrop element
 */
export const handleCloseMenu = (e, target) => {
    if (e.target !== target) return;
    state.uiState.isMenuOpen = false;
    renderApp();
};

/**
 * Handle new rhythm
 */
export const handleNewRhythm = () => {
    if (confirm("Create new rhythm? Unsaved changes lost.")) {
        actions.createNewRhythm();
    }
    state.uiState.isMenuOpen = false;
    renderApp();
};

/**
 * Handle load rhythm (open modal)
 */
export const handleLoadRhythm = () => {
    state.uiState.modalType = 'rhythm';
    state.uiState.modalOpen = true;
    state.uiState.isMenuOpen = false;
    renderApp();
};

/**
 * Handle download rhythm
 */
export const handleDownloadRhythm = () => {
    downloadRhythm(state);
    state.uiState.isMenuOpen = false;
    renderApp();
};

/**
 * Handle share rhythm
 */
export const handleShareRhythm = () => {
    if (state.rhythmSource === 'repo' && state.currentRhythmId) {
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?rhythm=${encodeURIComponent(state.currentRhythmId)}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            alert(`Link copied to clipboard!\n\n${shareUrl}`);
        }).catch(err => {
            console.error('Failed to copy:', err);
            prompt('Copy this link:', shareUrl);
        });
    }
    state.uiState.isMenuOpen = false;
    renderApp();
};

/**
 * Handle toggle user guide submenu
 */
export const handleToggleUserGuideSubmenu = () => {
    state.uiState.userGuideSubmenuOpen = !state.uiState.userGuideSubmenuOpen;
    renderApp();
};
