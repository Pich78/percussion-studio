import { state, playback } from '../../store.js';
import { Timeline } from '../../components/timeline.js';
import { TubsGrid } from '../../components/tubsGrid.js';
import { Bars3Icon } from '../../icons/bars3Icon.js';
import { StopIcon } from '../../icons/stopIcon.js';
import { PlayIcon } from '../../icons/playIcon.js';
import { PauseIcon } from '../../icons/pauseIcon.js';
import { FolderOpenIcon } from '../../icons/folderOpenIcon.js';
import { DeviceRotateIcon } from '../../icons/DeviceRotateIcon.js';
import { BataExplorerModal } from '../../components/bataExplorerModal.js';

const renderHeader = (activeSection) => {
  return `
      <header class="h-14 px-2 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-40 gap-2">
        <!-- Left: Menu -->
        <div class="flex items-center flex-shrink-0">
            <button data-action="toggle-menu" class="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
                ${Bars3Icon('w-5 h-5 pointer-events-none')}
            </button>
        </div>

        <!-- Center: Section Info & Status -->
        <div class="flex items-center justify-center flex-1 min-w-0 gap-2 overflow-hidden">
             <!-- Rhythm and Section Names -->
             <span class="text-sm font-bold text-amber-400 truncate">${state.toque.name}</span>
             <span class="text-gray-600 text-sm">/</span>
             <span class="text-sm font-bold text-gray-200 truncate">${activeSection.name}</span>
             
             <!-- Stats Badge -->
             <div class="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono bg-gray-900/50 px-1.5 py-0.5 rounded border border-gray-800/50 flex-shrink-0">
                <!-- Repetitions -->
                <span class="flex items-center gap-0.5">
                    <span class="uppercase tracking-wider">Rep</span>
                    <span class="text-white font-bold" id="header-rep-count">${state.isPlaying ? playback.repetitionCounter : 1}</span>
                    <span class="text-gray-600">/</span>
                    <span>${activeSection.repetitions || 1}</span>
                </span>
                
                <div class="h-2.5 w-px bg-gray-700"></div>

                <!-- Live BPM Indicator -->
                <span class="flex items-center gap-0.5 ${state.isPlaying ? 'text-green-400' : 'text-gray-600'} font-bold">
                    <span class="text-[8px] uppercase opacity-70">Live</span>
                    <span id="header-live-bpm">${state.isPlaying ? Math.round(playback.currentPlayheadBpm) : state.toque.globalBpm}</span>
                </span>
             </div>
        </div>

        <!-- Right: BPM Control + Play/Stop (like desktop) -->
        <div class="flex items-center gap-1 flex-shrink-0">
            <!-- Global BPM Control (desktop style) -->
            <div class="flex items-center gap-1.5 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800">
              <div class="flex flex-col items-end leading-none">
                  <span class="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Global</span>
                  <span class="text-[10px] font-mono font-bold text-cyan-400" id="header-global-bpm">${state.toque.globalBpm} <span class="text-[8px] text-gray-600">BPM</span></span>
              </div>
              <!-- BPM Slider with Handle (matching volume slider style) -->
              <div class="relative w-20 h-4 flex items-center group/bpm cursor-pointer">
                <!-- Background track -->
                <div class="absolute left-0 right-0 h-1.5 bg-gray-700 rounded-full cursor-pointer"></div>
                <!-- Fill bar (cyan gradient) -->
                <div class="absolute left-0 h-1.5 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full cursor-pointer" style="width: ${((state.toque.globalBpm - 40) / 200) * 100}%"></div>
                <!-- Handle -->
                <div class="absolute w-3 h-3 bg-white rounded-full shadow-md border border-cyan-400 cursor-pointer z-[15]" style="left: calc(${((state.toque.globalBpm - 40) / 200) * 100}% - 6px)"></div>
                <!-- Range input (invisible but captures interactions) -->
                <input type="range" min="40" max="240" value="${state.toque.globalBpm}" data-action="update-global-bpm" 
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
              </div>
            </div>
            ${(() => {
      const subdivision = activeSection?.subdivision || 4;
      const countInBeats = subdivision === 3 ? 6 : 4;
      const isCountingIn = playback.isCountingIn;
      const countInStep = playback.countInStep;

      const enabledClass = state.countInEnabled
        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400'
        : 'bg-gray-800 border-gray-700 text-gray-500';

      const countingInClass = isCountingIn
        ? 'animate-pulse ring-2 ring-cyan-400'
        : '';

      return `
              <button data-action="toggle-count-in" class="flex items-center gap-1 px-2 py-1 rounded-lg border transition-all ${enabledClass} ${countingInClass}">
                <span class="text-[8px] font-bold uppercase">Cnt</span>
                <span class="font-mono font-bold text-xs">${isCountingIn ? countInStep : countInBeats}</span>
              </button>
              `;
    })()}
            <!-- Play/Stop buttons -->
            <div class="flex items-center gap-0.5 bg-gray-900 rounded-lg p-0.5 border border-gray-800">
              <button data-action="stop" class="w-8 h-8 rounded-md flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-red-900/40 hover:text-red-400 hover:border-red-900/50 transition-all">
                  ${StopIcon('w-4 h-4 pointer-events-none')}
              </button>
              <button data-action="toggle-play" class="w-8 h-8 rounded-md flex items-center justify-center transition-all shadow-lg ${state.isPlaying ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50' : 'bg-green-600 text-white shadow-green-900/20'}">
                  ${state.isPlaying ? PauseIcon('w-4 h-4 pointer-events-none') : PlayIcon('w-4 h-4 ml-0.5 pointer-events-none')}
              </button>
            </div>
        </div>
      </header>
  `;
};

