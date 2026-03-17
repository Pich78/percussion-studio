/**
 * js/ui/mobile/dashboard-split-card/layout.js
 *
 * Layout for P2B "The Dashboard - Split Card".
 * Replaces the grid-first view with a section-first card navigator where each card is split:
 *   - Left half: Section info + settings (BPM, reps, random, mini mixer)
 *   - Right half: Mini grid preview (compressed, read-only)
 */

import { state, playback } from '../../../store.js';
import { getActiveSection } from '../../../store/stateSelectors.js';
import { TubsGrid } from '../../../components/tubsGrid.js';
import { Bars3Icon } from '../../../icons/bars3Icon.js';
import { StopIcon } from '../../../icons/stopIcon.js';
import { PlayIcon } from '../../../icons/playIcon.js';
import { PauseIcon } from '../../../icons/pauseIcon.js';
import { DeviceRotateIcon } from '../../../icons/DeviceRotateIcon.js';
import { FolderOpenIcon } from '../../../icons/folderOpenIcon.js';
import { ChevronDownIcon } from '../../../icons/chevronDownIcon.js';
import { BataExplorerModal } from '../../../components/bataExplorerModal.js';
import { Timeline } from '../../../components/timeline.js';
import { viewManager } from '../../../views/viewManager.js';
import { calculateMobileCellSize } from '../standard/layout.js';

export { calculateMobileCellSize };

// ─── Header (Slim) ──────────────────────────────────────────────────────────

const renderDashboardHeader = () => {
  return `
    <header class="h-10 px-2 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-40 gap-2">
      <div class="flex items-center flex-shrink-0">
        <button data-action="toggle-menu" class="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
          ${Bars3Icon('w-4 h-4 pointer-events-none')}
        </button>
      </div>
      <div class="flex items-center justify-center flex-1 min-w-0 overflow-hidden">
        <span class="text-xs font-bold text-amber-400 truncate">${state.toque.name}</span>
      </div>
      <div class="flex items-center gap-1 flex-shrink-0">
        <button data-action="stop" class="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-all border border-gray-700">
          ${StopIcon('w-4 h-4 pointer-events-none')}
        </button>
        <button data-action="toggle-play" class="w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-lg ${state.isPlaying ? 'bg-amber-500/15 text-amber-500 border border-amber-500/50' : 'bg-green-600 text-white shadow-green-900/30 border border-green-500'}">
          ${state.isPlaying ? PauseIcon('w-4 h-4 pointer-events-none') : PlayIcon('w-4 h-4 ml-0.5 pointer-events-none')}
        </button>
      </div>
    </header>
  `;
};

// ─── Mini Mixer Row (per track) ─────────────────────────────────────────────

const renderMiniMixerRow = (track, trackIndex) => {
  const isMuted = track.muted;
  const volume = state.mix?.[track.instrument]?.volume ?? 1.0;
  const volumePct = Math.round(volume * 100);

  return `
    <div class="flex items-center gap-2 py-0.5">
      <button data-action="toggle-mute" data-track-index="${trackIndex}"
        class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${isMuted ? 'bg-red-900/40 text-red-400' : 'bg-gray-700/50 text-gray-400 hover:text-gray-200'}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 pointer-events-none">
          ${isMuted
            ? '<path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />'
            : '<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />'
          }
        </svg>
      </button>
      <span class="text-[10px] text-gray-400 w-14 truncate flex-shrink-0 ${isMuted ? 'line-through opacity-50' : ''}">${track.instrument}</span>
      <div class="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all ${isMuted ? 'bg-gray-600' : 'bg-gradient-to-r from-cyan-700 to-cyan-400'}" style="width: ${isMuted ? 0 : volumePct}%"></div>
      </div>
      <span class="text-[9px] font-mono text-gray-600 w-7 text-right flex-shrink-0">${isMuted ? '✕' : volumePct + '%'}</span>
    </div>
  `;
};

// ─── Single Section Card (Split Layout) ──────────────────────────────────────

