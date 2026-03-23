import { state } from '../store.js';
import { viewManager } from '../views/viewManager.js';

export const ViewModeModal = () => {
    if (!state.uiState.modalOpen || state.uiState.modalType !== 'viewMode') return '';

    const activeViewId = viewManager.getActiveViewId();
    const isStandard = activeViewId === 'mobile-grid';
    const isPlayer = activeViewId === 'mobile-player';
    const isPlayerMixer = activeViewId === 'mobile-player-mixer';
    const isDashboard = activeViewId === 'mobile-dashboard';
    const isToolbarGestures = activeViewId === 'mobile-toolbar-gestures';
    const isToolbarSticky = activeViewId === 'mobile-toolbar-sticky';
    const isDimA = activeViewId === 'mobile-dual-view';
    const activeTag = `<span class="text-[9px] font-bold text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded ml-auto flex-shrink-0">Active</span>`;

    return `
        <div class="fixed inset-0 z-50 flex flex-col">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" data-action="close-modal-bg"></div>
            
            <!-- Modal Content -->
            <div class="relative w-full h-full sm:w-4/5 sm:max-w-sm bg-gray-900 border-r border-gray-800 shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom duration-200 pl-[var(--safe-area-left)] pr-[var(--safe-area-right)]">
                <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                    <h2 class="text-lg font-bold text-white">View Mode</h2>
                    <button data-action="close-modal" class="p-2 text-gray-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-3 pb-8">

                    <!-- Available Views -->
                    <div class="mb-4">
                        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-2">Views</h3>
                        <div class="bg-gray-800/50 rounded-2xl border border-gray-700/50">
                            <button data-action="select-view-mode" data-view-id="standard" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-t-2xl border-b border-gray-700/30">
                                <div class="w-7 h-7 rounded-lg bg-gray-600/30 flex items-center justify-center flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-300 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                                </div>
                                <span class="text-gray-100 text-sm font-medium">Standard</span>
                                ${isStandard ? activeTag : '<span class="text-[10px] text-gray-500 ml-auto">Classic grid layout</span>'}
                            </button>
                            <button data-action="select-view-mode" data-view-id="p1" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <div class="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-amber-400 pointer-events-none"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>
                                </div>
                                <span class="text-gray-100 text-sm font-medium">The Player</span>
                                ${isPlayer ? activeTag : '<span class="text-[10px] text-gray-500 ml-auto">Music player paradigm</span>'}
                            </button>
                            <button data-action="select-view-mode" data-view-id="p1a" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <div class="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-emerald-400 pointer-events-none">
                                      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                    </svg>
                                </div>
                                <span class="text-gray-100 text-sm font-medium">Player + Mixer</span>
                                ${isPlayerMixer ? activeTag : '<span class="text-[10px] text-gray-500 ml-auto">Mixer on swipe</span>'}
                            </button>
                            <button data-action="select-view-mode" data-view-id="p2" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-b-2xl">
                                <div class="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-cyan-400 pointer-events-none">
                                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
                                    </svg>
                                </div>
                                <span class="text-gray-100 text-sm font-medium">The Dashboard</span>
                                ${isDashboard ? activeTag : '<span class="text-[10px] text-gray-500 ml-auto">Card-based navigator</span>'}
                            </button>
                        </div>
                    </div>

                    <!-- Redesign Exploration (v1) -->
                    <div class="mb-4">
                        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-2">Redesign Exploration</h3>
                        <div class="bg-gray-800/50 rounded-2xl border border-gray-700/50">
                            <!-- P1: The Player -->
                            <div class="px-4 py-2.5 border-b border-gray-700/30">
                                <span class="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Proposal 1 — The Player</span>
                            </div>
                            <button data-action="select-view-mode" data-view-id="p1" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">P1: The Player — Music Player Paradigm</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="p1a" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">1A: Mixer on Swipe</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="p1b" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">1B: Circular Tempo Knob</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="p1c" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">1C: Focus Mode</span>
                            </button>

                            <!-- P2: The Dashboard -->
                            <div class="px-4 py-2.5 border-b border-gray-700/30 bg-gray-800/30">
                                <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Proposal 2 — The Dashboard</span>
                            </div>
                            <button data-action="select-view-mode" data-view-id="p2" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">P2: The Dashboard — Card-Based Navigator</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="p2a" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">2A: Stack Layout</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="p2b" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">2B: Split Card</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="p2c" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">2C: Playlist Mode</span>
                            </button>

                            <!-- P3: The Toolbar -->
                            <div class="px-4 py-2.5 border-b border-gray-700/30 bg-gray-800/30">
                                <span class="text-[10px] font-bold text-green-400 uppercase tracking-wider">Proposal 3 — The Toolbar</span>
                            </div>
                            <button data-action="select-view-mode" data-view-id="p3" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">P3: The Toolbar — Persistent Bottom Drawer</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="p3a" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-xs ${activeViewId === 'mobile-toolbar-chips' ? 'text-white font-bold' : 'text-gray-400'}">3A: Quick-Access Chips</span>
                                ${activeViewId === 'mobile-toolbar-chips' ? activeTag : ''}
                            </button>
                            <button data-action="select-view-mode" data-view-id="p3b" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-xs ${isToolbarGestures ? 'text-white font-bold' : 'text-gray-400'}">3B: Gesture Ring</span>
                                ${isToolbarGestures ? activeTag : ''}
                            </button>
                            <button data-action="select-view-mode" data-view-id="p3c" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-b-2xl">
                                <span class="text-xs ${isToolbarSticky ? 'text-white font-bold' : 'text-gray-400'}">3C: Sticky Footer Strip</span>
                                ${isToolbarSticky ? activeTag : ''}
                            </button>
                        </div>
                    </div>

                    <!-- Expanded Ideas (v2) -->
                    <div class="mb-4">
                        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-2">Expanded Ideas (v2)</h3>
                        <div class="bg-gray-800/50 rounded-2xl border border-gray-700/50">
                            <!-- Dimension A -->
                            <div class="px-4 py-2.5 border-b border-gray-700/30">
                                <span class="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Dimensions</span>
                            </div>
                            <button data-action="select-view-mode" data-view-id="dim-a" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-sm ${isDimA ? 'text-white font-bold' : 'text-gray-300'}">A: Portrait ↔ Landscape Dual View</span>
                                ${isDimA ? activeTag : ''}
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-a1" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">A1: Auto-Switch by Context</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-a2" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">A2: Portrait Mini-Grid</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-a3" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">A3: Two-App Feeling</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-b" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">B: Play Mode vs View Mode</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-c" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">C: Elevated Mixer</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-c1" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">C1: Mixer Strip</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-c2" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">C2: Mixer Toggle</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-c3" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">C3: Track Drawer</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-d" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">D: Compressed/Zoomable Notation</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-d1" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">D1: Bird's Eye Minimap</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-d2" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">D2: Pattern Blocks</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-d3" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">D3: Zoom Lens</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-e" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">E: Section Loop Selection</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-e1" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">E1: Playlist Checkboxes</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-e2" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">E2: Loop Markers (A/B)</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="dim-e3" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">E3: Queue Builder</span>
                            </button>

                            <!-- Innovative Ideas -->
                            <div class="px-4 py-2.5 border-b border-gray-700/30 bg-gray-800/30">
                                <span class="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Innovative Ideas</span>
                            </div>
                            <button data-action="select-view-mode" data-view-id="idea-f" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">F: Tap Tempo</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="idea-g" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">G: Haptic Metronome</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="idea-h" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">H: Practice Bookmarks</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="idea-i" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">I: Staff / Linear Notation Mode</span>
                            </button>

                            <!-- Combinations -->
                            <div class="px-4 py-2.5 border-b border-gray-700/30 bg-gray-800/30">
                                <span class="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Combinations</span>
                            </div>
                            <button data-action="select-view-mode" data-view-id="combo-1" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">1: Player + Portrait Control Surface</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="combo-2" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">2: Dashboard + Compressed View + Loop</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="combo-3" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">3: Toolbar + Adaptive Grid + Tap Tempo</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="combo-4" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">4: Portrait Mixer + Landscape Grid</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="combo-5" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">5: The Practice Studio</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="combo-6" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-b-2xl">
                                <span class="text-gray-300 text-sm">6: Minimal Player + Power Drawer</span>
                            </button>
                        </div>
                    </div>

                    <!-- UX Analysis -->
                    <div class="mb-4">
                        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-2">UX Analysis</h3>
                        <div class="bg-gray-800/50 rounded-2xl border border-gray-700/50">
                            <button data-action="select-view-mode" data-view-id="ux-structure-modal" class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-300 text-sm">Expand Structure Modal</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="ux-a" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">A: Tappable REP Badge</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="ux-b" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">B: Structure Shortcut Button</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="ux-c" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors border-b border-gray-700/30">
                                <span class="text-gray-400 text-xs">C: Count-in Label Readability</span>
                            </button>
                            <button data-action="select-view-mode" data-view-id="ux-d" class="w-full px-4 py-2.5 pl-8 flex items-center gap-3 hover:bg-gray-700/50 active:bg-gray-700 transition-colors rounded-b-2xl">
                                <span class="text-gray-400 text-xs">D: BPM Slider Wider Hit Area</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;
};
