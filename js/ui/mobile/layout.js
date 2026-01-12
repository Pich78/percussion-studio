import { state, playback } from '../../store.js';
import { Timeline } from '../../components/timeline.js';
import { TubsGrid } from '../../components/tubsGrid.js';
import { Bars3Icon } from '../../icons/bars3Icon.js';
import { StopIcon } from '../../icons/stopIcon.js';
import { PlayIcon } from '../../icons/playIcon.js';
import { PauseIcon } from '../../icons/pauseIcon.js';
import { FolderOpenIcon } from '../../icons/folderOpenIcon.js';
import { DeviceRotateIcon } from '../../icons/DeviceRotateIcon.js';

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
              <input type="range" min="40" max="240" value="${state.toque.globalBpm}" data-action="update-global-bpm" class="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400" />
            </div>
            
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

export const MobileLayout = () => {
  const activeSection = state.toque.sections.find(s => s.id === state.activeSectionId) || state.toque.sections[0];

  // Calculate optimal cell size based on available screen width
  // Only recalculate if step count changes, otherwise use cached value
  const calculateMobileCellSize = () => {
    const steps = activeSection?.steps || 12;

    // Use cached value if step count hasn't changed
    if (state.uiState.mobileCellSize !== null && state.uiState.mobileCellSteps === steps) {
      return state.uiState.mobileCellSize;
    }

    // Get safe area insets from CSS custom properties (set via env() in mobile.html)
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
    const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;

    const viewportWidth = window.innerWidth;
    // Subtract safe areas to get usable width (excludes dynamic island area)
    const usableWidth = viewportWidth - safeAreaLeft - safeAreaRight;

    const subdivision = activeSection?.subdivision || 4;

    // Account for all horizontal space consumers:
    // - Sticky instrument label: 144px (w-36)
    // - Gap between cells: ~5px per cell (gap-1 = 4px + border)
    // - Separators between groups: 2px each
    // - Cell container padding: 8px (p-1 on both sides = 4px + 4px)
    // - Some buffer for scrollbar and rendering: 10px
    const stickyLabelWidth = 144;
    const gapPerStep = 5;
    const separatorCount = Math.floor((steps - 1) / subdivision);
    const containerPadding = 8;
    const buffer = 15;

    const totalOverhead = stickyLabelWidth + containerPadding + buffer + (separatorCount * 2) + (steps * gapPerStep);
    const availableForCells = usableWidth - totalOverhead;

    const optimalCellWidth = Math.floor(availableForCells / steps);

    // Clamp between minimum (16px) and maximum (40px)
    // 16px is still usable for small icons/letters
    const clampedWidth = Math.max(16, Math.min(40, optimalCellWidth));

    // Cache the calculated value and the step count it was calculated for
    state.uiState.mobileCellSize = clampedWidth;
    state.uiState.mobileCellSteps = steps;

    return clampedWidth;
  };

  const mobileCellSize = calculateMobileCellSize();

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
            
            <!-- Modal Content -->
            <div class="relative w-4/5 max-w-sm h-full bg-gray-900 border-r border-gray-800 shadow-2xl flex flex-col animate-in fade-in slide-in-from-left duration-200">
                <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                    <h2 class="text-lg font-bold text-white">Menu</h2>
                    <button data-action="close-menu" class="p-2 text-gray-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <!-- Menu Actions -->
                <div class="p-4 flex flex-col gap-3">
                     <button data-action="load-rhythm" class="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white px-4 py-4 rounded-xl flex items-center justify-center gap-3 border border-gray-700 transition-colors font-bold shadow-lg text-lg">
                        ${FolderOpenIcon('w-6 h-6 text-amber-500 pointer-events-none')}
                        Load Rhythm
                     </button>
                     
                     <button data-action="open-structure" class="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white px-4 py-4 rounded-xl flex items-center justify-center gap-3 border border-gray-700 transition-colors font-bold shadow-lg text-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-cyan-500 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                        Show Structure
                     </button>
                     
                     ${window.location.hostname.includes('github.io') ? `
                     <button data-action="share-rhythm" class="w-full px-4 py-4 rounded-xl flex items-center justify-center gap-3 border transition-colors font-bold shadow-lg text-lg ${state.rhythmSource === 'repo' ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border-gray-700' : 'bg-gray-800/50 text-gray-600 border-gray-800 cursor-not-allowed'}" ${state.rhythmSource !== 'repo' ? 'disabled' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 ${state.rhythmSource === 'repo' ? 'text-blue-400' : 'text-gray-600'} pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                        Share Rhythm${state.rhythmSource !== 'repo' ? ' (N/A)' : ''}
                     </button>
                     ` : ''}
                     
                     <div class="mt-2 pt-3 border-t border-gray-700">
                        <button data-action="toggle-user-guide-submenu" class="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white px-4 py-4 rounded-xl flex items-center justify-between border border-gray-700 transition-colors font-bold shadow-lg text-lg mb-2">
                           <span class="flex items-center gap-3">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-purple-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                              User Guide
                           </span>
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 pointer-events-none transition-transform ${state.uiState.userGuideSubmenuOpen ? 'rotate-90' : ''}"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>
                        ${state.uiState.userGuideSubmenuOpen ? `
                        <div class="flex gap-2 mt-2">
                           <button data-action="open-user-guide" data-lang="en" class="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 border border-gray-700 transition-colors font-bold">
                              <span class="text-blue-400 font-bold">EN</span> English
                           </button>
                           <button data-action="open-user-guide" data-lang="it" class="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 border border-gray-700 transition-colors font-bold">
                              <span class="text-green-400 font-bold">IT</span> Italiano
                           </button>
                        </div>
                        ` : ''}
                     </div>
                </div>
            </div>
        </div>
      ` : ''}

      <!-- Mobile Structure Modal -->
      ${state.uiState.modalOpen && state.uiState.modalType === 'structure' ? `
        <div class="fixed inset-0 z-50 flex flex-col">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-modal-bg"></div>
            
            <!-- Modal Content -->
            <div class="relative w-full h-full sm:w-4/5 sm:max-w-sm bg-gray-900 border-r border-gray-800 shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom duration-200">
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
    readOnly: true
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
            
            <!-- Modal Content -->
            <div class="relative w-full h-full bg-gray-900 shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom duration-200">
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
    </div>
  `;
};
