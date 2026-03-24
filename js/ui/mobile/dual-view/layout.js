/**
 * js/ui/mobile/dual-view/layout.js
 * 
 * Layout for Proposal A: Portrait <-> Landscape Dual View.
 * Portrait mode acts as a Mixer and Control Surface.
 * Landscape mode acts as the notation grid.
 */

import { state, playback } from '../../../store.js';
import { getActiveSection } from '../../../store/stateSelectors.js';
import { calculateMobileCellSize } from '../standard/layout.js';
import { TubsGrid } from '../../../components/tubsGrid.js';
import { Bars3Icon } from '../../../icons/bars3Icon.js';
import { StopIcon } from '../../../icons/stopIcon.js';
import { PlayIcon } from '../../../icons/playIcon.js';
import { PauseIcon } from '../../../icons/pauseIcon.js';
import { FolderOpenIcon } from '../../../icons/folderOpenIcon.js';
import { BataExplorerModal } from '../../../components/bataExplorerModal.js';
import { ViewModeModal } from '../../../components/viewModeModal.js';
import { MobileMenuPanel } from '../../../components/mobileMenuPanel.js';

// Reusing shared modal render logic
const renderSharedModals = () => {
    let modals = '';
    
    if (state.uiState.isMenuOpen) { modals += MobileMenuPanel(); }

    if (state.uiState.modalOpen && state.uiState.modalType === 'viewMode') {
        modals += ViewModeModal();
    }

    modals += BataExplorerModal({ isMobile: true, bataExplorer: state.uiState.bataExplorer });
    return modals;
};

