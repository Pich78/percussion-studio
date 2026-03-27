/**
 * js/ui/mobile/practitioner/layout.js
 *
 * Layout for "Dimension D: The Practitioner" — a Dual View.
 *
 * This is the main entry point that composes landscape and portrait layouts.
 * See landscape.js and portrait.js for orientation-specific implementations.
 */

import { state } from '../../../store.js';
import { getActiveSection } from '../../../store/stateSelectors.js';
import { BataExplorerModal } from '../../../components/bataExplorerModal.js';
import { ViewModeModal } from '../../../components/viewModeModal.js';
import { MobileMenuPanel } from '../../../components/mobileMenuPanel.js';
import { renderLandscape } from './landscape.js';
import { renderPortrait } from './portrait.js';

const renderSharedModals = () => {
    let modals = '';
    if (state.uiState.isMenuOpen) { modals += MobileMenuPanel(); }
    if (state.uiState.modalOpen && state.uiState.modalType === 'viewMode') {
        modals += ViewModeModal();
    }
    modals += BataExplorerModal({ isMobile: true, bataExplorer: state.uiState.bataExplorer });
    return modals;
};

export const PractitionerLayout = () => {
    const activeSection = getActiveSection(state) || state.toque.sections[0];

    return `
    <div class="flex flex-col h-full bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500 selection:text-black select-none
                pl-[var(--safe-area-left)] pr-[var(--safe-area-right)]">

        <!-- App loading overlay -->
        ${state.uiState.isLoadingRhythm ? `
        <div class="fixed inset-0 z-[90] bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
            <div class="mb-8 relative w-20 h-20">
                <div class="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 class="text-xl font-bold text-white mb-2">Loading</h2>
            <p class="text-indigo-400 text-lg font-semibold">${state.uiState.loadingRhythmName || 'Rhythm'}</p>
        </div>` : ''}

        ${renderLandscape(activeSection)}
        ${renderPortrait(activeSection)}

        ${renderSharedModals()}
    </div>`;
};
