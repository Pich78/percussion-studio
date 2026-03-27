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
import { RhythmModal } from '../../../components/modals/rhythmModal.js';
import { Timeline } from '../../../components/timeline.js';
import { renderLandscape } from './landscape.js';
import { renderPortrait } from './portrait.js';

const renderSharedModals = () => {
    let modals = '';

    if (state.uiState.isMenuOpen) { modals += MobileMenuPanel(); }

    if (state.uiState.modalOpen && state.uiState.modalType === 'rhythm') {
        modals += RhythmModal();
    }

    if (state.uiState.modalOpen && state.uiState.modalType === 'structure') {
        modals += `
        <div class="fixed inset-0 z-50 flex flex-col">
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-modal-bg"></div>
            <div class="relative w-full h-full sm:w-4/5 sm:max-w-sm bg-gray-900 border-r border-gray-800 shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom duration-200 pl-[var(--safe-area-left)] pr-[var(--safe-area-right)]">
                <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                    <h2 class="text-lg font-bold text-white">Rhythm Structure</h2>
                    <button data-action="close-modal" class="p-2 text-gray-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div class="flex-1 overflow-hidden">
                    ${Timeline({
                        sections: state.toque.sections,
                        globalBpm: state.toque.globalBpm,
                        activeSectionId: state.activeSectionId,
                        rhythmName: state.toque.name,
                        readOnly: true,
                        isMobile: true,
                        bataExplorerMetadata: state.uiState.bataExplorer.metadata || null
                    })}
                </div>
                <div class="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
                    Select a section to switch playback.
                </div>
            </div>
        </div>`;
    }

    if (state.uiState.modalOpen && state.uiState.modalType === 'viewMode') {
        modals += ViewModeModal();
    }

    if (state.uiState.modalOpen && state.uiState.modalType === 'userGuide') {
        modals += `
        <div class="fixed inset-0 z-50 flex flex-col">
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-modal-bg"></div>
            <div class="relative w-full h-full bg-gray-900 shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom duration-200 pl-[var(--safe-area-left)] pr-[var(--safe-area-right)]">
                <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0">
                    <h2 class="text-lg font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-purple-400"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                        User Guide
                        <span class="text-sm text-gray-500 font-normal">(${state.uiState.userGuideLanguage === 'it' ? 'Italiano' : 'English'})</span>
                    </h2>
                    <button data-action="close-modal" class="p-2 text-gray-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-4 text-sm" id="user-guide-content">
                    ${state.uiState.userGuideContent || '<div class="text-center text-gray-500 py-8">Loading...</div>'}
                </div>
            </div>
        </div>`;
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
