/**
 * js/ui/mobile/dashboard-playlist/layout.js
 *
 * Layout for P2C "The Dashboard - Playlist Mode".
 * Sections are listed vertically like a music playlist queue.
 * Each row shows section info, and a "Now Playing" bar resides at the bottom.
 */

import { state, playback } from '../../../store.js';
import { getActiveSection } from '../../../store/stateSelectors.js';
import { Bars3Icon } from '../../../icons/bars3Icon.js';
import { StopIcon } from '../../../icons/stopIcon.js';
import { PlayIcon } from '../../../icons/playIcon.js';
import { PauseIcon } from '../../../icons/pauseIcon.js';
import { DeviceRotateIcon } from '../../../icons/DeviceRotateIcon.js';
import { FolderOpenIcon } from '../../../icons/folderOpenIcon.js';
import { BataExplorerModal } from '../../../components/bataExplorerModal.js';
import { Timeline } from '../../../components/timeline.js';
import { viewManager } from '../../../views/viewManager.js';

// ─── Header (Slim) ──────────────────────────────────────────────────────────

const renderDashboardHeader = () => {
  return `
    <header class="h-12 px-3 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-40 gap-3">
      <div class="flex items-center flex-shrink-0">
        <button data-action="toggle-menu" class="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
          ${Bars3Icon('w-5 h-5 pointer-events-none')}
        </button>
      </div>
      <div class="flex items-center justify-center flex-1 min-w-0 overflow-hidden">
        <span class="text-sm font-bold text-amber-400 truncate">${state.toque.name}</span>
      </div>
      <div class="w-8"></div> <!-- Spacer for balance -->
    </header>
  `;
};

// ─── Playlist Queue ──────────────────────────────────────────────────────────

const renderPlaylistRow = (section, isActive, sectionIndex) => {
  const subdivision = section?.subdivision || 4;
  const meter = `${subdivision === 3 ? 6 : 4}/${subdivision === 3 ? 8 : 4}`;
  
  const activeClass = isActive 
    ? 'bg-cyan-900/20 border-cyan-500/40 shadow-md ring-1 ring-cyan-500/20'
    : 'bg-gray-900/50 hover:bg-gray-800/80 border-gray-800/60';

  const indicator = isActive 
    ? `<div class="w-2 h-2 rounded-full bg-cyan-400 ${state.isPlaying ? 'animate-pulse ring-4 ring-cyan-500/30' : ''}"></div>`
    : `<div class="w-6 h-6 rounded flex items-center justify-center text-xs font-mono text-gray-500 bg-gray-900/40 border border-gray-800/30">${sectionIndex + 1}</div>`;

  return `
    <button data-action="select-section-item" data-section-id="${section.id}"
      class="w-full flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 text-left mb-2.5 snap-center ${activeClass}">
      
      <!-- Drag Handle Icon (Visual only) -->
      <div class="flex-shrink-0 text-gray-600 pl-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 opacity-50">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
        </svg>
      </div>
      
      <!-- Indicator -->
      <div class="flex-shrink-0 w-6 flex justify-center items-center">
        ${indicator}
      </div>
      
      <!-- Main Content -->
      <div class="flex-1 min-w-0 flex flex-col justify-center gap-1 shrink pb-0.5">
        <div class="flex items-center gap-2">
          <span class="text-[15px] font-bold truncate tracking-tight ${isActive ? 'text-cyan-50 shadow-cyan-900 drop-shadow-sm' : 'text-gray-200'}">${section.name}</span>
          ${section.randomRepetitions ? '<span class="text-[10px] bg-cyan-900/50 text-cyan-300 px-1 rounded pb-[1px]" title="Random">🎲</span>' : ''}
        </div>
        <div class="flex items-center gap-2 text-[11px] font-mono ${isActive ? 'text-cyan-300/80' : 'text-gray-500'}">
          <span>${meter}</span>
          <span class="text-gray-700">·</span>
          <span>${section.steps || 16} stp</span>
        </div>
      </div>
      
      <!-- Rep count & Settings -->
      <div class="flex items-center flex-shrink-0 pr-1">
         <div class="flex flex-col items-end gap-0.5">
             <span class="text-[9px] uppercase font-bold ${isActive ? 'text-cyan-500/60' : 'text-gray-600'}">Reps</span>
             <span class="text-sm font-mono font-bold ${isActive ? 'text-cyan-300' : 'text-gray-400'}">×${section.repetitions || 1}</span>
         </div>
      </div>
    </button>
  `;
};

const renderPlaylistContainer = () => {
  const sections = state.toque.sections;
  return `
    <div class="flex-1 flex flex-col overflow-hidden px-3 pt-4 gap-2 bg-gray-950 relative">
       <!-- Gradient overlay for smooth scrolling fade at top -->
       <div class="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-950 to-transparent z-10 pointer-events-none"></div>
       
       <div class="flex items-center justify-between mb-2 px-1">
           <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Sections Queue</span>
           <span class="text-[10px] font-mono text-gray-600 uppercase">${sections.length} parts</span>
       </div>
       
       <div class="flex-1 overflow-y-auto no-scrollbar pb-36 scroll-smooth z-0" id="playlist-container">
          ${sections.map((s, i) => renderPlaylistRow(s, s.id === state.activeSectionId, i)).join('')}
       </div>
    </div>
  `;
};

