import { state } from '../../../store.js';
import { trackMixer } from '../../../services/trackMixer.js';

export const renderMixerModal = (activeSection) => {
    const tracks = activeSection.measures[0]?.tracks || [];

    const rows = tracks.map((track, tIdx) => {
        const def = state.instrumentDefinitions[track.instrument] || {};
        const mix = state.mix?.[track.instrument] || { volume: track.volume ?? 1.0, muted: track.muted ?? false };
        const vol = mix.volume ?? 1.0;
        const isMuted = mix.muted ?? false;
        const isEffectivelyMuted = trackMixer.isTrackEffectivelyMuted(tIdx, track);
        const nameColor = isEffectivelyMuted ? '#6b7280' : (def.color || '#d1d5db');
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
                    <span class="text-xs font-bold uppercase tracking-wider truncate max-w-[120px] ${isEffectivelyMuted ? 'line-through' : ''}"
                          style="color: ${nameColor};">${def.name || track.instrument}</span>
                </div>
                <span class="text-xl font-mono font-bold ${isEffectivelyMuted ? 'text-gray-600' : 'text-indigo-400'}">${pct}%</span>
            </div>

            <!-- Wide slider — identical style to BPM slider -->
            <div class="relative w-full h-10 flex items-center group/vol cursor-pointer py-2 px-1 ${isEffectivelyMuted ? 'opacity-40' : ''}">
                <div class="absolute left-1 right-1 h-3 bg-gray-800 rounded-full border border-gray-700"></div>
                <div class="absolute left-1 h-3 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                     style="width: calc(${pct}% - 2px)"></div>
                <div class="absolute w-7 h-7 bg-white rounded-full shadow-lg border-2 border-indigo-400 z-[15] touch-none"
                     style="left: calc(${pct}% - 14px + 4px)"></div>
                <input type="range" min="0" max="1" step="0.01" value="${vol}"
                    data-action="update-volume" data-track-index="${tIdx}" data-measure-index="0"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            </div>
        </div>`;

    }).join('');

    return `
    <div class="fixed bottom-[52px] left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5 w-72 flex flex-col gap-4 z-[65] animate-in fade-in max-h-[70vh] overflow-y-auto custom-scrollbar">
        <!-- Mixer header with X -->
        <div class="flex justify-between items-center pb-2 border-b border-gray-800">
            <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Mixer</span>
            <button data-action="dual-mode-close-popover"
                class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                title="Close">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 pointer-events-none">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        ${rows}
    </div>`;
};
