import { INITIAL_TOQUE, STROKE_PALETTE, VALID_INSTRUMENT_STROKES } from './constants.js';
import { InstrumentName, StrokeType } from './types.js';
import { audioEngine } from './services/audioEngine.js';

// Components
import { TubsGrid, autoScrollGrid } from './components/tubsGrid.js';
import { Timeline } from './components/timeline.js';
import { Controls } from './components/controls.js';

// Icons for Header
import { PlayIcon } from './icons/playIcon.js';
import { PauseIcon } from './icons/pauseIcon.js';
import { StopIcon } from './icons/stopIcon.js';
import { Bars3Icon } from './icons/bars3Icon.js';
import { DocumentPlusIcon } from './icons/documentPlusIcon.js';
import { FolderOpenIcon } from './icons/folderOpenIcon.js';

// --- STATE MANAGEMENT ---

let state = {
    toque: JSON.parse(JSON.stringify(INITIAL_TOQUE)), // Deep copy
    activeSectionId: INITIAL_TOQUE.sections[0].id,
    isPlaying: false,
    currentStep: -1,
    selectedStroke: StrokeType.Open,
    uiState: {
        isMenuOpen: false,
        modalOpen: false,
        editingTrackIndex: null // null = adding new track
    }
};

// Mutable playback state (replaces useRefs)
const playback = {
    timeoutId: null,
    currentStep: -1,
    repetitionCounter: 1,
    currentPlayheadBpm: state.toque.globalBpm,
    activeSectionId: state.activeSectionId // Syncs with state but updated immediately in loop
};

// --- DOM ROOT ---
const root = document.getElementById('root');

// --- RENDER FUNCTIONS ---

const renderHeader = () => {
    const activeSection = state.toque.sections.find(s => s.id === state.activeSectionId) || state.toque.sections[0];

    return `
    <header class="h-16 px-4 border-b border-gray-800 flex justify-between items-center bg-gray-950 flex-shrink-0 z-40 gap-4">
      
      <!-- Left Group -->
      <div class="flex items-center gap-4 flex-1 min-w-0">
        
        <!-- Hamburger (Settings) -->
        <div class="relative">
          <button 
              data-action="toggle-menu"
              class="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-800 transition-colors ${state.uiState.isMenuOpen ? 'bg-gray-800 text-white' : ''}"
          >
              ${Bars3Icon('w-6 h-6 pointer-events-none')}
          </button>
          
          ${state.uiState.isMenuOpen ? `
            <div class="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                <div class="py-1">
                    <button 
                        data-action="new-rhythm"
                        class="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-b border-gray-800 flex items-center gap-2"
                    >
                        ${DocumentPlusIcon('w-4 h-4 text-cyan-500 pointer-events-none')}
                        New Rhythm
                    </button>
                    <button 
                        data-action="load-rhythm"
                        class="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2"
                    >
                        ${FolderOpenIcon('w-4 h-4 text-amber-500 pointer-events-none')}
                        Load Rhythm...
                    </button>
                </div>
            </div>
            <!-- Overlay to close menu -->
            <div class="fixed inset-0 z-40 bg-transparent" data-action="close-menu"></div>
          ` : ''}
        </div>
        
        <h1 class="text-xl font-bold text-gray-100 whitespace-nowrap hidden sm:block">
          Percussion Studio
        </h1>
        
        <div class="h-6 w-px bg-gray-800 hidden sm:block"></div>
        
        <!-- Context Info -->
        <div class="flex items-center gap-3 min-w-0 overflow-hidden flex-1">
           <span class="text-gray-200 font-bold text-lg truncate whitespace-nowrap">
              ${activeSection.name}
           </span>

           <div class="flex items-center gap-1 ml-2 bg-gray-900 px-2 py-0.5 rounded border border-gray-800 flex-shrink-0">
              <span class="text-[10px] uppercase font-bold text-gray-500">Rep</span>
              <span class="font-mono font-bold ${state.isPlaying ? 'text-green-400' : 'text-gray-400'}" id="header-rep-count">
                ${state.isPlaying ? playback.repetitionCounter : 1}
              </span>
              <span class="text-gray-600 font-mono">/</span>
              <span class="text-gray-500 font-mono">${activeSection.repetitions || 1}</span>
           </div>
        </div>
      </div>

      <!-- Right Group: Transport -->
      <div class="flex items-center gap-4 flex-shrink-0">
        
        <div class="flex items-center gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
          <button
            data-action="stop"
            class="w-10 h-10 rounded-md flex items-center justify-center bg-gray-800 hover:bg-red-900/40 hover:text-red-400 text-gray-400 transition-all border border-transparent hover:border-red-900/50"
            title="Stop & Reset"
          >
            ${StopIcon('w-5 h-5 pointer-events-none')}
          </button>

          <button
            data-action="toggle-play"
            class="w-10 h-10 rounded-md flex items-center justify-center transition-all shadow-lg ${state.isPlaying
            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500/20'
            : 'bg-green-600 text-white hover:bg-green-500 shadow-green-900/20'
        }"
            title="${state.isPlaying ? "Pause" : "Play"}"
          >
            ${state.isPlaying ? PauseIcon('w-6 h-6 pointer-events-none') : PlayIcon('w-6 h-6 ml-0.5 pointer-events-none')}
          </button>
        </div>

        <!-- Global BPM -->
        <div class="flex items-center gap-3 bg-gray-900 px-3 py-2 rounded-lg border border-gray-800">
          <div class="flex flex-col items-end leading-none">
              <span class="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Global</span>
              <span class="text-xs font-mono font-bold text-cyan-400">${state.toque.globalBpm} <span class="text-[9px] text-gray-600">BPM</span></span>
          </div>
          <input 
            type="range" 
            min="40" 
            max="240" 
            value="${state.toque.globalBpm}" 
            data-action="update-global-bpm"
            class="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
          />
        </div>

      </div>
    </header>
  `;
};

