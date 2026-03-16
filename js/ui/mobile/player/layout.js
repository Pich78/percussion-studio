/**
 * js/ui/mobile/player/layout.js
 * 
 * Layout for P1 "The Player" — Music Player Paradigm.
 * Redesigns the mobile view as a music player:
 *   - Slim header (menu + rhythm name + status)
 *   - Grid visualization (middle, scrollable)
 *   - Section navigation bar (prev/next + section name)
 *   - Bottom control deck (large BPM slider + transport controls)
 * 
 * Reuses existing shared components (TubsGrid, icons, modals).
 */

import { state, playback } from '../../../store.js';
import { getActiveSection } from '../../../store/stateSelectors.js';
import { TubsGrid } from '../../../components/tubsGrid.js';
import { Bars3Icon } from '../../../icons/bars3Icon.js';
import { StopIcon } from '../../../icons/stopIcon.js';
import { PlayIcon } from '../../../icons/playIcon.js';
import { PauseIcon } from '../../../icons/pauseIcon.js';
import { DeviceRotateIcon } from '../../../icons/DeviceRotateIcon.js';
import { BataExplorerModal } from '../../../components/bataExplorerModal.js';
import { FolderOpenIcon } from '../../../icons/folderOpenIcon.js';
import { ChevronDownIcon } from '../../../icons/chevronDownIcon.js';
import { Timeline } from '../../../components/timeline.js';
import { viewManager } from '../../../views/viewManager.js';

// Re-export calculateMobileCellSize from standard (shared utility)
import { calculateMobileCellSize } from '../standard/layout.js';
export { calculateMobileCellSize };

// ─── Header (Slim) ─────────────────────────────────────────────────────────

const renderPlayerHeader = (activeSection) => {
  const sections = state.toque.sections;
  const totalSections = sections.length;
  const activeSectionIndex = sections.findIndex(s => s.id === state.activeSectionId) + 1;

  return `
    <header class="h-10 px-2 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-40 gap-2">
      <!-- Left: Menu -->
      <div class="flex items-center flex-shrink-0">
        <button data-action="toggle-menu" class="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
          ${Bars3Icon('w-4 h-4 pointer-events-none')}
        </button>
      </div>

      <!-- Center: Rhythm & Section Name -->
      <div class="flex items-center justify-center flex-1 min-w-0 gap-1.5 overflow-hidden">
        <span class="text-xs font-bold text-amber-400 truncate">${state.toque.name}</span>
        <span class="text-gray-600 text-xs">/</span>
        <span class="text-xs font-bold text-gray-200 truncate">${activeSection.name}</span>
        <span class="text-[9px] font-mono text-gray-500 flex-shrink-0">${activeSectionIndex}/${totalSections}</span>
      </div>

      <!-- Right: Status Badge -->
      <div class="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono bg-gray-900/50 px-1.5 py-0.5 rounded border border-gray-800/50 flex-shrink-0">
        <!-- Repetitions -->
        <span class="flex items-center gap-0.5">
          <span class="uppercase tracking-wider">Rep</span>
          <span class="text-white font-bold" id="header-rep-count">${state.isPlaying ? playback.repetitionCounter : 1}</span>
          <span class="text-gray-600">/</span>
          <span>${activeSection.repetitions || 1}</span>
        </span>
        ${activeSection.randomRepetitions ? '<span class="text-cyan-400">🎲</span>' : ''}
        <div class="h-2.5 w-px bg-gray-700"></div>
        <!-- Live BPM -->
        <span class="flex items-center gap-0.5 ${state.isPlaying ? 'text-green-400' : 'text-gray-600'} font-bold">
          <span class="text-[8px] uppercase opacity-70">BPM</span>
          <span id="header-live-bpm">${state.isPlaying ? Math.round(playback.currentPlayheadBpm) : state.toque.globalBpm}</span>
        </span>
      </div>
    </header>
  `;
};

// ─── Section Navigation Bar ─────────────────────────────────────────────────

const renderSectionBar = (activeSection) => {
  const sections = state.toque.sections;
  const totalSections = sections.length;
  const activeSectionIndex = sections.findIndex(s => s.id === state.activeSectionId) + 1;
  const hasMutipleSections = totalSections > 1;

  return `
    <div class="h-9 px-3 flex items-center justify-between bg-gray-900/80 border-t border-b border-gray-800 flex-shrink-0">
      <!-- Prev Section -->
      <button data-action="player-prev-section"
        class="w-7 h-7 rounded-md flex items-center justify-center transition-colors ${hasMutipleSections ? 'text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700' : 'text-gray-700 cursor-default'}"
        ${!hasMutipleSections ? 'disabled' : ''}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
      </button>

      <!-- Section Name -->
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-sm font-bold text-gray-100 truncate">「${activeSection.name}」</span>
        <span class="text-[10px] font-mono text-gray-500 flex-shrink-0">${activeSectionIndex} of ${totalSections}</span>
      </div>

      <!-- Next Section -->
      <button data-action="player-next-section"
        class="w-7 h-7 rounded-md flex items-center justify-center transition-colors ${hasMutipleSections ? 'text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700' : 'text-gray-700 cursor-default'}"
        ${!hasMutipleSections ? 'disabled' : ''}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
      </button>
    </div>
  `;
};

