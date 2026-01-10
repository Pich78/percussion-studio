import { state, playback } from '../store.js';
import { actions } from '../actions.js';
import { togglePlay, stopPlayback } from '../services/sequencer.js';
import { renderApp, refreshGrid } from '../ui/renderer.js';
import { audioEngine } from '../services/audioEngine.js';

export const setupMobileEvents = () => {
    const root = document.getElementById('root');

    root.addEventListener('click', (e) => {
        // --- Fullscreen & Wake Lock Logic ---
        // (Fullscreen removed by user request)

        // Resume Audio Context (Mobile Fix)
        audioEngine.init();
        audioEngine.resume();
        // ------------------------------------
        // ------------------------------------

        const target = e.target.closest('[data-action], [data-role]');
        if (!target) return;
        const action = target.dataset.action;

        // Allowed actions for mobile
        const allowedActions = [
            'toggle-play', 'stop', 'toggle-menu', 'close-menu', 'load-rhythm',
            'select-rhythm-confirm', 'toggle-mute', 'update-global-bpm', 'toggle-folder',
            'update-volume', 'close-modal', 'close-modal-bg', 'open-structure',
            'toggle-user-guide-submenu', 'open-user-guide'
        ];
        if (!allowedActions.includes(action)) return;

        if (action === 'toggle-play') togglePlay();
        if (action === 'stop') stopPlayback();

        if (action === 'toggle-menu') {
            state.uiState.isMenuOpen = !state.uiState.isMenuOpen;
            state.uiState.userGuideSubmenuOpen = false; // Reset submenu when toggling main menu
            renderApp();
        }
        if (action === 'close-menu') {
            if (e.target !== target) return; // Prevent closing when clicking content
            state.uiState.isMenuOpen = false;
            state.uiState.userGuideSubmenuOpen = false;
            renderApp();
        }

        if (action === 'toggle-user-guide-submenu') {
            state.uiState.userGuideSubmenuOpen = !state.uiState.userGuideSubmenuOpen;
            renderApp();
        }
        if (action === 'open-user-guide') {
            const lang = target.dataset.lang;
            const filePath = `docs/user-guide-mobile-${lang}.md`;

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
                        .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-cyan-400 mt-4 mb-2">$1</h3>')
                        .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-6 mb-2 border-b border-gray-700 pb-2">$1</h2>')
                        .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-white mb-3">$1</h1>')
                        // Bold and italic
                        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        // Code
                        .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-cyan-300 text-xs">$1</code>')
                        // Links  
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-cyan-400 hover:underline">$1</a>')
                        // Horizontal rules
                        .replace(/^---$/gim, '<hr class="border-gray-700 my-4">')
                        // Lists
                        .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
                        .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1 list-disc">$1</li>')
                        // Tables - basic support
                        .replace(/^\|(.+)\|$/gim, (match, content) => {
                            const cells = content.split('|').map(c => c.trim());
                            if (cells.every(c => /^[-:]+$/.test(c))) return ''; // Skip separator row
                            const cellTags = cells.map(c => `<td class="border border-gray-700 px-2 py-1 text-xs">${c}</td>`).join('');
                            return `<tr>${cellTags}</tr>`;
                        })
                        // Blockquotes
                        .replace(/^&gt; \*\*Note\*\*: (.*$)/gim, '<div class="bg-blue-900/20 border-l-4 border-blue-500 p-2 my-2 text-blue-300 text-xs">$1</div>')
                        .replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-gray-600 pl-3 my-2 text-gray-400 text-xs">$1</blockquote>')
                        // Paragraphs
                        .replace(/\n\n/g, '</p><p class="mb-2 text-gray-300">')
                        .replace(/\n/g, '<br>');

                    // Wrap tables
                    html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, '<table class="w-full border-collapse border border-gray-700 my-3 text-xs">$&</table>');

                    state.uiState.userGuideContent = `<div class="text-gray-300"><p class="mb-2 text-gray-300">${html}</p></div>`;
                    renderApp();
                })
                .catch(err => {
                    state.uiState.userGuideContent = `<div class="text-center text-red-400 py-8">Failed to load user guide: ${err.message}</div>`;
                    renderApp();
                });
        }

        if (action === 'load-rhythm') {
            state.uiState.modalType = 'rhythm';
            state.uiState.modalOpen = true;
            state.uiState.isMenuOpen = false;
            renderApp();
        }

        if (action === 'toggle-folder') {
            const folderPath = target.dataset.folderPath;
            if (state.uiState.expandedFolders.has(folderPath)) {
                state.uiState.expandedFolders.delete(folderPath);
            } else {
                state.uiState.expandedFolders.add(folderPath);
            }
            renderApp();
        }

        if (action === 'select-rhythm-confirm') {
            const rhythmId = target.dataset.rhythmId;
            // Mobile: Close modal immediately and show loading screen
            // Extract readable name from rhythmId (e.g. "bata/chachalokafun" -> "Chachalokafun")
            const rhythmName = rhythmId.split('/').pop().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

            state.uiState.modalOpen = false;
            state.uiState.isLoadingRhythm = true;
            state.uiState.loadingRhythmName = rhythmName;
            renderApp();

            // Load rhythm asynchronously
            actions.loadRhythm(rhythmId).then(() => {
                state.uiState.isLoadingRhythm = false;
                state.uiState.loadingRhythmName = null;
                renderApp();
            }).catch(() => {
                state.uiState.isLoadingRhythm = false;
                state.uiState.loadingRhythmName = null;
                renderApp();
            });
        }

        if (action === 'toggle-mute') {
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            const tIdx = parseInt(target.dataset.trackIndex);

            // Mobile assumes track structure is consistent, so grab from first measure to identify instrument
            const track = section.measures[0].tracks[tIdx];
            if (track) {
                const newMutedState = !track.muted;
                actions.setGlobalMute(track.instrument, newMutedState);
            }
        }

        if (action === 'open-structure') {
            state.uiState.isMenuOpen = false;
            state.uiState.modalType = 'structure';
            state.uiState.modalOpen = true;
            renderApp();
        }

        if (action === 'close-modal' || (action === 'close-modal-bg' && e.target === target)) {
            state.uiState.modalOpen = false;
            renderApp();
        }
    });

    root.addEventListener('input', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (!action) return;

        // Only allow specific inputs
        if (action !== 'update-global-bpm' && action !== 'update-volume') return;

        const section = state.toque.sections.find(s => s.id === state.activeSectionId);

        if (action === 'update-global-bpm') {
            state.toque.globalBpm = Number(target.value);
            if (!section.bpm) playback.currentPlayheadBpm = state.toque.globalBpm;
            const display = document.getElementById('header-global-bpm');
            if (display) display.innerHTML = `${state.toque.globalBpm} <span class="text-[9px] text-gray-600">BPM</span>`;
        }

        if (action === 'update-volume') {
            const tIdx = parseInt(target.dataset.trackIndex);
            const newVolume = parseFloat(target.value);
            // Get instrument from first measure
            const track = section.measures[0].tracks[tIdx];
            if (track) {
                actions.setGlobalVolume(track.instrument, newVolume);
            }
        }
    });

    root.addEventListener('change', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (action === 'update-global-bpm') {
            state.toque.globalBpm = Number(target.value);
            const section = state.toque.sections.find(s => s.id === state.activeSectionId);
            if (!section.bpm) playback.currentPlayheadBpm = state.toque.globalBpm;
            renderApp();
        }
    });

    document.addEventListener('timeline-select', (e) => {
        actions.updateActiveSection(e.detail);
        state.uiState.isMenuOpen = false;
        state.uiState.modalOpen = false;
        renderApp();
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
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
};
