/*
  js/events/handlers/menuEvents.js
  Event handlers for menu interactions (new, load, download, share).
*/

import { state, commit } from '../../store.js';
import { getShareUrl } from '../../store/stateSelectors.js';
import { renderApp } from '../../ui/renderer.js';
import { actions } from '../../actions.js';
import { downloadRhythm } from '../../utils/rhythmExporter.js';

/**
 * Handle toggle menu
 */
export const handleToggleMenu = () => {
    commit('setMenuOpen', { isOpen: !state.uiState.isMenuOpen });
    renderApp();
};

/**
 * Handle close menu (clicking background)
 * @param {Event} e - The click event
 * @param {HTMLElement} target - The backdrop element
 */
export const handleCloseMenu = (e, target) => {
    if (e.target !== target) return;
    commit('setMenuOpen', { isOpen: false });
    renderApp();
};

/**
 * Handle new rhythm
 */
export const handleNewRhythm = () => {
    if (confirm("Create new rhythm? Unsaved changes lost.")) {
        actions.createNewRhythm();
    }
    commit('setMenuOpen', { isOpen: false });
    renderApp();
};

/**
 * Handle load rhythm (open modal)
 */
export const handleLoadRhythm = () => {
    commit('setModal', { open: true, type: 'rhythm' });
    commit('setMenuOpen', { isOpen: false });
    renderApp();
};

/**
 * Handle download rhythm
 */
export const handleDownloadRhythm = () => {
    downloadRhythm(state);
    commit('setMenuOpen', { isOpen: false });
    renderApp();
};

/**
 * Handle share rhythm
 */
export const handleShareRhythm = () => {
    const shareUrl = getShareUrl(state);
    if (shareUrl) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert(`Link copied to clipboard!\n\n${shareUrl}`);
        }).catch(err => {
            console.error('Failed to copy:', err);
            prompt('Copy this link:', shareUrl);
        });
    }
    commit('setMenuOpen', { isOpen: false });
    renderApp();
};

/**
 * Handle toggle user guide submenu
 */
export const handleToggleUserGuideSubmenu = () => {
    state.uiState.userGuideSubmenuOpen = !state.uiState.userGuideSubmenuOpen;
    renderApp();
};