// ─── Bottom Control Deck ────────────────────────────────────────────────────

const renderControlDeck = (activeSection) => {
  const subdivision = activeSection?.subdivision || 4;
  const countInBeats = subdivision === 3 ? 6 : 4;
  const isCountingIn = playback.isCountingIn;
  const countInStep = playback.countInStep;

  const countInEnabledClass = state.countInEnabled
    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400'
    : 'bg-gray-800 border-gray-700 text-gray-500';

  const countingInClass = isCountingIn
    ? 'animate-pulse ring-2 ring-cyan-400'
    : '';

  const bpmPercent = ((state.toque.globalBpm - 40) / 200) * 100;

  return `
    <div class="flex-shrink-0 bg-gray-950 border-t border-gray-800 px-3 py-2 flex flex-col gap-2">
      <!-- BPM Slider (Large) -->
      <div class="flex items-center gap-3">
        <div class="flex flex-col items-start leading-none flex-shrink-0">
          <span class="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Tempo</span>
          <span class="text-sm font-mono font-bold text-cyan-400" id="header-global-bpm">${state.toque.globalBpm} <span class="text-[9px] text-gray-600">BPM</span></span>
        </div>
        <div class="relative flex-1 h-8 flex items-center group/bpm cursor-pointer">
          <!-- Background track -->
          <div class="absolute left-0 right-0 h-2 bg-gray-700 rounded-full cursor-pointer"></div>
          <!-- Fill bar -->
          <div class="absolute left-0 h-2 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full cursor-pointer" style="width: ${bpmPercent}%"></div>
          <!-- Handle -->
          <div class="absolute w-5 h-5 bg-white rounded-full shadow-lg border-2 border-cyan-400 cursor-pointer z-[15]" style="left: calc(${bpmPercent}% - 10px)"></div>
          <!-- Range input (invisible) -->
          <input type="range" min="40" max="240" value="${state.toque.globalBpm}" data-action="update-global-bpm"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
        </div>
      </div>

      <!-- Transport Controls Row -->
      <div class="flex items-center justify-between gap-2">
        <!-- Rep & Random -->
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-lg border border-gray-800">
            <span class="text-[9px] font-bold text-gray-500 uppercase">Rep</span>
            <span class="text-sm font-mono font-bold text-white">×${activeSection.repetitions || 1}</span>
          </div>
          ${activeSection.randomRepetitions ? `
          <div class="flex items-center gap-0.5 bg-cyan-900/20 px-2 py-1 rounded-lg border border-cyan-800/50">
            <span class="text-sm">🎲</span>
            <span class="text-[9px] text-cyan-400 font-bold uppercase">On</span>
          </div>
          ` : ''}
        </div>

        <!-- Count-in + Play/Stop -->
        <div class="flex items-center gap-1.5">
          <!-- Count-in -->
          <button data-action="toggle-count-in" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all ${countInEnabledClass} ${countingInClass}">
            <span class="text-[9px] font-bold uppercase">Cnt</span>
            <span class="font-mono font-bold text-sm">${isCountingIn ? countInStep : countInBeats}</span>
          </button>

          <!-- Stop -->
          <button data-action="stop" class="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-all border border-gray-700">
            ${StopIcon('w-5 h-5 pointer-events-none')}
          </button>

          <!-- Play/Pause -->
          <button data-action="toggle-play" class="w-10 h-10 rounded-lg flex items-center justify-center transition-all shadow-lg ${state.isPlaying ? 'bg-amber-500/15 text-amber-500 border border-amber-500/50' : 'bg-green-600 text-white shadow-green-900/30 border border-green-500'}">
            ${state.isPlaying ? PauseIcon('w-5 h-5 pointer-events-none') : PlayIcon('w-5 h-5 ml-0.5 pointer-events-none')}
          </button>
        </div>
      </div>
    </div>
  `;
};

// ─── Shared Modals (imported pattern from standard layout) ──────────────────

