/*
  js/components/bataExplorerModal.js
  Specialized rhythm browser for Batà toques with:
  - Search with filter tokens
  - Multi-select dropdowns for Orisha and Classification
  - Zone-based display (Specific/Shared/Generic)
  - Details panel with variations/exercises list
*/

import { state } from '../store.js';
import { TOQUE_CLASSIFICATIONS, CLASSIFICATION_COLORS } from '../constants.js';
import { XMarkIcon } from '../icons/xMarkIcon.js';
import { MusicalNoteIcon } from '../icons/musicalNoteIcon.js';
import { ChevronDownIcon } from '../icons/chevronDownIcon.js';

// --- Logic: Group Toques by Folder ---
const groupToquesByFolder = (toquesMap) => {
    const groups = {};

    Object.entries(toquesMap).forEach(([id, meta]) => {
        // ID format: Batà/Folder/Filename
        const parts = id.split('/');
        // Ensure it has at least Folder/Filename structure
        if (parts.length < 3) return;

        const folderName = parts[1]; // e.g., "Yakota"

        if (!groups[folderName]) {
            groups[folderName] = {
                id: folderName, // Use folder name as Group ID
                displayName: folderName, // Default to folder name
                classification: meta.classification, // Take from first item
                associatedOrishas: new Set(),
                variations: []
            };
        }

        const group = groups[folderName];

        // Accumulate Orishas
        meta.associatedOrishas.forEach(o => group.associatedOrishas.add(o));

        // Add variation
        group.variations.push({
            id: id,
            displayName: meta.displayName
        });
    });

    // Convert Sets to Arrays and sort variations
    return Object.values(groups).map(g => ({
        ...g,
        associatedOrishas: Array.from(g.associatedOrishas),
        // Sort variations: try to put "Base" first if possible
        variations: g.variations.sort((a, b) => {
            const isBaseA = a.id.toLowerCase().includes('base') && !a.id.toLowerCase().includes('llamada');
            const isBaseB = b.id.toLowerCase().includes('base') && !b.id.toLowerCase().includes('llamada');
            if (isBaseA && !isBaseB) return -1;
            if (!isBaseA && isBaseB) return 1;
            return a.displayName.localeCompare(b.displayName);
        })
    }));
};

// --- Helper: Orisha Badge ---
const OrishaBadge = (name, size = 'sm') => {
    const meta = state.uiState.bataExplorer.metadata || {};
    const orishaColors = meta.orishaColors || {};
    // Fallback if not found
    const colors = orishaColors[name] || { border: 'border-stone-500', text: 'text-stone-400', bg: 'bg-stone-800' };
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return `
        <span class="rounded-full border-2 ${colors.border} ${colors.bg} ${colors.text} ${sizeClasses} whitespace-nowrap shadow-sm font-medium">
            ${name}
        </span>
    `;
};

// --- Helper: Filter Token ---
const FilterToken = (label, value, removeAction, dataAttr) => `
    <div class="flex items-center gap-1.5 bg-gray-800 border border-gray-600 text-gray-200 text-xs pl-2 pr-1 py-1 rounded-md flex-shrink-0">
        <span class="text-gray-500 font-medium select-none">${label}:</span>
        <span class="font-semibold select-none">${value}</span>
        <button 
            data-action="${removeAction}"
            ${dataAttr}
            class="text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded-full p-0.5 transition-colors"
        >
            ${XMarkIcon('w-3 h-3')}
        </button>
    </div>
`;

// --- Helper: Classification Badge ---
const ClassificationBadge = (classification) => {
    const colors = CLASSIFICATION_COLORS[classification] || CLASSIFICATION_COLORS['Generic'];
    return `
        <span class="px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide ${colors.text} border ${colors.border}" 
              style="background: ${colors.border.replace('border-', 'rgba(').replace('/30', ',0.2)')}"
        >
            ${classification}
        </span>
    `;
};

// --- Helper: Toque Card (Renders a Group) ---
const ToqueCard = (group) => {
    const { id, displayName, classification, associatedOrishas, variations } = group;

    return `
        <div 
            data-action="select-toque"
            data-toque-id="${id}" 
            class="
                p-4 rounded-lg border cursor-pointer transition-all duration-200 group
                flex flex-col gap-3 relative overflow-hidden
                bg-gray-800/50 border-gray-700 hover:border-amber-500 hover:bg-gray-800 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]
            "
        >
            <div class="flex justify-between items-start">
                <h3 class="text-lg font-bold text-gray-200 group-hover:text-amber-400 transition-colors">
                    ${displayName}
                </h3>
                <div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    ${ClassificationBadge(classification)}
                    <span class="text-[10px] text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700 ml-1">
                        ${variations.length} var.
                    </span>
                </div>
            </div>

            <div class="flex flex-wrap gap-1 mt-auto pt-2">
                ${associatedOrishas.slice(0, 4).map(orisha => OrishaBadge(orisha, 'sm')).join('')}
                ${associatedOrishas.length > 4 ?
            `<span class="text-[10px] text-gray-500 px-1 py-0.5">+${associatedOrishas.length - 4}</span>` : ''}
            </div>
        </div>
    `;
};

