import { state, playback } from '../store.js';
import { Timeline } from '../components/timeline.js';
import { TubsGrid, autoScrollGrid } from '../components/tubsGrid.js';
import { Controls } from '../components/controls.js';

// Icons
import { PlayIcon } from '../icons/playIcon.js';
import { PauseIcon } from '../icons/pauseIcon.js';
import { StopIcon } from '../icons/stopIcon.js';
import { Bars3Icon } from '../icons/bars3Icon.js';
import { DocumentPlusIcon } from '../icons/documentPlusIcon.js';
import { FolderOpenIcon } from '../icons/folderOpenIcon.js';
import { ArrowDownTrayIcon } from '../icons/arrowDownTrayIcon.js';

const root = document.getElementById('root');

const renderHeader = () => {
  const activeSection = state.toque.sections.find(s => s.id === state.activeSectionId) || state.toque.sections[0];

  return `
    <header class="h-16 px-4 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-40 gap-4">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <div class="relative">
          <button data-action="toggle-menu" class="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
              ${Bars3Icon('w-6 h-6 pointer-events-none')}
          </button>
          ${state.uiState.isMenuOpen ? `
            <div class="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                <div class="py-1">
                    <button data-action="new-rhythm" class="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-b border-gray-800 flex items-center gap-2">
                        ${DocumentPlusIcon('w-4 h-4 text-cyan-500 pointer-events-none')} New Rhythm
                    </button>
                    <button data-action="load-rhythm" class="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2 border-b border-gray-800">
                        ${FolderOpenIcon('w-4 h-4 text-amber-500 pointer-events-none')} Load Rhythm...
                    </button>
                    <button data-action="download-rhythm" class="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2">
                        ${ArrowDownTrayIcon('w-4 h-4 text-green-500 pointer-events-none')} Download Rhythm
                    </button>
                </div>
            </div>
            <div class="fixed inset-0 z-40 bg-transparent" data-action="close-menu"></div>
          ` : ''}
        </div>
        <h1 class="text-xl font-bold text-gray-100 whitespace-nowrap hidden sm:block">Percussion Studio</h1>
        <div class="h-6 w-px bg-gray-800 hidden sm:block"></div>
        <div class="flex items-center gap-3 min-w-0 overflow-hidden flex-1">
           <span class="text-gray-200 font-bold text-lg truncate whitespace-nowrap">${activeSection.name}</span>
           <div class="flex items-center gap-1 ml-2 bg-gray-900 px-2 py-0.5 rounded border border-gray-800 flex-shrink-0">
              <span class="text-[10px] uppercase font-bold text-gray-500">Rep</span>
              <span class="font-mono font-bold ${state.isPlaying ? 'text-green-400' : 'text-gray-400'}" id="header-rep-count">
                ${state.isPlaying ? playback.repetitionCounter : 1}
              </span>
              <span class="text-gray-600 font-mono">/</span>
              <span class="text-gray-500 font-mono">${activeSection.repetitions || 1}</span>
           </div>
        </div>
      </div>
      <div class="flex items-center gap-4 flex-shrink-0">
        <div class="flex items-center gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
          <button data-action="stop" class="w-10 h-10 rounded-md flex items-center justify-center bg-gray-800 hover:bg-red-900/40 hover:text-red-400 text-gray-400 transition-all border border-transparent hover:border-red-900/50">
            ${StopIcon('w-5 h-5 pointer-events-none')}
          </button>
          <button data-action="toggle-play" class="w-10 h-10 rounded-md flex items-center justify-center transition-all shadow-lg ${state.isPlaying ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500/20' : 'bg-green-600 text-white hover:bg-green-500 shadow-green-900/20'}">
            ${state.isPlaying ? PauseIcon('w-6 h-6 pointer-events-none') : PlayIcon('w-6 h-6 ml-0.5 pointer-events-none')}
          </button>
        </div>
        <div class="flex items-center gap-3 bg-gray-900 px-3 py-2 rounded-lg border border-gray-800">
          <div class="flex flex-col items-end leading-none">
              <span class="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Global</span>
              <span class="text-xs font-mono font-bold text-cyan-400" id="header-global-bpm">${state.toque.globalBpm} <span class="text-[9px] text-gray-600">BPM</span></span>
          </div>
          <input type="range" min="40" max="240" value="${state.toque.globalBpm}" data-action="update-global-bpm" class="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400" />
        </div>
      </div>
    </header>
  `;
};

export const renderApp = () => {
  if (!state.toque) {
    root.innerHTML = '<div class="flex h-full items-center justify-center text-gray-500">Loading Rhythm...</div>';
    return;
  }

  const activeSection = state.toque.sections.find(s => s.id === state.activeSectionId) || state.toque.sections[0];

  root.innerHTML = `
    <div class="flex flex-col h-full bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500 selection:text-black select-none">
      ${renderHeader()}
      <div class="flex flex-1 overflow-hidden">
        ${Timeline({
    sections: state.toque.sections,
    globalBpm: state.toque.globalBpm,
    activeSectionId: state.activeSectionId,
    rhythmName: state.toque.name
  })}
        <main class="flex-1 overflow-hidden relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
          <div id="grid-container" class="w-full max-w-7xl px-4 py-8 flex flex-col items-center justify-center overflow-hidden h-full">
            ${TubsGrid({
    section: activeSection,
    globalBpm: state.toque.globalBpm,
    currentStep: state.currentStep,
    selectedStroke: state.selectedStroke,
    uiState: state.uiState
  })}
          </div>
        </main>
      </div>
      ${Controls({ selectedStroke: state.selectedStroke })}
    </div>
  `;
};

export const refreshGrid = () => {
  const activeSection = state.toque.sections.find(s => s.id === state.activeSectionId) || state.toque.sections[0];
  const container = document.getElementById('grid-container');
  if (container) {
    // Save scroll position
    const scrollContainer = document.getElementById('tubs-scroll-container');
    const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
    const scrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;

    container.innerHTML = TubsGrid({
      section: activeSection,
      globalBpm: state.toque.globalBpm,
      currentStep: state.currentStep,
      selectedStroke: state.selectedStroke,
      uiState: state.uiState
    });

    // Restore scroll position
    const newScrollContainer = document.getElementById('tubs-scroll-container');
    if (newScrollContainer) {
      newScrollContainer.scrollTop = scrollTop;
      newScrollContainer.scrollLeft = scrollLeft;
    }
  }
};

export const updateVisualStep = (step) => {
  document.querySelectorAll('.ring-2.ring-white').forEach(el => {
    el.classList.remove('ring-2', 'ring-white', 'z-10', 'scale-105', 'shadow-lg', 'shadow-cyan-500/50');
  });
  document.querySelectorAll('.bg-gray-800').forEach(el => {
    if (el.innerText === '' || el.innerText === '.') el.classList.remove('bg-gray-800');
  });
  document.querySelectorAll('[data-step-marker]').forEach(el => {
    el.classList.remove('text-cyan-400', 'font-bold', 'scale-110');
    el.classList.add('text-gray-500');
  });

  const cells = document.querySelectorAll(`[data-step-index="${step}"]`);
  cells.forEach(cell => {
    cell.classList.add('ring-2', 'ring-white', 'z-10', 'scale-105', 'shadow-lg', 'shadow-cyan-500/50');
    if (cell.innerText.trim() === '') cell.classList.add('bg-gray-800');
  });

  const marker = document.querySelector(`[data-step-marker="${step}"]`);
  if (marker) {
    marker.classList.remove('text-gray-500');
    marker.classList.add('text-cyan-400', 'font-bold', 'scale-110');
  }
  autoScrollGrid(step);
};