const renderSharedModals = (activeSection) => {
  const sections = state.toque.sections;
  const totalSections = sections.length;
  const hasMutipleSections = totalSections > 1;
  const activeSectionIndex = sections.findIndex(s => s.id === state.activeSectionId) + 1;
  const activeViewId = viewManager.getActiveViewId();

  let modals = '';

  // ─── Mobile Menu Modal ──────────────────────────────────────────────────
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
              <!-- View Mode -->
              <button data-action="open-view-mode" class="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/50">
                <div class="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-green-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <span class="text-gray-100 font-medium text-base">View Mode</span>
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
              <!-- User Guide -->
              <button data-action="toggle-user-guide-submenu" class="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-gray-700/50 active:bg-gray-700 transition-colors ${state.uiState.userGuideSubmenuOpen ? '' : 'rounded-b-2xl'}">
                <div class="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-purple-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                </div>
                <span class="text-gray-100 font-medium text-base">User Guide</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500 ml-auto pointer-events-none transition-transform duration-200 ${state.uiState.userGuideSubmenuOpen ? 'rotate-90' : ''}"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
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
    `;
  }

  // ─── Structure Modal ──────────────────────────────────────────────────
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
          <div class="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
            Select a section to switch playback.
          </div>
        </div>
      </div>
    `;
  }

  // ─── View Mode Modal ──────────────────────────────────────────────────
  if (state.uiState.modalOpen && state.uiState.modalType === 'viewMode') {
    const isStandard = activeViewId === 'mobile-grid';
    const isPlayer = activeViewId === 'mobile-player';
    const isPlayerMixer = activeViewId === 'mobile-player-mixer';
    const isDashboard = activeViewId === 'mobile-dashboard';

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
            <!-- Standard Layout -->
            <div class="mb-4">
              <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-2">Current</h3>
              <div class="bg-gray-800/50 rounded-2xl border border-gray-700/50">
                <button data-action="select-view-mode" data-view-id="standard" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-t-2xl border-b border-gray-700/30">
                  <div class="w-7 h-7 rounded-lg bg-gray-600/30 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-300 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                  </div>
                  <span class="text-gray-100 text-sm font-medium">Standard</span>
                  ${isStandard ? activeTag : '<span class="text-[10px] text-gray-500 ml-auto">Classic grid layout</span>'}
                </button>
                <!-- P1: The Player -->
                <button data-action="select-view-mode" data-view-id="p1" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                  <div class="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-amber-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>
                  </div>
                  <span class="text-gray-100 text-sm font-medium">The Player</span>
                  ${isPlayer ? activeTag : '<span class="text-[10px] text-gray-500 ml-auto">Music player paradigm</span>'}
                </button>
                <!-- P1a: Player + Mixer -->
                <button data-action="select-view-mode" data-view-id="p1a" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                  <div class="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-emerald-400 pointer-events-none">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                  </div>
                  <span class="text-gray-100 text-sm font-medium">Player + Mixer</span>
                  ${isPlayerMixer ? activeTag : '<span class="text-[10px] text-gray-500 ml-auto">Mixer on swipe</span>'}
                </button>
                <button data-action="select-view-mode" data-view-id="p2" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-b-2xl">
                  <div class="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-cyan-400 pointer-events-none">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
                    </svg>
                  </div>
                  <span class="text-gray-100 text-sm font-medium">The Dashboard</span>
                  ${isDashboard ? activeTag : '<span class="text-[10px] text-gray-500 ml-auto">Card-based navigator</span>'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ─── User Guide Modal ──────────────────────────────────────────────────
  if (state.uiState.modalOpen && state.uiState.modalType === 'userGuide') {
    modals += `
      <div class="fixed inset-0 z-50 flex flex-col">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-modal-bg"></div>
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
    `;
  }

  // ─── Bata Explorer ──────────────────────────────────────────────────
  modals += BataExplorerModal({ isMobile: true, bataExplorer: state.uiState.bataExplorer });

  return modals;
};

// ─── Main Player Layout ─────────────────────────────────────────────────────

export const PlayerLayout = () => {
  const activeSection = getActiveSection(state) || state.toque.sections[0];

  // Calculate cell size for grid
  const viewportWidth = window.innerWidth;
  const computedStyle = getComputedStyle(document.documentElement);
  const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
  const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;
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
          <div class="relative w-20 h-20">
            <div class="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <h2 class="text-xl font-bold text-white mb-2">Loading</h2>
        <p class="text-cyan-400 text-lg font-semibold">${state.uiState.loadingRhythmName || 'Rhythm'}</p>
      </div>
      ` : ''}

      <!-- Main content - landscape only -->
      <div class="landscape-only flex flex-col flex-1 overflow-hidden">
        ${renderPlayerHeader(activeSection)}
        
        <!-- Grid Area (fills remaining space) -->
        <div class="flex flex-1 overflow-hidden">
          <main class="flex-1 overflow-hidden relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
            <div id="grid-container" class="w-full max-w-7xl py-1 flex flex-col items-center justify-center overflow-hidden h-full no-pinch-zoom">
              ${TubsGrid({
                section: activeSection,
                globalBpm: state.toque.globalBpm,
                currentStep: state.currentStep,
                selectedStroke: state.selectedStroke,
                uiState: state.uiState,
                readOnly: true,
                isMobile: true,
                mobileCellSize,
                instrumentDefinitions: state.instrumentDefinitions,
                isPlaying: state.isPlaying
              })}
            </div>
          </main>
        </div>

        <!-- Section Navigation Bar -->
        ${renderSectionBar(activeSection)}

        <!-- Bottom Control Deck -->
        ${renderControlDeck(activeSection)}
      </div>

      <!-- Shared Modals -->
      ${renderSharedModals(activeSection)}
    </div>
  `;
};
