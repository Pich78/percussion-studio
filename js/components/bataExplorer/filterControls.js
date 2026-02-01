/*
  js/components/bataExplorer/filterControls.js
  Filter controls for the Batá Explorer (dropdowns, tokens, search).
  Extracted from bataExplorerModal.js for modularity.
*/

import { XMarkIcon } from '../../icons/xMarkIcon.js';
import { ChevronDownIcon } from '../../icons/chevronDownIcon.js';

/**
 * Render a filter token (active filter badge)
 * @param {string} label - Token label (e.g., "Orisha", "Type")
 * @param {string} value - Token value
 * @param {string} removeAction - Data action for removal
 * @param {string} dataAttr - Additional data attribute
 * @returns {string} HTML string
 */
export const FilterToken = (label, value, removeAction, dataAttr) => `
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

/**
 * Render a filter dropdown
 * @param {string} id - Dropdown ID
 * @param {string} title - Dropdown title
 * @param {string} icon - Icon HTML
 * @param {string[]} options - Available options
 * @param {string[]} selectedValues - Currently selected values
 * @param {string} toggleAction - Data action for toggling selection
 * @param {boolean} isOpen - Whether dropdown is open
 * @param {object} colorMap - Optional color map for options
 * @returns {string} HTML string
 */
export const FilterDropdown = (id, title, icon, options, selectedValues, toggleAction, isOpen = false, colorMap = {}) => {
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

/**
 * Render the search bar with tokens
 * @param {string} searchTerm - Current search term
 * @param {string[]} selectedOrishas - Selected Orisha filters
 * @param {string[]} selectedTypes - Selected type filters
 * @returns {string} HTML string
 */
export const SearchBar = (searchTerm, selectedOrishas, selectedTypes) => {
    const searchIcon = '<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>';
    const hasFilters = searchTerm || selectedOrishas.length > 0 || selectedTypes.length > 0;

    return `
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
            ${hasFilters ? `
                <button 
                    data-action="clear-bata-filters"
                    class="text-gray-500 hover:text-gray-300 p-1.5 rounded-full hover:bg-gray-800 transition-colors ml-auto"
                    title="Clear all filters"
                >
                    ${XMarkIcon('w-4 h-4')}
                </button>
            ` : ''}
        </div>
    `;
};
