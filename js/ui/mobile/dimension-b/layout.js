import { state, playback } from '../../../store.js';
import { getActiveSection } from '../../../store/stateSelectors.js';
import { Timeline } from '../../../components/timeline.js';
import { TubsGrid } from '../../../components/tubsGrid.js';
import { Bars3Icon } from '../../../icons/bars3Icon.js';
import { StopIcon } from '../../../icons/stopIcon.js';
import { PlayIcon } from '../../../icons/playIcon.js';
import { PauseIcon } from '../../../icons/pauseIcon.js';
import { DeviceRotateIcon } from '../../../icons/DeviceRotateIcon.js';
import { FolderOpenIcon } from '../../../icons/folderOpenIcon.js';
import { ChevronDownIcon } from '../../../icons/chevronDownIcon.js';
import { BataExplorerModal } from '../../../components/bataExplorerModal.js';
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

      <!-- Menus and Modals -->
      ${state.uiState.isMenuOpen ? `
        <div class="fixed inset-0 z-50 flex flex-col">
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-menu"></div>
            <!-- Keep basic menu just to allow navigation away -->
            <div class="relative w-4/5 max-w-sm h-full bg-gray-900 border-r border-gray-800 shadow-2xl flex flex-col animate-in fade-in slide-in-from-left duration-200 ml-[var(--safe-area-left)]">
                <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                    <h2 class="text-lg font-bold text-white">Dimension B Options</h2>
                    <button data-action="close-menu" class="p-2 text-gray-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <nav class="flex-1 overflow-y-auto p-3 pb-8">
                      <button data-action="open-view-mode" class="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-gray-700/50 transition-colors border-b border-gray-700/50 rounded-2xl bg-gray-800/50">
                          <span class="text-gray-100 font-medium text-base">View Mode Selection</span>
                      </button>
                </nav>
            </div>
        </div>
      ` : ''}

      ${state.uiState.modalOpen && state.uiState.modalType === 'viewMode' ? ViewModeModal() : ''}
    </div>
  `;
};
