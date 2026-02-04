/*
  js/events/handlers/bataExplorerEvents.js
  Event handlers for the Batá Explorer modal (filters, search, selection).
*/

import { state } from '../../store.js';
import { renderApp } from '../../ui/renderer.js';
import { actions } from '../../actions.js';

/**
 * Handle close Bata Explorer
 */
export const handleCloseBataExplorer = () => {
    state.uiState.bataExplorer.isOpen = false;
    state.uiState.bataExplorer.selectedToqueId = null;
    state.uiState.bataExplorer.orishaDropdownOpen = false;
    state.uiState.bataExplorer.typeDropdownOpen = false;
    renderApp();
};

/**
 * Handle toggle filter dropdown
 * @param {HTMLElement} target - The dropdown button element
 */
export const handleToggleFilterDropdown = (target) => {
    const dropdownId = target.dataset.dropdownId;
    if (dropdownId === 'orisha') {
        state.uiState.bataExplorer.orishaDropdownOpen = !state.uiState.bataExplorer.orishaDropdownOpen;
        state.uiState.bataExplorer.typeDropdownOpen = false;
    } else if (dropdownId === 'type') {
        state.uiState.bataExplorer.typeDropdownOpen = !state.uiState.bataExplorer.typeDropdownOpen;
        state.uiState.bataExplorer.orishaDropdownOpen = false;
    }
    renderApp();
};

/**
 * Handle toggle Orisha filter
 * @param {HTMLElement} target - The filter option element
 */
export const handleToggleOrishaFilter = (target) => {
    const orisha = target.dataset.value;
    const arr = state.uiState.bataExplorer.selectedOrishas;
    const idx = arr.indexOf(orisha);
    if (idx >= 0) {
        arr.splice(idx, 1);
    } else {
        arr.push(orisha);
    }
    state.uiState.bataExplorer.orishaDropdownOpen = false;
    renderApp();
};

/**
 * Handle remove Orisha filter (from token)
 * @param {HTMLElement} target - The token remove button
 */
export const handleRemoveOrishaFilter = (target) => {
    const orisha = target.dataset.orisha;
    const arr = state.uiState.bataExplorer.selectedOrishas;
    const idx = arr.indexOf(orisha);
    if (idx >= 0) arr.splice(idx, 1);
    renderApp();
};

/**
 * Handle toggle Type filter
 * @param {HTMLElement} target - The filter option element
 */
export const handleToggleTypeFilter = (target) => {
    const type = target.dataset.value;
    const arr = state.uiState.bataExplorer.selectedTypes;
    const idx = arr.indexOf(type);
    if (idx >= 0) {
        arr.splice(idx, 1);
    } else {
        arr.push(type);
    }
    state.uiState.bataExplorer.typeDropdownOpen = false;
    renderApp();
};

/**
 * Handle remove Type filter (from token)
 * @param {HTMLElement} target - The token remove button
 */
export const handleRemoveTypeFilter = (target) => {
    const type = target.dataset.type;
    const arr = state.uiState.bataExplorer.selectedTypes;
    const idx = arr.indexOf(type);
    if (idx >= 0) arr.splice(idx, 1);
    renderApp();
};

/**
 * Handle clear all Bata filters
 */
export const handleClearBataFilters = () => {
    state.uiState.bataExplorer.searchTerm = '';
    state.uiState.bataExplorer.selectedOrishas = [];
    state.uiState.bataExplorer.selectedTypes = [];
    state.uiState.bataExplorer.selectedToqueId = null;
    const searchInput = document.getElementById('bata-search-input');
    if (searchInput) searchInput.value = '';
    renderApp();
};

/**
 * Handle select toque card
 * @param {HTMLElement} target - The toque card element
 */
export const handleSelectToque = (target) => {
    const toqueId = target.dataset.toqueId;
    state.uiState.bataExplorer.selectedToqueId = toqueId;
    state.uiState.bataExplorer.orishaDropdownOpen = false;
    state.uiState.bataExplorer.typeDropdownOpen = false;
    renderApp();
};

/**
 * Handle close toque details
 */
export const handleCloseToqueDetails = () => {
    state.uiState.bataExplorer.selectedToqueId = null;
    renderApp();
};

/**
 * Handle load toque confirm
 * @param {HTMLElement} target - The load button element
 */
export const handleLoadToqueConfirm = async (target) => {
    const toqueId = target.dataset.toqueId;
    if (confirm("Load this rhythm? Unsaved changes will be lost.")) {
        await actions.loadRhythm(toqueId);
        state.uiState.bataExplorer.isOpen = false;
        state.uiState.bataExplorer.selectedToqueId = null;
        state.uiState.bataExplorer.selectedOrishas = [];
        state.uiState.bataExplorer.selectedTypes = [];
        state.uiState.bataExplorer.searchTerm = '';
        renderApp();
    }
};

/**
 * Handle Bata search input
 * @param {HTMLInputElement} target - The search input element
 */
export const handleBataSearchInput = (target) => {
    state.uiState.bataExplorer.searchTerm = target.value;
    // Debounce re-render for performance
    clearTimeout(window._bataSearchTimeout);
    window._bataSearchTimeout = setTimeout(() => renderApp(), 150);
};