const renderApp = () => {
    const activeSection = state.toque.sections.find(s => s.id === state.activeSectionId) || state.toque.sections[0];

    root.innerHTML = `
    <div class="flex flex-col h-full bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      ${renderHeader()}
      
      <div class="flex flex-1 overflow-hidden">
        ${Timeline({
        sections: state.toque.sections,
        globalBpm: state.toque.globalBpm,
        activeSectionId: state.activeSectionId,
        rhythmName: state.toque.name
    })}

        <main class="flex-1 overflow-hidden relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
          <div id="grid-container" class="w-full max-w-7xl px-4 py-8 flex flex-col items-center justify-center overflow-hidden h-full">
            ${TubsGrid({
        section: activeSection,
        globalBpm: state.toque.globalBpm,
        currentStep: state.currentStep,
        selectedStroke: state.selectedStroke,
        uiState: state.uiState
    })}
          </div>
        </main>
      </div>

      ${Controls({
        selectedStroke: state.selectedStroke
    })}
    </div>
  `;
};

// Optimized render for just the grid (e.g., when editing notes)
const refreshGrid = () => {
    const activeSection = state.toque.sections.find(s => s.id === state.activeSectionId) || state.toque.sections[0];
    const container = document.getElementById('grid-container');
    if (container) {
        container.innerHTML = TubsGrid({
            section: activeSection,
            globalBpm: state.toque.globalBpm,
            currentStep: state.currentStep,
            selectedStroke: state.selectedStroke,
            uiState: state.uiState
        });
        // Restore scroll position if needed, though mostly handled by logic
    }
};

const refreshHeader = () => {
    // Only refresh if header exists to prevent losing focus if re-rendering entire app
    // For simplicity in this vanilla version, we re-render the whole app on major changes
    // but we can use this for small updates.
    // NOTE: In this implementation, we usually re-render the whole app or just the grid. 
};

// --- AUDIO LOGIC ---