const renderSectionCard = (section, isActive, sectionIndex, totalSections) => {
  const bpmPercent = ((state.toque.globalBpm - 40) / 200) * 100;
  const subdivision = section?.subdivision || 4;
  const meter = `${subdivision === 3 ? 6 : 4}/${subdivision === 3 ? 8 : 4}`;
  const tracks = section?.measures?.[0]?.tracks || [];

  const cardBorder = isActive
    ? 'border-cyan-500/50 ring-1 ring-cyan-500/30'
    : 'border-gray-700/50';

  const repDisplay = section.repetitions > 1
    ? `<span class="text-xs font-mono font-bold text-white">×${section.repetitions}</span>`
    : `<span class="text-xs font-mono text-gray-500">×1</span>`;

  // Mini Grid configuration
  // For the right pane, we compute a strict miniature cell size
  const steps = section?.steps || 12;
  const viewportWidth = window.innerWidth;
  // Estimate right pane width (approx 40% of standard usable width)
  const computedStyle = getComputedStyle(document.documentElement);
  const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
  const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;
  const usableWidth = viewportWidth - safeAreaLeft - safeAreaRight;
  const rightPaneWidth = usableWidth * 0.45; // slightly under half for grid
  const cellWidthRaw = Math.floor(rightPaneWidth / steps);
  const mobileCellSize = Math.max(8, Math.min(24, cellWidthRaw - 2)); // keep it smaller

  return `
    <div class="dashboard-card flex-shrink-0 w-full h-full flex flex-row bg-gray-900/80 rounded-2xl border ${cardBorder} snap-center overflow-hidden"
         data-section-id="${section.id}"
         data-card-index="${sectionIndex}">

      <!-- Left Panel: Settings & Info -->
      <div class="flex-1 flex flex-col p-3 gap-2 min-w-0 border-r border-gray-800">
        <!-- Card Header: Section Name + Active indicator -->
        <div class="flex items-start justify-between gap-2 flex-shrink-0">
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              ${isActive ? `<div class="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 ${state.isPlaying ? 'animate-pulse' : ''}"></div>` : '<div class="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0"></div>'}
              <span class="text-sm font-bold text-gray-100 truncate">「${section.name}」</span>
            </div>
            <div class="flex items-center gap-2 mt-0.5 pl-3.5">
              <span class="text-[10px] font-mono text-gray-500">${meter} · ${section.steps || 16} steps</span>
              <span class="text-[10px] font-mono text-gray-600">${sectionIndex + 1}/${totalSections}</span>
            </div>
          </div>
        </div>

        <!-- BPM Slider (inline, only shown on active card) -->
        ${isActive ? `
        <div class="flex items-center gap-2 flex-shrink-0">
          <div class="flex flex-col items-start leading-none flex-shrink-0">
            <span class="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Tempo</span>
            <span class="text-sm font-mono font-bold text-cyan-400" id="header-global-bpm">${state.toque.globalBpm} <span class="text-[9px] text-gray-600">BPM</span></span>
          </div>
          <div class="relative flex-1 h-8 flex items-center group/bpm cursor-pointer pr-2">
            <!-- Track -->
            <div class="absolute left-0 right-0 h-1.5 bg-gray-700 rounded-full"></div>
            <!-- Fill -->
            <div class="absolute left-0 h-1.5 bg-gradient-to-r from-cyan-700 to-cyan-400 rounded-full" style="width: ${bpmPercent}%"></div>
            <!-- Handle -->
            <div class="absolute w-4 h-4 bg-white rounded-full shadow-lg border-2 border-cyan-400 z-[15]" style="left: calc(${bpmPercent}% - 8px)"></div>
            <!-- Range input -->
            <input type="range" min="40" max="240" value="${state.toque.globalBpm}" data-action="update-global-bpm"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
          </div>
        </div>
        ` : `
        <!-- BPM display (read-only for inactive cards) -->
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <span class="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Tempo</span>
          <span class="text-xs font-mono text-gray-500">${state.toque.globalBpm} BPM</span>
        </div>
        `}

        <!-- Rep + Random row -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <div class="flex items-center gap-1 bg-gray-800/60 px-2 py-1 rounded-lg border border-gray-700/50">
            <span class="text-[9px] font-bold text-gray-500 uppercase">Rep</span>
            ${repDisplay}
          </div>
          ${section.randomRepetitions ? `
          <div class="flex items-center gap-0.5 bg-cyan-900/20 px-2 py-1 rounded-lg border border-cyan-800/40">
            <span class="text-xs">🎲</span>
            <span class="text-[9px] text-cyan-400 font-bold uppercase">Rand</span>
          </div>
          ` : ''}
          ${isActive && state.isPlaying ? `
          <div class="flex items-center gap-1 ml-auto">
            <span class="text-[9px] text-gray-500 uppercase">Rep</span>
            <span class="text-xs font-mono font-bold text-white" id="header-rep-count">${playback.repetitionCounter}</span>
            <span class="text-[9px] text-gray-600">/${section.repetitions || 1}</span>
          </div>
          ` : ''}
        </div>

        <!-- Mini Mixer (scrollable, fills remaining space) -->
        <div class="flex-1 overflow-y-auto min-h-0 pr-2">
          <div class="flex flex-col gap-0.5">
            ${tracks.length > 0
              ? tracks.map((track, i) => renderMiniMixerRow(track, i)).join('')
              : `<span class="text-[10px] text-gray-600 italic">No tracks</span>`
            }
          </div>
        </div>
      </div>

      <!-- Right Panel: Mini Grid Preview -->
      <!-- We scale the entire sub-grid structure or just rely on a small mobileCellSize -->
      <div class="w-[45%] flex-shrink-0 flex items-center justify-center p-1 overflow-hidden relative" style="container-type: inline-size;">
        <div class="w-full flex justify-center transform origin-left scale-75 md:scale-90 opacity-70">
            ${TubsGrid({
                section: section,
                globalBpm: state.toque.globalBpm,
                currentStep: isActive ? state.currentStep : -1, // Only show playhead on active
                selectedStroke: state.selectedStroke,
                uiState: state.uiState,
                readOnly: true, // Grid is completely non-interactive
                isMobile: true,
                mobileCellSize: mobileCellSize,
                instrumentDefinitions: state.instrumentDefinitions,
                isPlaying: state.isPlaying && isActive,
                hideLabels: true // Important: hide labels in this mini preview
            })}
        </div>
      </div>
    </div>
  `;
};

