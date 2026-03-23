import { state, playback } from '../../../store.js';
import { getActiveSection } from '../../../store/stateSelectors.js';
import { TubsGrid } from '../../../components/tubsGrid.js';
import { Bars3Icon } from '../../../icons/bars3Icon.js';
import { StopIcon } from '../../../icons/stopIcon.js';
import { PlayIcon } from '../../../icons/playIcon.js';
import { PauseIcon } from '../../../icons/pauseIcon.js';
import { DeviceRotateIcon } from '../../../icons/DeviceRotateIcon.js';
import { ViewModeModal } from '../../../components/viewModeModal.js';
import { calculateMobileCellSize } from '../standard/layout.js';

const renderHeader = (activeSection) => {
  const sections = state.toque.sections || [];
  const totalSections = sections.length;
  const activeSectionIndex = sections.findIndex(s => s.id === state.activeSectionId) + 1;

  return `
    <header class="h-12 px-2 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-40 gap-2">
      <!-- Left: Menu -->
      <div class="flex items-center flex-shrink-0">
        <button data-action="toggle-menu" class="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
          ${Bars3Icon('w-5 h-5 pointer-events-none')}
        </button>
      </div>

      <!-- Center: Rhythm Name & Info -->
      <div class="flex items-center flex-1 min-w-0 justify-center gap-1.5 overflow-hidden">
        <span class="text-sm font-bold text-amber-400 truncate">${state.toque.name}</span>
        <span class="text-gray-600 text-xs truncate">/ ${activeSection?.name || 'Main'}</span>
      </div>

      <!-- Right: Play/Stop -->
      <div class="flex items-center justify-end flex-shrink-0 min-w-[70px]">
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

const renderMixerStrip = (activeSection) => {
  const tracks = activeSection?.measures?.[0]?.tracks || [];
  
  const trackItems = tracks.map((track, idx) => {
    const volume = track.volume ?? 1;
    const isMuted = track.muted ?? false;
    const volumePercent = Math.round(volume * 100);

    return `
      <div class="flex flex-col items-center min-w-[120px] max-w-[150px] border-r border-gray-800 last:border-r-0 px-4 py-2 flex-shrink-0 ${isMuted ? 'opacity-50' : 'opacity-100'} hover:bg-gray-800/30 transition-colors">
        <div class="flex items-center justify-between w-full mb-2">
          <span class="text-xs font-bold text-gray-300 truncate w-16" title="${track.instrument}">${track.instrument}</span>
          <button data-action="toggle-mute" data-track-index="${idx}" class="p-1 rounded hover:bg-gray-700 transition-colors ${isMuted ? 'text-red-400' : 'text-green-400'}" title="${isMuted ? 'Unmute' : 'Mute'}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 pointer-events-none">
              ${isMuted 
                ? '<path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-3.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />'
                : '<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-3.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />'
              }
            </svg>
          </button>
        </div>
        
        <!-- Volume Slider -->
        <div class="relative w-full h-5 flex items-center cursor-pointer group/vol mt-1">
          <div class="absolute left-0 right-0 h-1.5 bg-gray-700 rounded-full cursor-pointer"></div>
          <div class="absolute left-0 h-1.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full cursor-pointer" style="width: ${volumePercent}%"></div>
          <div class="absolute w-4 h-4 bg-white rounded-full shadow-md border border-emerald-400 cursor-pointer z-10" style="left: calc(${volumePercent}% - 8px)"></div>
          <input type="range" min="0" max="1" step="0.01" value="${volume}" data-action="update-volume" data-track-index="${idx}" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
        </div>
        <div class="text-[10px] text-gray-500 font-mono mt-1 w-full text-right font-medium">${volumePercent}%</div>
      </div>
    `;
  }).join('');

  return `
    <div class="bg-gray-900 border-t border-gray-800 flex overflow-x-auto custom-scrollbar flex-shrink-0 relative">
      ${trackItems}
    </div>
  `;
};

export const DimensionCLayout = () => {
  const activeSection = getActiveSection(state) || state.toque.sections[0];

  const viewportWidth = window.innerWidth;
  const computedStyle = getComputedStyle(document.documentElement);
  const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
  const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;
  
  const steps = activeSection?.steps || 12;
  const standardMobileCellSize = calculateMobileCellSize(viewportWidth, steps, safeAreaLeft, safeAreaRight);

  return `
    <div class="flex flex-col h-full bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500 selection:text-black select-none pl-[var(--safe-area-left)] pr-[var(--safe-area-right)] h-screen overflow-hidden">
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
          <main class="flex-1 overflow-hidden relative flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
            <div id="grid-container" class="w-full max-w-7xl flex flex-col justify-center items-center h-full no-pinch-zoom py-2">
              ${TubsGrid({
                section: activeSection,
                globalBpm: state.toque.globalBpm,
                currentStep: state.currentStep,
                selectedStroke: state.selectedStroke,
                uiState: state.uiState,
                readOnly: true, // No editing
                isMobile: true,
                mobileCellSize: standardMobileCellSize,
                instrumentDefinitions: state.instrumentDefinitions,
                isPlaying: state.isPlaying
              })}
            </div>
          </main>
          
          ${renderMixerStrip(activeSection)}
        </div>
      </div>

      <!-- Menus and Modals -->
      ${state.uiState.isMenuOpen ? `
        <div class="fixed inset-0 z-50 flex flex-col">
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-menu"></div>
            <div class="relative w-4/5 max-w-sm h-full bg-gray-900 border-r border-gray-800 shadow-2xl flex flex-col animate-in fade-in slide-in-from-left duration-200 ml-[var(--safe-area-left)]">
                <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                    <h2 class="text-lg font-bold text-white">Options</h2>
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