const tick = () => {
    const currentToque = state.toque;
    const currentId = playback.activeSectionId;

    let sectionIndex = currentToque.sections.findIndex(s => s.id === currentId);
    if (sectionIndex === -1) sectionIndex = 0;
    let activeSec = currentToque.sections[sectionIndex];

    let nextStep = playback.currentStep + 1;

    const effectiveBpm = playback.currentPlayheadBpm;

    if (nextStep >= activeSec.steps) {
        // Loop or Next Section logic
        if (playback.repetitionCounter < (activeSec.repetitions || 1)) {
            // Same Section Loop
            playback.repetitionCounter += 1;
            nextStep = 0;

            // Accel
            if (activeSec.tempoAcceleration && activeSec.tempoAcceleration !== 0) {
                const multiplier = 1 + (activeSec.tempoAcceleration / 100);
                playback.currentPlayheadBpm = playback.currentPlayheadBpm * multiplier;
            }

            // Update UI Rep counter
            const repEl = document.getElementById('header-rep-count');
            if (repEl) repEl.innerText = playback.repetitionCounter;

            playSectionStep(activeSec, 0);

        } else {
            // Next Section
            const nextIndex = (sectionIndex + 1) % currentToque.sections.length;
            const nextSection = currentToque.sections[nextIndex];

            // Update State / Playback Refs
            updateActiveSection(nextSection.id); // This triggers UI update

            nextStep = 0;
            activeSec = nextSection; // Update local ref for calculations below

            if (nextSection.bpm !== undefined) {
                playback.currentPlayheadBpm = nextSection.bpm;
            }

            playSectionStep(activeSec, 0);
        }
    } else {
        // Standard Step
        playSectionStep(activeSec, nextStep);
    }

    playback.currentStep = nextStep;
    state.currentStep = nextStep; // Keep UI state in sync

    // Visual Update (High Perf)
    updateVisualStep(nextStep);

    // Schedule Next
    const stepsPerBeat = activeSec.subdivision || 4;
    const secondsPerBeat = 60.0 / effectiveBpm;
    const intervalMs = (secondsPerBeat / stepsPerBeat) * 1000;

    playback.timeoutId = setTimeout(tick, intervalMs);
};

const playSectionStep = (section, stepIndex) => {
    section.tracks.forEach(track => {
        if (track.muted) return;
        if (stepIndex < track.strokes.length) {
            const stroke = track.strokes[stepIndex];
            audioEngine.playStroke(track.instrument, stroke, 0, track.volume);
        }
    });
};

const updateVisualStep = (step) => {
    // Remove old highlights
    document.querySelectorAll('.ring-2.ring-white').forEach(el => {
        el.classList.remove('ring-2', 'ring-white', 'z-10', 'scale-105', 'shadow-lg', 'shadow-cyan-500/50');
    });
    document.querySelectorAll('.bg-gray-800').forEach(el => {
        // Only remove if it was the specific step-highlight class, simpler to just query cells
        // Logic: TubsCell uses bg-gray-800 for ghost effect on empty cells
        if (el.innerText === '' || el.innerText === '.') {
            el.classList.remove('bg-gray-800');
        }
    });
    document.querySelectorAll('[data-step-marker]').forEach(el => {
        el.classList.remove('text-cyan-400', 'font-bold', 'scale-110');
        el.classList.add('text-gray-500');
    });

    // Add new highlights
    // 1. Cells
    const cells = document.querySelectorAll(`[data-step-index="${step}"]`);
    cells.forEach(cell => {
        cell.classList.add('ring-2', 'ring-white', 'z-10', 'scale-105', 'shadow-lg', 'shadow-cyan-500/50');
        if (cell.innerText.trim() === '') { // StrokeType.None
            cell.classList.add('bg-gray-800');
        }
    });

    // 2. Header Marker
    const marker = document.querySelector(`[data-step-marker="${step}"]`);
    if (marker) {
        marker.classList.remove('text-gray-500');
        marker.classList.add('text-cyan-400', 'font-bold', 'scale-110');
    }

    autoScrollGrid(step);
};

// --- ACTION HANDLERS ---

