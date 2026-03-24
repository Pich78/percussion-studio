import { state, playback } from '../../../store.js';
import { getActiveSection } from '../../../store/stateSelectors.js';
import { Timeline } from '../../../components/timeline.js';
import { TubsGrid } from '../../../components/tubsGrid.js';
import { Bars3Icon } from '../../../icons/bars3Icon.js';
import { StopIcon } from '../../../icons/stopIcon.js';
import { PlayIcon } from '../../../icons/playIcon.js';
import { PauseIcon } from '../../../icons/pauseIcon.js';
import { DeviceRotateIcon } from '../../../icons/DeviceRotateIcon.js';
import { BataExplorerModal } from '../../../components/bataExplorerModal.js';
import { MobileMenuPanel } from '../../../components/mobileMenuPanel.js';
import { ViewModeModal } from '../../../components/viewModeModal.js';
import { calculateMobileCellSize } from '../standard/layout.js';

const renderHeader = (activeSection) => {
  const isPlayMode = state.uiState.dimensionBMode !== 'view'; // default to play

  return `
      <header class="h-14 px-2 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-40 gap-2">
        <!-- Left: Menu -->
        <div class="flex items-center flex-shrink-0">
            <button data-action="toggle-menu" class="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
                ${Bars3Icon('w-5 h-5 pointer-events-none')}
            </button>
        </div>

        <!-- Center: Segmented Control -->
        <div class="flex justify-center flex-1 min-w-0">
          <div class="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
             <button data-action="toggle-dim-b-mode" data-mode="play" class="flex items-center gap-1.5 px-4 py-1 text-xs font-bold rounded-md ${isPlayMode ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'} transition-all">
                ▶ PLAY
             </button>
             <button data-action="toggle-dim-b-mode" data-mode="view" class="flex items-center gap-1.5 px-4 py-1 text-xs font-bold rounded-md ${!isPlayMode ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'} transition-all">
                👁 VIEW
             </button>
          </div>
        </div>

        <!-- Right: Play/Stop (only in play mode) or placeholder (view mode) -->
        <div class="flex items-center justify-end flex-shrink-0 min-w-[70px]">
          ${isPlayMode ? `
            <div class="flex items-center gap-0.5 bg-gray-900 rounded-lg p-0.5 border border-gray-800">
              <button data-action="stop" class="w-8 h-8 rounded-md flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-red-900/40 hover:text-red-400 hover:border-red-900/50 transition-all">
                  ${StopIcon('w-4 h-4 pointer-events-none')}
              </button>
              <button data-action="toggle-play" class="w-8 h-8 rounded-md flex items-center justify-center transition-all shadow-lg ${state.isPlaying ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50' : 'bg-green-600 text-white shadow-green-900/20'}">
                  ${state.isPlaying ? PauseIcon('w-4 h-4 pointer-events-none') : PlayIcon('w-4 h-4 ml-0.5 pointer-events-none')}
              </button>
            </div>
          ` : `
            <!-- Placeholder for balance -->
            <div class="w-16 h-8"></div>
          `}
        </div>
      </header>
  `;
};

