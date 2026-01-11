import { state, playback } from '../../store.js';
import { Timeline } from '../../components/timeline.js';
import { TubsGrid } from '../../components/tubsGrid.js';
import { Controls } from '../../components/controls.js';
import { Bars3Icon } from '../../icons/bars3Icon.js';
import { DocumentPlusIcon } from '../../icons/documentPlusIcon.js';
import { FolderOpenIcon } from '../../icons/folderOpenIcon.js';
import { ArrowDownTrayIcon } from '../../icons/arrowDownTrayIcon.js';
import { StopIcon } from '../../icons/stopIcon.js';
import { PlayIcon } from '../../icons/playIcon.js';
import { PauseIcon } from '../../icons/pauseIcon.js';

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
                    <button data-action="download-rhythm" class="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2 border-b border-gray-800">
                        ${ArrowDownTrayIcon('w-4 h-4 text-green-500 pointer-events-none')} Download Rhythm
                    </button>
                    ${window.location.hostname.includes('github.io') ? `
                    <button data-action="share-rhythm" class="w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 border-b border-gray-800 ${state.rhythmSource === 'repo' ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 cursor-not-allowed'}" ${state.rhythmSource !== 'repo' ? 'disabled title="Only rhythms from the library can be shared"' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 ${state.rhythmSource === 'repo' ? 'text-blue-400' : 'text-gray-600'} pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                        Share Rhythm${state.rhythmSource !== 'repo' ? ' (N/A)' : ''}
                    </button>
                    ` : ''}
                    <div class="relative">
                        <button data-action="toggle-user-guide-submenu" class="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-between gap-2">
                            <span class="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-purple-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                                User Guide
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 pointer-events-none ${state.uiState.userGuideSubmenuOpen ? 'rotate-90' : ''}"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>
                        ${state.uiState.userGuideSubmenuOpen ? `
                        <div class="border-t border-gray-800 bg-gray-800/50">
                            <button data-action="open-user-guide" data-lang="en" class="w-full text-left px-6 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2">
                                <span class="w-5 h-5 flex items-center justify-center text-xs font-bold text-blue-400 bg-blue-400/10 rounded">EN</span> English
                            </button>
                            <button data-action="open-user-guide" data-lang="it" class="w-full text-left px-6 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2">
                                <span class="w-5 h-5 flex items-center justify-center text-xs font-bold text-green-400 bg-green-400/10 rounded">IT</span> Italiano
                            </button>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="fixed inset-0 z-40 bg-transparent" data-action="close-menu"></div>
          ` : ''}
        </div>
        <h1 class="text-xl font-bold text-gray-100 whitespace-nowrap hidden sm:block">Percussion Studio</h1>
        <div class="h-6 w-px bg-gray-800 hidden sm:block"></div>
        <div class="flex items-center gap-3 min-w-0 overflow-hidden flex-1">
           <span class="text-amber-400 font-bold text-lg truncate whitespace-nowrap">${state.toque.name}</span>
           <span class="text-gray-600">/</span>
           <span class="text-gray-200 font-bold text-lg truncate whitespace-nowrap">${activeSection.name}</span>
           <div class="flex items-center gap-1 ml-2 bg-gray-900 px-2 py-0.5 rounded border border-gray-800 flex-shrink-0">
              <span class="text-[10px] uppercase font-bold text-gray-500">Rep</span>
              <span class="font-mono font-bold ${state.isPlaying ? 'text-green-400' : 'text-gray-400'}" id="header-rep-count">
                ${state.isPlaying ? playback.repetitionCounter : 1}
              </span>
              <span class="text-gray-600 font-mono">/</span>
              <span class="text-gray-500 font-mono">${activeSection.repetitions || 1}</span>
           </div>
           <div class="flex items-center gap-1 ml-2 bg-gray-900 px-2 py-0.5 rounded border border-gray-800 flex-shrink-0 border-l-2 ${state.isPlaying ? 'border-l-green-500/50' : 'border-l-gray-700'}">
              <span class="text-[10px] uppercase font-bold text-gray-500">Live</span>
              <span class="font-mono font-bold ${state.isPlaying ? 'text-green-400' : 'text-gray-500'}" id="header-live-bpm">
                ${state.isPlaying ? Math.round(playback.currentPlayheadBpm) : state.toque.globalBpm}
              </span>
              <span class="text-[9px] text-gray-600">BPM</span>
           </div>
        </div>
      </div>
      <div class="flex items-center gap-4 flex-shrink-0">
        <div class="flex items-center gap-3 bg-gray-900 px-3 py-2 rounded-lg border border-gray-800">
          <div class="flex flex-col items-end leading-none">
              <span class="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Global</span>
              <span class="text-xs font-mono font-bold text-cyan-400" id="header-global-bpm">${state.toque.globalBpm} <span class="text-[9px] text-gray-600">BPM</span></span>
          </div>
          <input type="range" min="40" max="240" value="${state.toque.globalBpm}" data-action="update-global-bpm" class="w-40 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400" />
        </div>
        <div class="flex items-center gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
          <button data-action="stop" class="w-10 h-10 rounded-md flex items-center justify-center bg-gray-800 hover:bg-red-900/40 hover:text-red-400 text-gray-400 transition-all border border-transparent hover:border-red-900/50">
            ${StopIcon('w-5 h-5 pointer-events-none')}
          </button>
          <button data-action="toggle-play" class="w-10 h-10 rounded-md flex items-center justify-center transition-all shadow-lg ${state.isPlaying ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500/20' : 'bg-green-600 text-white hover:bg-green-500 shadow-green-900/20'}">
            ${state.isPlaying ? PauseIcon('w-6 h-6 pointer-events-none') : PlayIcon('w-6 h-6 ml-0.5 pointer-events-none')}
          </button>
        </div>
      </div>
    </header>
  `;
};

const renderUserGuideModal = () => {
  if (!state.uiState.modalOpen || state.uiState.modalType !== 'userGuide') return '';

  const langLabel = state.uiState.userGuideLanguage === 'it' ? 'Italiano' : 'English';

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" data-action="close-modal-bg">
      <div class="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-purple-400"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
            User Guide <span class="text-sm text-gray-500 font-normal">(${langLabel})</span>
          </h3>
          <button data-action="close-modal" class="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 prose prose-invert prose-sm max-w-none" id="user-guide-content">
          ${state.uiState.userGuideContent || '<div class="text-center text-gray-500 py-8">Loading...</div>'}
        </div>
        <div class="p-4 border-t border-gray-800 bg-gray-950 flex justify-end flex-shrink-0">
          <button data-action="close-modal" class="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
};

export const DesktopLayout = () => {
  const activeSection = state.toque.sections.find(s => s.id === state.activeSectionId) || state.toque.sections[0];

  return `
    <div class="flex flex-col h-full bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500 selection:text-black select-none">
      ${renderHeader()}
      <div class="flex flex-1 overflow-hidden">
        <div class="block flex-shrink-0 h-full"> 
            ${Timeline({
    sections: state.toque.sections,
    globalBpm: state.toque.globalBpm,
    activeSectionId: state.activeSectionId,
    rhythmName: state.toque.name,
    readOnly: false
  })}
        </div>
        <main class="flex-1 overflow-hidden relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
          <div id="grid-container" class="w-full max-w-7xl px-4 py-8 flex flex-col items-center justify-center overflow-hidden h-full">
            ${TubsGrid({
    section: activeSection,
    globalBpm: state.toque.globalBpm,
    currentStep: state.currentStep,
    selectedStroke: state.selectedStroke,
    uiState: state.uiState,
    readOnly: false
  })}
          </div>
        </main>
      </div>
      ${Controls({ selectedStroke: state.selectedStroke })}
    </div>
    ${renderUserGuideModal()}
  `;
};