// --- Helper: Zone Section ---
const ZoneSection = (zoneName, groups, isMobile = false) => {
    if (groups.length === 0) return '';

    const colors = CLASSIFICATION_COLORS[zoneName];
    const dotShape = zoneName === 'Specific' ? 'rounded-sm rotate-45' : zoneName === 'Shared' ? 'rounded-full' : 'rounded-sm';

    return `
        <section class="mb-8">
            <div class="flex items-center gap-3 mb-4 border-b ${colors.border} pb-3">
                <div class="h-3 w-3 ${dotShape} ${colors.dot}" style="box-shadow: 0 0 15px ${colors.glow}"></div>
                <div>
                <h3 class="font-bold uppercase tracking-widest text-sm ${colors.text}">${zoneName}</h3>
                </div>
            </div>
            <div class="grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4">
                ${groups.map(group => ToqueCard(group)).join('')}
            </div>
        </section>
    `;
};

// --- Helper: Details Modal Overlay ---
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
                            <div class="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 hover:border-amber-500/50 hover:bg-gray-800 transition-all group flex flex-col">
                                <div class="flex justify-between items-start mb-2">
                                    <h4 class="font-bold text-gray-200 text-sm group-hover:text-amber-400 transition-colors">${variant.displayName}</h4>
                                </div>
                                <button
                                    data-action="load-toque-confirm"
                                    data-toque-id="${variant.id}"
                                    class="mt-4 w-full py-2.5 px-3 rounded-lg bg-gray-700 hover:bg-amber-600 hover:text-white text-gray-300 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    ${MusicalNoteIcon('w-4 h-4')}
                                    Load Rhythm
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
};

// --- Filter Dropdown ---
const FilterDropdown = (id, title, icon, options, selectedValues, toggleAction, isOpen = false, colorMap = {}) => {
    const hasSelection = selectedValues.length > 0;

    return `
        <div class="relative" data-dropdown="${id}">
            <button 
                data-action="toggle-filter-dropdown"
                data-dropdown-id="${id}"
                class="
                    flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium
                    ${isOpen || hasSelection
            ? 'bg-gray-800 border-amber-600/50 text-gray-100 shadow-[0_0_10px_rgba(217,119,6,0.1)]'
            : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:bg-gray-800'
        }
                "
            >
                ${icon}
                <span>${title}</span>
                ${hasSelection ? `
                    <span class="bg-amber-600 text-gray-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                        ${selectedValues.length}
                    </span>
                ` : ''}
                <span class="transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} opacity-50">
                    ${ChevronDownIcon('w-3.5 h-3.5')}
                </span>
            </button>

            ${isOpen ? `
                <div class="absolute top-full right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 p-1">
                    ${options.map(option => {
            const isSelected = selectedValues.includes(option);
            // Optional: Use the text color if available, or just default styles
            // const colorClass = id === 'orisha' && colorMap[option] ? colorMap[option].text : ''; 
            // Turning off color text to ensure "simple text" request is met fully, matching other dropdowns

            return `
                            <div 
                                data-action="${toggleAction}"
                                data-value="${option}"
                                class="
                                    flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md transition-colors text-sm
                                    ${isSelected ? 'bg-gray-800' : 'hover:bg-gray-800/50'}
                                "
                            >
                                <div class="${isSelected ? 'text-amber-500' : 'text-gray-400'}">
                                    ${isSelected
                    ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
                    : '<svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"></rect></svg>'
                }
                                </div>
                                <span class="flex-1 ${isSelected ? 'text-gray-100 font-medium' : 'text-gray-400'}">
                                    ${option}
                                </span>
                            </div>
                        `;
        }).join('')}
                </div>
            ` : ''}
        </div>
    `;
};

