/**
 * js/ui/mobile/practitioner/layout.js
 *
 * Layout for "Dimension D: The Practitioner" — a Dual View.
 *
 * LANDSCAPE: Chromatic notation grid in the centre (instrument name only, no volume),
 *            scrollable by measure (up/down) and by section (left/right via chips).
 *            Upper bar: track name · section name · rep count · live BPM  (all informative).
 *            Lower bar: BPM chip · Mixer chip · Section chip (active when stopped/paused)
 *                       + Play/Stop button group on the far right.
 *
 * PORTRAIT:  Music-player control surface.
 *            Header: hamburger · track name.
 *            Row 1:  section name · live BPM · rep count.
 *            Row 2:  BPM slider.
 *            Row 3:  Instrument mixer (volume + mute).
 *            Row 4:  Section bar button (active when stopped/paused).
 *            Footer: large Play / Stop buttons.
 */

import { state, playback } from '../../../store.js';
import { getActiveSection } from '../../../store/stateSelectors.js';
import { calculateMobileCellSize } from '../standard/layout.js';
import { PractitionerMeasureRenderer } from './practitionerMeasureRenderer.js';
import { SectionSettings } from '../../../components/grid/sectionSettings.js';
import { Bars3Icon } from '../../../icons/bars3Icon.js';
import { StopIcon } from '../../../icons/stopIcon.js';
import { PlayIcon } from '../../../icons/playIcon.js';
import { PauseIcon } from '../../../icons/pauseIcon.js';
import { BataExplorerModal } from '../../../components/bataExplorerModal.js';
import { ViewModeModal } from '../../../components/viewModeModal.js';
import { MobileMenuPanel } from '../../../components/mobileMenuPanel.js';

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

const liveBpm = () =>
    state.isPlaying
        ? Math.round(playback.currentPlayheadBpm)
        : state.toque.globalBpm;

