/**
 * js/ui/mobile/player-knob/layout.js
 * 
 * Layout for P1b "Circular Tempo Knob" — Player with Rotary BPM Control.
 * Based on the P1 Player paradigm but replaces the linear BPM slider
 * with a circular rotary knob, natural for musicians accustomed to
 * DJ/synth hardware. Tap the BPM number to type a precise value.
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
import { ViewModeModal } from '../../../components/viewModeModal.js';

// Re-export calculateMobileCellSize from standard (shared utility)
import { calculateMobileCellSize } from '../standard/layout.js';
import { MobileMenuPanel } from '../../../components/mobileMenuPanel.js';
export { calculateMobileCellSize };

// ─── Circular Knob Constants ────────────────────────────────────────────────

const KNOB_RADIUS = 32;         // SVG radius
const KNOB_STROKE = 5;          // Arc stroke width
const KNOB_CENTER = 40;         // SVG center point (viewBox 80x80)
const KNOB_START_ANGLE = 135;   // Start angle in degrees (bottom-left)
const KNOB_END_ANGLE = 405;     // End angle (bottom-right, 360+45 = 405)
const KNOB_ARC_SPAN = KNOB_END_ANGLE - KNOB_START_ANGLE; // 270°
const BPM_MIN = 40;
const BPM_MAX = 240;

/**
 * Convert degrees to radians
 */
const degToRad = (deg) => (deg * Math.PI) / 180;

/**
 * Get a point on the circle at a given angle
 */
const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = degToRad(angleDeg);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

/**
 * Build an SVG arc path from startAngle to endAngle
 */
const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

/**
 * Get the angle for a given BPM value
 */
const bpmToAngle = (bpm) => {
  const fraction = (bpm - BPM_MIN) / (BPM_MAX - BPM_MIN);
  return KNOB_START_ANGLE + fraction * KNOB_ARC_SPAN;
};

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

// ─── Circular Tempo Knob SVG ────────────────────────────────────────────────

const renderTempoKnob = () => {
  const bpm = state.toque.globalBpm;
  const angle = bpmToAngle(bpm);

  // Background arc (full 270°)
  const bgArc = describeArc(KNOB_CENTER, KNOB_CENTER, KNOB_RADIUS, KNOB_START_ANGLE, KNOB_END_ANGLE);
  // Value arc (up to current BPM)
  const valArc = bpm > BPM_MIN
    ? describeArc(KNOB_CENTER, KNOB_CENTER, KNOB_RADIUS, KNOB_START_ANGLE, angle)
    : '';
  // Handle position
  const handle = polarToCartesian(KNOB_CENTER, KNOB_CENTER, KNOB_RADIUS, angle);

  // Tick marks at key BPM positions (60, 80, 100, 120, 140, 160, 180, 200)
  const tickBpms = [60, 80, 100, 120, 140, 160, 180, 200];
  const ticks = tickBpms.map(t => {
    const tickAngle = bpmToAngle(t);
    const inner = polarToCartesian(KNOB_CENTER, KNOB_CENTER, KNOB_RADIUS + 6, tickAngle);
    const outer = polarToCartesian(KNOB_CENTER, KNOB_CENTER, KNOB_RADIUS + 9, tickAngle);
    return `<line x1="${inner.x}" y1="${inner.y}" x2="${outer.x}" y2="${outer.y}" stroke="#4a5568" stroke-width="1" stroke-linecap="round" />`;
  }).join('');

  return `
    <div class="flex items-center gap-3">
      <!-- Knob SVG -->
      <div id="tempo-knob" class="relative flex-shrink-0 cursor-pointer select-none" style="width: 80px; height: 80px;" data-role="tempo-knob">
        <svg viewBox="0 0 80 80" class="w-full h-full">
          <!-- Tick marks -->
          ${ticks}
          <!-- Background arc -->
          <path d="${bgArc}" fill="none" stroke="#374151" stroke-width="${KNOB_STROKE}" stroke-linecap="round" />
          <!-- Value arc -->
          ${valArc ? `<path d="${valArc}" fill="none" stroke="url(#knobGradient)" stroke-width="${KNOB_STROKE}" stroke-linecap="round" />` : ''}
          <!-- Gradient definition -->
          <defs>
            <linearGradient id="knobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#7c3aed" />
              <stop offset="100%" stop-color="#a78bfa" />
            </linearGradient>
          </defs>
          <!-- Handle dot -->
          <circle cx="${handle.x}" cy="${handle.y}" r="5" fill="white" stroke="#7c3aed" stroke-width="2" class="drop-shadow-md" />
          <!-- Center shadow circle -->
          <circle cx="${KNOB_CENTER}" cy="${KNOB_CENTER}" r="18" fill="#0d1117" stroke="#1f2937" stroke-width="1" />
        </svg>
        <!-- Center BPM display (overlaid on SVG center) -->
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-[8px] font-bold text-gray-500 uppercase tracking-wider leading-none">Tempo</span>
          <span class="text-base font-mono font-bold text-violet-400 leading-tight" id="header-global-bpm">${bpm}</span>
          <span class="text-[7px] text-gray-600 leading-none">BPM</span>
        </div>
        <!-- Invisible range input for value tracking -->
        <input type="range" min="${BPM_MIN}" max="${BPM_MAX}" value="${bpm}" data-action="update-global-bpm"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" style="pointer-events: none;" />
      </div>

      <!-- Min/Max labels -->
      <div class="flex flex-col justify-between h-16 text-[8px] font-mono text-gray-600">
        <span>${BPM_MAX}</span>
        <span>${BPM_MIN}</span>
      </div>
    </div>
  `;
};

// ─── Bottom Control Deck (with Circular Knob) ───────────────────────────────

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

  return `
    <div class="flex-shrink-0 bg-gray-950 border-t border-gray-800 px-3 py-2 flex items-center gap-3">
      <!-- Circular Tempo Knob -->
      ${renderTempoKnob()}

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Controls Column -->
      <div class="flex flex-col gap-1.5 items-end">
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

// ─── Main Player + Knob Layout ──────────────────────────────────────────────

export const PlayerKnobLayout = () => {
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

        <!-- Bottom Control Deck (with Circular Knob) -->
        ${renderControlDeck(activeSection)}
      </div>

      <!-- Shared Modals -->
      ${renderSharedModals(activeSection)}
    </div>
  `;
};
