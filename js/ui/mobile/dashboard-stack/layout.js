/**
 * js/ui/mobile/dashboard-stack/layout.js
 *
 * Layout for P2a "The Dashboard — Stack Layout".
 * Variant of P2 (The Dashboard) where sections are stacked vertically
 * as scrollable cards (like a social feed / timeline), instead of a
 * horizontal swipe carousel.
 *
 * Key differences from P2 (horizontal carousel):
 *   - Cards stacked vertically in a scrollable list
 *   - Active (playing) card is visually expanded and auto-scrolls into view
 *   - Inactive cards are compact (collapsed) showing only name + key stats
 *   - A narrow timeline indicator on the left edge shows section order
 *   - "View Grid" button on each card opens a full-screen grid overlay
 *   - Slim header (menu + rhythm name + play/stop)
 *   - Slim footer with count-in status + live BPM
 *
 * Reuses shared modals (menu, structure, viewMode, userGuide, BataExplorer).
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
import { ViewModeModal } from '../../../components/viewModeModal.js';

// Re-export calculateMobileCellSize from standard (shared utility)
import { calculateMobileCellSize } from '../standard/layout.js';
export { calculateMobileCellSize };

// ─── Header (Slim) ──────────────────────────────────────────────────────────

const renderStackHeader = () => {
  return `
    <header class="h-10 px-2 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-40 gap-2">
      <!-- Left: Menu -->
      <div class="flex items-center flex-shrink-0">
        <button data-action="toggle-menu" class="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
          ${Bars3Icon('w-4 h-4 pointer-events-none')}
        </button>
      </div>

      <!-- Center: Rhythm Name -->
      <div class="flex items-center justify-center flex-1 min-w-0 overflow-hidden">
        <span class="text-xs font-bold text-amber-400 truncate">${state.toque.name}</span>
      </div>

      <!-- Right: Play/Stop -->
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

// ─── Mini Mixer Row (per track, compact) ────────────────────────────────────

const renderMiniMixerRow = (track, trackIndex) => {
  const isMuted = track.muted;
  const volume = state.mix?.[track.instrument]?.volume ?? 1.0;
  const volumePct = Math.round(volume * 100);

  return `
    <div class="flex items-center gap-2 py-0.5">
      <!-- Mute toggle -->
      <button data-action="toggle-mute" data-track-index="${trackIndex}"
        class="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${isMuted ? 'bg-red-900/40 text-red-400' : 'bg-gray-700/50 text-gray-400 hover:text-gray-200'}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 pointer-events-none">
          ${isMuted
            ? '<path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />'
            : '<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />'
          }
        </svg>
      </button>

      <!-- Instrument Name -->
      <span class="text-[10px] text-gray-400 w-14 truncate flex-shrink-0 ${isMuted ? 'line-through opacity-50' : ''}">${track.instrument}</span>

      <!-- Volume bar (visual) -->
      <div class="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all ${isMuted ? 'bg-gray-600' : 'bg-gradient-to-r from-teal-700 to-teal-400'}" style="width: ${isMuted ? 0 : volumePct}%"></div>
      </div>

      <!-- Volume % -->
      <span class="text-[9px] font-mono text-gray-600 w-7 text-right flex-shrink-0">${isMuted ? '✕' : volumePct + '%'}</span>
    </div>
  `;
};

// ─── Collapsed Card (inactive section, compact) ──────────────────────────────

const renderCollapsedCard = (section, sectionIndex, totalSections) => {
  const subdivision = section?.subdivision || 4;
  const meter = `${subdivision === 3 ? 6 : 4}/${subdivision === 3 ? 8 : 4}`;
  const repDisplay = section.repetitions > 1 ? `×${section.repetitions}` : '×1';

  return `
    <div class="dashboard-stack-card flex-shrink-0 w-full flex items-center gap-2 px-3 py-2.5 bg-gray-900/60 rounded-xl border border-gray-800/60 cursor-pointer hover:border-gray-700 hover:bg-gray-900/80 active:bg-gray-800/80 transition-all"
         data-action="select-section-item"
         data-section-id="${section.id}"
         data-card-index="${sectionIndex}">

      <!-- Left: Timeline connector dot -->
      <div class="relative flex flex-col items-center flex-shrink-0 self-stretch w-3 gap-0.5">
        <div class="w-2 h-2 rounded-full bg-gray-700 border border-gray-600 mt-0.5"></div>
        ${sectionIndex < totalSections - 1 ? '<div class="flex-1 w-px bg-gray-800 mx-auto"></div>' : ''}
      </div>

      <!-- Section Name + meter -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-semibold text-gray-400 truncate">「${section.name}」</span>
        </div>
        <div class="flex items-center gap-1.5 mt-0.5">
          <span class="text-[9px] font-mono text-gray-600">${meter} · ${section.steps || 16} steps · ${repDisplay}</span>
          ${section.randomRepetitions ? '<span class="text-[9px] text-gray-600">🎲</span>' : ''}
        </div>
      </div>

      <!-- Right: BPM chip -->
      <div class="flex-shrink-0 text-[9px] font-mono text-gray-600 bg-gray-800/60 px-1.5 py-0.5 rounded border border-gray-700/50">
        ♩=${state.toque.globalBpm}
      </div>
    </div>
  `;
};

// ─── Expanded Card (active section, full controls) ───────────────────────────

const renderExpandedCard = (section, sectionIndex, totalSections) => {
  const bpmPercent = ((state.toque.globalBpm - 40) / 200) * 100;
  const subdivision = section?.subdivision || 4;
  const meter = `${subdivision === 3 ? 6 : 4}/${subdivision === 3 ? 8 : 4}`;
  const tracks = section?.measures?.[0]?.tracks || [];

  const repDisplay = section.repetitions > 1
    ? `<span class="text-xs font-mono font-bold text-white">×${section.repetitions}</span>`
    : `<span class="text-xs font-mono text-gray-500">×1</span>`;

  return `
    <div class="dashboard-stack-card dashboard-stack-active flex-shrink-0 w-full flex flex-col p-3 gap-2 bg-gray-900/90 rounded-xl border border-teal-500/50 ring-1 ring-teal-500/20 shadow-lg shadow-teal-950/30 transition-all"
         data-section-id="${section.id}"
         data-card-index="${sectionIndex}"
         id="dashboard-stack-active-card">

      <!-- Card Header: Timeline dot + Section Name + Grid button -->
      <div class="flex items-start gap-2">
        <!-- Timeline connector dot -->
        <div class="relative flex flex-col items-center flex-shrink-0 self-stretch w-3 gap-0.5">
          <div class="w-2.5 h-2.5 rounded-full bg-teal-400 flex-shrink-0 mt-0.5 ${state.isPlaying ? 'animate-pulse' : ''}"></div>
          ${sectionIndex < totalSections - 1 ? '<div class="flex-1 w-px bg-teal-900/50 mx-auto mt-0.5"></div>' : ''}
        </div>

        <!-- Section meta -->
        <div class="flex flex-col flex-1 min-w-0 gap-0.5">
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-bold text-gray-100 truncate">「${section.name}」</span>
            ${state.isPlaying ? '<span class="text-[8px] font-bold text-teal-400 bg-teal-500/15 px-1 py-0.5 rounded uppercase tracking-wider flex-shrink-0">Playing</span>' : ''}
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-mono text-gray-500">${meter} · ${section.steps || 16} steps</span>
            <span class="text-[10px] font-mono text-gray-600">${sectionIndex + 1} / ${totalSections}</span>
          </div>
        </div>

        <!-- View Grid button -->
        <button data-action="toggle-grid-overlay" data-section-id="${section.id}"
          class="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700/50 transition-colors text-[10px] font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 pointer-events-none">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          Grid
        </button>
      </div>

      <!-- BPM Slider -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <div class="flex flex-col items-start leading-none flex-shrink-0">
          <span class="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Tempo</span>
          <span class="text-sm font-mono font-bold text-teal-400" id="header-global-bpm">${state.toque.globalBpm} <span class="text-[9px] text-gray-600">BPM</span></span>
        </div>
        <div class="relative flex-1 h-8 flex items-center group/bpm cursor-pointer">
          <!-- Track -->
          <div class="absolute left-0 right-0 h-1.5 bg-gray-700 rounded-full"></div>
          <!-- Fill -->
          <div class="absolute left-0 h-1.5 bg-gradient-to-r from-teal-700 to-teal-400 rounded-full" style="width: ${bpmPercent}%"></div>
          <!-- Handle -->
          <div class="absolute w-4 h-4 bg-white rounded-full shadow-lg border-2 border-teal-400 z-[15]" style="left: calc(${bpmPercent}% - 8px)"></div>
          <!-- Range input -->
          <input type="range" min="40" max="240" value="${state.toque.globalBpm}" data-action="update-global-bpm"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
        </div>
      </div>

      <!-- Rep + Random row -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <div class="flex items-center gap-1 bg-gray-800/60 px-2 py-1 rounded-lg border border-gray-700/50">
          <span class="text-[9px] font-bold text-gray-500 uppercase">Rep</span>
          ${repDisplay}
        </div>
        ${section.randomRepetitions ? `
        <div class="flex items-center gap-0.5 bg-teal-900/20 px-2 py-1 rounded-lg border border-teal-800/40">
          <span class="text-xs">🎲</span>
          <span class="text-[9px] text-teal-400 font-bold uppercase">Rand</span>
        </div>
        ` : ''}
        ${state.isPlaying ? `
        <div class="flex items-center gap-1 ml-auto">
          <span class="text-[9px] text-gray-500 uppercase">Rep</span>
          <span class="text-xs font-mono font-bold text-white" id="header-rep-count">${playback.repetitionCounter}</span>
          <span class="text-[9px] text-gray-600">/${section.repetitions || 1}</span>
        </div>
        ` : ''}
      </div>

      <!-- Mini Mixer -->
      <div class="flex flex-col gap-0.5">
        ${tracks.length > 0
          ? tracks.map((track, i) => renderMiniMixerRow(track, i)).join('')
          : `<span class="text-[10px] text-gray-600 italic">No tracks</span>`
        }
      </div>
    </div>
  `;
};

// ─── Section Stack ───────────────────────────────────────────────────────────

const renderSectionStack = () => {
  const sections = state.toque.sections;
  const totalSections = sections.length;

  return `
    <div class="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2" id="dashboard-stack-scroll">
      ${sections.map((s, i) => {
        const isActive = s.id === state.activeSectionId;
        return isActive
          ? renderExpandedCard(s, i, totalSections)
          : renderCollapsedCard(s, i, totalSections);
      }).join('')}
      <!-- Bottom spacer so last card doesn't sit flush against footer -->
      <div class="flex-shrink-0 h-2"></div>
    </div>
  `;
};

// ─── Footer (slim status strip) ──────────────────────────────────────────────

const renderStackFooter = (activeSection) => {
  const subdivision = activeSection?.subdivision || 4;
  const countInBeats = subdivision === 3 ? 6 : 4;
  const isCountingIn = playback.isCountingIn;
  const countInStep = playback.countInStep;

  const countInEnabledClass = state.countInEnabled
    ? 'bg-teal-500/15 border-teal-500/50 text-teal-400'
    : 'bg-gray-800/60 border-gray-700 text-gray-500';

  return `
    <div class="flex-shrink-0 h-8 px-3 border-t border-gray-800 flex items-center justify-between gap-3 bg-gray-950/80">
      <!-- Count-in -->
      <button data-action="toggle-count-in" class="flex items-center gap-1 px-2 py-0.5 rounded border transition-all text-[9px] ${countInEnabledClass} ${isCountingIn ? 'animate-pulse ring-1 ring-teal-400' : ''}">
        <span class="font-bold uppercase">Cnt</span>
        <span class="font-mono font-bold">${isCountingIn ? countInStep : countInBeats}</span>
      </button>

      <!-- Section name + live BPM -->
      <div class="flex items-center gap-2 flex-1 justify-center min-w-0">
        <span class="text-[9px] text-gray-500 truncate">${activeSection.name}</span>
        <span class="text-[9px] text-gray-700">·</span>
        <span class="text-[9px] font-mono ${state.isPlaying ? 'text-green-400' : 'text-gray-600'} font-bold">
          ♩=${state.isPlaying ? Math.round(playback.currentPlayheadBpm) : state.toque.globalBpm}
          ${state.isPlaying ? '<span class="text-[8px] text-green-600 font-normal">live</span>' : ''}
        </span>
      </div>

      <!-- Stack indicator: section position -->
      <div class="flex items-center gap-0.5 text-[9px] font-mono text-gray-500 flex-shrink-0">
        <span class="uppercase tracking-wider">§</span>
        <span class="text-white font-bold">${(state.toque.sections.findIndex(s => s.id === state.activeSectionId) + 1)}</span>
        <span class="text-gray-600">/${state.toque.sections.length}</span>
      </div>
    </div>
  `;
};

// ─── Grid Overlay ────────────────────────────────────────────────────────────

const renderGridOverlay = (activeSection) => {
  if (!state.uiState.dashboardGridOpen) return '';

  const viewportWidth = window.innerWidth;
  const computedStyle = getComputedStyle(document.documentElement);
  const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
  const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;
  const steps = activeSection?.steps || 12;
  const mobileCellSize = calculateMobileCellSize(viewportWidth, steps, safeAreaLeft, safeAreaRight);

  return `
    <div class="fixed inset-0 z-50 flex flex-col bg-gray-950">
      <!-- Overlay Header -->
      <div class="flex-shrink-0 h-10 px-3 flex items-center justify-between border-b border-gray-800 bg-gray-950">
        <button data-action="toggle-grid-overlay"
          class="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 pointer-events-none">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Stack
        </button>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-200">${activeSection.name}</span>
          <span class="text-[10px] font-mono text-gray-500">${(activeSection.subdivision === 3 ? '6/8' : '4/4')} · ${activeSection.steps || 16} steps</span>
        </div>
        <div class="w-24"></div>
      </div>

      <!-- Grid -->
      <div class="flex-1 overflow-hidden flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
        <div id="grid-container" class="w-full py-1 flex flex-col items-center justify-center overflow-hidden h-full no-pinch-zoom">
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
      </div>
    </div>
  `;
};

// ─── Shared Modals (same pattern as Dashboard layout) ────────────────────────

const renderSharedModals = (activeSection) => {
  const activeViewId = viewManager.getActiveViewId();
  const isDashboardStack = activeViewId === 'mobile-dashboard-stack';
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
                <div class="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-teal-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
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

// ─── Main Dashboard Stack Layout ─────────────────────────────────────────────

export const DashboardStackLayout = () => {
  const activeSection = getActiveSection(state) || state.toque.sections[0];

  return `
    <div class="flex flex-col h-full bg-gray-950 text-gray-100 font-sans selection:bg-teal-500 selection:text-black select-none pl-[var(--safe-area-left)] pr-[var(--safe-area-right)]">
      <!-- Portrait Mode Enforcer Overlay -->
      <div class="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center p-8 text-center portrait:flex landscape:hidden">
        <div class="animate-pulse mb-6 text-teal-500">
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
            <div class="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <h2 class="text-xl font-bold text-white mb-2">Loading</h2>
        <p class="text-teal-400 text-lg font-semibold">${state.uiState.loadingRhythmName || 'Rhythm'}</p>
      </div>
      ` : ''}

      <!-- Main content - landscape only -->
      <div class="landscape-only flex flex-col flex-1 overflow-hidden">
        ${renderStackHeader()}
        ${renderSectionStack()}
        ${renderStackFooter(activeSection)}
      </div>

      <!-- Grid Overlay -->
      ${renderGridOverlay(activeSection)}

      <!-- Shared Modals -->
      ${renderSharedModals(activeSection)}
    </div>
  `;
};

/**
 * After rendering, auto-scroll the active card into view.
 * Called from the view's onRender hook.
 */
export const scrollActiveCardIntoView = () => {
  const activeCard = document.getElementById('dashboard-stack-active-card');
  if (activeCard) {
    activeCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