// ─── Now Playing Footer ──────────────────────────────────────────────────────

const renderNowPlayingFooter = (activeSection) => {
  const bpmPercent = ((state.toque.globalBpm - 40) / 200) * 100;
  
  return `
    <div class="absolute bottom-0 left-0 right-0 p-3 pt-0 pb-[env(safe-area-inset-bottom,12px)] z-30 pointer-events-none" style="padding-bottom: max(env(safe-area-inset-bottom, 12px), 12px);">
      <!-- Now Playing Card -->
      <div class="bg-gray-900/90 backdrop-blur-xl rounded-[20px] border border-gray-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-3 flex flex-col gap-3.5 pointer-events-auto ring-1 ring-white/5">
        
        <!-- Top Row: Info & Play Controls -->
        <div class="flex items-center justify-between pl-1">
           <!-- Thumbnail / Icon -->
           <div class="w-11 h-11 rounded-[14px] bg-gradient-to-br from-cyan-900 to-gray-800 flex items-center justify-center flex-shrink-0 border border-cyan-500/20 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-cyan-300">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              </svg>
           </div>
           
           <!-- Title -->
           <div class="flex-1 min-w-0 px-3.5 flex flex-col justify-center">
              <span class="text-[15px] font-bold text-white truncate drop-shadow-md leading-tight pb-0.5">${activeSection.name}</span>
              <div class="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                  <span class="${state.isPlaying ? 'text-green-400' : 'text-cyan-400'} font-bold">♩=${state.isPlaying ? Math.round(playback.currentPlayheadBpm) : state.toque.globalBpm}</span>
                  <span class="text-gray-500 flex items-center gap-0.5">
                    · Rep <span class="bg-gray-800 text-gray-200 px-1 rounded pb-[1px]" id="header-rep-count">${state.isPlaying ? playback.repetitionCounter : 1}</span> / ${activeSection.repetitions || 1}
                  </span>
              </div>
           </div>
           
           <!-- Play/Stop -->
           <div class="flex items-center gap-2.5 flex-shrink-0">
              <button data-action="stop" class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800/80 text-gray-400 hover:text-red-400 hover:bg-red-900/30 active:scale-95 transition-all border border-gray-700/80">
                 ${StopIcon('w-4 h-4 pointer-events-none')}
              </button>
              <button data-action="toggle-play" class="w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] active:scale-95 ${state.isPlaying ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-amber-500/20' : 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-500/20 border-t border-white/20'}">
                 ${state.isPlaying ? PauseIcon('w-7 h-7 pointer-events-none') : PlayIcon('w-7 h-7 ml-1 pointer-events-none')}
              </button>
           </div>
        </div>

        <!-- Bottom Row: Progress/BPM Slider -->
        <div class="flex items-center gap-2.5 px-1 pb-1">
            <span class="text-[10px] font-mono text-gray-500 flex-shrink-0 font-medium">40</span>
            <div class="relative flex-1 h-6 flex items-center group/bpm cursor-pointer -my-2 py-2">
                <!-- Track Background -->
                <div class="absolute left-0 right-0 h-1.5 bg-gray-800/80 rounded-full inset-y-auto shadow-inner"></div>
                <!-- Track Fill (Tempo) -->
                <div class="absolute left-0 h-1.5 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full pointer-events-none shadow-[0_0_10px_rgba(34,211,238,0.3)]" style="width: ${bpmPercent}%"></div>
                <!-- Handle -->
                <div class="absolute w-4 h-4 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)] border-[2.5px] border-cyan-400 pointer-events-none transition-transform" style="left: calc(${bpmPercent}% - 8px)"></div>
                <!-- Range input -->
                <input type="range" min="40" max="240" step="1" value="${state.toque.globalBpm}" data-action="update-global-bpm"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            </div>
            <span class="text-[10px] font-mono text-gray-500 flex-shrink-0 font-medium">240</span>
        </div>
      </div>
    </div>
  `;
};

// ─── Shared Modals ───────────────────────────────────────────────────────────

