import { state } from '../store.js';

export const EditingOptionsModal = ({ isMobile = false } = {}) => {
    if (!state.uiState.modalOpen || state.uiState.modalType !== 'editingOptions') return '';

    const mode = state.uiState.pieMenu.editingMode; // 'disabled', 'hover', 'long-press', 'right-click'
    const hoverMs = state.uiState.pieMenu.hoverTimeMs;
    const pressMs = state.uiState.pieMenu.pressTimeMs;

    const widthClass = isMobile ? 'w-full h-full' : 'max-w-md w-full rounded-xl';
    const placementClass = isMobile ? 'slide-in-from-bottom' : 'zoom-in-95';
    const paddingClass = isMobile ? 'pl-[var(--safe-area-left)] pr-[var(--safe-area-right)] h-full' : '';

    return `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm ${isMobile ? 'flex-col' : 'p-4'}" data-action="close-modal-bg">
        <div class="bg-gray-900 border border-gray-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in ${placementClass} duration-200 ${widthClass} ${paddingClass}">
            <!-- Header -->
            <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-pink-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 0H4.5m0 12h9.75M10.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 0H4.5m6-6h9.75M16.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 0H4.5" /></svg>
                    Editing Options
                </h3>
                <button data-action="close-modal" class="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <!-- Editing Mode -->
                <div>
                    <h4 class="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Editing Mode</h4>
                    <div class="flex flex-col gap-3">
                        
                        <!-- Standard Mode -->
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="radio" name="editingMode" value="standard" class="w-4 h-4 text-pink-500 bg-gray-800 border-gray-600 focus:ring-pink-500 focus:ring-2" data-action="update-editing-mode" ${mode === 'standard' ? 'checked' : ''}>
                            <div class="flex flex-col">
                                <span class="text-gray-200 font-medium group-hover:text-white transition-colors">Standard (Bottom Palette)</span>
                                <span class="text-xs text-gray-500">Only use the global palette at the bottom to single-click drops.</span>
                            </div>
                        </label>

                        <!-- Pie Menu Mode -->
                        <label class="flex items-start gap-3 cursor-pointer group mt-2">
                            <input type="radio" name="editingMode" value="pie-menu" class="w-4 h-4 mt-0.5 text-pink-500 bg-gray-800 border-gray-600 focus:ring-pink-500 focus:ring-2" data-action="update-editing-mode" ${mode === 'pie-menu' ? 'checked' : ''}>
                            <div class="flex flex-col flex-1">
                                <span class="text-gray-200 font-medium group-hover:text-white transition-colors">Pie Menu</span>
                                <span class="text-xs text-gray-500 mb-1">Contextual radial menu to select valid symbols.</span>
                                
                                <!-- Pie Menu Sub-options -->
                                <div class="${mode === 'pie-menu' ? 'flex' : 'hidden'} flex-col gap-4 p-4 mt-2 bg-gray-950/50 rounded-lg border border-gray-800">
                                    
                                    <!-- Trigger Mode Sub-section -->
                                    <div>
                                        <h5 class="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Trigger</h5>
                                        <div class="flex flex-col gap-3">
                                            <label class="flex items-center gap-3 cursor-pointer group">
                                                <input type="radio" name="pieMenuTrigger" value="right-click" class="w-4 h-4 text-pink-500 bg-gray-800 border-gray-600 focus:ring-pink-500 focus:ring-2" data-action="update-pie-trigger" ${state.uiState.pieMenu.pieMenuTrigger === 'right-click' ? 'checked' : ''}>
                                                <div class="flex flex-col">
                                                    <span class="text-gray-200 text-sm font-medium group-hover:text-white transition-colors">Right Click (Recommended)</span>
                                                </div>
                                            </label>

                                            <label class="flex items-center gap-3 cursor-pointer group">
                                                <input type="radio" name="pieMenuTrigger" value="long-press" class="w-4 h-4 text-pink-500 bg-gray-800 border-gray-600 focus:ring-pink-500 focus:ring-2" data-action="update-pie-trigger" ${state.uiState.pieMenu.pieMenuTrigger === 'long-press' ? 'checked' : ''}>
                                                <div class="flex items-center gap-2">
                                                    <span class="text-gray-200 text-sm font-medium group-hover:text-white transition-colors w-20">Long Press</span>
                                                    <input type="number" min="100" max="2000" step="50" value="${pressMs}" class="w-16 bg-gray-900 border border-gray-700 rounded px-1 py-0.5 text-xs text-white focus:outline-none focus:border-pink-500 ${state.uiState.pieMenu.pieMenuTrigger !== 'long-press' ? 'opacity-50 pointer-events-none' : ''}" data-action="update-pie-timing" data-target="pressTimeMs">
                                                    <span class="text-xs text-gray-500 ${state.uiState.pieMenu.pieMenuTrigger !== 'long-press' ? 'opacity-50 pointer-events-none' : ''}">ms</span>
                                                </div>
                                            </label>

                                            <label class="flex items-center gap-3 cursor-pointer group">
                                                <input type="radio" name="pieMenuTrigger" value="hover" class="w-4 h-4 text-pink-500 bg-gray-800 border-gray-600 focus:ring-pink-500 focus:ring-2" data-action="update-pie-trigger" ${state.uiState.pieMenu.pieMenuTrigger === 'hover' ? 'checked' : ''}>
                                                <div class="flex items-center gap-2">
                                                    <span class="text-gray-200 text-sm font-medium group-hover:text-white transition-colors w-20">Hover</span>
                                                    <input type="number" min="50" max="2000" step="50" value="${hoverMs}" class="w-16 bg-gray-900 border border-gray-700 rounded px-1 py-0.5 text-xs text-white focus:outline-none focus:border-pink-500 ${state.uiState.pieMenu.pieMenuTrigger !== 'hover' ? 'opacity-50 pointer-events-none' : ''}" data-action="update-pie-timing" data-target="hoverTimeMs">
                                                    <span class="text-xs text-gray-500 ${state.uiState.pieMenu.pieMenuTrigger !== 'hover' ? 'opacity-50 pointer-events-none' : ''}">ms</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <!-- Behavior Sub-section -->
                                    <div>
                                        <h5 class="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Behavior</h5>
                                        <div class="flex flex-col gap-2">
                                            <label class="flex items-center gap-3 cursor-pointer group">
                                                <input type="checkbox" class="w-4 h-4 text-pink-500 bg-gray-800 border-gray-600 focus:ring-pink-500 focus:ring-2 rounded" data-action="update-pie-behavior" data-setting="updateGlobalCursor" ${state.uiState.pieMenu.updateGlobalCursor ? 'checked' : ''}>
                                                <span class="text-gray-200 text-sm font-medium group-hover:text-white transition-colors">Update Palette Tool on Select</span>
                                            </label>

                                            <label class="flex items-center gap-3 cursor-pointer group">
                                                <input type="checkbox" class="w-4 h-4 text-pink-500 bg-gray-800 border-gray-600 focus:ring-pink-500 focus:ring-2 rounded" data-action="update-pie-behavior" data-setting="hideCurrentCursor" ${state.uiState.pieMenu.hideCurrentCursor ? 'checked' : ''}>
                                                <span class="text-gray-200 text-sm font-medium group-hover:text-white transition-colors">Hide Current Tool from Menu</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </label>
                        
                        <!-- Mouse Wheel Mode -->
                        <label class="flex items-center gap-3 cursor-pointer group mt-2">
                            <input type="radio" name="editingMode" value="mouse-wheel" class="w-4 h-4 text-pink-500 bg-gray-800 border-gray-600 focus:ring-pink-500 focus:ring-2" data-action="update-editing-mode" ${mode === 'mouse-wheel' ? 'checked' : ''}>
                            <div class="flex flex-col">
                                <span class="text-gray-200 font-medium group-hover:text-white transition-colors">Mouse Wheel</span>
                                <span class="text-xs text-gray-500">Scroll the mouse wheel over a cell to cycle through valid symbols.</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-gray-800 bg-gray-950 flex justify-end flex-shrink-0">
                <button data-action="close-modal" class="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors">
                    Done
                </button>
            </div>
        </div>
    </div>
    `;
};
