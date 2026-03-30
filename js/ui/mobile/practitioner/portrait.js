import { state, playback } from '../../../store.js';
import { trackMixer } from '../../../services/trackMixer.js';
import { Bars3Icon } from '../../../icons/bars3Icon.js';
import { StopIcon } from '../../../icons/stopIcon.js';
import { PlayIcon } from '../../../icons/playIcon.js';
import { PauseIcon } from '../../../icons/pauseIcon.js';
import { ArrowTrendingUpIcon } from '../../../icons/arrowTrendingUpIcon.js';
import { ArrowTrendingDownIcon } from '../../../icons/arrowTrendingDownIcon.js';
import { renderPortraitSectionModal } from './sectionModal.js';

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
    
    return `<span class="text-xs font-mono ${color} flex items-center gap-0.5 ml-1" title="Tempo acceleration: ${accel > 0 ? '+' : ''}${accel.toFixed(1)}% per rep">${icon}${Math.abs(accel).toFixed(1)}%</span>`;
};

const renderPortraitHeader = () => `
    <header class="h-14 px-3 border-b border-gray-800 flex items-center gap-3 bg-gray-950 flex-shrink-0 z-40">
        <button data-action="toggle-menu"
            class="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors flex-shrink-0
                   ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}">
            ${Bars3Icon('w-6 h-6 pointer-events-none')}
        </button>
        <span class="text-base font-bold text-indigo-400 truncate">${state.toque.name}</span>
    </header>`;

const renderPortraitInfoRow = (activeSection) => `
    <div class="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div class="flex items-center gap-3">
            <span class="text-xl font-bold text-white leading-tight">${activeSection.name}</span>
            <span class="text-base font-mono font-bold ${state.isPlaying ? 'text-green-400' : 'text-gray-400'}">Rep <span id="practitioner-rep-count">${repLabel(activeSection)}</span>${renderAccelerationBadge(activeSection)}</span>
        </div>
        <div class="flex items-center gap-1">
            <span class="text-2xl font-mono font-bold ${state.isPlaying ? 'text-green-400' : 'text-indigo-400'}">${liveBpm()}</span>
            <span class="text-[10px] text-gray-600 uppercase tracking-wider">BPM${state.isPlaying ? ' live' : ''}</span>
        </div>
    </div>`;

const renderPortraitBpmRow = () => {
    const bpm = state.toque.globalBpm;
    const pct = ((bpm - 40) / 200) * 100;
    const subdivision = state.activeSectionId 
        ? (state.toque.sections.find(s => s.id === state.activeSectionId)?.subdivision || 4)
        : 4;
    const countInBeats = subdivision === 3 ? 6 : 4;
    const isCountingIn = playback.isCountingIn;

    return `
    <div class="flex items-center gap-3 mx-4 flex-shrink-0">
        <!-- Tempo bar -->
        <div class="flex-1 bg-gray-900 border border-gray-800 rounded-2xl p-3">
            <div class="flex items-center gap-2">
                <!-- Minus 1 button -->
                <button data-action="practitioner-bpm-step" data-delta="-1"
                    class="w-8 h-8 flex-shrink-0 rounded-full bg-gray-800 border border-gray-700 text-gray-400 
                           hover:bg-gray-700 hover:text-white active:bg-gray-600 transition-all flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>

                <!-- Slider -->
                <div class="relative flex-1 h-8 flex items-center cursor-pointer px-1">
                    <div class="absolute left-1 right-1 h-full bg-gray-800 rounded-lg border border-gray-700 pointer-events-none"></div>
                    <div id="portrait-bpm-fill" class="absolute left-1 h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-l-lg pointer-events-none"
                         style="width: ${pct}%"></div>
                    <div id="portrait-bpm-thumb" class="absolute w-4 h-12 bg-white rounded shadow-lg border-2 border-indigo-400 z-[15] touch-none pointer-events-none"
                         style="left: calc(${pct}% - 8px)"></div>
                    <span id="portrait-bpm-label" class="absolute inset-0 flex items-center justify-center gap-0.5 text-sm font-mono font-normal text-white/80 pointer-events-none z-10">${bpm} <span class="text-[10px]">bpm</span></span>
                    <input type="range" min="40" max="240" value="${bpm}"
                           data-action="update-global-bpm"
                           style="touch-action: none"
                           class="absolute -inset-x-2 -top-2 -bottom-2 w-[calc(100%+16px)] h-12 opacity-0 cursor-pointer z-20 portrait-bpm-slider" />
                </div>

                <!-- Plus 1 button -->
                <button data-action="practitioner-bpm-step" data-delta="1"
                    class="w-8 h-8 flex-shrink-0 rounded-full bg-gray-800 border border-gray-700 text-gray-400 
                           hover:bg-gray-700 hover:text-white active:bg-gray-600 transition-all flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Count-in button -->
        <button data-action="toggle-count-in"
            class="w-20 h-14 p-3 rounded-2xl flex flex-col items-center justify-center gap-0 flex-shrink-0 bg-gray-900 border border-gray-800 transition-all
                   ${state.countInEnabled ? 'text-cyan-400' : 'text-gray-500'}"
            title="Toggle count-in">
            <span class="text-[10px] font-bold uppercase">Count</span>
            <span class="font-mono text-xs font-bold">${state.countInEnabled ? (isCountingIn ? playback.countInStep : countInBeats) : ''}</span>
        </button>
    </div>`;
};