const renderSharedModals = () => {
  const activeViewId = viewManager.getActiveViewId();
  let modals = '';

  if (state.uiState.isMenuOpen) {
    modals += `
      <div class="fixed inset-0 z-50 flex flex-col">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-menu"></div>
        <div class="relative w-4/5 max-w-sm h-full bg-gray-900 border-r border-gray-800 shadow-2xl flex flex-col animate-in fade-in slide-in-from-left duration-200 ml-[var(--safe-area-left)]">
          <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
            <h2 class="text-lg font-bold text-white">Percussion Studio</h2>
            <button data-action="close-menu" class="p-2 text-gray-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav class="flex-1 overflow-y-auto p-3 pb-8">
            <div class="bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <button data-action="load-rhythm" class="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/50 rounded-t-2xl">
                <div class="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  ${FolderOpenIcon('w-5 h-5 text-amber-400 pointer-events-none')}
                </div>
                <span class="text-gray-100 font-medium text-base">Load Rhythm</span>
              </button>
              <button data-action="open-structure" class="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/50">
                <div class="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-cyan-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                </div>
                <span class="text-gray-100 font-medium text-base">Show Structure</span>
              </button>
              <button data-action="open-view-mode" class="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/50">
                <div class="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-green-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <span class="text-gray-100 font-medium text-base">View Mode</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    `;
  }

  if (state.uiState.modalOpen && state.uiState.modalType === 'structure') {
    modals += `
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
        </div>
      </div>
    `;
  }

  if (state.uiState.modalOpen && state.uiState.modalType === 'viewMode') {
    const isStandard = activeViewId === 'mobile-grid';
    const isDashboard = activeViewId === 'mobile-dashboard';
    const isDashboardStack = activeViewId === 'mobile-dashboard-stack';
    const isDashboardSplit = activeViewId === 'mobile-dashboard-split-card';
    const isDashboardPlaylist = activeViewId === 'mobile-dashboard-playlist';
    const activeTag = `<span class="text-[9px] font-bold text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded ml-auto flex-shrink-0">Active</span>`;

    modals += `
      <div class="fixed inset-0 z-50 flex flex-col">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-modal-bg"></div>
        <div class="relative w-full h-full sm:w-4/5 sm:max-w-sm bg-gray-900 border-r border-gray-800 shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom duration-200 pl-[var(--safe-area-left)] pr-[var(--safe-area-right)]">
          <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
            <h2 class="text-lg font-bold text-white">View Mode</h2>
            <button data-action="close-modal" class="p-2 text-gray-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-3 pb-8">
            <div class="mb-4">
              <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-2">Current</h3>
              <div class="bg-gray-800/50 rounded-2xl border border-gray-700/50 flex flex-col">
                <button data-action="select-view-mode" data-view-id="standard" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-t-2xl border-b border-gray-700/30">
                  <span class="text-gray-100 text-sm font-medium">Standard</span>
                  ${isStandard ? activeTag : ''}
                </button>
                <button data-action="select-view-mode" data-view-id="p2" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                  <span class="text-gray-100 text-sm font-medium">P2: Dashboard</span>
                  ${isDashboard ? activeTag : ''}
                </button>
                <button data-action="select-view-mode" data-view-id="p2a" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                  <span class="text-gray-100 text-sm font-medium">P2A: Dashboard Stack</span>
                  ${isDashboardStack ? activeTag : ''}
                </button>
                <button data-action="select-view-mode" data-view-id="p2b" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                  <span class="text-gray-100 text-sm font-medium">P2B: Split Card</span>
                  ${isDashboardSplit ? activeTag : ''}
                </button>
                <button data-action="select-view-mode" data-view-id="p2c" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-b-2xl">
                  <span class="text-gray-100 text-sm font-medium">P2C: Playlist Mode</span>
                  ${isDashboardPlaylist ? activeTag : ''}
                </button>
              </div>
            </div>
            
            <div class="mb-4">
                <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-2">Back to complete menu</h3>
                <div class="text-xs text-gray-400 px-2">Use Standard view mode modal for full options</div>
            </div>
            
          </div>
        </div>
      </div>
    `;
  }

  modals += BataExplorerModal({ isMobile: true, bataExplorer: state.uiState.bataExplorer });
  return modals;
};

// ─── Main Dashboard Layout ───────────────────────────────────────────────────

export const DashboardPlaylistLayout = () => {
  const activeSection = getActiveSection(state) || state.toque.sections[0];

  return `
    <div class="flex flex-col h-full bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500 selection:text-black select-none pl-[var(--safe-area-left)] pr-[var(--safe-area-right)]">
      <div class="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center p-8 text-center portrait:flex landscape:hidden">
        <div class="animate-pulse mb-6 text-cyan-500">
          ${DeviceRotateIcon('w-24 h-24')}
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Please Rotate Your Device</h2>
        <p class="text-gray-400">Percussion Studio is designed for landscape mode.</p>
      </div>

      ${state.uiState.isLoadingRhythm ? `
      <div class="fixed inset-0 z-[90] bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
        <h2 class="text-xl font-bold text-white mb-2">Loading</h2>
      </div>
      ` : ''}

      <!-- Main content - landscape only -->
      <div class="landscape-only flex flex-col flex-1 overflow-hidden relative">
        ${renderDashboardHeader()}
        ${renderPlaylistContainer()}
        ${renderNowPlayingFooter(activeSection)}
      </div>

      <!-- Shared Modals -->
      ${renderSharedModals()}
    </div>
  `;
};