const togglePlay = () => {
    if (state.isPlaying) {
        // Stop
        state.isPlaying = false;
        clearTimeout(playback.timeoutId);
        renderApp(); // Full re-render to update play button icon
    } else {
        // Start
        state.isPlaying = true;
        audioEngine.resume();
        renderApp();
        tick();
    }
};

const stopPlayback = () => {
    state.isPlaying = false;
    clearTimeout(playback.timeoutId);
    playback.currentStep = -1;
    state.currentStep = -1;
    playback.repetitionCounter = 1;

    // Reset to first section
    if (state.toque.sections.length > 0) {
        const first = state.toque.sections[0];
        updateActiveSection(first.id, false); // Don't trigger another render yet
        playback.currentPlayheadBpm = first.bpm ?? state.toque.globalBpm;
    }

    renderApp();
};

const updateActiveSection = (id, shouldRender = true) => {
    state.activeSectionId = id;
    playback.activeSectionId = id;
    playback.repetitionCounter = 1; // Reset rep counter on section change

    const section = state.toque.sections.find(s => s.id === id);
    if (section) {
        // Sync BPM override logic
        playback.currentPlayheadBpm = section.bpm ?? state.toque.globalBpm;
    }

    if (shouldRender) {
        renderApp();
    }
};

// --- DATA UPDATERS ---

const handleUpdateStroke = (trackIdx, stepIdx) => {
    const sectionIdx = state.toque.sections.findIndex(s => s.id === state.activeSectionId);
    const section = state.toque.sections[sectionIdx];
    const track = section.tracks[trackIdx];

    const currentStroke = track.strokes[stepIdx];
    const nextStroke = currentStroke === state.selectedStroke ? StrokeType.None : state.selectedStroke;

    // Validation
    if (nextStroke !== StrokeType.None) {
        const allowed = VALID_INSTRUMENT_STROKES[track.instrument] || [];
        if (!allowed.includes(nextStroke)) return;
    }

    // Mutate state directly (Vanilla way)
    track.strokes[stepIdx] = nextStroke;

    // Refresh Grid Only
    refreshGrid();

    // Optional: Play the sound immediately
    audioEngine.playStroke(track.instrument, nextStroke, 0, track.volume);
};

// --- EVENT DELEGATION ---