export const DimensionBLayout = () => {
  const activeSection = getActiveSection(state) || state.toque.sections[0];
  const isViewMode = state.uiState.dimensionBMode === 'view';

  // Get current viewport and safe area dimensions
  const viewportWidth = window.innerWidth;
  const computedStyle = getComputedStyle(document.documentElement);
  const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
  const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;

  // Calculate cell sizes
  const steps = activeSection?.steps || 12;
  const standardMobileCellSize = calculateMobileCellSize(viewportWidth, steps, safeAreaLeft, safeAreaRight);
  
  // View mode shrinks grid to fit (hardcode smaller base size)
  const mobileCellSize = isViewMode ? Math.min(16, standardMobileCellSize) : standardMobileCellSize;

  return `
    <div class="flex flex-col h-full bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500 selection:text-black select-none pl-[var(--safe-area-left)] pr-[var(--safe-area-right)]">
      <!-- Portrait Mode Enforcer Overlay -->
      <div class="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center p-8 text-center portrait:flex landscape:hidden">
         <div class="animate-pulse mb-6 text-cyan-500">
            ${DeviceRotateIcon('w-24 h-24')}
         </div>
         <h2 class="text-2xl font-bold text-white mb-2">Please Rotate Your Device</h2>
         <p class="text-gray-400">Percussion Studio is designed for landscape mode.</p>
      </div>

      <!-- Main content - hidden in portrait mode -->
      <div class="landscape-only flex flex-col flex-1 overflow-hidden">
        ${renderHeader(activeSection)}
        
        <div class="flex flex-col flex-1 overflow-hidden relative">
          <!-- Play Mode overlay tools (BPM/Mixer) -->
          ${!isViewMode ? `
             <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-2 shadow-2xl">
               <!-- Mixer access / details would go here -->
               <div class="flex items-center gap-1.5">
                  <span class="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Tempo</span>
                  <span class="text-[10px] font-mono font-bold text-cyan-400" id="dim-b-bpm">${state.toque.globalBpm} <span class="text-[8px] text-gray-600">BPM</span></span>
               </div>
               
               <div class="relative w-24 h-4 flex items-center group/bpm cursor-pointer">
                  <!-- Background track -->
                  <div class="absolute left-0 right-0 h-1.5 bg-gray-700 rounded-full cursor-pointer"></div>
                  <!-- Fill bar -->
                  <div class="absolute left-0 h-1.5 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full cursor-pointer" style="width: ${((state.toque.globalBpm - 40) / 200) * 100}%"></div>
                  <!-- Handle -->
                  <div class="absolute w-3 h-3 bg-white rounded-full shadow-md border border-cyan-400 cursor-pointer z-[15]" style="left: calc(${((state.toque.globalBpm - 40) / 200) * 100}% - 6px)"></div>
                  <input type="range" min="40" max="240" value="${state.toque.globalBpm}" data-action="update-global-bpm" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
               </div>
             </div>
          ` : ''}
          
          <main class="flex-1 ${isViewMode ? 'overflow-auto' : 'overflow-hidden'} relative flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950" style="${isViewMode ? 'touch-action: pan-x pan-y pinch-zoom;' : ''}">
            <div id="grid-container" class="w-full ${isViewMode ? 'min-w-max p-6' : 'max-w-7xl py-2'} flex flex-col justify-center items-center ${isViewMode ? 'origin-center' : 'h-full no-pinch-zoom'}">
              ${TubsGrid({
                section: activeSection,
                globalBpm: state.toque.globalBpm,
                currentStep: isViewMode ? -1 : state.currentStep, // Hide playhead in view mode by passing -1 or actual
                selectedStroke: state.selectedStroke,
                uiState: state.uiState,
                readOnly: true, // No editing
                isMobile: true,
                mobileCellSize,
                instrumentDefinitions: state.instrumentDefinitions,
                isPlaying: isViewMode ? false : state.isPlaying // Prevent scrolling/highlight if in view mode
              })}
            </div>
          </main>
        </div>
      </div>

      <!-- Mobile Menu -->
      ${state.uiState.isMenuOpen ? MobileMenuPanel() : ''}

      <!-- Mobile Structure Modal -->
      ${state.uiState.modalOpen && state.uiState.modalType === 'structure' ? `
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
                <div class="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">Select a section to switch playback.</div>
            </div>
        </div>
      ` : ''}

      <!-- Mobile View Mode Modal -->
      ${state.uiState.modalOpen && state.uiState.modalType === 'viewMode' ? ViewModeModal() : ''}

      <!-- Mobile User Guide Modal -->
      ${state.uiState.modalOpen && state.uiState.modalType === 'userGuide' ? `
        <div class="fixed inset-0 z-50 flex flex-col">
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-modal-bg"></div>
            <div class="relative w-full h-full bg-gray-900 shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom duration-200 pl-[var(--safe-area-left)] pr-[var(--safe-area-right)]">
                <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0">
                    <h2 class="text-lg font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-purple-400"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
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
        </div>
      ` : ''}

      ${BataExplorerModal({ isMobile: true, bataExplorer: state.uiState.bataExplorer })}
    </div>
  `;
};
