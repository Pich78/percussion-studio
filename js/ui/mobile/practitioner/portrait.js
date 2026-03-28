import { state, playback } from '../../../store.js';
import { Bars3Icon } from '../../../icons/bars3Icon.js';
import { StopIcon } from '../../../icons/stopIcon.js';
import { PlayIcon } from '../../../icons/playIcon.js';
import { PauseIcon } from '../../../icons/pauseIcon.js';
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
            <span class="text-base font-mono font-bold ${state.isPlaying ? 'text-green-400' : 'text-gray-400'}">Rep <span id="practitioner-rep-count">${repLabel(activeSection)}</span></span>
        </div>
        <div class="flex flex-col items-end gap-0.5">
            <span class="text-2xl font-mono font-bold ${state.isPlaying ? 'text-green-400' : 'text-indigo-400'}">${liveBpm()}</span>
            <span class="text-[10px] text-gray-600 uppercase tracking-wider">BPM${state.isPlaying ? ' live' : ''}</span>
        </div>
    </div>`;

const renderPortraitBpmRow = () => {
    const bpm = state.toque.globalBpm;
    const pct = ((bpm - 40) / 200) * 100;
    return `
    <div class="bg-gray-900 border border-gray-800 rounded-2xl mx-4 p-4 flex-shrink-0">
        <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tempo</span>
            <span id="portrait-bpm-display" class="text-sm font-mono font-bold text-indigo-400">${bpm} BPM</span>
        </div>
        <div class="relative w-full h-10 flex items-center cursor-pointer py-2 px-1 mx-2">
            <div class="absolute left-1 right-1 h-3 bg-gray-800 rounded-full border border-gray-700 pointer-events-none"></div>
            <div id="portrait-bpm-fill" class="absolute left-1 h-3 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full pointer-events-none"
                 style="width: calc(${pct}% - 2px)"></div>
            <div id="portrait-bpm-thumb" class="absolute w-7 h-7 bg-white rounded-full shadow-lg border-2 border-indigo-400 z-[15] touch-none pointer-events-none"
                 style="left: calc(${pct}% - 14px + 4px)"></div>
            <input type="range" min="40" max="240" value="${bpm}"
                   data-action="update-global-bpm"
                   oninput="(() => {
                       const v = parseInt(this.value, 10);
                       const p = ((v - 40) / 200) * 100;
                       const fill = document.getElementById('portrait-bpm-fill');
                       const thumb = document.getElementById('portrait-bpm-thumb');
                       const disp = document.getElementById('portrait-bpm-display');
                       if (fill) fill.style.width = 'calc(' + p + '% - 2px)';
                       if (thumb) thumb.style.left = 'calc(' + p + '% - 14px + 4px)';
                       if (disp) disp.textContent = v + ' BPM';
                   })()"
                   class="absolute -inset-x-3 inset-y-0 w-[calc(100%+24px)] h-full opacity-0 cursor-pointer z-20" />
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
};

const renderPortraitMixer = (activeSection) => {
    const tracks = activeSection.measures[0]?.tracks || [];

    const rows = tracks.map((track, tIdx) => {
        const def = state.instrumentDefinitions[track.instrument] || {};
        const mix = state.mix?.[track.instrument] || { volume: track.volume ?? 1.0, muted: track.muted ?? false };
        const vol = mix.volume ?? 1.0;
        const isMuted = mix.muted ?? false;
        const isSolo = state.soloTrack === tIdx;
        const pct = Math.round(vol * 100);
        const nameColor = (isMuted || (state.soloTrack !== undefined && state.soloTrack !== null && !isSolo))
            ? '#6b7280' : (def.color || '#d1d5db');

        const fillId = `portrait-vol-fill-${tIdx}`;
        const thumbId = `portrait-vol-thumb-${tIdx}`;
        const dispId = `portrait-vol-disp-${tIdx}`;

        return `
        <div class="flex flex-col w-full gap-2">
            <!-- Instrument name row -->
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold truncate max-w-[60%]" style="color: ${nameColor};">
                    ${def.name || track.instrument}${isSolo ? ' ◉' : ''}
                </span>
                <span id="${dispId}" class="text-xs font-mono font-bold ${isMuted ? 'text-gray-600' : 'text-indigo-400'}">${pct}%</span>
            </div>

            <!-- Controls row: Solo | Mute | ───────slider─────── -->
            <div class="flex items-center gap-2">
                <!-- Solo button -->
                <button data-action="practitioner-solo" data-track-index="${tIdx}"
                    class="h-8 px-2 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase tracking-wider transition-colors border
                           ${isSolo ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-gray-800 text-gray-500 border-gray-700 hover:text-amber-400 hover:border-amber-500/30'}"
                    title="Solo">
                    S
                </button>

                <!-- Mute button -->
                <button data-action="toggle-mute" data-track-index="${tIdx}" data-measure-index="0"
                    class="h-8 px-2 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase tracking-wider transition-colors border
                           ${isMuted ? 'bg-red-900/30 text-red-400 border-red-900/50' : 'bg-gray-800 text-gray-500 border-gray-700 hover:text-red-400 hover:border-red-900/30'}"
                    title="${isMuted ? 'Unmute' : 'Mute'}">
                    M
                </button>

                <!-- Volume slider -->
                <div class="flex-1 h-8 relative flex items-center cursor-pointer ml-1 mr-1 ${isMuted ? 'opacity-40' : ''}">
                    <div class="absolute left-0 right-0 h-2 bg-gray-800 rounded-full border border-gray-700 pointer-events-none"></div>
                    <div id="${fillId}" class="absolute left-0 h-2 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full pointer-events-none"
                         style="width: ${pct}%"></div>
                    <div id="${thumbId}" class="absolute w-5 h-5 bg-white rounded-full shadow-md border-2 border-indigo-400 z-[15] touch-none pointer-events-none"
                         style="left: calc(${pct}% - 10px)"></div>
                    <input type="range" min="0" max="1" step="0.01" value="${vol}"
                           data-action="update-volume" data-track-index="${tIdx}" data-measure-index="0"
                            oninput="(() => {
                                const v = parseFloat(this.value);
                                const p = Math.round(v * 100);
                                const fill = document.getElementById('${fillId}');
                                const thumb = document.getElementById('${thumbId}');
                                const disp = document.getElementById('${dispId}');
                                if (fill) fill.style.width = p + '%';
                                if (thumb) thumb.style.left = 'calc(' + p + '% - 10px)';
                                if (disp) disp.textContent = p + '%';
                            })()"
                           class="absolute -inset-x-3 inset-y-0 w-[calc(100%+24px)] h-full opacity-0 cursor-pointer z-20"
                           ${isMuted ? 'disabled' : ''} />
                </div>
            </div>
        </div>`;
    }).join('<div class="h-px bg-gray-800"></div>');

    return `
    <div class="bg-gray-900 border border-gray-800 rounded-xl mx-4 p-3 flex flex-col gap-3 flex-shrink-0">
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
