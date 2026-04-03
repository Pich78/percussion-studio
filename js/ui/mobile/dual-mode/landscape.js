import { state, playback } from '../../../store.js';
import { calculateMobileCellSize } from '../standard/layout.js';
import { DualModeMeasureRenderer } from './dualModeMeasureRenderer.js';
import { SectionSettings } from '../../../components/grid/sectionSettings.js';
import { Bars3Icon } from '../../../icons/bars3Icon.js';
import { StopIcon } from '../../../icons/stopIcon.js';
import { PlayIcon } from '../../../icons/playIcon.js';
import { PauseIcon } from '../../../icons/pauseIcon.js';
import { ArrowTrendingUpIcon } from '../../../icons/arrowTrendingUpIcon.js';
import { ArrowTrendingDownIcon } from '../../../icons/arrowTrendingDownIcon.js';
import { renderBpmModal } from './bpmModal.js';
import { renderMixerModal } from './mixerModal.js';
import { renderSectionModal } from './sectionModal.js';

const liveBpm = () =>
    state.isPlaying
        ? Math.round(playback.currentPlayheadBpm)
        : state.toque.globalBpm;

const repLabel = (section) => {
    const reps = section.repetitions || 1;
    const current = state.isPlaying ? (playback.repetitionCounter || 1) : 1;
    const isRandom = section.randomRepetitions;
    const randIndicator = isRandom ? ' 🎲' : '';
    return `${current}/${reps}${randIndicator}`;
};

const renderAccelerationBadge = (section) => {
    const accel = section?.tempoAcceleration || 0;
    if (accel === 0) return '';
    
    const isPositive = accel > 0;
    const icon = isPositive 
        ? ArrowTrendingUpIcon('w-3 h-3 pointer-events-none') 
        : ArrowTrendingDownIcon('w-3 h-3 pointer-events-none');
    const color = isPositive ? 'text-green-400' : 'text-red-400';
    
    return `<span class="text-[10px] font-mono ${color} flex-shrink-0 flex items-center gap-0.5 ml-1" title="Tempo acceleration: ${accel > 0 ? '+' : ''}${accel.toFixed(1)}% per rep">${icon}${Math.abs(accel).toFixed(1)}</span>`;
};

const renderDualModeGrid = (activeSection, cellSizePx, iconSizePx, fontSizePx) => {
    if (!activeSection || !activeSection.measures || activeSection.measures.length === 0) {
        return `<div class="flex-1 flex items-center justify-center text-gray-600">No data</div>`;
    }

    const measuresHtml = activeSection.measures.map((measure, measureIdx) =>
        DualModeMeasureRenderer({
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
            title="${action === 'dual-mode-prev-section' ? 'Previous section' : 'Next section'}"
        >${icon}</button>`;

    return `
    <header id="dual-mode-landscape-header"
        class="h-10 bg-gray-950 border-b border-gray-800 flex items-center px-3 gap-2 z-40 flex-shrink-0">
        <!-- Hamburger -->
        <button data-action="toggle-menu"
            class="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors flex-shrink-0 ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
            ${Bars3Icon('w-6 h-6 pointer-events-none')}
        </button>

        <!-- Track Name -->
        <span class="text-sm font-bold text-indigo-400 truncate flex-shrink-0 max-w-[120px]">${state.toque.name}</span>

        <span class="text-gray-700 flex-shrink-0">﹒</span>

        <!-- Section navigation: < Name (n/N) > -->
        <div class="flex items-center gap-1 flex-shrink-0">
            ${navBtn('dual-mode-prev-section', hasPrev,
                '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>')}
            <span class="text-xs text-gray-300 font-medium whitespace-nowrap">${activeSection.name}
                <span class="text-gray-600 font-normal">${sectionIdx + 1}/${sections.length}</span>
            </span>
            ${navBtn('dual-mode-next-section', hasNext,
                '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>')}
        </div>

        <span class="text-gray-700 flex-shrink-0">﹒</span>

        <!-- Rep count with acceleration -->
        <span class="text-[10px] font-mono text-gray-400 flex-shrink-0 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800 flex items-center">
            Rep <span id="dual-mode-rep-count">${repLabel(activeSection)}</span>
            ${renderAccelerationBadge(activeSection)}
        </span>

        <div class="flex-1"></div>

        <!-- Live BPM badge -->
        <span class="text-xs font-mono font-bold flex-shrink-0 ${state.isPlaying ? 'text-green-400' : 'text-indigo-400'}">
            ♩${liveBpm()}
        </span>
    </header>`;
};

const renderLandscapeBottomBar = (activeSection) => {
    const activePopover = state.uiState.dualModePopover || null;
    const canEditSection = !state.isPlaying;
    const sections = state.toque.sections;
    const sectionIdx = sections.findIndex(s => s.id === state.activeSectionId);

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
            return `<button class="bg-gray-900 border border-gray-700 rounded-md px-4 h-9 flex items-center gap-2 opacity-40 cursor-not-allowed" disabled>
                <span class="text-xs font-bold text-gray-500">${label}</span>
                ${sublabel ? `<span class="text-[10px] text-gray-600">${sublabel}</span>` : ''}
            </button>`;
        }

        return `
        <button data-action="dual-mode-toggle-popover" data-popover-id="${id}"
            class="bg-gray-800 border ${border} rounded-md px-4 h-9 flex items-center gap-2 transition-colors flex-shrink-0">
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

        <!-- Count-in chip (left of play/stop) -->
        <button data-action="toggle-count-in"
            class="h-9 px-3 rounded-lg flex items-center gap-1.5 flex-shrink-0 transition-all border
                   ${state.countInEnabled 
                       ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400' 
                       : 'bg-gray-800 border-gray-700 text-gray-500'}"
            title="Toggle count-in">
            <span class="text-[10px] font-bold uppercase">Cnt</span>
            <span class="font-mono text-xs font-bold">${state.countInEnabled ? (playback.isCountingIn ? playback.countInStep : (activeSection?.subdivision === 3 ? 6 : 4)) : ''}</span>
        </button>

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

        overlayHtml: activePopover ? `
        ${activePopoverHtml}
        <div data-action="dual-mode-close-popover"
             class="fixed inset-x-0 top-0 z-[60]" style="bottom: 52px; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);">
        </div>` : ''
    };
};

export const renderLandscape = (activeSection) => {
    const viewportWidth = window.innerWidth;
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
    const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;
    const steps = activeSection?.steps || 12;
    const cellSizePx = calculateMobileCellSize(viewportWidth, steps, safeAreaLeft, safeAreaRight);

    const iconSizePx = cellSizePx >= 36 ? 32 : cellSizePx >= 28 ? 24 : 16;
    const fontSizePx = cellSizePx >= 36 ? '0.875rem' : cellSizePx >= 28 ? '0.75rem' : '0.625rem';

    const { barHtml, overlayHtml } = renderLandscapeBottomBar(activeSection);

    return `
    <div class="landscape:flex portrait:hidden flex-col flex-1 h-full w-full">
        ${renderLandscapeTopBar(activeSection)}
        <main class="flex-1 min-h-0 w-full flex flex-col px-2 py-1
                     bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
            ${renderDualModeGrid(activeSection, cellSizePx, iconSizePx, fontSizePx)}
        </main>
        ${barHtml}
        ${overlayHtml}
    </div>`;
};
