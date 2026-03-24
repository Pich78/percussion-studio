/**
 * js/ui/mobile/player-focus/layout.js
 * 
 * Layout for P1c "Focus Mode" — Player with Solo/Focus Interaction.
 * Extends The Player (P1) with:
 *   - Double-tap a track name to SOLO it (mute all others)
 *   - Double-tap again to UNSOLO (unmute all)
 *   - Non-soloed tracks are visually dimmed
 *   - A hint indicator shows the focus mode instruction
 * 
 * Uses the same header, section bar, and control deck as P1,
 * with an enhanced grid that supports the solo interaction.
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
import { ViewModeModal } from '../../../components/viewModeModal.js';

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

// ─── Focus Mode Indicator ───────────────────────────────────────────────────

const renderFocusIndicator = (activeSection) => {
  // Determine if any track is currently soloed (i.e., the only one NOT muted)
  const tracks = activeSection?.measures?.[0]?.tracks || [];
  const unmutedCount = tracks.filter(t => !t.muted).length;
  const totalTracks = tracks.length;
  const hasSolo = totalTracks > 1 && unmutedCount === 1;
  const soloedTrack = hasSolo ? tracks.find(t => !t.muted) : null;

  if (hasSolo && soloedTrack) {
    const instDef = state.instrumentDefinitions?.[soloedTrack.instrument];
    const soloName = instDef ? instDef.name : soloedTrack.instrument;
    return `
      <div class="flex items-center justify-center gap-2 h-6 bg-violet-500/10 border-t border-b border-violet-500/30 px-3 flex-shrink-0">
        <span class="text-[10px] font-bold text-violet-400 uppercase tracking-wider animate-pulse">🎯 Solo</span>
        <span class="text-[10px] font-bold text-violet-200">${soloName}</span>
        <span class="text-[9px] text-violet-400/60 ml-1">double-tap to unsolo</span>
      </div>
    `;
  }

  return `
    <div class="flex items-center justify-center gap-2 h-6 bg-gray-900/50 border-t border-b border-gray-800/50 px-3 flex-shrink-0">
      <span class="text-[9px] text-gray-500">💡 Double-tap a track name to <span class="text-violet-400 font-semibold">solo</span></span>
    </div>
  `;
};

// ─── Focus Tap Target Overlay ───────────────────────────────────────────────
// Invisible buttons positioned over each track label, one per track.
// The TubsGrid sticky label column is w-44 (176px); these buttons sit above it.
// double-tap detection lives in focusEvents.js which listens for
// data-role="focus-track-tap" elements.

const renderFocusTapTargets = (activeSection) => {
  const tracks = activeSection?.measures?.[0]?.tracks || [];
  if (tracks.length === 0) return '';

  const unmutedCount = tracks.filter(t => !t.muted).length;
  const hasSolo = tracks.length > 1 && unmutedCount === 1;

  // Each TrackRow is ~52px tall (py-1.5 padding + name row + control row).
  // We stack one button per track inside a flex column so they self-size.
  const buttons = tracks.map((track, idx) => {
    const isSoloed = hasSolo && !track.muted;
    const isDimmed = hasSolo && track.muted;
    const instDef = state.instrumentDefinitions?.[track.instrument];
    const displayName = instDef ? instDef.name : track.instrument;

    // Visual ring indicates tappable + shows solo state
    const ringClass = isSoloed
      ? 'ring-2 ring-violet-500/70 bg-violet-500/10'
      : isDimmed
        ? 'opacity-40'
        : 'hover:bg-white/5 active:bg-white/10';

    return `
      <button
        data-role="focus-track-tap"
        data-track-index="${idx}"
        class="flex-1 w-44 flex items-center justify-start px-3 rounded-sm transition-all duration-150 cursor-pointer ${ringClass}"
        title="Double-tap to ${isSoloed ? 'unsolo' : 'solo'} ${displayName}"
      >
        ${isSoloed ? '<span class="text-[8px] font-bold text-violet-400 uppercase tracking-wider pointer-events-none">solo</span>' : ''}
      </button>
    `;
  }).join('');

  return `
    <div
      class="absolute top-0 left-0 h-full flex flex-col z-30 pointer-events-none"
      id="focus-tap-overlay"
    >
      <div class="flex flex-col h-full pointer-events-auto">
        ${buttons}
      </div>
    </div>
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

// ─── Bottom Control Deck (same as P1) ───────────────────────────────────────

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

// ─── Shared Modals (same pattern as Player) ─────────────────────────────────

const renderSharedModals = (activeSection) => {
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

// ─── Main Focus Layout ──────────────────────────────────────────────────────

export const PlayerFocusLayout = () => {
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

        <!-- Focus Mode Indicator -->
        ${renderFocusIndicator(activeSection)}
        
        <!-- Grid Area (fills remaining space) -->
        <div class="flex flex-1 overflow-hidden">
          <main class="flex-1 overflow-hidden relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
            <!-- Focus mode tap targets — invisible buttons over the track label column -->
            ${renderFocusTapTargets(activeSection)}
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
