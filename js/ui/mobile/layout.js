import { state, playback } from '../../store.js';
import { Timeline } from '../../components/timeline.js';
import { TubsGrid } from '../../components/tubsGrid.js';
import { Bars3Icon } from '../../icons/bars3Icon.js';
import { StopIcon } from '../../icons/stopIcon.js';
import { PlayIcon } from '../../icons/playIcon.js';
import { PauseIcon } from '../../icons/pauseIcon.js';
import { FolderOpenIcon } from '../../icons/folderOpenIcon.js';
import { DevicePhoneMobileIcon } from '../../icons/DevicePhoneMobileIcon.js';

const renderHeader = (activeSection) => {
  return `
      <header class="h-16 px-4 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-40 gap-2">
        <!-- Left: Menu -->
        <div class="flex items-center gap-2">
            <button data-action="toggle-menu" class="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
                ${Bars3Icon('w-6 h-6 pointer-events-none')}
            </button>
        </div>

        <!-- Center: Section Info & Status -->
        <div class="flex flex-col items-center justify-center flex-1 min-w-0 px-2 overflow-hidden">
             <!-- Top: Section Name -->
             <span class="text-sm font-bold text-gray-200 truncate w-full text-center leading-tight mb-0.5">${activeSection.name}</span>
             
             <!-- Bottom: Stats -->
             <div class="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 font-mono bg-gray-900/50 px-2 py-0.5 rounded-md border border-gray-800/50">
                <!-- Repetitions -->
                <span class="flex items-center gap-1">
                    <span class="uppercase tracking-wider">Rep</span>
                    <span class="text-white font-bold" id="header-rep-count">${state.isPlaying ? playback.repetitionCounter : 1}</span>
                    <span>/</span>
                    <span>${activeSection.repetitions || 1}</span>
                </span>
                
                <div class="h-3 w-px bg-gray-700"></div>

                <!-- Global BPM Control -->
                <div class="flex items-center gap-1">
                    <input 
                      type="range" 
                      min="40" 
                      max="240" 
                      value="${state.toque.globalBpm}" 
                      data-action="update-global-bpm" 
                      class="w-12 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                    />
                    <span class="text-cyan-400 font-bold w-5 text-right" id="header-global-bpm-val">${state.toque.globalBpm}</span>
                </div>

                <!-- Live BPM Indicator (Only when playing) -->
                ${state.isPlaying ? `
                    <div class="h-3 w-px bg-gray-700 animate-pulse"></div>
                    <span class="flex items-center gap-1 text-green-400 font-bold animate-pulse">
                        <span>${Math.round(playback.currentPlayheadBpm)}</span>
                        <span class="text-[8px] opacity-70">LIVE</span>
                    </span>
                ` : ''}
             </div>
        </div>

        <!-- Right: Play/Stop -->
        <div class="flex items-center gap-2">
            <button data-action="stop" class="w-10 h-10 rounded-md flex items-center justify-center bg-gray-900 border border-gray-800 text-gray-400 hover:bg-red-900/40 hover:text-red-400 hover:border-red-900/50 transition-all">
                ${StopIcon('w-5 h-5 pointer-events-none')}
            </button>
            <button data-action="toggle-play" class="w-10 h-10 rounded-md flex items-center justify-center transition-all shadow-lg ${state.isPlaying ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50' : 'bg-green-600 text-white shadow-green-900/20'}">
                ${state.isPlaying ? PauseIcon('w-6 h-6 pointer-events-none') : PlayIcon('w-6 h-6 ml-0.5 pointer-events-none')}
            </button>
        </div>
      </header>
  `;
};

export const MobileLayout = () => {
  const activeSection = state.toque.sections.find(s => s.id === state.activeSectionId) || state.toque.sections[0];

  return `
    <div class="flex flex-col h-full bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500 selection:text-black select-none">
      <!-- Portrait Mode Enforcer Overlay -->
      <div class="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center p-8 text-center portrait:flex landscape:hidden">
         <div class="animate-pulse mb-6 text-cyan-500">
            ${DevicePhoneMobileIcon('w-24 h-24 rotate-90')}
         </div>
         <h2 class="text-2xl font-bold text-white mb-2">Please Rotate Your Device</h2>
         <p class="text-gray-400">Percussion Studio is designed for landscape mode.</p>
      </div>

      ${renderHeader(activeSection)}
      <div class="flex flex-1 overflow-hidden">
        <main class="flex-1 overflow-hidden relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
          <div id="grid-container" class="w-full max-w-7xl px-4 py-8 flex flex-col items-center justify-center overflow-hidden h-full">
            ${TubsGrid({
    section: activeSection,
    globalBpm: state.toque.globalBpm,
    currentStep: state.currentStep,
    selectedStroke: state.selectedStroke,
    uiState: state.uiState,
    readOnly: true
  })}
          </div>
        </main>
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
    </div>
  `;
};
