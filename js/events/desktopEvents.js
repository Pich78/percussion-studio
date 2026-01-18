import { state, playback } from '../store.js';
import { actions } from '../actions.js';
import { togglePlay, stopPlayback } from '../services/sequencer.js';
import { renderApp, refreshGrid } from '../ui/renderer.js';
import { Controls } from '../components/controls.js';
import { StrokeType } from '../types.js';
import { downloadRhythm } from '../utils/rhythmExporter.js';
import { dataLoader } from '../services/dataLoader.js'; // Import dataLoader

export const setupDesktopEvents = () => {
    const root = document.getElementById('root');

    root.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action], [data-role]');
        if (!target) return;
        const action = target.dataset.action;

        if (action === 'toggle-play') togglePlay();
        if (action === 'stop') stopPlayback();

        if (action === 'toggle-menu') {
            state.uiState.isMenuOpen = !state.uiState.isMenuOpen;
            renderApp();
        }
        if (action === 'toggle-count-in') {
            state.countInEnabled = !state.countInEnabled;
            renderApp();
        }
        if (action === 'close-menu') {
            if (e.target !== target) return;
            state.uiState.isMenuOpen = false;
            renderApp();
        }
        if (action === 'new-rhythm') {
            if (confirm("Create new rhythm? Unsaved changes lost.")) actions.createNewRhythm();
            state.uiState.isMenuOpen = false;
            renderApp();
        }
        if (action === 'load-rhythm') {
            state.uiState.modalType = 'rhythm';
            state.uiState.modalOpen = true;
            state.uiState.isMenuOpen = false;
            renderApp();
        }
        if (action === 'download-rhythm') {
            downloadRhythm(state);
            state.uiState.isMenuOpen = false;
            renderApp();
        }
        if (action === 'share-rhythm') {
            if (state.rhythmSource === 'repo' && state.currentRhythmId) {
                // Build shareable URL
                const baseUrl = window.location.origin + window.location.pathname;
                const shareUrl = `${baseUrl}?rhythm=${encodeURIComponent(state.currentRhythmId)}`;

                // Copy to clipboard
                navigator.clipboard.writeText(shareUrl).then(() => {
                    // Show success feedback briefly
                    alert(`Link copied to clipboard!\n\n${shareUrl}`);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    // Fallback: show URL in prompt for manual copy
                    prompt('Copy this link:', shareUrl);
                });
            }
            state.uiState.isMenuOpen = false;
            renderApp();
        }
        if (action === 'toggle-user-guide-submenu') {
            state.uiState.userGuideSubmenuOpen = !state.uiState.userGuideSubmenuOpen;
            renderApp();
        }
        if (action === 'open-user-guide') {
            const lang = target.dataset.lang;
            const isMobile = window.IS_MOBILE_VIEW === true;
            const platform = isMobile ? 'mobile' : 'desktop';
            const filePath = `docs/user-guide-${platform}-${lang}.md`;

            state.uiState.userGuideLanguage = lang;
            state.uiState.userGuideContent = '<div class="text-center text-gray-500 py-8"><div class="animate-spin inline-block w-6 h-6 border-2 border-gray-500 border-t-cyan-400 rounded-full mb-2"></div><div>Loading...</div></div>';
            state.uiState.modalType = 'userGuide';
            state.uiState.modalOpen = true;
            state.uiState.isMenuOpen = false;
            state.uiState.userGuideSubmenuOpen = false;
            renderApp();

            // Fetch and render markdown
            fetch(filePath)
                .then(response => response.text())
                .then(markdown => {
                    // Simple markdown to HTML conversion
                    let html = markdown
                        // Escape HTML
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        // Headers
                        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-cyan-400 mt-6 mb-2">$1</h3>')
                        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-8 mb-3 border-b border-gray-700 pb-2">$1</h2>')
                        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>')
                        // Bold and italic
                        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        // Code
                        .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-cyan-300 text-sm">$1</code>')
                        // Links  
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-cyan-400 hover:underline">$1</a>')
                        // Horizontal rules
                        .replace(/^---$/gim, '<hr class="border-gray-700 my-6">')
                        // Lists
                        .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
                        .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1 list-disc">$1</li>')
                        // Tables - basic support
                        .replace(/^\|(.+)\|$/gim, (match, content) => {
                            const cells = content.split('|').map(c => c.trim());
                            if (cells.every(c => /^[-:]+$/.test(c))) return ''; // Skip separator row
                            const cellTags = cells.map(c => `<td class="border border-gray-700 px-3 py-2">${c}</td>`).join('');
                            return `<tr>${cellTags}</tr>`;
                        })
                        // Blockquotes
                        .replace(/^&gt; \*\*Note\*\*: (.*$)/gim, '<div class="bg-blue-900/20 border-l-4 border-blue-500 p-3 my-3 text-blue-300">$1</div>')
                        .replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-gray-600 pl-4 my-3 text-gray-400">$1</blockquote>')
                        // Paragraphs
                        .replace(/\n\n/g, '</p><p class="mb-3">')
                        .replace(/\n/g, '<br>');

                    // Wrap tables
                    html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, '<table class="w-full border-collapse border border-gray-700 my-4">$&</table>');

                    state.uiState.userGuideContent = `<div class="text-gray-300"><p class="mb-3">${html}</p></div>`;
                    renderApp();
                })
                .catch(err => {
                    state.uiState.userGuideContent = `<div class="text-center text-red-400 py-8">Failed to load user guide: ${err.message}</div>`;
                    renderApp();
                });
        }

        if (action === 'add-measure') {
            actions.addMeasure();
        }
        if (action === 'delete-measure') {
            actions.deleteMeasure(parseInt(target.dataset.measureIndex));
        }
        if (action === 'duplicate-measure') {
            actions.duplicateMeasure(parseInt(target.dataset.measureIndex));
        }

        if (action === 'add-section') actions.addSection();
        if (action === 'delete-section') actions.deleteSection(target.dataset.id);
        if (action === 'duplicate-section') actions.duplicateSection(target.dataset.id);

        if (target.dataset.role === 'tubs-cell') {
            actions.handleUpdateStroke(
                parseInt(target.dataset.trackIndex),
                parseInt(target.dataset.stepIndex),
                parseInt(target.dataset.measureIndex || 0)
            );
        }

        if (action === 'toggle-mute') {
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            const tIdx = parseInt(target.dataset.trackIndex);
            const mIdx = parseInt(target.dataset.measureIndex || 0);
            const track = section.measures[mIdx].tracks[tIdx];

            // Toggle local to get new state, then apply globally
            const newMutedState = !track.muted;
            actions.setGlobalMute(track.instrument, newMutedState);
        }
        if (action === 'remove-track') {
            if (confirm("Remove track?")) {
                const section = state.toque.sections.find(s => s.id === state.activeSectionId);
                const tIdx = parseInt(target.dataset.trackIndex);
                // Remove from all measures
                section.measures.forEach(measure => {
                    measure.tracks.splice(tIdx, 1);
                });
                refreshGrid();
            }
        }

        // Modals
        if (action === 'open-add-modal') {
            state.uiState.editingTrackIndex = null;
            state.uiState.modalType = 'instrument';
            state.uiState.pendingInstrument = null; // Reset selection
            state.uiState.pendingSoundPack = null; // Reset sound pack selection
            state.uiState.modalOpen = true;

            // Pre-load all instrument definitions for display names
            (async () => {
                const manifest = dataLoader.manifest;
                if (manifest && manifest.instruments) {
                    for (const symbol of Object.keys(manifest.instruments)) {
                        if (!state.instrumentDefinitions[symbol]) {
                            const instDef = await dataLoader.loadInstrumentDefinition(symbol);
                            state.instrumentDefinitions[symbol] = instDef;
                        }
                    }
                    refreshGrid(); // Refresh to show full names
                }
            })();

            refreshGrid();
        }
        if (action === 'open-edit-modal') {
            state.uiState.editingTrackIndex = parseInt(target.dataset.trackIndex);
            state.uiState.modalType = 'instrument';
            state.uiState.pendingInstrument = null; // Reset selection
            state.uiState.pendingSoundPack = null; // Reset sound pack selection
            state.uiState.modalOpen = true;

            // Pre-load all instrument definitions for display names
            (async () => {
                const manifest = dataLoader.manifest;
                if (manifest && manifest.instruments) {
                    for (const symbol of Object.keys(manifest.instruments)) {
                        if (!state.instrumentDefinitions[symbol]) {
                            const instDef = await dataLoader.loadInstrumentDefinition(symbol);
                            state.instrumentDefinitions[symbol] = instDef;
                        }
                    }
                    refreshGrid(); // Refresh to show full names
                }
            })();

            refreshGrid();
        }
        if (action === 'close-modal' || (action === 'close-modal-bg' && e.target === target)) {
            state.uiState.modalOpen = false;
            state.uiState.pendingInstrument = null; // Reset selections
            state.uiState.pendingSoundPack = null;
            renderApp();
        }
        if (action === 'select-instrument') {
            const inst = target.dataset.instrument;
            state.uiState.pendingInstrument = inst;
            refreshGrid();
        }
        if (action === 'select-sound-pack') {
            const pack = target.dataset.pack;
            state.uiState.pendingSoundPack = pack;
            refreshGrid();
        }
        if (action === 'confirm-instrument-selection') {
            const inst = state.uiState.pendingInstrument;
            const pack = state.uiState.pendingSoundPack;

            if (!inst || !pack) return;

            if (state.uiState.editingTrackIndex === null) {
                actions.addTrack(inst, pack).then(() => {
                    state.uiState.modalOpen = false;
                    state.uiState.pendingInstrument = null;
                    state.uiState.pendingSoundPack = null;
                    renderApp();
                });
            } else {
                actions.updateTrackInstrument(state.uiState.editingTrackIndex, inst, pack).then(() => {
                    state.uiState.modalOpen = false;
                    state.uiState.pendingInstrument = null;
                    state.uiState.pendingSoundPack = null;
                    renderApp();
                });
            }
        }
        if (action === 'toggle-folder') {
            const folderPath = target.dataset.folderPath;

            // Special handling for Batà folder: Open BataExplorer modal
            if (folderPath === 'Batà') {
                state.uiState.modalOpen = false; // Close rhythm modal
                state.uiState.bataExplorer.isOpen = true;

                // Load metadata if not already loaded
                if (!state.uiState.bataExplorer.metadata) {
                    dataLoader.loadBataMetadata().then(metadata => {
                        state.uiState.bataExplorer.metadata = metadata;
                        renderApp();
                    });
                }
                renderApp();
                return;
            }

            // Save scroll position before re-render
            const scrollContainer = document.getElementById('rhythm-modal-scroll');
            const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

            if (state.uiState.expandedFolders.has(folderPath)) {
                state.uiState.expandedFolders.delete(folderPath);
            } else {
                state.uiState.expandedFolders.add(folderPath);
            }
            refreshGrid();

            // Restore scroll position after re-render
            requestAnimationFrame(() => {
                const newScrollContainer = document.getElementById('rhythm-modal-scroll');
                if (newScrollContainer) {
                    newScrollContainer.scrollTop = scrollTop;
                }
            });
        }

        // --- BataExplorer Event Handlers ---

        // Close BataExplorer modal
        if (action === 'close-bata-explorer' ||
            (action === 'close-bata-explorer-bg' && e.target === target)) {
            state.uiState.bataExplorer.isOpen = false;
            state.uiState.bataExplorer.selectedToqueId = null;
            state.uiState.bataExplorer.orishaDropdownOpen = false;
            state.uiState.bataExplorer.typeDropdownOpen = false;
            renderApp();
        }

        // Toggle filter dropdowns
        if (action === 'toggle-filter-dropdown') {
            const dropdownId = target.dataset.dropdownId;
            if (dropdownId === 'orisha') {
                state.uiState.bataExplorer.orishaDropdownOpen = !state.uiState.bataExplorer.orishaDropdownOpen;
                state.uiState.bataExplorer.typeDropdownOpen = false;
            } else if (dropdownId === 'type') {
                state.uiState.bataExplorer.typeDropdownOpen = !state.uiState.bataExplorer.typeDropdownOpen;
                state.uiState.bataExplorer.orishaDropdownOpen = false;
            }
            renderApp();
        }

        // Toggle Orisha filter
        if (action === 'toggle-orisha-filter') {
            const orisha = target.dataset.value;
            const arr = state.uiState.bataExplorer.selectedOrishas;
            const idx = arr.indexOf(orisha);
            if (idx >= 0) {
                arr.splice(idx, 1);
            } else {
                arr.push(orisha);
            }
            state.uiState.bataExplorer.orishaDropdownOpen = false; // Close dropdown after selection
            renderApp();
        }

        // Remove Orisha filter (from token)
        if (action === 'remove-orisha-filter') {
            const orisha = target.dataset.orisha;
            const arr = state.uiState.bataExplorer.selectedOrishas;
            const idx = arr.indexOf(orisha);
            if (idx >= 0) arr.splice(idx, 1);
            renderApp();
        }

        // Toggle Type filter
        if (action === 'toggle-type-filter') {
            const type = target.dataset.value;
            const arr = state.uiState.bataExplorer.selectedTypes;
            const idx = arr.indexOf(type);
            if (idx >= 0) {
                arr.splice(idx, 1);
            } else {
                arr.push(type);
            }
            state.uiState.bataExplorer.typeDropdownOpen = false; // Close dropdown after selection
            renderApp();
        }

        // Remove Type filter (from token)
        if (action === 'remove-type-filter') {
            const type = target.dataset.type;
            const arr = state.uiState.bataExplorer.selectedTypes;
            const idx = arr.indexOf(type);
            if (idx >= 0) arr.splice(idx, 1);
            renderApp();
        }

        // Clear all BataExplorer filters
        if (action === 'clear-bata-filters') {
            state.uiState.bataExplorer.searchTerm = '';
            state.uiState.bataExplorer.selectedOrishas = [];
            state.uiState.bataExplorer.selectedTypes = [];
            state.uiState.bataExplorer.selectedToqueId = null;
            const searchInput = document.getElementById('bata-search-input');
            if (searchInput) searchInput.value = '';
            renderApp();
        }

        // Select toque card (show in details panel)
        if (action === 'select-toque') {
            const toqueId = target.dataset.toqueId;
            state.uiState.bataExplorer.selectedToqueId = toqueId;
            state.uiState.bataExplorer.orishaDropdownOpen = false;
            state.uiState.bataExplorer.typeDropdownOpen = false;
            renderApp();
        }

        // Close toque details panel
        if (action === 'close-toque-details') {
            state.uiState.bataExplorer.selectedToqueId = null;
            renderApp();
        }

        // Load selected toque
        if (action === 'load-toque-confirm') {
            const toqueId = target.dataset.toqueId;
            if (confirm("Load this rhythm? Unsaved changes will be lost.")) {
                actions.loadRhythm(toqueId).then(() => {
                    state.uiState.bataExplorer.isOpen = false;
                    state.uiState.bataExplorer.selectedToqueId = null;
                    state.uiState.bataExplorer.selectedOrishas = [];
                    state.uiState.bataExplorer.selectedTypes = [];
                    state.uiState.bataExplorer.searchTerm = '';
                    renderApp();
                });
            }
        }

        // --- Rhythm Metadata Editor Event Handlers ---

        // Toggle Batà Rhythm Mode (show/hide metadata)
        if (action === 'toggle-bata-rhythm-mode') {
            state.toque.isBata = !state.toque.isBata;
            // Initialize arrays if turning ON and they don't exist
            if (state.toque.isBata) {
                if (!state.toque.orisha) state.toque.orisha = [];
                if (state.toque.classification === undefined) state.toque.classification = null;
                if (state.toque.description === undefined) state.toque.description = '';
            }
            renderApp();
        }

        // Toggle Orisha dropdown in timeline metadata editor
        if (action === 'toggle-metadata-orisha-dropdown') {
            state.uiState.metadataEditor.orishaDropdownOpen = !state.uiState.metadataEditor.orishaDropdownOpen;
            renderApp();
        }

        // Toggle Orisha selection in rhythm metadata
        if (action === 'toggle-rhythm-orisha') {
            const orisha = target.dataset.orisha;
            if (!state.toque.orisha) state.toque.orisha = [];
            const idx = state.toque.orisha.indexOf(orisha);
            if (idx >= 0) {
                state.toque.orisha.splice(idx, 1);
            } else {
                state.toque.orisha.push(orisha);
            }
            state.uiState.metadataEditor.orishaDropdownOpen = false; // Close dropdown after selection
            renderApp();
        }

        // Remove Orisha from rhythm metadata (via badge X button)
        if (action === 'remove-rhythm-orisha') {
            const orisha = target.dataset.orisha;
            if (state.toque.orisha) {
                const idx = state.toque.orisha.indexOf(orisha);
                if (idx >= 0) state.toque.orisha.splice(idx, 1);
            }
            renderApp();
        }

        // Set rhythm classification
        if (action === 'set-rhythm-classification') {
            const classification = target.dataset.classification;
            // Toggle off if clicking the same one, otherwise set new
            if (state.toque.classification === classification) {
                state.toque.classification = null;
            } else {
                state.toque.classification = classification;
            }
            renderApp();
        }
        if (action === 'select-rhythm-confirm') {
            const rhythmId = target.dataset.rhythmId;
            if (confirm("Load this rhythm? Unsaved changes will be lost.")) {
                actions.loadRhythm(rhythmId).then(() => {
                    state.uiState.modalOpen = false;
                    renderApp();
                });
            }
        }
        if (action === 'trigger-file-input') {
            // Programmatically trigger the hidden file input
            const fileInput = document.getElementById('rhythm-file-input');
            if (fileInput) {
                fileInput.click();
            }
        }

        // Settings
        if (action === 'toggle-bpm-override') {
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            section.bpm = (section.bpm !== undefined) ? undefined : state.toque.globalBpm;
            refreshGrid();
        }
        if (action === 'select-stroke') {
            state.selectedStroke = target.dataset.stroke;
            document.querySelector('#root > div > div:last-child').outerHTML = Controls({ selectedStroke: state.selectedStroke });
        }
        if (action === 'clear-pattern') {
            if (confirm("Clear all notes in this section?")) {
                const section = state.toque.sections.find(s => s.id === state.activeSectionId);
                section.measures.forEach(measure => {
                    measure.tracks.forEach(t => t.strokes.fill(StrokeType.None));
                });
                stopPlayback();
                refreshGrid();
            }
        }
    });

    root.addEventListener('contextmenu', (e) => {
        const target = e.target.closest('[data-role="tubs-cell"]');
        if (target) {
            e.preventDefault();
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            section.tracks[parseInt(target.dataset.trackIndex)].strokes[parseInt(target.dataset.stepIndex)] = StrokeType.None;
            refreshGrid();
        }
    });

    root.addEventListener('input', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (!action) return;

        // BataExplorer search (doesn't need toque)
        if (action === 'bata-search-input') {
            state.uiState.bataExplorer.searchTerm = target.value;
            // Debounce re-render for performance
            clearTimeout(window._bataSearchTimeout);
            window._bataSearchTimeout = setTimeout(() => renderApp(), 150);
            return;
        }

        // Update rhythm description
        if (action === 'update-rhythm-description') {
            state.toque.description = target.value;
            // No renderApp() to avoid textarea losing focus during typing
            return;
        }

        // Safety check for other actions that need toque
        if (!state.toque) return;
        const section = state.toque.sections.find(s => s.id === state.activeSectionId);
        if (!section) return;

        if (action === 'update-global-bpm') {
            state.toque.globalBpm = Number(target.value);
            if (!section.bpm) playback.currentPlayheadBpm = state.toque.globalBpm;
            const display = document.getElementById('header-global-bpm');
            if (display) display.innerHTML = `${state.toque.globalBpm} <span class="text-[9px] text-gray-600">BPM</span>`;
        }

        if (action === 'update-volume') {
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            const tIdx = parseInt(target.dataset.trackIndex);
            const mIdx = parseInt(target.dataset.measureIndex || 0);
            const track = section.measures[mIdx].tracks[tIdx];
            const newVolume = parseFloat(target.value);

            actions.setGlobalVolume(track.instrument, newVolume);
        }

        if (action === 'update-bpm') {
            section.bpm = Number(target.value);
            playback.currentPlayheadBpm = section.bpm;
        }

        if (action === 'update-acceleration') {
            section.tempoAcceleration = parseFloat(target.value);
        }
    });

    root.addEventListener('change', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (!action) return;

        // Handle file input separately (doesn't need section)
        if (action === 'load-rhythm-file') {
            const file = target.files?.[0];
            if (file) {
                if (confirm("Load this rhythm file? Unsaved changes will be lost.")) {
                    actions.loadRhythmFromFile(file).then(() => {
                        state.uiState.modalOpen = false;
                        renderApp();
                    });
                }
                // Reset file input so the same file can be selected again
                target.value = '';
            }
            return;
        }

        const section = state.toque.sections.find(s => s.id === state.activeSectionId);

        if (action === 'update-global-bpm') {
            state.toque.globalBpm = Number(target.value);
            if (!section.bpm) playback.currentPlayheadBpm = state.toque.globalBpm;
            renderApp();
        }
        if (action === 'update-section-name') {
            section.name = target.value;
            renderApp();
        }
        if (action === 'update-time-sig') {
            section.timeSignature = target.value;
            if (section.timeSignature === '6/8') { section.steps = 12; section.subdivision = 3; }
            if (section.timeSignature === '4/4') { section.steps = 16; section.subdivision = 4; }
            if (section.timeSignature === '12/8') { section.steps = 24; section.subdivision = 3; }
            actions.resizeTracks(section);
            refreshGrid();
            renderApp();
        }
        if (action === 'update-steps') {
            section.steps = Number(target.value);
            actions.resizeTracks(section);
            refreshGrid();
            renderApp();
        }
        if (action === 'update-repetitions') {
            section.repetitions = Math.max(1, Number(target.value));
            renderApp();
        }
        if (action === 'update-bpm') {
            section.bpm = Number(target.value);
            playback.currentPlayheadBpm = section.bpm;
        }
        if (action === 'update-acceleration') {
            section.tempoAcceleration = parseFloat(target.value);
            renderApp();
        }
        if (action === 'update-rhythm-name') {
            state.toque.name = target.value;
        }
    });

    root.addEventListener('keydown', (e) => {
        const target = e.target;
        const action = target.dataset.action;

        if (action === 'update-rhythm-name' && e.key === 'Enter') {
            e.preventDefault();
            target.blur();
        }
    });

    document.addEventListener('keydown', (e) => {
        // Spacebar
        if (e.code === 'Space' || e.key === ' ') {
            const activeElement = document.activeElement;
            const isInputField = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable
            );

            if (!isInputField) {
                e.preventDefault();
                togglePlay();
            }
        }
    });

    document.addEventListener('timeline-select', (e) => {
        actions.updateActiveSection(e.detail);
        // No closing menus needed for desktop
    });

    // Drag and Drop
    let draggedIndex = null;
    root.addEventListener('dragstart', (e) => {
        const item = e.target.closest('[data-role="timeline-item"]');
        if (item) {
            draggedIndex = parseInt(item.dataset.index);
            e.dataTransfer.effectAllowed = 'move';
        } else {
            e.preventDefault();
        }
    });
    root.addEventListener('dragover', (e) => e.preventDefault());
    root.addEventListener('drop', (e) => {
        const item = e.target.closest('[data-role="timeline-item"]');
        if (item && draggedIndex !== null) {
            const targetIndex = parseInt(item.dataset.index);
            if (draggedIndex !== targetIndex) {
                const moved = state.toque.sections.splice(draggedIndex, 1)[0];
                state.toque.sections.splice(targetIndex, 0, moved);
                renderApp();
            }
            draggedIndex = null;
        }
    });
};
