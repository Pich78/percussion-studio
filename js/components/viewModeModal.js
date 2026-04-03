import { state } from '../store.js';
import { viewManager } from '../views/viewManager.js';

export const ViewModeModal = () => {
    if (!state.uiState.modalOpen || state.uiState.modalType !== 'viewMode') return '';

    const activeViewId = viewManager.getActiveViewId();
    const isStandard   = activeViewId === 'mobile-grid';
    const isPractitioner = activeViewId === 'mobile-practitioner';
    const activeTag = `<span class="text-[9px] font-bold text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded ml-auto flex-shrink-0">Active</span>`;

    return `
        <div class="fixed inset-0 z-50 flex flex-col">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-modal-bg"></div>
            
            <!-- Modal Content -->
            <div class="relative w-full h-full sm:w-4/5 sm:max-w-sm bg-gray-900 border-r border-gray-800 shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom duration-200 pl-[var(--safe-area-left)] pr-[var(--safe-area-right)]">
                <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                    <h2 class="text-lg font-bold text-white">View Mode</h2>
                    <button data-action="close-modal" class="p-2 text-gray-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-3 pb-8">
                    <div class="mb-4">
                        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-2">Views</h3>
                        <div class="bg-gray-800/50 rounded-2xl border border-gray-700/50">
                            <button data-action="select-view-mode" data-view-id="standard" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-t-2xl border-b border-gray-700/30">
                                <div class="w-7 h-7 rounded-lg bg-gray-600/30 flex items-center justify-center flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-300 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                                </div>
                                <span class="text-gray-100 text-sm font-medium">Standard</span>
                                ${isStandard ? activeTag : '<span class="text-[10px] text-gray-500 ml-auto">Classic grid layout</span>'}
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-d" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-b-2xl">
                                <div class="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-indigo-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>
                                </div>
                                <span class="text-xs ${isPractitioner ? 'text-white font-bold' : 'text-gray-300'}">The Practitioner</span>
                                ${isPractitioner ? activeTag : '<span class="text-[10px] text-gray-500 ml-auto">Grid + Player dual view</span>'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