const renderSimplifiedHeader = (activeSection) => {
    return `
        <header class="h-14 px-3 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-40 gap-2">
          <div class="flex items-center overflow-hidden gap-2 flex-1 relative">
              <button data-action="toggle-menu" class="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''} flex-shrink-0">
                  ${Bars3Icon('w-6 h-6 pointer-events-none')}
              </button>
              <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold text-purple-500 truncate">${state.toque.name}</span>
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

export const DualViewLayout = () => {
    const activeSection = getActiveSection(state) || state.toque.sections[0];
    const viewportWidth = window.innerWidth;
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaLeft = parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10) || 0;
    const safeAreaRight = parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10) || 0;
    
    const steps = activeSection?.steps || 12;
    const mobileCellSize = calculateMobileCellSize(viewportWidth, steps, safeAreaLeft, safeAreaRight);

    return `
      <div class="flex flex-col h-full bg-gray-950 text-gray-100 font-sans selection:bg-purple-500 selection:text-black select-none pl-[var(--safe-area-left)] pr-[var(--safe-area-right)] overflow-hidden">
          
          <!-- App Loading -->
          ${state.uiState.isLoadingRhythm ? `
          <div class="fixed inset-0 z-[90] bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
              <div class="mb-8 relative w-20 h-20">
                  <div class="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                  <div class="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 class="text-xl font-bold text-white mb-2">Loading</h2>
              <p class="text-purple-400 text-lg font-semibold">${state.uiState.loadingRhythmName || 'Rhythm'}</p>
          </div>
          ` : ''}
  
          <!-- PORTRAIT MODE: Control Surface -->
          <div class="portrait:flex landscape:hidden flex-col flex-1 h-full w-full relative pt-[env(safe-area-inset-top)] bg-gray-950">
              ${renderSimplifiedHeader(activeSection)}
              
              <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                
                <!-- Practice Info Card -->
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Now Playing</span>
                        <span class="text-xs font-mono text-gray-500 border border-gray-700 bg-gray-800 px-1.5 py-0.5 rounded">
                            Rep ${state.isPlaying ? playback.repetitionCounter : 1} / ${activeSection.repetitions || 1}
                        </span>
                    </div>
                    
                    <div class="flex items-center gap-4 mt-2">
                        <!-- Play/Pause Big Button for Portrait -->
                        <button data-action="toggle-play" class="w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${state.isPlaying ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' : 'bg-green-600 text-white shadow-green-900/30'}">
                            ${state.isPlaying ? PauseIcon('w-8 h-8 pointer-events-none') : PlayIcon('w-8 h-8 ml-1 pointer-events-none')}
                        </button>
                        <div class="flex flex-col">
                            <h3 class="text-xl font-bold text-white leading-tight">${state.toque.name}</h3>
                            <span class="text-gray-400 text-sm">${activeSection.name}</span>
                        </div>
                    </div>
                </div>

                <!-- Tempo Control -->
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-xs text-gray-400 uppercase font-bold tracking-wider">Tempo</span>
                        <div class="flex gap-2">
                            ${state.countInEnabled ? `<span class="text-[10px] font-bold text-purple-400 bg-purple-900/30 px-1.5 py-0.5 rounded border border-purple-500/30">COUNT-IN ON</span>` : ''}
                            <span class="text-sm font-mono text-purple-400 font-bold">${state.toque.globalBpm} BPM</span>
                        </div>
                    </div>
                    <div class="relative w-full h-10 flex items-center group/bpm cursor-pointer py-2 px-2">
                        <div class="absolute left-2 right-2 h-3 bg-gray-800 rounded-full cursor-pointer"></div>
                        <div class="absolute left-2 h-3 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full cursor-pointer" style="width: ${((state.toque.globalBpm - 40) / 200) * 100}%"></div>
                        <div class="absolute w-7 h-7 bg-white rounded-full shadow-lg border-2 border-purple-400 cursor-pointer z-[15] touch-none" style="left: calc(${((state.toque.globalBpm - 40) / 200) * 100}% - 14px + 8px)"></div>
                        <input type="range" min="40" max="240" value="${state.toque.globalBpm}" data-action="update-global-bpm" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                    </div>
                </div>

                <!-- Mixer -->
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 pb-6">
                    <span class="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-4">Mix Console</span>
                    <div class="flex flex-col gap-5">
                        ${activeSection.measures[0]?.tracks.map((track, tIdx) => {
                            const def = state.instrumentDefinitions[track.instrument];
                            const mixState = state.mix[track.instrument] || { volume: 1.0, muted: false };
                            return `
                            <div class="flex flex-col w-full gap-2">
                                <div class="flex justify-between items-center px-1">
                                    <span class="text-sm font-bold ${mixState.muted ? 'text-gray-600' : 'text-gray-200'}" style="color: ${mixState.muted ? '' : def?.color}">${def?.name || track.instrument}</span>
                                    <div class="flex gap-2 items-center">
                                        <span class="text-xs font-mono text-gray-500 ${mixState.muted ? 'opacity-30' : ''}">${Math.round(mixState.volume * 100)}%</span>
                                        <button data-action="toggle-mute" data-track-index="${tIdx}" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${mixState.muted ? 'bg-red-900/30 text-red-500 border border-red-900/50' : 'bg-gray-800 text-gray-400 border border-gray-700'}">
                                            ${mixState.muted ? 'Muted' : 'Mute'}
                                        </button>
                                    </div>
                                </div>
                                <div class="flex-1 h-8 relative flex items-center group/vol cursor-pointer ${mixState.muted ? 'opacity-30' : ''}">
                                    <div class="absolute left-0 right-0 h-2 bg-gray-800 rounded-full cursor-pointer"></div>
                                    <div class="absolute left-0 h-2 bg-gradient-to-r from-gray-500 to-gray-400 rounded-full cursor-pointer pointer-events-none" style="width: ${Math.round(mixState.volume * 100)}%"></div>
                                    <div class="absolute w-5 h-5 bg-white rounded-full shadow-md z-[15] touch-none pointer-events-none" style="left: calc(${Math.round(mixState.volume * 100)}% - 10px)"></div>
                                    <input type="range" min="0" max="1" step="0.01" value="${mixState.volume}" data-action="update-volume" data-track-index="${tIdx}" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Sections Navigator -->
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
                    <span class="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-4">Sections</span>
                    <div class="flex flex-col gap-2">
                        ${state.toque.sections.map((s, idx) => {
                            const isActive = s.id === state.activeSectionId;
                            return `
                            <button data-action="select-section-item" data-section-id="${s.id}" class="w-full text-left bg-gray-950 border ${isActive ? 'border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.15)]' : 'border-gray-800'} rounded-lg p-3 flex justify-between items-center transition-colors hover:bg-gray-800 active:bg-gray-800">
                                <div class="flex items-center gap-3">
                                    <div class="w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-500'}">
                                        <span class="text-[10px] font-bold">${idx + 1}</span>
                                    </div>
                                    <span class="font-medium ${isActive ? 'text-purple-400' : 'text-gray-300'}">${s.name}</span>
                                </div>
                                <span class="text-xs font-mono text-gray-500">x${s.repetitions || 1}</span>
                            </button>
                            `;
                        }).join('')}
                    </div>
                </div>

              </div>
          </div>
  
          <!-- LANDSCAPE MODE: Notation View -->
          <div class="landscape:flex portrait:hidden flex-col flex-1 h-full w-full relative">
              
              <!-- Slim playback bar -->
              <div class="h-10 bg-gray-950 border-b border-gray-800 flex items-center px-2 justify-between z-40 shadow-sm gap-2">
                  <div class="flex items-center gap-2">
                      <button data-action="toggle-menu" class="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''} flex-shrink-0">
                          ${Bars3Icon('w-5 h-5 pointer-events-none')}
                      </button>
                      <span class="text-sm font-bold text-gray-200 ml-1">${activeSection.name}</span>
                      <span class="text-[10px] uppercase font-bold text-gray-500 border border-gray-700 bg-gray-800 px-1.5 py-0.5 rounded ml-1 hidden sm:inline-block">
                          Rep ${state.isPlaying ? playback.repetitionCounter : 1}/${activeSection.repetitions || 1}
                      </span>
                  </div>
                  
                  <div class="flex items-center gap-3">
                      <span class="text-xs font-mono font-bold ${state.isPlaying ? 'text-green-400' : 'text-purple-400'}">
                          ♩=${state.isPlaying ? Math.round(playback.currentPlayheadBpm) : state.toque.globalBpm}
                      </span>
                      <div class="flex items-center gap-1 bg-gray-900 rounded border border-gray-800 p-0.5">
                          <button data-action="stop" class="w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:text-red-400">
                              ${StopIcon('w-3.5 h-3.5 pointer-events-none')}
                          </button>
                          <button data-action="toggle-play" class="w-7 h-7 rounded flex items-center justify-center ${state.isPlaying ? 'text-amber-500 bg-gray-800' : 'text-green-500'}">
                              ${state.isPlaying ? PauseIcon('w-3.5 h-3.5 pointer-events-none') : PlayIcon('w-3.5 h-3.5 ml-0.5 pointer-events-none')}
                          </button>
                      </div>
                  </div>
              </div>

              <!-- Grid Area - Full height minus slim bar -->
              <main class="flex-[1_0_0] min-h-0 w-full relative pl-[var(--safe-area-left)] pr-[var(--safe-area-right)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950 flex flex-col items-center justify-center">
                  <div id="grid-container" class="w-full max-w-7xl h-[calc(100vh-40px)] flex flex-col items-center justify-center overflow-auto no-pinch-zoom">
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
  
          ${renderSharedModals()}
      </div>
    `;
  };