const setupEventListeners = () => {

    // CLICK LISTENER
    root.addEventListener('click', (e) => {
        // Traverse up to find element with data-action or data-role
        const target = e.target.closest('[data-action], [data-role]');
        if (!target) return;

        const action = target.dataset.action;

        // --- TRANSPORT ---
        if (action === 'toggle-play') togglePlay();
        if (action === 'stop') stopPlayback();

        // --- MENU ---
        if (action === 'toggle-menu') {
            state.uiState.isMenuOpen = !state.uiState.isMenuOpen;
            renderApp();
        }
        if (action === 'close-menu') {
            state.uiState.isMenuOpen = false;
            renderApp();
        }
        if (action === 'new-rhythm') {
            if (confirm("Create new rhythm? Unsaved changes lost.")) {
                stopPlayback();
                // Reset Toque
                state.toque = JSON.parse(JSON.stringify(INITIAL_TOQUE));
                // Just one empty section
                const newId = crypto.randomUUID();
                state.toque = {
                    ...INITIAL_TOQUE,
                    id: crypto.randomUUID(),
                    name: "New Rhythm",
                    sections: [{
                        id: newId,
                        name: "Section 1",
                        timeSignature: '4/4',
                        steps: 16,
                        subdivision: 4,
                        repetitions: 1,
                        tracks: []
                    }]
                };
                updateActiveSection(newId);
            }
        }
        if (action === 'load-rhythm') {
            alert("Not implemented in static version.");
            state.uiState.isMenuOpen = false;
            renderApp();
        }

        // --- TIMELINE ---
        if (action === 'add-section') {
            const newSec = {
                id: crypto.randomUUID(),
                name: `Section ${state.toque.sections.length + 1}`,
                timeSignature: '4/4',
                steps: 16,
                subdivision: 4,
                repetitions: 1,
                tracks: [
                    { id: crypto.randomUUID(), instrument: InstrumentName.Conga, volume: 1.0, muted: false, strokes: Array(16).fill(StrokeType.None) },
                    { id: crypto.randomUUID(), instrument: InstrumentName.Tumbadora, volume: 1.0, muted: false, strokes: Array(16).fill(StrokeType.None) }
                ]
            };
            state.toque.sections.push(newSec);
            updateActiveSection(newSec.id);
        }
        if (action === 'delete-section') {
            const id = target.dataset.id;
            if (state.toque.sections.length <= 1) return;
            state.toque.sections = state.toque.sections.filter(s => s.id !== id);
            if (state.activeSectionId === id) {
                updateActiveSection(state.toque.sections[0].id);
            } else {
                renderApp();
            }
        }
        if (action === 'duplicate-section') {
            const id = target.dataset.id;
            const src = state.toque.sections.find(s => s.id === id);
            if (src) {
                const copy = JSON.parse(JSON.stringify(src));
                copy.id = crypto.randomUUID();
                copy.name = `${src.name} (Copy)`;
                copy.tracks.forEach(t => t.id = crypto.randomUUID());
                state.toque.sections.push(copy);
                updateActiveSection(copy.id);
            }
        }

        // --- GRID / TRACKS ---
        if (target.dataset.role === 'tubs-cell') {
            const tIdx = parseInt(target.dataset.trackIndex);
            const sIdx = parseInt(target.dataset.stepIndex);
            handleUpdateStroke(tIdx, sIdx);
        }
        if (action === 'toggle-mute') {
            const tIdx = parseInt(target.dataset.trackIndex);
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            section.tracks[tIdx].muted = !section.tracks[tIdx].muted;
            refreshGrid();
        }
        if (action === 'remove-track') {
            if (!confirm("Remove track?")) return;
            const tIdx = parseInt(target.dataset.trackIndex);
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            section.tracks.splice(tIdx, 1);
            refreshGrid();
        }

        // --- MODAL ---
        if (action === 'open-add-modal') {
            state.uiState.editingTrackIndex = null;
            state.uiState.modalOpen = true;
            refreshGrid(); // Modal is part of grid render
        }
        if (action === 'open-edit-modal') {
            state.uiState.editingTrackIndex = parseInt(target.dataset.trackIndex);
            state.uiState.modalOpen = true;
            refreshGrid();
        }
        if (action === 'close-modal' || action === 'close-modal-bg') {
            state.uiState.modalOpen = false;
            refreshGrid();
        }
        if (action === 'select-instrument') {
            const inst = target.dataset.instrument;
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);

            if (state.uiState.editingTrackIndex === null) {
                // Add
                section.tracks.push({
                    id: crypto.randomUUID(),
                    instrument: inst,
                    volume: 1.0,
                    muted: false,
                    strokes: Array(section.steps).fill(StrokeType.None)
                });
            } else {
                // Edit
                section.tracks[state.uiState.editingTrackIndex].instrument = inst;
            }
            state.uiState.modalOpen = false;
            refreshGrid();
        }

        // --- SECTION SETTINGS ---
        if (action === 'toggle-bpm-override') {
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            if (section.bpm !== undefined) {
                section.bpm = undefined;
            } else {
                section.bpm = state.toque.globalBpm;
            }
            refreshGrid(); // Re-render setting bar
        }

        // --- CONTROLS ---
        if (action === 'select-stroke') {
            state.selectedStroke = target.dataset.stroke;
            // Re-render controls to show active state
            document.querySelector('#root > div > div:last-child').outerHTML = Controls({ selectedStroke: state.selectedStroke });
        }
        if (action === 'clear-pattern') {
            if (!confirm("Clear all notes in this section?")) return;
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            section.tracks.forEach(t => t.strokes.fill(StrokeType.None));
            stopPlayback();
            refreshGrid();
        }
    });

    // RIGHT CLICK (Context Menu on Cells)
    root.addEventListener('contextmenu', (e) => {
        const target = e.target.closest('[data-role="tubs-cell"]');
        if (target) {
            e.preventDefault();
            const tIdx = parseInt(target.dataset.trackIndex);
            const sIdx = parseInt(target.dataset.stepIndex);

            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            section.tracks[tIdx].strokes[sIdx] = StrokeType.None;
            refreshGrid();
        }
    });

    // CHANGE / INPUT LISTENERS
    root.addEventListener('change', (e) => {
        const target = e.target;
        const action = target.dataset.action;

        if (!action) return;
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);

        // Global BPM
        if (action === 'update-global-bpm') {
            const val = Number(target.value);
            state.toque.globalBpm = val;
            // Live update playhead if no override
            if (!section.bpm) playback.currentPlayheadBpm = val;
            renderApp(); // Update header and settings
        }

        // Section Settings
        if (action === 'update-section-name') {
            section.name = target.value;
            renderApp(); // Update Sidebar
        }
        if (action === 'update-time-sig') {
            const val = target.value;
            section.timeSignature = val;
            if (val === '6/8') { section.steps = 12; section.subdivision = 3; }
            if (val === '4/4') { section.steps = 16; section.subdivision = 4; }
            if (val === '12/8') { section.steps = 24; section.subdivision = 3; }

            // Resize tracks
            resizeTracks(section);
            refreshGrid();
            renderApp(); // Update sidebar info
        }
        if (action === 'update-steps') {
            const val = Number(target.value);
            section.steps = val;
            resizeTracks(section);
            refreshGrid();
            renderApp(); // Update sidebar
        }
        if (action === 'update-repetitions') {
            section.repetitions = Math.max(1, Number(target.value));
            renderApp(); // Sidebar and Header updates
        }
        if (action === 'update-bpm') {
            const val = Number(target.value);
            section.bpm = val;
            playback.currentPlayheadBpm = val;
        }
        if (action === 'update-acceleration') {
            section.tempoAcceleration = parseFloat(target.value);
            renderApp(); // Sidebar icon update
        }

        // Volume
        if (action === 'update-volume') {
            const tIdx = parseInt(target.dataset.trackIndex);
            section.tracks[tIdx].volume = parseFloat(target.value);
            // No render needed, just data update. 
            // If we want to show value, we'd need to update title or a label
        }

        // Rhythm Name
        if (action === 'update-rhythm-name') {
            state.toque.name = target.value;
            // No full render needed usually, handled by input value
        }
    });

    // CUSTOM EVENT FOR TIMELINE SELECTION (From onclick in timeline.js)
    document.addEventListener('timeline-select', (e) => {
        updateActiveSection(e.detail);
    });

    // DRAG AND DROP (Timeline)
    let draggedIndex = null;

    root.addEventListener('dragstart', (e) => {
        const item = e.target.closest('[data-role="timeline-item"]');
        if (item) {
            draggedIndex = parseInt(item.dataset.index);
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    root.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
    });

    root.addEventListener('drop', (e) => {
        const item = e.target.closest('[data-role="timeline-item"]');
        if (item && draggedIndex !== null) {
            const targetIndex = parseInt(item.dataset.index);
            if (draggedIndex !== targetIndex) {
                // Reorder
                const moved = state.toque.sections.splice(draggedIndex, 1)[0];
                state.toque.sections.splice(targetIndex, 0, moved);
                renderApp();
            }
            draggedIndex = null;
        }
    });
};

const resizeTracks = (section) => {
    const newSteps = section.steps;
    section.tracks.forEach(track => {
        if (newSteps > track.strokes.length) {
            const diff = newSteps - track.strokes.length;
            track.strokes.push(...Array(diff).fill(StrokeType.None));
        } else {
            track.strokes.length = newSteps;
        }
    });
};

// --- INITIALIZATION ---

const init = () => {
    setupEventListeners();
    renderApp();
};

init();