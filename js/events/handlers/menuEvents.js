/*
  js/events/handlers/menuEvents.js
  Event handlers for menu interactions (new, load, download, share).
*/

import { state, commit } from '../../store.js';
import { getShareUrl } from '../../store/stateSelectors.js';
import { eventBus } from '../../services/eventBus.js';
import { actions } from '../../actions.js';
import { downloadRhythm } from '../../utils/rhythmExporter.js';

/**
 * Handle toggle menu
 */
export const handleToggleMenu = () => {
    commit('setMenuOpen', { isOpen: !state.uiState.isMenuOpen });
    eventBus.emit('render');
};

/**
 * Handle close menu (clicking background)
 * @param {Event} e - The click event
 * @param {HTMLElement} target - The backdrop element
 */
export const handleCloseMenu = (e, target) => {
    if (e.target !== target) return;
    commit('setMenuOpen', { isOpen: false });
    eventBus.emit('render');
};

/**
 * Handle new rhythm
 */
export const handleNewRhythm = () => {
    if (confirm("Create new rhythm? Unsaved changes lost.")) {
        actions.createNewRhythm();
    }
    commit('setMenuOpen', { isOpen: false });
    eventBus.emit('render');
};

/**
 * Handle load rhythm (open modal)
 */
export const handleLoadRhythm = () => {
    commit('setModal', { open: true, type: 'rhythm' });
    commit('setMenuOpen', { isOpen: false });
    eventBus.emit('render');
};

/**
 * Handle download rhythm
 */
export const handleDownloadRhythm = () => {
    downloadRhythm(state);
    commit('setMenuOpen', { isOpen: false });
    eventBus.emit('render');
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
    eventBus.emit('render');
};

/**
 * Handle toggle user guide submenu
 */
export const handleToggleUserGuideSubmenu = () => {
    state.uiState.userGuideSubmenuOpen = !state.uiState.userGuideSubmenuOpen;
    eventBus.emit('render');
};
