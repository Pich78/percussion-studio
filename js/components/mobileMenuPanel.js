/**
 * js/components/mobileMenuPanel.js
 *
 * Shared hamburger-menu panel used by every mobile view.
 * Renders the full side-drawer navigation (Load Rhythm, Show Structure,
 * View Mode, Share, User Guide) so all views have identical menu behaviour.
 *
 * Usage:
 *   import { MobileMenuPanel } from '../../../components/mobileMenuPanel.js';
 *   ${state.uiState.isMenuOpen ? MobileMenuPanel() : ''}
 */

import { state } from '../store.js';
import { FolderOpenIcon } from '../icons/folderOpenIcon.js';
import { ChevronDownIcon } from '../icons/chevronDownIcon.js';

export const MobileMenuPanel = () => `
    <div class="fixed inset-0 z-50 flex flex-col">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-menu"></div>

        <!-- Drawer -->
        <div class="relative w-4/5 max-w-sm h-full bg-gray-900 border-r border-gray-800 shadow-2xl flex flex-col animate-in fade-in slide-in-from-left duration-200 ml-[var(--safe-area-left)]">
            <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                <h2 class="text-lg font-bold text-white">Percussion Studio</h2>
                <button data-action="close-menu" class="p-2 text-gray-500 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <!-- Menu Actions -->
            <nav class="flex-1 overflow-y-auto p-3 pb-8">
                 <div class="bg-gray-800/50 rounded-2xl border border-gray-700/50">
                    <!-- Load Rhythm -->
                    <button data-action="load-rhythm" class="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/50 rounded-t-2xl">
                       <div class="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                          ${FolderOpenIcon('w-5 h-5 text-amber-400 pointer-events-none')}
                       </div>
                       <span class="text-gray-100 font-medium text-base">Load Rhythm</span>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500 ml-auto pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>

                    <!-- Show Structure -->
                    <button data-action="open-structure" class="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/50">
                       <div class="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-cyan-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                       </div>
                       <span class="text-gray-100 font-medium text-base">Show Structure</span>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500 ml-auto pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>

                    <!-- View Mode -->
                    <button data-action="open-view-mode" class="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/50">
                       <div class="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-green-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       </div>
                       <span class="text-gray-100 font-medium text-base">View Mode</span>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500 ml-auto pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>

                    ${window.location.hostname.includes('github.io') ? `
                    <!-- Share Rhythm -->
                    <button data-action="share-rhythm" class="w-full px-4 py-3.5 flex items-center gap-4 transition-colors border-b border-gray-700/50 ${state.rhythmSource === 'repo' ? 'hover:bg-gray-700/50 active:bg-gray-700' : 'opacity-40 cursor-not-allowed'}" ${state.rhythmSource !== 'repo' ? 'disabled' : ''}>
                       <div class="w-9 h-9 rounded-xl ${state.rhythmSource === 'repo' ? 'bg-blue-500/15' : 'bg-gray-700/50'} flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 ${state.rhythmSource === 'repo' ? 'text-blue-400' : 'text-gray-500'} pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                       </div>
                       <span class="${state.rhythmSource === 'repo' ? 'text-gray-100' : 'text-gray-500'} font-medium text-base">Share Rhythm</span>
                       ${state.rhythmSource !== 'repo' ? '<span class="text-xs text-gray-600 ml-1">(N/A)</span>' : ''}
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500 ml-auto pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>
                    ` : ''}

                    <!-- User Guide with Submenu -->
                    <button data-action="toggle-user-guide-submenu" class="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-gray-700/50 active:bg-gray-700 transition-colors ${state.uiState.userGuideSubmenuOpen ? '' : 'rounded-b-2xl'}">
                       <div class="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-purple-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                       </div>
                       <span class="text-gray-100 font-medium text-base">User Guide</span>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500 ml-auto pointer-events-none transition-transform duration-200 ${state.uiState.userGuideSubmenuOpen ? 'rotate-90' : ''}"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>

                    <!-- Language Submenu -->
                    ${state.uiState.userGuideSubmenuOpen ? `
                    <div class="bg-gray-900/50 border-t border-gray-700/50 rounded-b-2xl">
                       <button data-action="open-user-guide" data-lang="en" class="w-full px-4 py-3 pl-16 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                          <span class="w-8 h-6 rounded bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">EN</span>
                          <span class="text-gray-300 text-sm">English</span>
                       </button>
                       <button data-action="open-user-guide" data-lang="it" class="w-full px-4 py-3 pl-16 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-b-2xl">
                          <span class="w-8 h-6 rounded bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center">IT</span>
                          <span class="text-gray-300 text-sm">Italiano</span>
                       </button>
                    </div>
                    ` : ''}
                 </div>
            </nav>
        </div>
    </div>
`;
