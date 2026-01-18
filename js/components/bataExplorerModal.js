/*
  js/components/bataExplorerModal.js
  Specialized rhythm browser for Batà toques with:
  - Search with filter tokens
  - Multi-select dropdowns for Orisha and Classification
  - Zone-based display (Specific/Shared/Generic)
  - Details panel
*/

import { state } from '../store.js';
import { dataLoader } from '../services/dataLoader.js';
import { ORISHAS_LIST, TOQUE_CLASSIFICATIONS, ORISHA_COLORS, CLASSIFICATION_COLORS } from '../constants.js';
import { XMarkIcon } from '../icons/xMarkIcon.js';
import { MusicalNoteIcon } from '../icons/musicalNoteIcon.js';
import { ChevronDownIcon } from '../icons/chevronDownIcon.js';

// --- Helper: Orisha Badge ---
const OrishaBadge = (name, size = 'sm') => {
    const colors = ORISHA_COLORS[name] || { border: 'border-stone-500', text: 'text-stone-400', bg: 'bg-stone-800' };
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return `
        <span class="rounded-full border ${colors.border} ${colors.text} ${sizeClasses} whitespace-nowrap">
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

// --- Helper: Toque Card ---
const ToqueCard = (toqueId, metadata) => {
    const { displayName, classification, associatedOrishas, description } = metadata;

    return `
        <div 
            data-action="load-toque-confirm"
            data-toque-id="${toqueId}"
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
                </div>
            </div>

            <p class="text-sm text-gray-400 line-clamp-2">
                ${description || 'No description available.'}
            </p>

            <div class="flex flex-wrap gap-1 mt-auto pt-2">
                ${associatedOrishas.map(orisha => OrishaBadge(orisha, 'sm')).join('')}
            </div>
        </div>
    `;
};

// --- Helper: Zone Section ---
const ZoneSection = (zoneName, toques, isMobile = false) => {
    if (toques.length === 0) return '';

    const colors = CLASSIFICATION_COLORS[zoneName];
    const dotShape = zoneName === 'Specific' ? 'rounded-sm rotate-45' : zoneName === 'Shared' ? 'rounded-full' : 'rounded-sm';

    return `
        <section class="mb-8">
            <div class="flex items-center gap-3 mb-4 border-b ${colors.border} pb-3">
                <div class="h-3 w-3 ${dotShape} ${colors.dot}" style="box-shadow: 0 0 15px ${colors.glow}"></div>
                <div>
                <h3 class="font-bold uppercase tracking-widest text-sm ${colors.text}">${zoneName}</h3>
                    <p class="text-xs text-gray-500 mt-0.5">
                        ${zoneName === 'Specific' ? 'Rhythms dedicated exclusively to the selected Orisha(s)' :
            zoneName === 'Shared' ? 'Rhythms shared with other deities' :
                'General purpose rhythms available for these Orishas'}
                    </p>
                </div>
            </div>
            <div class="grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4">
                ${toques.map(([id, meta]) => ToqueCard(id, meta)).join('')}
            </div>
        </section>
    `;
};

// --- Helper: Details Panel ---
const ToqueDetailsPanel = (toqueId, metadata) => {
    if (!toqueId || !metadata) return '';

    const { displayName, classification, associatedOrishas, description, timeSignature } = metadata;

    return `
        <div class="w-80 bg-gray-900 border-l border-gray-800 flex flex-col p-6 overflow-y-auto flex-shrink-0">
            <!-- Close button -->
            <div class="flex justify-end mb-4">
                <button 
                    data-action="close-toque-details"
                    class="text-gray-500 hover:text-gray-200 transition bg-gray-800/80 hover:bg-gray-700 rounded-full p-2"
                >
                    ${XMarkIcon('w-5 h-5')}
                </button>
            </div>
            
            <!-- Header -->
            <div class="mb-6 border-b border-gray-700 pb-4">
                <div class="flex items-center gap-2 mb-2">
                    ${ClassificationBadge(classification)}
                    ${timeSignature ? `<span class="text-xs text-gray-500">${timeSignature}</span>` : ''}
                </div>
                <h2 class="text-2xl font-bold text-gray-100 mb-2">${displayName}</h2>
                <p class="text-gray-400 leading-relaxed text-sm">${description || 'No description available.'}</p>
            </div>
            
            <!-- Associated Orishas -->
            <div class="mb-6">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Associated Orishas
                </h3>
                <div class="flex flex-wrap gap-2">
                    ${associatedOrishas.map(orisha => OrishaBadge(orisha, 'md')).join('')}
                </div>
            </div>
            
            <!-- Load Button -->
            <div class="mt-auto pt-4 border-t border-gray-700">
                <button
                    data-action="load-toque-confirm"
                    data-toque-id="${toqueId}"
                    class="w-full py-3 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
                >
                    ${MusicalNoteIcon('w-5 h-5')}
                    Load This Rhythm
                </button>
            </div>
        </div>
    `;
};

// --- Filter Dropdown ---
const FilterDropdown = (id, title, icon, options, selectedValues, toggleAction, isOpen = false) => {
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
            const colorClass = id === 'orisha' && ORISHA_COLORS[option] ? ORISHA_COLORS[option].text : '';

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
                    : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"></rect></svg>'
                }
                                </div>
                                <span class="flex-1 ${isSelected ? 'text-gray-100 font-medium' : 'text-gray-400'} ${colorClass}">
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

    // Filter logic
    let filteredToques = Object.entries(metadata.toques);

    // 1. Text search
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        filteredToques = filteredToques.filter(([id, meta]) =>
            meta.displayName.toLowerCase().includes(lowerTerm) ||
            meta.description?.toLowerCase().includes(lowerTerm)
        );
    }

    // 2. Orisha filter (OR logic within Orishas)
    if (selectedOrishas.length > 0) {
        filteredToques = filteredToques.filter(([id, meta]) =>
            meta.associatedOrishas.some(o => selectedOrishas.includes(o))
        );
    }

    // 3. Classification filter (AND with Orishas, OR within Types)
    if (selectedTypes.length > 0) {
        filteredToques = filteredToques.filter(([id, meta]) =>
            selectedTypes.includes(meta.classification)
        );
    }

    // Group by classification if Orisha filter is active
    const showZones = selectedOrishas.length > 0;
    let zones = {};
    if (showZones) {
        zones = {
            Specific: filteredToques.filter(([id, meta]) => meta.classification === 'Specific'),
            Shared: filteredToques.filter(([id, meta]) => meta.classification === 'Shared'),
            Generic: filteredToques.filter(([id, meta]) => meta.classification === 'Generic')
        };
    }

    // Get selected toque details
    const selectedToqueMeta = selectedToqueId ? metadata.toques[selectedToqueId] : null;

    // Dropdown states (stored in uiState)
    const orishaDropdownOpen = bata.orishaDropdownOpen || false;
    const typeDropdownOpen = bata.typeDropdownOpen || false;

    // Icons
    const musicIcon = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>';
    const filterIcon = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>';
    const searchIcon = '<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>';
    const drumIcon = '';

    return `
        <div class="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm" data-action="close-bata-explorer-bg">
            <div class="flex-1 flex flex-col bg-gray-950 overflow-hidden ${isMobile ? '' : 'max-w-6xl mx-auto my-4 rounded-xl border border-gray-800'}">
                
                <!-- Header -->
                <div class="border-b border-gray-800 bg-gray-950 flex-shrink-0 px-6 py-4 ${isMobile ? 'pt-[max(1rem,env(safe-area-inset-top))]' : ''}">
                    <div class="max-w-4xl mx-auto flex items-center gap-4">
                        <!-- Search & Filters -->
                        <!-- Search Input with Tokens -->
                        <div 
                            class="flex-1 flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-amber-600 focus-within:border-amber-600 transition-all cursor-text group"
                            data-action="focus-bata-search"
                        >
                            ${searchIcon}
                            
                            <div class="flex flex-wrap gap-2 items-center flex-1 min-w-0">
                                <!-- Orisha Tokens -->
                                ${selectedOrishas.map(orisha =>
        FilterToken('Orisha', orisha, 'remove-orisha-filter', `data-orisha="${orisha}"`)
    ).join('')}
                                
                                <!-- Type Tokens -->
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
                            ${FilterDropdown('orisha', 'Orisha', musicIcon, ORISHAS_LIST, selectedOrishas, 'toggle-orisha-filter', orishaDropdownOpen)}
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
                            ${filteredToques.length === 0 ? `
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
                                ${ZoneSection('Specific', zones.Specific, isMobile)}
                                ${ZoneSection('Shared', zones.Shared, isMobile)}
                                ${ZoneSection('Generic', zones.Generic, isMobile)}
                            ` : `
                                <div class="grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4">
                                    ${filteredToques.map(([id, meta]) => ToqueCard(id, meta)).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