// --- Main Export: BataExplorerModal ---
export const BataExplorerModal = ({ isMobile = false }) => {
    const bata = state.uiState.bataExplorer;
    const meta = bata.metadata || {};
    const orishas = meta.orishas || [];
    const orishaColors = meta.orishaColors || {};
    // Ensure we are in the correct state
    if (!bata.isOpen) return '';

    const metadata = bata.metadata;
    if (!metadata) {
        return `
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div class="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center">
                    <div class="animate-spin inline-block w-8 h-8 border-2 border-gray-500 border-t-amber-400 rounded-full mb-4"></div>
                    <p class="text-gray-400">Loading Batà rhythms...</p>
                </div>
            </div>
        `;
    }

    const { searchTerm, selectedOrishas, selectedTypes, selectedToqueId } = bata;

    // 1. Group Raw Toques into Folders
    let groups = groupToquesByFolder(metadata.toques);

    // 2. Filter Groups
    // Text search
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        groups = groups.filter(g =>
            g.displayName.toLowerCase().includes(lowerTerm) ||
            g.description?.toLowerCase().includes(lowerTerm) ||
            g.variations.some(v => v.displayName.toLowerCase().includes(lowerTerm))
        );
    }

    // Orisha filter (OR logic)
    if (selectedOrishas.length > 0) {
        groups = groups.filter(g =>
            g.associatedOrishas.some(o => selectedOrishas.includes(o))
        );
    }

    // Classification filter (AND with Orishas)
    if (selectedTypes.length > 0) {
        groups = groups.filter(g =>
            selectedTypes.includes(g.classification)
        );
    }

    // 3. Organize by Zone if needed
    const showZones = selectedOrishas.length > 0;
    let zoneGroups = {};
    if (showZones) {
        zoneGroups = {
            Specific: groups.filter(g => g.classification === 'Specific'),
            Shared: groups.filter(g => g.classification === 'Shared'),
            Generic: groups.filter(g => g.classification === 'Generic')
        };
    }

    // Dropdown states
    const orishaDropdownOpen = bata.orishaDropdownOpen || false;
    const typeDropdownOpen = bata.typeDropdownOpen || false;

    // Icons
    const musicIcon = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>';
    const filterIcon = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>';
    const searchIcon = '<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>';

    return `
        <div class="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm" data-action="close-bata-explorer-bg">
            <div class="flex-1 flex flex-col bg-gray-950 overflow-hidden ${isMobile ? '' : 'max-w-6xl mx-auto my-4 rounded-xl border border-gray-800'}">

                <!-- Header -->
                <div class="border-b border-gray-800 bg-gray-950 flex-shrink-0 px-6 py-4 ${isMobile ? 'pt-[calc(env(safe-area-inset-top)+1.5rem)]' : ''}">
                <div class="max-w-4xl mx-auto flex items-center gap-4">
                    <!-- Search & Filters -->
                    <div
                        class="flex-1 flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-amber-600 focus-within:border-amber-600 transition-all cursor-text group"
                        data-action="focus-bata-search"
                    >
                        ${searchIcon}

                        <div class="flex flex-wrap gap-2 items-center flex-1 min-w-0">
                            <!-- Tokens -->
                            ${selectedOrishas.map(orisha =>
        FilterToken('Orisha', orisha, 'remove-orisha-filter', `data-orisha="${orisha}"`)
    ).join('')}
                            ${selectedTypes.map(type =>
        FilterToken('Type', type, 'remove-type-filter', `data-type="${type}"`)
    ).join('')}

                            <!-- Input -->
                            <input
                                id="bata-search-input"
                                type="text"
                                placeholder="${selectedOrishas.length === 0 && selectedTypes.length === 0 ? 'Search rhythms...' : ''}"
                                value="${searchTerm}"
                                data-action="bata-search-input"
                                class="bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-600 min-w-[100px] flex-1 py-0.5"
                            />
                        </div>

                        <!-- Clear All -->
                        ${(searchTerm || selectedOrishas.length > 0 || selectedTypes.length > 0) ? `
                                <button 
                                    data-action="clear-bata-filters"
                                    class="text-gray-500 hover:text-gray-300 p-1.5 rounded-full hover:bg-gray-800 transition-colors ml-auto"
                                    title="Clear all filters"
                                >
                                    ${XMarkIcon('w-4 h-4')}
                                </button>
                            ` : ''}
                    </div>

                    <!-- Filter Dropdowns -->
                    <div class="flex items-center gap-2">
                        ${FilterDropdown('orisha', 'Orisha', musicIcon, orishas, selectedOrishas, 'toggle-orisha-filter', orishaDropdownOpen, orishaColors)}
                        ${FilterDropdown('type', 'Classification', filterIcon, TOQUE_CLASSIFICATIONS, selectedTypes, 'toggle-type-filter', typeDropdownOpen)}
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
