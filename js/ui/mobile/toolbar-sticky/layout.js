/**
 * js/ui/mobile/toolbar-sticky/layout.js
 * 
 * Layout for P3c "Sticky Footer Strip" variant.
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
import { MobileMenuPanel } from '../../../components/mobileMenuPanel.js';

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
      </header>
  `;
};

const renderStickyFooter = (activeSection) => {
    const sections = state.toque.sections;
    const currentRep = state.isPlaying ? playback.repetitionCounter : 1;
    const totalReps = activeSection.repetitions || 1;
    const bpm = state.isPlaying ? Math.round(playback.currentPlayheadBpm) : state.toque.globalBpm;
    
    // Calculate index for navigation
    const currentIndex = sections.findIndex(s => s.id === activeSection.id);
    const hasNext = currentIndex < sections.length - 1;
    const hasPrev = currentIndex > 0;
    
    return `
      <!-- Sticky Footer -->
      <div id="toolbar-sticky-footer" class="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-gray-900 border-t border-gray-700 pl-[var(--safe-area-left)] pr-[var(--safe-area-right)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] select-none">
        
        <!-- Row 1: Essential Controls -->
        <div class="h-12 flex items-center justify-between px-3 border-b border-gray-800">
            <!-- Tempo Slider -->
            <div class="flex items-center gap-2 flex-1 min-w-0 pr-4">
                <span class="text-xs font-mono font-bold text-cyan-400 w-14 flex-shrink-0">♩=${state.toque.globalBpm}</span>
                <div class="relative w-full h-8 flex items-center group/bpm cursor-pointer py-2">
                    <div class="absolute left-0 right-0 h-1.5 bg-gray-800 rounded-full cursor-pointer"></div>
                    <div class="absolute left-0 h-1.5 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full cursor-pointer" style="width: ${((state.toque.globalBpm - 40) / 200) * 100}%"></div>
                    <div class="absolute w-5 h-5 bg-white rounded-full shadow-lg border border-cyan-400 cursor-pointer z-10 touch-none" style="left: calc(${((state.toque.globalBpm - 40) / 200) * 100}% - 10px)"></div>
                    <input type="range" min="40" max="240" value="${state.toque.globalBpm}" data-action="update-global-bpm" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                </div>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
                <!-- Count-in toggle -->
                <button data-action="toggle-count-in" class="h-8 px-2 rounded-md flex items-center justify-center gap-1 transition-colors border ${state.countInEnabled ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/50' : 'bg-gray-800 text-gray-500 border-gray-700'}">
                   <span class="text-[10px] font-bold">CNT</span>
                   ${state.countInEnabled ? '<span class="text-[10px] font-mono">⓸</span>' : ''}
                </button>
                
                <!-- Playback controls -->
                <div class="flex items-center gap-1 bg-gray-950 rounded-lg p-0.5 border border-gray-800">
                    <button data-action="toggle-play" class="w-8 h-8 rounded-md flex items-center justify-center transition-all ${state.isPlaying ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50' : 'bg-green-600 text-white'}">
                        ${state.isPlaying ? PauseIcon('w-4 h-4 pointer-events-none') : PlayIcon('w-4 h-4 ml-0.5 pointer-events-none')}
                    </button>
                    <button data-action="stop" class="w-8 h-8 rounded-md flex items-center justify-center bg-gray-800 text-gray-400 hover:text-red-400 transition-colors">
                        ${StopIcon('w-4 h-4 pointer-events-none')}
                    </button>
                </div>
            </div>
        </div>

        <!-- Row 2: Status + Navigation -->
        <div class="h-10 flex items-center px-3 justify-between bg-gray-950 text-xs text-gray-400">
            <!-- Section Navigation -->
            <div class="flex items-center gap-2 flex-1 w-1/3">
                <button data-action="prev-section" class="p-1.5 rounded-md hover:bg-gray-800 transition-colors ${!hasPrev ? 'opacity-30 cursor-not-allowed' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <div class="flex flex-col min-w-0 flex-1 truncate text-center">
                    <span class="font-bold text-gray-300 truncate">${activeSection.name}</span>
                    <span class="text-[9px] uppercase tracking-wider text-gray-500">(${currentIndex + 1}/${sections.length})</span>
                </div>
                <button data-action="next-section" class="p-1.5 rounded-md hover:bg-gray-800 transition-colors ${!hasNext ? 'opacity-30 cursor-not-allowed' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
            </div>

            <!-- Reps / Random -->
            <div class="flex justify-center flex-1 w-1/3 border-x border-gray-800 px-2 mx-2">
                 <!-- Placeholder for Rep/Random inline controls -->
                 <div class="flex items-center gap-1.5 cursor-pointer bg-gray-800/50 hover:bg-gray-800 px-2 py-1 rounded-md border border-gray-700/50" onclick="window.actions && window.actions.updateSectionSettings('${activeSection.id}', { repetitions: Math.max(1, (${activeSection.repetitions || 1} + 1)) })">
                    <span class="font-mono text-cyan-400">Rep ${currentRep}/${totalReps}</span>
                    ${Math.random() > 0.5 ? '<span class="text-[10px]">🎲</span>' : ''} <!-- Random indicator mockup -->
                 </div>
            </div>

            <!-- Live Status -->
            <div class="flex justify-end flex-1 w-1/3">
                 <span class="font-mono ${state.isPlaying ? 'text-green-400' : 'text-gray-500'}">Live: ${bpm} BPM</span>
            </div>
        </div>
      </div>
    `;
};

// Shared Modals
const renderSharedModals = () => {
    let modals = '';
    
    // Mobile Menu
    if (state.uiState.isMenuOpen) { modals += MobileMenuPanel(); }

    if (state.uiState.modalOpen && state.uiState.modalType === 'viewMode') {
        modals += ViewModeModal();
    }

    modals += BataExplorerModal({ isMobile: true, bataExplorer: state.uiState.bataExplorer });
    return modals;
};

// Main Layout
export const ToolbarStickyLayout = () => {
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
            
            <!-- Grid Area - Full height minus header (56px) and footer strip (88px) -->
            <main class="flex-1 w-full relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950 pb-[88px]">
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

            ${renderStickyFooter(activeSection)}
        </div>

        ${renderSharedModals()}
    </div>
  `;
};