const repLabel = (section) => {
    const reps = section.repetitions || 1;
    const current = state.isPlaying ? (playback.repetitionCounter || 1) : 1;
    const isRandom = section.random;
    const randIndicator = isRandom ? ' 🎲' : '';
    return `${current}/${reps}${randIndicator}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared modal layer (used by both orientations)
// ─────────────────────────────────────────────────────────────────────────────

const renderSharedModals = () => {
    let modals = '';
    if (state.uiState.isMenuOpen) { modals += MobileMenuPanel(); }
    if (state.uiState.modalOpen && state.uiState.modalType === 'viewMode') {
        modals += ViewModeModal();
    }
    modals += BataExplorerModal({ isMobile: true, bataExplorer: state.uiState.bataExplorer });
    return modals;
};

// ─────────────────────────────────────────────────────────────────────────────
// LANDSCAPE — custom minimal grid (instrument name only, no volume controls)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders the custom practitioner grid.
 *
 * Instrument name column (clickable → cycle colour metric).
 * Steps shown for the currently active measure of the active section.
 * Scrolling up/down shows other measures; scrolling left/right handled by the
 * chip bar (section navigation is via the Section chip modal, not inline swipe).
 */
/**
 * Renders the practitioner grid using the standard TubsCell pipeline but with
 * a name-only centered label column (PractitionerMeasureRenderer).
 * Behaviour is identical to the standard mobile grid — same cells, same step
 * highlighting, same measure structure — only the row header differs.
 */
const renderPractitionerGrid = (activeSection, cellSizePx, iconSizePx, fontSizePx) => {
    if (!activeSection || !activeSection.measures || activeSection.measures.length === 0) {
        return `<div class="flex-1 flex items-center justify-center text-gray-600">No data</div>`;
    }

    const measuresHtml = activeSection.measures.map((measure, measureIdx) =>
        PractitionerMeasureRenderer({
            measure,
            measureIdx,
            section: activeSection,
            currentStep: state.currentStep,
            selectedStroke: state.selectedStroke,
            cellSizePx,
            iconSizePx,
            fontSizePx,
            instrumentDefinitions: state.instrumentDefinitions,
            isPlaying: state.isPlaying
        })
    ).join('');

    return `
    <div
        id="tubs-scroll-container"
        class="flex-1 flex flex-col gap-2 overflow-x-auto overflow-y-scroll pb-4 w-full h-full custom-scrollbar relative outline-none ring-0 no-pinch-zoom"
        style="scroll-snap-type: y mandatory; -webkit-overflow-scrolling: touch;"
    >
        ${SectionSettings(activeSection, state.toque.globalBpm, /* readOnly= */ true)}
        ${measuresHtml}
    </div>`;
};

// ─────────────────────────────────────────────────────────────────────────────
// LANDSCAPE — upper informative bar
// ─────────────────────────────────────────────────────────────────────────────

const renderLandscapeTopBar = (activeSection) => {
    const sections = state.toque.sections;
    const sectionIdx = sections.findIndex(s => s.id === state.activeSectionId);
    const hasPrev = sectionIdx > 0;
    const hasNext = sectionIdx < sections.length - 1;

    const navBtn = (action, enabled, icon) =>
        `<button data-action="${action}"
            class="w-7 h-7 flex items-center justify-center rounded-md transition-colors flex-shrink-0
                   ${enabled ? 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700' : 'text-gray-700 cursor-not-allowed'}"
            ${enabled ? '' : 'disabled'}
            title="${action === 'practitioner-prev-section' ? 'Previous section' : 'Next section'}"
        >${icon}</button>`;

    return `
    <header id="practitioner-landscape-header"
        class="h-10 bg-gray-950 border-b border-gray-800 flex items-center px-3 gap-2 z-40 flex-shrink-0">
        <!-- Hamburger -->
        <button data-action="toggle-menu"
            class="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors flex-shrink-0 ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
            ${Bars3Icon('w-5 h-5 pointer-events-none')}
        </button>

        <!-- Track Name -->
        <span class="text-sm font-bold text-indigo-400 truncate flex-shrink-0 max-w-[120px]">${state.toque.name}</span>

        <span class="text-gray-700 flex-shrink-0">﹒</span>

        <!-- Section navigation: < Name (n/N) > -->
        <div class="flex items-center gap-1 flex-shrink-0">
            ${navBtn('practitioner-prev-section', hasPrev,
                '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>')}
            <span class="text-xs text-gray-300 font-medium whitespace-nowrap">${activeSection.name}
                <span class="text-gray-600 font-normal">${sectionIdx + 1}/${sections.length}</span>
            </span>
            ${navBtn('practitioner-next-section', hasNext,
                '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>')}
        </div>

        <span class="text-gray-700 flex-shrink-0">﹒</span>

        <!-- Rep count -->
        <span class="text-[10px] font-mono text-gray-400 flex-shrink-0 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
            Rep ${repLabel(activeSection)}
        </span>

        <div class="flex-1"></div>

        <!-- Live BPM badge -->
        <span class="text-xs font-mono font-bold flex-shrink-0 ${state.isPlaying ? 'text-green-400' : 'text-indigo-400'}">
            ♩${liveBpm()}
        </span>
    </header>`;
};



// ─────────────────────────────────────────────────────────────────────────────
// LANDSCAPE — BPM chip modal
// ─────────────────────────────────────────────────────────────────────────────

const renderBpmModal = () => `
    <div class="fixed bottom-[52px] left-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5 w-72 flex flex-col gap-4 z-[65] animate-in fade-in">
        <div class="flex justify-between items-center">
            <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Tempo</span>
            <span class="text-xl font-mono text-indigo-400 font-bold">${state.toque.globalBpm} BPM</span>
        </div>
        <div class="relative w-full h-10 flex items-center group/bpm cursor-pointer py-2 px-1">
            <div class="absolute left-1 right-1 h-3 bg-gray-800 rounded-full border border-gray-700"></div>
            <div class="absolute left-1 h-3 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full" style="width: calc(${((state.toque.globalBpm - 40) / 200) * 100}% - 2px)"></div>
            <div class="absolute w-7 h-7 bg-white rounded-full shadow-lg border-2 border-indigo-400 z-[15] touch-none" style="left: calc(${((state.toque.globalBpm - 40) / 200) * 100}% - 14px + 4px)"></div>
            <input type="range" min="40" max="240" value="${state.toque.globalBpm}"
                data-action="update-global-bpm"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
        </div>
        <div class="flex gap-2">
            <button data-action="practitioner-bpm-step" data-delta="-5"
                class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl py-2 text-sm font-bold text-gray-300">−5</button>
            <button data-action="practitioner-bpm-step" data-delta="-1"
                class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl py-2 text-sm font-bold text-gray-300">−1</button>
            <button data-action="practitioner-bpm-step" data-delta="1"
                class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl py-2 text-sm font-bold text-gray-300">+1</button>
            <button data-action="practitioner-bpm-step" data-delta="5"
                class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl py-2 text-sm font-bold text-gray-300">+5</button>
        </div>
    </div>`;

// ─────────────────────────────────────────────────────────────────────────────
// LANDSCAPE — Mixer chip modal
// ─────────────────────────────────────────────────────────────────────────────

const renderMixerModal = (activeSection) => {
    const tracks = activeSection.measures[0]?.tracks || [];

    const rows = tracks.map((track, tIdx) => {
        const def = state.instrumentDefinitions[track.instrument] || {};
        const mix = state.mix?.[track.instrument] || { volume: track.volume ?? 1.0, muted: track.muted ?? false };
        const vol = mix.volume ?? 1.0;
        const isMuted = mix.muted ?? false;
        const nameColor = isMuted ? '#6b7280' : (def.color || '#d1d5db');
        const pct = Math.round(vol * 100);

        return `
        <div class="flex flex-col gap-2 ${tIdx > 0 ? 'pt-3 border-t border-gray-800' : ''}">
            <!-- Header row: mute + name + value -->
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <button data-action="toggle-mute" data-track-index="${tIdx}" data-measure-index="0"
                        class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors border
                               ${isMuted ? 'bg-red-900/30 text-red-500 border-red-900/50' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-gray-200'}"
                        title="${isMuted ? 'Unmute' : 'Mute'}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 pointer-events-none">
                            ${isMuted
                                ? '<path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />'
                                : '<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />'
                            }
                        </svg>
                    </button>
                    <span class="text-xs font-bold uppercase tracking-wider truncate max-w-[120px] ${isMuted ? 'line-through' : ''}"
                          style="color: ${nameColor};">${def.name || track.instrument}</span>
                </div>
                <span class="text-xl font-mono font-bold ${isMuted ? 'text-gray-600' : 'text-indigo-400'}">${pct}%</span>
            </div>

            <!-- Wide slider — identical style to BPM slider -->
            <div class="relative w-full h-10 flex items-center group/vol cursor-pointer py-2 px-1 ${isMuted ? 'opacity-40' : ''}">
                <div class="absolute left-1 right-1 h-3 bg-gray-800 rounded-full border border-gray-700"></div>
                <div class="absolute left-1 h-3 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                     style="width: calc(${pct}% - 2px)"></div>
                <div class="absolute w-7 h-7 bg-white rounded-full shadow-lg border-2 border-indigo-400 z-[15] touch-none"
                     style="left: calc(${pct}% - 14px + 4px)"></div>
                <input type="range" min="0" max="1" step="0.01" value="${vol}"
                    data-action="update-volume" data-track-index="${tIdx}" data-measure-index="0"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    ${isMuted ? 'disabled' : ''} />
            </div>

            <!-- Step buttons — identical row to BPM −5 −1 +1 +5 -->
            <div class="flex gap-2">
                <button data-action="practitioner-vol-step" data-track-index="${tIdx}" data-delta="-0.1"
                    class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl py-2 text-sm font-bold text-gray-300 ${isMuted ? 'opacity-40 pointer-events-none' : ''}">−10</button>
                <button data-action="practitioner-vol-step" data-track-index="${tIdx}" data-delta="-0.01"
                    class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl py-2 text-sm font-bold text-gray-300 ${isMuted ? 'opacity-40 pointer-events-none' : ''}">−1</button>
                <button data-action="practitioner-vol-step" data-track-index="${tIdx}" data-delta="0.01"
                    class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl py-2 text-sm font-bold text-gray-300 ${isMuted ? 'opacity-40 pointer-events-none' : ''}">+1</button>
                <button data-action="practitioner-vol-step" data-track-index="${tIdx}" data-delta="0.1"
                    class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl py-2 text-sm font-bold text-gray-300 ${isMuted ? 'opacity-40 pointer-events-none' : ''}">+10</button>
            </div>
        </div>`;
    }).join('');

    return `
    <div class="fixed bottom-[52px] left-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5 w-72 flex flex-col gap-4 z-[65] animate-in fade-in max-h-[70vh] overflow-y-auto custom-scrollbar">
        ${rows}
    </div>`;
};



// ─────────────────────────────────────────────────────────────────────────────
// LANDSCAPE — Section chip modal (only enabled when stopped/paused)
// ─────────────────────────────────────────────────────────────────────────────

const renderSectionModal = (activeSection) => {
    const sections = state.toque.sections;

    const sectionRows = sections.map((s, idx) => {
        const isActive = s.id === state.activeSectionId;
        return `
        <button data-action="practitioner-select-section" data-section-id="${s.id}"
            class="w-full text-left rounded-xl px-3 py-3 flex items-center gap-3 transition-colors
                   ${isActive ? 'bg-indigo-500/15 border border-indigo-500/40' : 'bg-gray-800 border border-transparent hover:bg-gray-700 active:bg-gray-600'}">
            <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border
                        ${isActive ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-gray-700 text-gray-500 border-gray-600'}">
                <span class="text-[10px] font-bold">${idx + 1}</span>
            </div>
            <div class="flex flex-col flex-1 min-w-0">
                <span class="font-semibold text-sm ${isActive ? 'text-indigo-400' : 'text-gray-200'} truncate">${s.name}</span>
                <span class="text-[10px] text-gray-500 font-mono">×${s.repetitions || 1}${s.random ? ' 🎲' : ''}</span>
            </div>
            <!-- Rep stepper (inline, only for active section) -->
            ${isActive ? `
            <div class="flex items-center gap-1 flex-shrink-0">
                <button data-action="practitioner-rep-step" data-section-id="${s.id}" data-delta="-1"
                    class="w-7 h-7 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg flex items-center justify-center text-gray-300 font-bold text-sm">−</button>
                <span class="text-xs font-mono text-indigo-400 w-4 text-center">${s.repetitions || 1}</span>
                <button data-action="practitioner-rep-step" data-section-id="${s.id}" data-delta="1"
                    class="w-7 h-7 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg flex items-center justify-center text-gray-300 font-bold text-sm">+</button>
            </div>` : ''}
        </button>`;
    }).join('');

    return `
    <div class="fixed bottom-[52px] right-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 w-80 max-w-[90vw] max-h-[55vh] overflow-y-auto z-[65] animate-in fade-in">
        <div class="flex justify-between items-center pb-1 border-b border-gray-800 mb-1">
            <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Sections</span>
            <span class="text-[10px] text-gray-600">Tap to jump • Edit reps inline</span>
        </div>
        ${sectionRows}
    </div>`;
};

// ─────────────────────────────────────────────────────────────────────────────
// LANDSCAPE — lower chips bar
// ─────────────────────────────────────────────────────────────────────────────

const renderLandscapeBottomBar = (activeSection) => {
    const activePopover = state.uiState.practitionerPopover || null;
    const canEditSection = !state.isPlaying;
    const sections = state.toque.sections;
    const sectionIdx = sections.findIndex(s => s.id === state.activeSectionId);

    // Chip helper
    const chip = ({ id, label, sublabel, color, disabled = false }) => {
        const isOpen = activePopover === id;
        const colorMap = {
            indigo: { open: 'border-indigo-400 bg-gray-800', closed: 'border-gray-600 hover:border-indigo-500/50', label: isOpen ? 'text-white' : 'text-gray-200' },
            violet: { open: 'border-violet-400 bg-gray-800', closed: 'border-gray-600 hover:border-violet-500/50', label: isOpen ? 'text-white' : 'text-gray-200' },
            pink: { open: 'border-pink-400 bg-gray-800', closed: 'border-gray-600 hover:border-pink-500/50', label: isOpen ? 'text-white' : 'text-gray-200' },
        };
        const c = colorMap[color] || colorMap.indigo;
        const border = isOpen ? c.open : c.closed;

        if (disabled) {
            return `<button class="bg-gray-900 border border-gray-700 rounded-full px-3 py-1 flex items-center gap-1.5 opacity-40 cursor-not-allowed" disabled>
                <span class="text-xs font-bold text-gray-500">${label}</span>
                ${sublabel ? `<span class="text-[10px] text-gray-600">${sublabel}</span>` : ''}
            </button>`;
        }

        return `
        <button data-action="practitioner-toggle-popover" data-popover-id="${id}"
            class="bg-gray-800 border ${border} rounded-full px-3 py-1 flex items-center gap-1.5 transition-colors flex-shrink-0">
            <span class="text-xs font-bold ${c.label}">${label}</span>
            ${sublabel ? `<span class="text-[10px] text-gray-400">${sublabel}</span>` : ''}
        </button>`;
    };

    const activePopoverHtml = activePopover
        ? (activePopover === 'prac-bpm'     ? renderBpmModal()
         : activePopover === 'prac-mixer'   ? renderMixerModal(activeSection)
         : activePopover === 'prac-section' ? renderSectionModal(activeSection)
         : '')
        : '';

    return {
        barHtml: `
    <div class="h-13 border-t border-gray-800 bg-gray-950 flex items-center px-3 gap-2 flex-shrink-0 relative z-50"
         style="height: 52px;">

        <!-- Chip row (left-aligned) -->
        <div class="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar py-1">
            ${chip({ id: 'prac-bpm', label: `♩=${liveBpm()}`, color: 'indigo' })}
            ${chip({ id: 'prac-mixer', label: '🎚 Mixer', color: 'violet' })}
            ${chip({
                id: 'prac-section',
                label: activeSection.name,
                sublabel: `${sectionIdx + 1}/${sections.length}`,
                color: 'pink',
                disabled: !canEditSection
            })}
        </div>

        <!-- Play / Stop group (right) -->
        <div class="flex items-center gap-1 bg-gray-900 rounded-lg p-0.5 border border-gray-800 flex-shrink-0">
            <button data-action="stop"
                class="w-9 h-9 rounded-md flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-all">
                ${StopIcon('w-4 h-4 pointer-events-none')}
            </button>
            <button data-action="toggle-play"
                class="w-9 h-9 rounded-md flex items-center justify-center transition-all shadow-lg
                       ${state.isPlaying ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50' : 'bg-indigo-600 text-white shadow-indigo-900/30'}">
                ${state.isPlaying ? PauseIcon('w-4 h-4 pointer-events-none') : PlayIcon('w-4 h-4 ml-0.5 pointer-events-none')}
            </button>
        </div>
    </div>`,

        // Popover + backdrop rendered OUTSIDE the bottom bar so they live in the
        // root stacking context (z-[60]/z-[65]) and are not trapped under z-50.
        overlayHtml: activePopover ? `
        ${activePopoverHtml}
        <div data-action="practitioner-close-popover"
             class="fixed inset-x-0 top-0 z-[60]" style="bottom: 52px; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);">
        </div>` : ''
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// LANDSCAPE — full assembled view
// ─────────────────────────────────────────────────────────────────────────────

const renderLandscape = (activeSection) => {
    // Calculate cell size the same way the standard mobile layout does
    const viewportWidth = window.innerWidth;
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
    const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;
    const steps = activeSection?.steps || 12;
    const cellSizePx = calculateMobileCellSize(viewportWidth, steps, safeAreaLeft, safeAreaRight);

    // Derive icon/font sizes from cell size (same logic as TubsGrid)
    const iconSizePx = cellSizePx >= 36 ? 32 : cellSizePx >= 28 ? 24 : 16;
    const fontSizePx = cellSizePx >= 36 ? '0.875rem' : cellSizePx >= 28 ? '0.75rem' : '0.625rem';

    // Bottom bar returns barHtml + overlayHtml separately so popovers sit at root z-level
    const { barHtml, overlayHtml } = renderLandscapeBottomBar(activeSection);

    return `
    <div class="landscape:flex portrait:hidden flex-col flex-1 h-full w-full">
        ${renderLandscapeTopBar(activeSection)}
        <main class="flex-1 min-h-0 w-full flex flex-col px-2 py-1
                     bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
            ${renderPractitionerGrid(activeSection, cellSizePx, iconSizePx, fontSizePx)}
        </main>
        ${barHtml}
        ${overlayHtml}
    </div>`;
};

// ─────────────────────────────────────────────────────────────────────────────
// PORTRAIT — header
// ─────────────────────────────────────────────────────────────────────────────

const renderPortraitHeader = () => `
    <header class="h-14 px-3 border-b border-gray-800 flex items-center gap-3 bg-gray-950 flex-shrink-0 z-40">
        <button data-action="toggle-menu"
            class="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors flex-shrink-0
                   ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
            ${Bars3Icon('w-6 h-6 pointer-events-none')}
        </button>
        <span class="text-base font-bold text-indigo-400 truncate">${state.toque.name}</span>
    </header>`;

// ─────────────────────────────────────────────────────────────────────────────
// PORTRAIT — info row (Row 1)
// ─────────────────────────────────────────────────────────────────────────────

const renderPortraitInfoRow = (activeSection) => `
    <div class="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div class="flex flex-col gap-0.5">
            <span class="text-lg font-bold text-white leading-tight">${activeSection.name}</span>
            <span class="text-xs text-gray-500">Rep ${repLabel(activeSection)}</span>
        </div>
        <div class="flex flex-col items-end gap-0.5">
            <span class="text-2xl font-mono font-bold ${state.isPlaying ? 'text-green-400' : 'text-indigo-400'}">${liveBpm()}</span>
            <span class="text-[10px] text-gray-600 uppercase tracking-wider">BPM${state.isPlaying ? ' live' : ''}</span>
        </div>
    </div>`;

// ─────────────────────────────────────────────────────────────────────────────
// PORTRAIT — BPM row (Row 2)
// ─────────────────────────────────────────────────────────────────────────────

const renderPortraitBpmRow = () => `
    <div class="bg-gray-900 border border-gray-800 rounded-2xl mx-4 p-4 flex-shrink-0">
        <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tempo</span>
            <span class="text-sm font-mono font-bold text-indigo-400">${state.toque.globalBpm} BPM</span>
        </div>
        <div class="relative w-full h-10 flex items-center group/bpm cursor-pointer py-2 px-1">
            <div class="absolute left-1 right-1 h-3 bg-gray-800 rounded-full"></div>
            <div class="absolute left-1 h-3 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                 style="width: calc(${((state.toque.globalBpm - 40) / 200) * 100}% - 2px)"></div>
            <div class="absolute w-7 h-7 bg-white rounded-full shadow-lg border-2 border-indigo-400 z-[15] touch-none"
                 style="left: calc(${((state.toque.globalBpm - 40) / 200) * 100}% - 14px + 4px)"></div>
            <input type="range" min="40" max="240" value="${state.toque.globalBpm}"
                   data-action="update-global-bpm"
                   class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
        </div>
        <!-- Quick BPM nudge buttons -->
        <div class="flex gap-2 mt-1">
            <button data-action="practitioner-bpm-step" data-delta="-10"
                class="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg text-xs font-bold text-gray-400">−10</button>
            <button data-action="practitioner-bpm-step" data-delta="-5"
                class="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg text-xs font-bold text-gray-400">−5</button>
            <button data-action="practitioner-bpm-step" data-delta="-1"
                class="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg text-xs font-bold text-gray-400">−1</button>
            <button data-action="practitioner-bpm-step" data-delta="1"
                class="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg text-xs font-bold text-gray-400">+1</button>
            <button data-action="practitioner-bpm-step" data-delta="5"
                class="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg text-xs font-bold text-gray-400">+5</button>
            <button data-action="practitioner-bpm-step" data-delta="10"
                class="flex-1 py-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg text-xs font-bold text-gray-400">+10</button>
        </div>
    </div>`;

// ─────────────────────────────────────────────────────────────────────────────
// PORTRAIT — mixer block (Row 3)
// ─────────────────────────────────────────────────────────────────────────────

const renderPortraitMixer = (activeSection) => {
    const tracks = activeSection.measures[0]?.tracks || [];

    const rows = tracks.map((track, tIdx) => {
        const def = state.instrumentDefinitions[track.instrument] || {};
        const mix = state.mix[track.instrument] || { volume: 1.0, muted: false };
        return `
        <div class="flex flex-col w-full gap-2">
            <div class="flex justify-between items-center px-1">
                <span class="text-sm font-bold ${mix.muted ? 'text-gray-600' : ''}"
                      style="color: ${mix.muted ? '' : (def.color || '#d1d5db')}">${def.name || track.instrument}</span>
                <div class="flex gap-2 items-center">
                    <span class="text-xs font-mono text-gray-500 ${mix.muted ? 'opacity-30' : ''}">${Math.round(mix.volume * 100)}%</span>
                    <button data-action="toggle-mute" data-track-index="${tIdx}"
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors border
                               ${mix.muted ? 'bg-red-900/30 text-red-500 border-red-900/50' : 'bg-gray-800 text-gray-400 border-gray-700'}">
                        ${mix.muted ? 'Muted' : 'Mute'}
                    </button>
                </div>
            </div>
            <div class="flex-1 h-8 relative flex items-center group/vol cursor-pointer ${mix.muted ? 'opacity-30' : ''}">
                <div class="absolute left-0 right-0 h-2 bg-gray-800 rounded-full"></div>
                <div class="absolute left-0 h-2 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full pointer-events-none"
                     style="width: ${Math.round(mix.volume * 100)}%"></div>
                <div class="absolute w-5 h-5 bg-white rounded-full shadow-md z-[15] touch-none pointer-events-none"
                     style="left: calc(${Math.round(mix.volume * 100)}% - 10px)"></div>
                <input type="range" min="0" max="1" step="0.01" value="${mix.volume}"
                       data-action="update-volume" data-track-index="${tIdx}"
                       class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            </div>
        </div>`;
    }).join('');

    return `
    <div class="bg-gray-900 border border-gray-800 rounded-2xl mx-4 p-4 flex flex-col gap-4 flex-shrink-0">
        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mix Console</span>
        ${rows}
    </div>`;
};

// ─────────────────────────────────────────────────────────────────────────────
// PORTRAIT — Section button + modal (Row 4 / before-last)
// ─────────────────────────────────────────────────────────────────────────────

const renderPortraitSectionBar = (activeSection) => {
    const canEdit = !state.isPlaying;
    const sections = state.toque.sections;
    const sectionIdx = sections.findIndex(s => s.id === state.activeSectionId);
    const isModalOpen = state.uiState.practitionerPortraitSectionModal === true
        && !state.isPlaying;  // auto-dismiss when playback starts — keeps mixer unblocked

    const sectionModal = isModalOpen ? `
    <div class="fixed inset-x-0 bottom-20 z-[70] mx-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 max-h-[55vh] overflow-y-auto animate-in fade-in">
        <div class="flex justify-between items-center pb-1 border-b border-gray-800 mb-1">
            <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Sections</span>
            <button data-action="practitioner-portrait-close-sections" class="text-gray-500 hover:text-white text-xs">Done</button>
        </div>
        ${sections.map((s, idx) => {
            const isActive = s.id === state.activeSectionId;
            return `
            <button data-action="practitioner-select-section" data-section-id="${s.id}"
                class="w-full text-left rounded-xl px-3 py-3 flex items-center gap-3 transition-colors
                       ${isActive ? 'bg-indigo-500/15 border border-indigo-500/40' : 'bg-gray-800 border border-transparent hover:bg-gray-700'}">
                <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border
                            ${isActive ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-gray-700 text-gray-500 border-gray-600'}">
                    <span class="text-[10px] font-bold">${idx + 1}</span>
                </div>
                <div class="flex flex-col flex-1 min-w-0">
                    <span class="font-semibold text-sm ${isActive ? 'text-indigo-400' : 'text-gray-200'} truncate">${s.name}</span>
                    <span class="text-[10px] text-gray-500 font-mono">×${s.repetitions || 1}${s.random ? ' 🎲' : ''}</span>
                </div>
                ${isActive ? `
                <div class="flex items-center gap-1 flex-shrink-0">
                    <button data-action="practitioner-rep-step" data-section-id="${s.id}" data-delta="-1"
                        class="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-300 font-bold text-sm">−</button>
                    <span class="text-xs font-mono text-indigo-400 w-4 text-center">${s.repetitions || 1}</span>
                    <button data-action="practitioner-rep-step" data-section-id="${s.id}" data-delta="1"
                        class="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-300 font-bold text-sm">+</button>
                </div>` : ''}
            </button>`;
        }).join('')}
    </div>
    <div data-action="practitioner-portrait-close-sections"
         class="fixed inset-0 z-[65] bg-black/50" style="bottom: 80px;"></div>` : '';

    return `
    <div class="mx-4 flex-shrink-0 relative">
        <button
            data-action="practitioner-portrait-toggle-sections"
            class="w-full rounded-xl px-4 py-3 flex items-center justify-between border transition-colors
                   ${canEdit
                       ? 'bg-gray-900 border-gray-700 hover:bg-gray-800 active:bg-gray-700'
                       : 'bg-gray-900 border-gray-800 opacity-40 cursor-not-allowed'}"
            ${canEdit ? '' : 'disabled'}>
            <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full flex-shrink-0 ${canEdit ? 'bg-indigo-400' : 'bg-gray-600'}"></div>
                <span class="text-sm font-semibold ${canEdit ? 'text-gray-200' : 'text-gray-600'}">
                    ${activeSection.name}
                </span>
                <span class="text-xs font-mono text-gray-500">${sectionIdx + 1}/${sections.length}</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">${canEdit ? 'Tap to change' : 'Playing…'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </div>
        </button>
        ${sectionModal}
    </div>`;
};

// ─────────────────────────────────────────────────────────────────────────────
// PORTRAIT — bottom play/stop bar
// ─────────────────────────────────────────────────────────────────────────────

const renderPortraitPlayBar = () => `
    <div class="flex-shrink-0 bg-gray-950 border-t border-gray-800 px-4 pt-3"
         style="padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 1rem);">
        <div class="flex items-center gap-3 justify-center">
            <button data-action="stop"
                class="flex-1 max-w-[160px] h-16 rounded-2xl flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-900/30 hover:text-red-400 text-gray-400 border border-gray-700 hover:border-red-900/50 transition-all font-bold text-sm">
                ${StopIcon('w-6 h-6 pointer-events-none')}
                Stop
            </button>
            <button data-action="toggle-play"
                class="flex-1 max-w-[160px] h-16 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-sm shadow-xl
                       ${state.isPlaying
                           ? 'bg-amber-500/15 text-amber-400 border border-amber-500/50'
                           : 'bg-indigo-600 text-white shadow-indigo-900/30 border border-indigo-500/50'}">
                ${state.isPlaying ? PauseIcon('w-6 h-6 pointer-events-none') : PlayIcon('w-6 h-6 ml-0.5 pointer-events-none')}
                ${state.isPlaying ? 'Pause' : 'Play'}
            </button>
        </div>
    </div>`;

// ─────────────────────────────────────────────────────────────────────────────
// PORTRAIT — full assembled view
// ─────────────────────────────────────────────────────────────────────────────

const renderPortrait = (activeSection) => `
    <div class="portrait:flex landscape:hidden flex-col flex-1 h-full w-full relative pt-[env(safe-area-inset-top)] bg-gray-950">
        ${renderPortraitHeader()}

        <!-- Scrollable content area -->
        <div class="flex-1 overflow-y-auto flex flex-col gap-4 py-4">
            ${renderPortraitInfoRow(activeSection)}
            ${renderPortraitBpmRow()}
            ${renderPortraitMixer(activeSection)}
            ${renderPortraitSectionBar(activeSection)}
            <!-- Spacer so content doesn't hide behind footer -->
            <div class="h-2 flex-shrink-0"></div>
        </div>

        ${renderPortraitPlayBar()}
    </div>`;

// ─────────────────────────────────────────────────────────────────────────────
// Main exported layout function
// ─────────────────────────────────────────────────────────────────────────────

export const PractitionerLayout = () => {
    const activeSection = getActiveSection(state) || state.toque.sections[0];

    return `
    <div class="flex flex-col h-full bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500 selection:text-black select-none
                pl-[var(--safe-area-left)] pr-[var(--safe-area-right)] overflow-hidden">

        <!-- App loading overlay -->
        ${state.uiState.isLoadingRhythm ? `
        <div class="fixed inset-0 z-[90] bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
            <div class="mb-8 relative w-20 h-20">
                <div class="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 class="text-xl font-bold text-white mb-2">Loading</h2>
            <p class="text-indigo-400 text-lg font-semibold">${state.uiState.loadingRhythmName || 'Rhythm'}</p>
        </div>` : ''}

        ${renderLandscape(activeSection)}
        ${renderPortrait(activeSection)}

        ${renderSharedModals()}
    </div>`;
};
