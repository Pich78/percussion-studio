/*
  js/components/bataExplorerModal.js
  Specialized rhythm browser for Batà toques.
  REFACTORED: Now composes smaller modular components.
*/

import { state } from '../store.js';
import { TOQUE_CLASSIFICATIONS } from '../constants.js';
import { XMarkIcon } from '../icons/xMarkIcon.js';
import { MusicalNoteIcon } from '../icons/musicalNoteIcon.js';

// Import modular components
import { ToqueCard, ZoneSection, OrishaBadge, ClassificationBadge } from './bataExplorer/toqueCard.js';
import { FilterDropdown, SearchBar } from './bataExplorer/filterControls.js';

/**
 * Group toques by folder structure
 * @param {object} toquesMap - Map of toque ID to metadata
 * @returns {object[]} Array of grouped toques
 */
const groupToquesByFolder = (toquesMap) => {
    const groups = {};

    Object.entries(toquesMap).forEach(([id, meta]) => {
        const parts = id.split('/');
        if (parts.length < 3) return;

        const folderName = parts[1];

        if (!groups[folderName]) {
            groups[folderName] = {
                id: folderName,
                displayName: folderName,
                classification: meta.classification,
                associatedOrishas: new Set(),
                variations: []
            };
        }

        const group = groups[folderName];
        meta.associatedOrishas.forEach(o => group.associatedOrishas.add(o));

        group.variations.push({
            id: id,
            displayName: meta.displayName
        });
    });

    return Object.values(groups).map(g => ({
        ...g,
        associatedOrishas: Array.from(g.associatedOrishas),
        variations: g.variations.sort((a, b) => {
            const isBaseA = a.id.toLowerCase().includes('base') && !a.id.toLowerCase().includes('llamada');
            const isBaseB = b.id.toLowerCase().includes('base') && !b.id.toLowerCase().includes('llamada');
            if (isBaseA && !isBaseB) return -1;
            if (!isBaseA && isBaseB) return 1;
            return a.displayName.localeCompare(b.displayName);
        })
    }));
};

/**
 * Render the toque details modal overlay
 * @param {string} groupId - Selected group ID
 * @param {object[]} allGroups - All groups array
 * @returns {string} HTML string
 */
