/*
  js/components/bataExplorer/toqueCard.js
  Toque card component for rendering rhythm groups in the Batá Explorer.
  Extracted from bataExplorerModal.js for modularity.
*/

import { CLASSIFICATION_COLORS } from '../../constants.js';
import { state } from '../../store.js';

/**
 * Render an Orisha badge
 * @param {string} name - Orisha name
 * @param {string} size - Badge size ('sm' or 'md')
 * @returns {string} HTML string
 */
export const OrishaBadge = (name, size = 'sm') => {
    const meta = state.uiState.bataExplorer.metadata || {};
    const orishaColors = meta.orishaColors || {};
    const colors = orishaColors[name] || { border: 'border-stone-500', text: 'text-stone-400', bg: 'bg-stone-800' };
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return `
        <span class="rounded-full border-2 ${colors.border} ${colors.bg} ${colors.text} ${sizeClasses} whitespace-nowrap shadow-sm font-medium">
            ${name}
        </span>
    `;
};

/**
 * Render a classification badge
 * @param {string} classification - Classification type
 * @returns {string} HTML string
 */
export const ClassificationBadge = (classification) => {
    const colors = CLASSIFICATION_COLORS[classification] || CLASSIFICATION_COLORS['Generic'];
    return `
        <span class="px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide ${colors.text} border ${colors.border}" 
              style="background: ${colors.border.replace('border-', 'rgba(').replace('/30', ',0.2)')}"
        >
            ${classification}
        </span>
    `;
};

/**
 * Render a toque card (group of related rhythms)
 * @param {object} group - Group data with displayName, classification, associatedOrishas, variations
 * @returns {string} HTML string
 */
export const ToqueCard = (group) => {
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

/**
 * Render a zone section (Specific, Shared, Generic)
 * @param {string} zoneName - Zone name
 * @param {object[]} groups - Array of group objects
 * @param {boolean} isMobile - Whether on mobile
 * @returns {string} HTML string
 */
export const ZoneSection = (zoneName, groups, isMobile = false) => {
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
