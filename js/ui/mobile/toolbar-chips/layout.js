/**
 * js/ui/mobile/toolbar-chips/layout.js
 * 
 * Layout for P3a "The Toolbar — Quick-access chips"
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
import { ChevronDownIcon } from '../../../icons/chevronDownIcon.js';
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

const renderChipPopovers = (activeSection) => {
    const activePopover = state.uiState.activeChipPopover || null;
    
    // Safety check just in case sections haven't loaded
    if (!state.toque || !state.toque.sections) return '';

    return `
        <!-- Rep Popover -->
        ${activePopover === 'chip-rep-popover' ? `
        <div class="absolute bottom-[56px] left-4 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 min-w-[200px] animate-in fade-in z-[60]">
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Repetitions</span>
                <span class="text-xl font-bold text-white">×${activeSection.repetitions || 1}</span>
            </div>
            <div class="flex gap-2">
                <button data-action="chip-update-rep" data-delta="-1" class="flex-1 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 p-2 rounded-xl text-xl font-bold flex items-center justify-center">−</button>
                <button data-action="chip-update-rep" data-delta="1" class="flex-1 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 p-2 rounded-xl text-xl font-bold flex items-center justify-center">+</button>
            </div>
            <button data-action="chip-toggle-random" class="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 p-3 rounded-xl flex items-center justify-center gap-2 mt-1 border border-transparent text-gray-500 opacity-50 cursor-not-allowed">
                <span class="text-lg disabled">🎲</span> <span class="text-sm font-bold">Randomize (Soon)</span>
            </button>
        </div>` : ''}

        <!-- Tempo Popover -->
        ${activePopover === 'chip-tempo-popover' ? `
        <div class="absolute bottom-[56px] left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 min-w-[280px] w-4/5 max-w-[400px] animate-in fade-in z-[60]">
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Tempo</span>
                <span class="text-xl font-mono text-cyan-400">${state.toque.globalBpm} BPM</span>
            </div>
            <div class="relative w-full h-8 flex items-center group/bpm cursor-pointer py-2">
                <div class="absolute left-0 right-0 h-2 bg-gray-900 rounded-full cursor-pointer border border-gray-700"></div>
                <div class="absolute left-0 h-2 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full cursor-pointer" style="width: ${((state.toque.globalBpm - 40) / 200) * 100}%"></div>
                <div class="absolute w-6 h-6 bg-white rounded-full shadow-lg border-2 border-cyan-400 cursor-pointer z-[15] touch-none" style="left: calc(${((state.toque.globalBpm - 40) / 200) * 100}% - 12px)"></div>
                <input type="range" min="40" max="240" value="${state.toque.globalBpm}" data-action="update-global-bpm" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            </div>
        </div>` : ''}

        <!-- Section Popover -->
        ${activePopover === 'chip-section-popover' ? `
        <div class="absolute bottom-[56px] right-4 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 min-w-[240px] max-w-[280px] max-h-[50vh] overflow-y-auto animate-in fade-in z-[60]">
            <div class="p-2 border-b border-gray-700 mb-1 sticky top-0 bg-gray-800">
                <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Jump to Section</span>
            </div>
            ${state.toque.sections.map((s, idx) => {
                const isActive = s.id === state.activeSectionId;
                return `
                <button data-action="chip-select-section" data-section-id="${s.id}" class="w-full text-left bg-transparent ${isActive ? 'bg-cyan-500/10' : ''} rounded-lg px-3 py-2 flex items-center gap-3 transition-colors hover:bg-gray-700 active:bg-gray-600">
                    <span class="text-xs font-bold ${isActive ? 'text-cyan-400' : 'text-gray-500'} w-4">${idx + 1}.</span>
                    <span class="font-medium text-sm ${isActive ? 'text-cyan-400' : 'text-gray-200'} truncate flex-1">${s.name}</span>
                </button>
                `;
            }).join('')}
        </div>` : ''}

        <!-- Backdrop to close popover -->
        ${activePopover ? `
        <div data-action="chip-close-popover" class="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm top-0 bottom-[48px]"></div>
        ` : ''}
    `;
};

const renderBottomDrawer = (activeSection) => {
    // Determine section index
    const sections = state.toque.sections;
    const currentSectionIdx = sections.findIndex(s => s.id === state.activeSectionId) + 1;
    const totalSections = sections.length;

    return `
      <!-- Drawer Container -->
      <div id="toolbar-drawer" class="fixed bottom-0 left-0 right-0 z-50 flex flex-col transition-transform duration-300 ease-in-out translate-y-[calc(100%-48px)] pl-[var(--safe-area-left)] pr-[var(--safe-area-right)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        <!-- Peek Bar with Chips -->
        <div class="h-12 bg-gray-900 border-t border-gray-700 flex items-center px-3 justify-between select-none relative z-[58]">
            <div class="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 mr-2 px-1">
                <!-- Reps Chip -->
                <button data-action="chip-toggle-popover" data-popover-id="chip-rep-popover" class="bg-gray-800 border ${state.uiState.activeChipPopover === 'chip-rep-popover' ? 'border-amber-400 bg-gray-700' : 'border-gray-600'} hover:border-amber-500/50 rounded-full px-3 py-1 flex items-center gap-1.5 transition-colors flex-shrink-0">
                    <span class="text-xs font-bold ${state.uiState.activeChipPopover === 'chip-rep-popover' ? 'text-white' : 'text-gray-200'}">×${activeSection.repetitions || 1}</span>
                    <span class="text-xs opacity-80">🎲</span>
                </button>

                <!-- Tempo Chip -->
                <button data-action="chip-toggle-popover" data-popover-id="chip-tempo-popover" class="bg-gray-800 border ${state.uiState.activeChipPopover === 'chip-tempo-popover' ? 'border-cyan-400 bg-gray-700' : 'border-gray-600'} hover:border-cyan-500/50 rounded-full px-3 py-1 flex items-center gap-1 transition-colors flex-shrink-0">
                    <span class="text-[10px] text-gray-400 font-bold">♩=</span>
                    <span class="text-xs font-bold ${state.isPlaying ? 'text-green-400' : 'text-cyan-400'}">${state.isPlaying ? Math.round(playback.currentPlayheadBpm) : state.toque.globalBpm}</span>
                </button>

                <!-- Section Chip -->
                <button data-action="chip-toggle-popover" data-popover-id="chip-section-popover" class="bg-gray-800 border ${state.uiState.activeChipPopover === 'chip-section-popover' ? 'border-pink-400 bg-gray-700' : 'border-gray-600'} hover:border-pink-500/50 rounded-full px-3 py-1 flex items-center gap-1.5 transition-colors max-w-[150px] flex-shrink-0">
                    <span class="text-xs font-bold ${state.uiState.activeChipPopover === 'chip-section-popover' ? 'text-white' : 'text-gray-200'} truncate">${activeSection.name}</span>
                    <span class="text-[10px] text-gray-400 font-mono ml-0.5">${currentSectionIdx}/${totalSections}</span>
                </button>
            </div>
            
            <!-- Drawer Toggle Handle -->
            <button data-action="toggle-toolbar-drawer" class="w-9 h-9 flex justify-center items-center text-gray-400 hover:text-white transition-colors bg-gray-800 border border-gray-700 rounded-full flex-shrink-0 active:bg-gray-700 z-[61]">
                <svg id="drawer-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 transition-transform duration-300 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
            </button>

            ${renderChipPopovers(activeSection)}
        </div>

        <!-- Drawer Content (Revealed when open) -->
        <div class="bg-gray-950 border-t border-gray-800 h-[70vh] flex flex-col overflow-y-auto">
            
            <!-- Mixer -->
            <div class="p-4 border-b border-gray-800">
                <span class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-3 block">Mixer</span>
                <div class="flex flex-col gap-3">
                    ${activeSection.measures[0]?.tracks.map((track, tIdx) => {
                        const def = state.instrumentDefinitions[track.instrument];
                        const mixState = state.mix[track.instrument] || { volume: 1.0, muted: false };
                        return `
                        <div class="flex items-center gap-3 w-full">
                            <button data-action="toggle-mute" data-track-index="${tIdx}" class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${mixState.muted ? 'bg-red-900/30 text-red-500 border border-red-900/50' : 'bg-gray-800 text-gray-400 border border-gray-700'}">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 pointer-events-none">
                                    ${mixState.muted 
                                        ? '<path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />'
                                        : '<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />'
                                    }
                                </svg>
                            </button>
                            <span class="w-20 text-xs font-bold ${mixState.muted ? 'text-gray-600' : 'text-gray-300'} truncate" style="color: ${mixState.muted ? '' : def?.color}">${def?.name || track.instrument}</span>
                            <div class="flex-1 h-6 relative flex items-center group/vol cursor-pointer ${mixState.muted ? 'opacity-30' : ''}">
                                <div class="absolute left-0 right-0 h-1.5 bg-gray-800 rounded-full cursor-pointer border border-gray-700/50"></div>
                                <div class="absolute left-0 h-1.5 bg-gradient-to-r from-gray-500 to-gray-400 rounded-full cursor-pointer pointer-events-none" style="width: ${Math.round(mixState.volume * 100)}%"></div>
                                <div class="absolute w-4 h-4 bg-white rounded-full shadow-md z-[15] touch-none pointer-events-none" style="left: calc(${Math.round(mixState.volume * 100)}% - 8px)"></div>
                                <input type="range" min="0" max="1" step="0.01" value="${mixState.volume}" data-action="update-volume" data-track-index="${tIdx}" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                            </div>
                            <span class="w-10 text-right text-xs font-mono text-gray-500 ${mixState.muted ? 'opacity-30' : ''}">${Math.round(mixState.volume * 100)}%</span>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Sections Navigator -->
            <div class="p-4 pb-12 mb-12">
                <span class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-3 block">Sections</span>
                <div class="flex flex-col gap-2">
                    ${sections.map((s, idx) => {
                        const isActive = s.id === state.activeSectionId;
                        return `
                        <button data-action="select-section-item" data-section-id="${s.id}" class="w-full text-left bg-gray-900 border ${isActive ? 'border-pink-500/50' : 'border-gray-800'} rounded-lg p-3 flex justify-between items-center transition-colors hover:bg-gray-800 active:bg-gray-700">
                            <div class="flex items-center gap-3">
                                <div class="w-6 h-6 rounded-full flex items-center justify-center border ${isActive ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'bg-gray-800 text-gray-500 border-gray-700'}">
                                    <span class="text-[10px] font-bold">${idx + 1}</span>
                                </div>
                                <span class="font-medium ${isActive ? 'text-pink-400' : 'text-gray-300'}">${s.name}</span>
                            </div>
                            <span class="text-xs font-mono text-gray-500">x${s.repetitions || 1}</span>
                        </button>
                        `;
                    }).join('')}
                </div>
            </div>

        </div>
      </div>
    `;
};

// Modals rendering
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

// ─── Main Toolbar Layout ───────────────────────────────────────────────────

export const DashboardToolbarChipsLayout = () => {
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
        <div class="landscape-only flex flex-col flex-1 h-full w-full relative">
            ${renderSimplifiedHeader(activeSection)}
            
            <!-- Grid Area - Full height minus header and peek bar (48px) -->
            <main class="flex-1 w-full relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950 h-[calc(100vh-56px-48px)]">
                <div id="grid-container" class="w-full max-w-7xl py-2 flex flex-col items-center justify-center overflow-hidden h-full no-pinch-zoom">
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

            ${renderBottomDrawer(activeSection)}
        </div>

        ${renderSharedModals()}
    </div>
  `;
};