const ToqueDetailsModal = (groupId, allGroups) => {
    if (!groupId || !allGroups) return '';

    const group = allGroups.find(g => g.id === groupId);
    if (!group) return '';

    const { displayName, classification, associatedOrishas, variations } = group;

    return `
        <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-action="close-toque-details-bg">
            <div class="bg-gray-900 rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-700 animate-in zoom-in-95 duration-200">
                
                <!-- Header -->
                <div class="p-6 border-b border-gray-800 bg-gray-900/50">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-2">
                            ${ClassificationBadge(classification)}
                            <h2 class="text-2xl font-bold text-gray-100">${displayName}</h2>
                        </div>
                        <button 
                            data-action="close-toque-details"
                            class="text-gray-500 hover:text-white transition bg-gray-800 hover:bg-gray-700 rounded-full p-2"
                        >
                            ${XMarkIcon('w-6 h-6')}
                        </button>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        ${associatedOrishas.map(orisha => OrishaBadge(orisha, 'md')).join('')}
                    </div>
                </div>
                
                <!-- Variations List -->
                <div class="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-gray-950/30">
                    <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Available Variations
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${variations.map(variant => `
                            <div 
                                data-action="load-toque-confirm"
                                data-toque-id="${variant.id}"
                                class="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 hover:border-amber-500 hover:bg-gray-800 hover:shadow-lg cursor-pointer transition-all group flex items-center justify-between"
                            >
                                <h4 class="font-bold text-gray-200 text-sm group-hover:text-amber-400 transition-colors">${variant.displayName}</h4>
                                <div class="text-gray-600 group-hover:text-amber-500 transition-colors">
                                     ${MusicalNoteIcon('w-5 h-5')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Main Batá Explorer Modal component
 */
export const BataExplorerModal = ({ isMobile = false }) => {
    const bata = state.uiState.bataExplorer;
    const meta = bata.metadata || {};
    const orishas = meta.orishas || [];
    const orishaColors = meta.orishaColors || {};

    if (!bata.isOpen) return '';

    const metadata = bata.metadata;
    if (!metadata) {
        const loaderContainerClass = isMobile
            ? "fixed inset-y-0 left-[var(--safe-area-left)] right-[var(--safe-area-right)] z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            : "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4";

        return `
            <div class="${loaderContainerClass}">
                <div class="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center">
                    <div class="animate-spin inline-block w-8 h-8 border-2 border-gray-500 border-t-amber-400 rounded-full mb-4"></div>
                    <p class="text-gray-400">Loading Batà rhythms...</p>
                </div>
            </div>
        `;
    }

    const { searchTerm, selectedOrishas, selectedTypes, selectedToqueId } = bata;

    // Group and filter toques
    let groups = groupToquesByFolder(metadata.toques);

    // Text search
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        groups = groups.filter(g =>
            g.displayName.toLowerCase().includes(lowerTerm) ||
            g.description?.toLowerCase().includes(lowerTerm) ||
            g.variations.some(v => v.displayName.toLowerCase().includes(lowerTerm))
        );
    }

    // Orisha filter
    if (selectedOrishas.length > 0) {
        groups = groups.filter(g =>
            g.associatedOrishas.some(o => selectedOrishas.includes(o))
        );
    }

    // Classification filter
    if (selectedTypes.length > 0) {
        groups = groups.filter(g =>
            selectedTypes.includes(g.classification)
        );
    }

    // Organize by zone if Orisha filter is active
    const showZones = selectedOrishas.length > 0;
    let zoneGroups = {};
    if (showZones) {
        zoneGroups = {
            Specific: groups.filter(g => g.classification === 'Specific'),
            Shared: groups.filter(g => g.classification === 'Shared'),
            Generic: groups.filter(g => g.classification === 'Generic')
        };
    }

    // Icons
    const musicIcon = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>';
    const filterIcon = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>';
    const searchIcon = '<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>';

    const modalContainerClass = isMobile
        ? "fixed inset-y-0 left-[var(--safe-area-left)] right-[var(--safe-area-right)] z-50 flex bg-black/80 backdrop-blur-sm"
        : "fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm";

    return `
        <div class="${modalContainerClass}" data-action="close-bata-explorer-bg">
            <div class="flex-1 flex flex-col bg-gray-950 overflow-hidden ${isMobile ? '' : 'max-w-6xl mx-auto my-4 rounded-xl border border-gray-800'}">

                <!-- Header -->
                <div class="border-b border-gray-800 bg-gray-950 flex-shrink-0 px-6 py-4 ${isMobile ? 'pt-[calc(env(safe-area-inset-top)+1.5rem)]' : ''}">
                <div class="max-w-4xl mx-auto flex items-center gap-4">
                    <!-- Search Bar -->
                    ${SearchBar(searchTerm, selectedOrishas, selectedTypes)}

                    <!-- Filter Dropdowns -->
                    <div class="flex items-center gap-2">
                        ${FilterDropdown('orisha', 'Orisha', musicIcon, orishas, selectedOrishas, 'toggle-orisha-filter', bata.orishaDropdownOpen || false, orishaColors)}
                        ${FilterDropdown('type', 'Classification', filterIcon, TOQUE_CLASSIFICATIONS, selectedTypes, 'toggle-type-filter', bata.typeDropdownOpen || false)}
                    </div>

                    <!-- Close Button -->
                    <button
                        data-action="close-bata-explorer"
                        class="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
                    >
                        ${XMarkIcon('w-6 h-6')}
                    </button>
                </div>
            </div>

            <!-- Content Area -->
            <div class="flex-1 flex overflow-hidden">
                <!-- Main List -->
                <div class="flex-1 overflow-y-auto p-6 bg-gray-950/50">
                    <div class="max-w-4xl mx-auto">

                        <!-- Results -->
                        ${groups.length === 0 ? `
                                <div class="text-center py-16 opacity-60 flex flex-col items-center gap-4">
                                    <div class="bg-gray-800 p-4 rounded-full">
                                        ${searchIcon}
                                    </div>
                                    <div>
                                        <p class="text-lg font-medium text-gray-300">No rhythms found</p>
                                        <p class="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
                                    </div>
                                    <button 
                                        data-action="clear-bata-filters"
                                        class="text-amber-500 hover:text-amber-400 text-sm font-medium border border-gray-700 hover:border-amber-900 bg-gray-800 hover:bg-gray-800/80 px-4 py-2 rounded-lg transition-all"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            ` : showZones ? `
                                ${ZoneSection('Specific', zoneGroups.Specific, isMobile)}
                                ${ZoneSection('Shared', zoneGroups.Shared, isMobile)}
                                ${ZoneSection('Generic', zoneGroups.Generic, isMobile)}
                            ` : `
                                <div class="grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4">
                                    ${groups.map(group => ToqueCard(group)).join('')}
                                </div>
                            `}
                    </div>
                </div>

                <!-- Details Modal (Overlay) -->
                ${selectedToqueId ? ToqueDetailsModal(selectedToqueId, groups) : ''}
            </div>
        </div>
        </div>
    `;
};
