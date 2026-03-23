/**
 * js/ui/mobile/toolbar-gestures/layout.js
 * 
 * Layout for P3b "The Toolbar — Gesture ring"
 * Features edge zones that reveal sliding panels for BPM, Mixer, and Sections.
 */

import { state, playback } from '../../../store.js';
import { getActiveSection } from '../../../store/stateSelectors.js';
import { calculateMobileCellSize } from '../standard/layout.js';
import { TubsGrid } from '../../../components/tubsGrid.js';
import { Bars3Icon } from '../../../icons/bars3Icon.js';
import { StopIcon } from '../../../icons/stopIcon.js';
import { PlayIcon } from '../../../icons/playIcon.js';
import { PauseIcon } from '../../../icons/pauseIcon.js';
import { DeviceRotateIcon } from '../../../icons/DeviceRotateIcon.js';
import { BataExplorerModal } from '../../../components/bataExplorerModal.js';
import { ViewModeModal } from '../../../components/viewModeModal.js';
import { FolderOpenIcon } from '../../../icons/folderOpenIcon.js';

const renderSimplifiedHeader = (activeSection) => {
  return `
      <header class="h-14 px-3 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-40 gap-2">
        <div class="flex items-center overflow-hidden gap-2 flex-1 relative">
            <button data-action="toggle-menu" class="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''} flex-shrink-0">
                ${Bars3Icon('w-6 h-6 pointer-events-none')}
            </button>
            <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-amber-500 truncate">${state.toque.name}</span>
                <span class="text-sm font-medium text-gray-200 truncate">${activeSection.name}</span>
            </div>
        </div>
        <div class="flex items-center gap-1 bg-gray-900 rounded-lg p-0.5 border border-gray-800 flex-shrink-0">
            <button data-action="stop" class="w-9 h-9 rounded-md flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-all">
                ${StopIcon('w-4 h-4 pointer-events-none')}
            </button>
            <button data-action="toggle-play" class="w-9 h-9 rounded-md flex items-center justify-center transition-all shadow-lg ${state.isPlaying ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50' : 'bg-green-600 text-white shadow-green-900/20'}">
                ${state.isPlaying ? PauseIcon('w-4 h-4 pointer-events-none') : PlayIcon('w-4 h-4 ml-0.5 pointer-events-none')}
            </button>
        </div>
      </header>
  `;
};

// ─── Edge Zones and Panels ─────────────────────────────────────────────────