const renderPortraitMixer = (activeSection) => {
    const tracks = activeSection.measures[0]?.tracks || [];

    const rows = tracks.map((track, tIdx) => {
        const def = state.instrumentDefinitions[track.instrument] || {};
        const mix = state.mix?.[track.instrument] || { volume: track.volume ?? 1.0, muted: track.muted ?? false };
        const vol = mix.volume ?? 1.0;
        const isMuted = mix.muted ?? false;
        const isSolo = trackMixer.isTrackSoloed(tIdx);
        const pct = Math.round(vol * 100);
        
        // Track is effectively muted if: M button is active OR volume is 0
        const isEffectivelyMuted = trackMixer.isTrackEffectivelyMuted(tIdx, track);
        
        // Name grayed out when: Muted OR (solo active AND not this track)
        const nameColor = isEffectivelyMuted ? '#6b7280' : (def.color || '#d1d5db');

        const fillId = `portrait-vol-fill-${tIdx}`;
        const thumbId = `portrait-vol-thumb-${tIdx}`;
        const dispId = `portrait-vol-disp-${tIdx}`;

        return `
        <div class="flex items-center gap-2">
            <!-- Box 1: Track name + Volume slider -->
            <div class="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex flex-col gap-1 flex-1 h-14">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold truncate max-w-[60%]" style="color: ${nameColor};">
                        ${def.name || track.instrument}${isSolo ? ' ◉' : ''}
                    </span>
                    <span id="${dispId}" class="text-xs font-mono font-bold ${isEffectivelyMuted ? 'text-gray-600' : 'text-indigo-400'}">${pct}%</span>
                </div>
                <div class="relative h-8 flex items-center cursor-pointer px-1 ${isEffectivelyMuted ? 'opacity-40' : ''}">
                    <div class="absolute left-1 right-1 h-full bg-gray-800 rounded-lg border border-gray-700 pointer-events-none"></div>
                    <div id="${fillId}" class="absolute left-1 h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-l-lg pointer-events-none"
                         style="width: ${pct}%"></div>
                    <div id="${thumbId}" class="absolute w-4 h-12 bg-white rounded shadow-lg border-2 border-indigo-400 z-[15] touch-none pointer-events-none"
                         style="left: calc(${pct}% - 8px)"></div>
                    <input type="range" min="0" max="1" step="0.01" value="${vol}"
                           data-action="update-volume" data-track-index="${tIdx}" data-measure-index="0"
                           class="absolute -inset-x-3 inset-y-0 w-[calc(100%+24px)] h-full opacity-0 cursor-pointer z-20" />
                </div>
            </div>

            <!-- Box 2: S button -->
            <div class="bg-gray-900 border border-gray-800 rounded-2xl w-10 h-14 flex items-center justify-center">
                <button data-action="practitioner-solo" data-track-index="${tIdx}"
                    class="font-bold text-sm uppercase tracking-wider transition-colors
                           ${isSolo ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}"
                    title="Solo">
                    S
                </button>
            </div>

            <!-- Box 3: M button -->
            <div class="bg-gray-900 border border-gray-800 rounded-2xl w-10 h-14 flex items-center justify-center">
                <button data-action="toggle-mute" data-track-index="${tIdx}" data-measure-index="0"
                    class="font-bold text-sm uppercase tracking-wider transition-colors
                           ${isMuted ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}"
                    title="${isMuted ? 'Unmute' : 'Mute'}">
                    M
                </button>
            </div>
        </div>`;
    }).join('');

    return `
    <div class="mx-4 flex flex-col gap-3 flex-shrink-0">
        ${rows}
    </div>`;
};

const renderPortraitSectionBar = (activeSection) => {
    const canEdit = !state.isPlaying;
    const sections = state.toque.sections;
    const sectionIdx = sections.findIndex(s => s.id === state.activeSectionId);
    const isModalOpen = state.uiState.practitionerPortraitSectionModal === true
        && !state.isPlaying;

    const sectionModal = isModalOpen ? renderPortraitSectionModal(activeSection) : '';

    return `
    <div class="mx-4 flex-shrink-0 relative">
        <button
            data-action="practitioner-toggle-popover"
            data-popover-id="prac-section"
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

const renderPortraitPlayBar = () => `
    <div class="flex-shrink-0 bg-gray-950 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+2.5rem)]">
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

export const renderPortrait = (activeSection) => {
    const isModalOpen = state.uiState.practitionerPortraitSectionModal === true && !state.isPlaying;
    const sections = state.toque.sections;
    const sectionIdx = sections.findIndex(s => s.id === state.activeSectionId);

    const popoverHtml = isModalOpen ? `
        ${renderPortraitSectionModal(activeSection)}
        <div data-action="practitioner-close-popover"
             class="fixed inset-0 z-[60]" style="bottom: 80px; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);">
        </div>` : '';

    return `
    <div class="portrait:flex landscape:hidden flex-col flex-1 h-full w-full relative pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] bg-gray-950">
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
        ${popoverHtml}
    </div>`;
};