/**
 * Pure function to calculate optimal mobile cell size.
 * Cells fill available width after subtracting layout overhead (195px).
 * 
 * @param {number} viewportWidth - Current window.innerWidth
 * @param {number} steps - Number of steps in the section
 * @param {number} safeAreaLeft - Left safe area inset
 * @param {number} safeAreaRight - Right safe area inset
 * @returns {number} Optimal cell size in pixels (16-40px)
 */
export const calculateMobileCellSize = (viewportWidth, steps, safeAreaLeft, safeAreaRight) => {
  // Usable width after safe areas
  const usableWidth = viewportWidth - safeAreaLeft - safeAreaRight;

  // Layout overhead (accurate breakdown):
  // - Sticky label: w-44 (176px) + border-l-4 (4px) + border-r (1px) = 181px
  // - Cell container: p-1 = 8px total (4px each side)
  // - ml-1 between label and cells = 4px
  // - Small buffer for sub-pixel rounding = 2px
  const totalOverhead = 181 + 8 + 4 + 2; // = 195px

  const availableForCells = usableWidth - totalOverhead;

  // Calculate optimal cell width - cells are adjacent (no gaps)
  const optimalCellWidth = Math.floor(availableForCells / steps);

  // Clamp between minimum (16px) and maximum (40px)
  return Math.max(16, Math.min(40, optimalCellWidth));
};

export const MobileLayout = () => {
  const activeSection = state.toque.sections.find(s => s.id === state.activeSectionId) || state.toque.sections[0];

  // Get current viewport and safe area dimensions
  const viewportWidth = window.innerWidth;
  const computedStyle = getComputedStyle(document.documentElement);
  const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
  const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;

  // Calculate cell size fresh on every render (pure functional - no caching)
  const steps = activeSection?.steps || 12;
  const mobileCellSize = calculateMobileCellSize(viewportWidth, steps, safeAreaLeft, safeAreaRight);

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

      <!-- Rhythm Loading Overlay -->
      ${state.uiState.isLoadingRhythm ? `
      <div class="fixed inset-0 z-[90] bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
         <div class="mb-8">
            <!-- Animated loading spinner -->
            <div class="relative w-20 h-20">
               <div class="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
               <div class="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
         </div>
         <h2 class="text-xl font-bold text-white mb-2">Loading</h2>
         <p class="text-cyan-400 text-lg font-semibold">${state.uiState.loadingRhythmName || 'Rhythm'}</p>
      </div>
      ` : ''}

      <!-- Main content - hidden in portrait mode -->
      <div class="landscape-only flex flex-col flex-1 overflow-hidden">
        ${renderHeader(activeSection)}
        <div class="flex flex-1 overflow-hidden">
          <main class="flex-1 overflow-hidden relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
            <div id="grid-container" class="w-full max-w-7xl py-2 flex flex-col items-center justify-center overflow-hidden h-full no-pinch-zoom">
              ${TubsGrid({
    section: activeSection,
    globalBpm: state.toque.globalBpm,
    currentStep: state.currentStep,
    selectedStroke: state.selectedStroke,
    uiState: state.uiState,
    readOnly: true,
    isMobile: true,
    mobileCellSize
  })}
            </div>
          </main>
        </div>
      </div>

      <!-- Mobile Menu Modal (Timeline) -->
      ${state.uiState.isMenuOpen ? `
        <div class="fixed inset-0 z-50 flex flex-col">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-menu"></div>
            
            <!-- Modal Content - with safe area padding for dynamic island -->
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
      ` : ''}

      <!-- Mobile Structure Modal -->
      ${state.uiState.modalOpen && state.uiState.modalType === 'structure' ? `
        <div class="fixed inset-0 z-50 flex flex-col">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-modal-bg"></div>
            
            <!-- Modal Content -->
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
    isMobile: true
  })}
                </div>
                <div class="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
                    Select a section to switch playback.
                </div>
            </div>
        </div>
      ` : ''}

      <!-- Mobile User Guide Modal -->
      ${state.uiState.modalOpen && state.uiState.modalType === 'userGuide' ? `
        <div class="fixed inset-0 z-50 flex flex-col">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-modal-bg"></div>
            
            <!-- Modal Content - with safe area padding for dynamic island -->
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
        </div>
      ` : ''}

      ${BataExplorerModal({ isMobile: true })}
    </div>
  `;
};