// ─── Section Card Carousel ───────────────────────────────────────────────────

const renderCardCarousel = (activeSection) => {
  const sections = state.toque.sections;
  const totalSections = sections.length;
  const activeSectionIndex = sections.findIndex(s => s.id === state.activeSectionId);
  const hasMutipleSections = totalSections > 1;

  return `
    <div class="flex-1 flex flex-col overflow-hidden px-3 py-2 gap-2">
      <div id="dashboard-cards-container" class="flex-1 relative overflow-hidden">
        <div id="dashboard-cards-strip"
          class="flex h-full gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
          style="scroll-padding: 0;">
          ${sections.map((s, i) =>
            `<div class="flex-shrink-0 snap-center" style="width: 100%; height: 100%;">
              ${renderSectionCard(s, s.id === state.activeSectionId, i, totalSections)}
            </div>`
          ).join('')}
        </div>
      </div>

      <div class="flex items-center justify-center gap-4 flex-shrink-0 h-7">
        <button data-action="player-prev-section"
          class="w-7 h-7 rounded-md flex items-center justify-center transition-colors ${hasMutipleSections ? 'text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700' : 'text-gray-700 cursor-default'}"
          ${!hasMutipleSections ? 'disabled' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>

        <div class="flex items-center gap-1.5">
          ${sections.map((s, i) => {
            const isActive = s.id === state.activeSectionId;
            return `<button data-action="select-section-item" data-section-id="${s.id}"
              class="rounded-full transition-all ${isActive ? 'w-4 h-1.5 bg-cyan-400' : 'w-1.5 h-1.5 bg-gray-600 hover:bg-gray-400'}">
            </button>`;
          }).join('')}
        </div>

        <button data-action="player-next-section"
          class="w-7 h-7 rounded-md flex items-center justify-center transition-colors ${hasMutipleSections ? 'text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700' : 'text-gray-700 cursor-default'}"
          ${!hasMutipleSections ? 'disabled' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>
    </div>
  `;
};

// ─── Footer (slim status strip) ──────────────────────────────────────────────

const renderDashboardFooter = (activeSection) => {
  const subdivision = activeSection?.subdivision || 4;
  const countInBeats = subdivision === 3 ? 6 : 4;
  const isCountingIn = playback.isCountingIn;
  const countInStep = playback.countInStep;

  const countInEnabledClass = state.countInEnabled
    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400'
    : 'bg-gray-800/60 border-gray-700 text-gray-500';

  return `
    <div class="flex-shrink-0 h-8 px-3 border-t border-gray-800 flex items-center justify-between gap-3 bg-gray-950/80">
      <button data-action="toggle-count-in" class="flex items-center gap-1 px-2 py-0.5 rounded border transition-all text-[9px] ${countInEnabledClass} ${isCountingIn ? 'animate-pulse ring-1 ring-cyan-400' : ''}">
        <span class="font-bold uppercase">Cnt</span>
        <span class="font-mono font-bold">${isCountingIn ? countInStep : countInBeats}</span>
      </button>

      <div class="flex items-center gap-2 flex-1 justify-center min-w-0">
        <span class="text-[9px] text-gray-500 truncate">${activeSection.name}</span>
        <span class="text-[9px] text-gray-700">·</span>
        <span class="text-[9px] font-mono ${state.isPlaying ? 'text-green-400' : 'text-gray-600'} font-bold">
          ♩=${state.isPlaying ? Math.round(playback.currentPlayheadBpm) : state.toque.globalBpm}
          ${state.isPlaying ? '<span class="text-[8px] text-green-600 font-normal">live</span>' : ''}
        </span>
      </div>

      <div class="flex items-center gap-0.5 text-[9px] font-mono text-gray-500">
        <span class="uppercase tracking-wider">Rep</span>
        <span class="text-white font-bold" id="header-rep-count">${state.isPlaying ? playback.repetitionCounter : 1}</span>
        <span class="text-gray-600">/${activeSection.repetitions || 1}</span>
        ${activeSection.randomRepetitions ? '<span class="text-cyan-400 ml-1">🎲</span>' : ''}
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
              <div class="bg-gray-800/50 rounded-2xl border border-gray-700/50">
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
                <button data-action="select-view-mode" data-view-id="p2b" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-b-2xl">
                  <span class="text-gray-100 text-sm font-medium">P2B: Split Card</span>
                  ${isDashboardSplit ? activeTag : ''}
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

export const DashboardSplitCardLayout = () => {
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
      <div class="landscape-only flex flex-col flex-1 overflow-hidden">
        ${renderDashboardHeader()}
        ${renderCardCarousel(activeSection)}
        ${renderDashboardFooter(activeSection)}
      </div>

      <!-- Shared Modals -->
      ${renderSharedModals()}
    </div>
  `;
};