const renderEdgePanels = (activeSection) => {
    const sections = state.toque.sections;
    const bpmPercent = ((state.toque.globalBpm - 40) / 200) * 100;
    const currentSectionIdx = sections.findIndex(s => s.id === state.activeSectionId) + 1;
    const tracks = activeSection?.measures?.[0]?.tracks || [];

    return `
        <!-- Left Edge Grabber (Sections) -->
        <div data-action="toggle-gestures-sections" class="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-32 z-[45] flex items-center justify-start group cursor-pointer pl-1">
            <div class="w-1.5 h-12 bg-gray-800/80 rounded-full group-hover:bg-gray-600/80 transition-colors backdrop-blur-sm pointer-events-none"></div>
        </div>
        <!-- Right Edge Grabber (Mixer) -->
        <div data-action="toggle-gestures-mixer" class="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-32 z-[45] flex items-center justify-end group cursor-pointer pr-1">
            <div class="w-1.5 h-12 bg-gray-800/80 rounded-full group-hover:bg-gray-600/80 transition-colors backdrop-blur-sm pointer-events-none"></div>
        </div>
        <!-- Bottom Edge Grabber (BPM) -->
        <div data-action="toggle-gestures-bpm" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-6 z-[45] flex items-end justify-center group cursor-pointer pb-1">
            <div class="w-12 h-1.5 bg-gray-800/80 rounded-full group-hover:bg-gray-600/80 transition-colors backdrop-blur-sm pointer-events-none"></div>
        </div>

        <!-- BPM Bottom Panel -->
        <div id="gestures-bpm-sheet" class="absolute bottom-0 left-0 right-0 z-[50] transition-transform duration-300 ease-out translate-y-full flex flex-col items-center pointer-events-none">
            <div class="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] w-full max-w-xl pb-[env(safe-area-inset-bottom)] pointer-events-auto">
                <div class="flex items-center justify-center pt-3 pb-2 cursor-pointer" data-action="toggle-gestures-bpm">
                    <div class="w-12 h-1.5 bg-gray-600 rounded-full"></div>
                </div>
                <div class="px-6 pb-8 pt-2">
                    <div class="flex justify-between items-center mb-6">
                        <span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Tempo</span>
                        <span class="text-3xl font-mono text-cyan-400 font-light" id="header-global-bpm">${state.toque.globalBpm}</span>
                    </div>
                    <div class="relative w-full h-10 flex items-center group/bpm cursor-pointer mb-2">
                        <div class="absolute left-0 right-0 h-3 bg-gray-800 rounded-full border border-gray-700/50"></div>
                        <div class="absolute left-0 h-3 bg-gradient-to-r from-cyan-600/80 to-cyan-400 rounded-full" style="width: ${bpmPercent}%"></div>
                        <div class="absolute w-8 h-8 bg-white rounded-full shadow-[0_0_15px_rgba(34,211,238,0.4)] z-[15] pointer-events-none" style="left: calc(${bpmPercent}% - 16px)"></div>
                        <input type="range" min="40" max="240" value="${state.toque.globalBpm}" data-action="update-global-bpm" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Mixer Right Panel -->
        <div id="gestures-mixer-sheet" class="absolute top-0 bottom-0 right-0 w-[280px] z-[50] transition-transform duration-300 ease-out translate-x-full pointer-events-none flex">
            <div class="flex-1 bg-gray-900/95 backdrop-blur-md border-l border-gray-700/50 shadow-[-10px_0_40px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
                <div class="flex items-center justify-between p-4 border-b border-gray-800/50">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Mixer</span>
                    <button data-action="toggle-gestures-mixer" class="p-2 -mr-2 text-gray-500 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                    ${tracks.map((track, tIdx) => {
                        const def = state.instrumentDefinitions[track.instrument];
                        const mixState = state.mix[track.instrument] || { volume: 1.0, muted: false };
                        return `
                        <div class="flex flex-col gap-2 w-full">
                            <div class="flex justify-between items-center">
                                <span class="text-sm font-bold ${mixState.muted ? 'text-gray-600' : 'text-gray-200'}" style="color: ${mixState.muted ? '' : def?.color}">${def?.name || track.instrument}</span>
                                <button data-action="toggle-mute" data-track-index="${tIdx}" class="text-[10px] uppercase font-bold px-2 py-0.5 rounded border transition-colors ${mixState.muted ? 'bg-red-900/30 border-red-800/50 text-red-500' : 'bg-green-900/20 border-green-800/50 text-green-500 hidden'}">
                                    ${mixState.muted ? 'Muted' : 'Solo'}
                                </button>
                                ${!mixState.muted ? `<span class="text-xs font-mono text-gray-500">${Math.round(mixState.volume * 100)}%</span>` : ''}
                            </div>
                            <div class="flex items-center gap-3 w-full">
                                <button data-action="toggle-mute" data-track-index="${tIdx}" class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${mixState.muted ? 'bg-red-900/30 text-red-500 border border-red-900/50' : 'bg-gray-800 text-gray-400 border border-gray-700/50 shadow-sm'}">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 pointer-events-none">
                                        ${mixState.muted 
                                            ? '<path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />'
                                            : '<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />'
                                        }
                                    </svg>
                                </button>
                                <div class="flex-1 h-8 relative flex items-center group/vol cursor-pointer ${mixState.muted ? 'opacity-30' : ''}">
                                    <div class="absolute left-0 right-0 h-2 bg-gray-800 rounded-full border border-gray-700/50"></div>
                                    <div class="absolute left-0 h-2 bg-gradient-to-r from-gray-500 to-gray-400 rounded-full pointer-events-none" style="width: ${Math.round(mixState.volume * 100)}%"></div>
                                    <div class="absolute w-5 h-5 bg-white rounded-full shadow-md z-[15] pointer-events-none" style="left: calc(${Math.round(mixState.volume * 100)}% - 10px)"></div>
                                    <input type="range" min="0" max="1" step="0.01" value="${mixState.volume}" data-action="update-volume" data-track-index="${tIdx}" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>

        <!-- Sections Left Panel -->
        <div id="gestures-sections-sheet" class="absolute top-0 bottom-0 left-0 w-[280px] z-[50] transition-transform duration-300 ease-out -translate-x-full pointer-events-none flex">
            <div class="flex-1 bg-gray-900/95 backdrop-blur-md border-r border-gray-700/50 shadow-[10px_0_40px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
                <div class="flex items-center justify-between p-4 border-b border-gray-800/50">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Sections</span>
                    <button data-action="toggle-gestures-sections" class="p-2 -mr-2 text-gray-500 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                    ${sections.map((s, idx) => {
                        const isActive = s.id === state.activeSectionId;
                        return `
                        <button data-action="select-section-item" data-section-id="${s.id}" class="w-full text-left bg-gray-800/30 border ${isActive ? 'border-pink-500/50 bg-pink-500/10' : 'border-gray-800/50'} rounded-xl p-3 flex justify-between items-center transition-colors hover:bg-gray-700 active:bg-gray-600">
                            <div class="flex items-center gap-3">
                                <div class="w-6 h-6 rounded-full flex items-center justify-center border ${isActive ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'bg-gray-800 text-gray-500 border-gray-700'}">
                                    <span class="text-[10px] font-bold">${idx + 1}</span>
                                </div>
                                <span class="font-medium ${isActive ? 'text-pink-400' : 'text-gray-300'}">${s.name}</span>
                            </div>
                        </button>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
};

// ─── Shared Modals ─────────────────────────────────────────────────────────
const renderSharedModals = () => {
    let modals = '';
    
    // Mobile Menu
    if (state.uiState.isMenuOpen) {
        modals += `
        <div class="fixed inset-0 z-[60] flex flex-col">
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
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500 ml-auto pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>
                        <button data-action="open-view-mode" class="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/50 rounded-b-2xl">
                           <div class="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-green-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                           </div>
                           <span class="text-gray-100 font-medium text-base">View Mode</span>
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-gray-500 ml-auto pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </button>
                     </div>
                </nav>
            </div>
        </div>`;
    }

    if (state.uiState.modalOpen && state.uiState.modalType === 'viewMode') {
        modals += ViewModeModal();
    }

    modals += BataExplorerModal({ isMobile: true, bataExplorer: state.uiState.bataExplorer });
    return modals;
};

// ─── Main Toolbar Gestures Layout ──────────────────────────────────────────

export const ToolbarGesturesLayout = () => {
    const activeSection = getActiveSection(state) || state.toque.sections[0];
    const viewportWidth = window.innerWidth;
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
    const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;
    
    const steps = activeSection?.steps || 12;
    const mobileCellSize = calculateMobileCellSize(viewportWidth, steps, safeAreaLeft, safeAreaRight);

    return `
        <div class="flex flex-col h-full bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500 selection:text-black select-none pl-[var(--safe-area-left)] pr-[var(--safe-area-right)] overflow-hidden">
            
            <!-- Portrait Override -->
            <div class="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center p-8 text-center portrait:flex landscape:hidden">
                <div class="animate-pulse mb-6 text-cyan-500">
                    ${DeviceRotateIcon('w-24 h-24')}
                </div>
                <h2 class="text-2xl font-bold text-white mb-2">Please Rotate Your Device</h2>
                <p class="text-gray-400">Percussion Studio is designed for landscape mode.</p>
            </div>

            <!-- App Loading -->
            ${state.uiState.isLoadingRhythm ? `
            <div class="fixed inset-0 z-[90] bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
                <div class="mb-8 relative w-20 h-20">
                    <div class="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                    <div class="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 class="text-xl font-bold text-white mb-2">Loading</h2>
                <p class="text-cyan-400 text-lg font-semibold">${state.uiState.loadingRhythmName || 'Rhythm'}</p>
            </div>
            ` : ''}

            <!-- Main Landscape View -->
            <div class="landscape-only flex flex-col flex-1 h-full w-full relative overflow-hidden">
                ${renderSimplifiedHeader(activeSection)}
                
                <!-- Grid Area - Full height minus header -->
                <main class="flex-1 w-full relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950 overflow-hidden">
                    <div id="grid-container" class="w-full max-w-7xl flex flex-col items-center justify-center overflow-hidden h-full no-pinch-zoom">
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

                <!-- Gestures overlay panels and edge zones -->
                ${renderEdgePanels(activeSection)}
            </div>

            ${renderSharedModals()}
        </div>
    `;
};
