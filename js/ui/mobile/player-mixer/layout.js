/**
 * js/ui/mobile/player-mixer/layout.js
 * 
 * Layout for P1a "Mixer on Swipe" — Player + Bottom Sheet Mixer.
 * Extends the P1 Player paradigm with a swipe-up mixer panel that
 * slides over the grid. The mixer contains per-track volume/mute controls.
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
import { MobileMenuPanel } from '../../../components/mobileMenuPanel.js';
export { calculateMobileCellSize };

// ─── Header (Slim — same as P1) ────────────────────────────────────────────

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

// ─── Section Navigation Bar (same as P1) ────────────────────────────────────

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

// ─── Mixer Bottom Sheet ─────────────────────────────────────────────────────

const renderMixerSheet = (activeSection) => {
  const tracks = activeSection?.measures?.[0]?.tracks || [];

  const trackRows = tracks.map((track, idx) => {
    const volume = track.volume ?? 1;
    const isMuted = track.muted ?? false;
    const volumePercent = Math.round(volume * 100);

    return `
      <div class="flex items-center gap-2 px-3 py-1.5 ${isMuted ? 'opacity-50' : ''}">
        <!-- Mute Toggle -->
        <button data-action="toggle-mute" data-track-index="${idx}"
          class="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors border ${isMuted
            ? 'bg-red-900/30 border-red-800/50 text-red-400'
            : 'bg-gray-800 border-gray-700 text-green-400 hover:bg-gray-700'}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 pointer-events-none">
            ${isMuted
              ? '<path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-3.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />'
              : '<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-3.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />'}
          </svg>
        </button>

        <!-- Instrument Name -->
        <span class="text-xs font-medium text-gray-300 w-20 truncate flex-shrink-0">${track.instrument}</span>

        <!-- Volume Slider -->
        <div class="relative flex-1 h-6 flex items-center group/vol cursor-pointer">
          <!-- Background track -->
          <div class="absolute left-0 right-0 h-1.5 bg-gray-700 rounded-full cursor-pointer"></div>
          <!-- Fill bar -->
          <div class="absolute left-0 h-1.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full cursor-pointer" style="width: ${volumePercent}%"></div>
          <!-- Handle -->
          <div class="absolute w-4 h-4 bg-white rounded-full shadow-md border border-emerald-400 cursor-pointer z-[15]" style="left: calc(${volumePercent}% - 8px)"></div>
          <!-- Range input (invisible) -->
          <input type="range" min="0" max="1" step="0.01" value="${volume}" data-action="update-volume" data-track-index="${idx}"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
        </div>

        <!-- Volume % -->
        <span class="text-[10px] font-mono text-gray-500 w-8 text-right font-medium">${volumePercent}%</span>
      </div>
    `;
  }).join('');

  return `
    <!-- Mixer Sheet (toggle visibility via data-action="toggle-mixer-sheet") -->
    <div id="mixer-sheet" class="absolute bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-out translate-y-full"
         style="pointer-events: none;">
      <div class="bg-gray-900/95 backdrop-blur-md border-t border-gray-700 rounded-t-2xl shadow-2xl shadow-black/60"
           style="pointer-events: auto;">
        <!-- Drag Handle -->
        <div class="flex items-center justify-center pt-2 pb-1">
          <div class="w-10 h-1 bg-gray-600 rounded-full"></div>
        </div>
        <!-- Header -->
        <div class="flex items-center justify-between px-4 pb-2">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Mixer</h3>
          <button data-action="toggle-mixer-sheet" class="text-gray-500 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
          </button>
        </div>
        <!-- Track Rows -->
        <div class="pb-3 max-h-40 overflow-y-auto">
          ${trackRows}
        </div>
      </div>
    </div>
  `;
};

// ─── Bottom Control Deck (P1 base + Mixer toggle) ───────────────────────────

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
      <!-- Mixer Toggle Handle -->
      <button data-action="toggle-mixer-sheet"
        class="flex items-center justify-center gap-1.5 py-1 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 text-emerald-400 pointer-events-none">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
        <span class="text-[9px] font-bold uppercase tracking-wider text-emerald-400 pointer-events-none">Mixer</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3 text-gray-500 pointer-events-none">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>

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

// ─── Shared Modals ──────────────────────────────────────────────────────────

const renderSharedModals = (activeSection) => {
  const sections = state.toque.sections;
  const totalSections = sections.length;
  const hasMutipleSections = totalSections > 1;
  const activeSectionIndex = sections.findIndex(s => s.id === state.activeSectionId) + 1;
  const activeViewId = viewManager.getActiveViewId();

  let modals = '';

  // ─── Mobile Menu Modal ──────────────────────────────────────────────────
  if (state.uiState.isMenuOpen) { modals += MobileMenuPanel(); }

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
    modals += ViewModeModal();
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

// ─── Main Player + Mixer Layout ─────────────────────────────────────────────

export const PlayerMixerLayout = () => {
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
        
        <!-- Grid Area (fills remaining space) — relative for mixer sheet positioning -->
        <div class="flex flex-1 overflow-hidden relative">
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

          <!-- Mixer Bottom Sheet (positioned absolutely over the grid) -->
          ${renderMixerSheet(activeSection)}
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
