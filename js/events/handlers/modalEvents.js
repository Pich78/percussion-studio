/*
  js/events/handlers/modalEvents.js
  Event handlers for modal dialogs (instrument, rhythm, user guide).
*/

import { state } from '../../store.js';
import { renderApp, refreshGrid } from '../../ui/renderer.js';
import { actions } from '../../actions.js';
import { dataLoader } from '../../services/dataLoader.js';

/**
 * Handle open add instrument modal
 */
export const handleOpenAddModal = async () => {
    state.uiState.editingTrackIndex = null;
    state.uiState.modalType = 'instrument';
    state.uiState.pendingInstrument = null;
    state.uiState.pendingSoundPack = null;
    state.uiState.modalOpen = true;

    // Pre-load all instrument definitions for display names
    await preloadInstrumentDefinitions();
    refreshGrid();
};

/**
 * Handle open edit instrument modal (pre-selects instrument only)
 * @param {HTMLElement} target - The edit button element
 */
export const handleOpenEditModal = async (target) => {
    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    state.uiState.editingTrackIndex = trackIdx;
    state.uiState.modalType = 'instrument';

    // Pre-select current instrument only (NOT pack) - user can pick new pack
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    const track = section?.measures[measureIdx]?.tracks[trackIdx];
    if (track) {
        state.uiState.pendingInstrument = track.instrument;
        state.uiState.pendingSoundPack = null; // Don't pre-select pack
    } else {
        state.uiState.pendingInstrument = null;
        state.uiState.pendingSoundPack = null;
    }

    state.uiState.modalOpen = true;

    await preloadInstrumentDefinitions();
    refreshGrid();
};

/**
 * Handle open pack modal (pre-selects both instrument AND pack)
 * @param {HTMLElement} target - The pack button element
 */
export const handleOpenPackModal = async (target) => {
    const trackIdx = parseInt(target.dataset.trackIndex);
    const measureIdx = parseInt(target.dataset.measureIndex || 0);
    state.uiState.editingTrackIndex = trackIdx;
    state.uiState.modalType = 'instrument';

    // Pre-select both instrument AND pack - shows current selection
    const section = state.toque?.sections.find(s => s.id === state.activeSectionId);
    const track = section?.measures[measureIdx]?.tracks[trackIdx];
    if (track) {
        state.uiState.pendingInstrument = track.instrument;
        state.uiState.pendingSoundPack = track.pack;
    } else {
        state.uiState.pendingInstrument = null;
        state.uiState.pendingSoundPack = null;
    }

    state.uiState.modalOpen = true;

    await preloadInstrumentDefinitions();
    refreshGrid();
};

/**
 * Pre-load all instrument definitions for modal display
 */
const preloadInstrumentDefinitions = async () => {
    const manifest = dataLoader.manifest;
    if (manifest && manifest.instruments) {
        for (const symbol of Object.keys(manifest.instruments)) {
            // Always reload instrument definitions to ensure freshness
            const instDef = await dataLoader.loadInstrumentDefinition(symbol);
            state.instrumentDefinitions[symbol] = instDef;
        }
        refreshGrid();
    }
};

/**
 * Handle close modal
 */
export const handleCloseModal = () => {
    state.uiState.modalOpen = false;
    state.uiState.pendingInstrument = null;
    state.uiState.pendingSoundPack = null;
    renderApp();
};

/**
 * Handle select instrument
 * @param {HTMLElement} target - The instrument option element
 */
export const handleSelectInstrument = (target) => {
    const inst = target.dataset.instrument;
    state.uiState.pendingInstrument = inst;
    refreshGrid();
};

/**
 * Handle select sound pack
 * @param {HTMLElement} target - The sound pack option element
 */
export const handleSelectSoundPack = (target) => {
    const pack = target.dataset.pack;
    state.uiState.pendingSoundPack = pack;
    refreshGrid();
};

/**
 * Handle confirm instrument selection
 */
export const handleConfirmInstrumentSelection = async () => {
    const inst = state.uiState.pendingInstrument;
    const pack = state.uiState.pendingSoundPack;

    if (!inst || !pack) return;

    if (state.uiState.editingTrackIndex === null) {
        await actions.addTrack(inst, pack);
    } else {
        await actions.updateTrackInstrument(state.uiState.editingTrackIndex, inst, pack);
    }

    state.uiState.modalOpen = false;
    state.uiState.pendingInstrument = null;
    state.uiState.pendingSoundPack = null;
    renderApp();
};

/**
 * Handle toggle folder in rhythm modal
 * @param {HTMLElement} target - The folder element
 */
export const handleToggleFolder = (target) => {
    const folderPath = target.dataset.folderPath;

    // Special handling for Batà folder: Open BataExplorer modal
    if (folderPath === 'Batà') {
        state.uiState.modalOpen = false;
        state.uiState.bataExplorer.isOpen = true;

        // In development, always reload metadata to pick up changes
        const shouldReload = !state.uiState.bataExplorer.metadata ||
            (typeof window !== 'undefined' && window.location.hostname === 'localhost');

        if (shouldReload) {
            state.uiState.bataExplorer.metadata = null; // Clear cached state
            dataLoader.loadBataMetadata().then(metadata => {
                state.uiState.bataExplorer.metadata = metadata;
                renderApp();
            });
        }
        renderApp();
        return true; // Handled specially
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

    return false;
};

/**
 * Handle select rhythm confirm
 * @param {HTMLElement} target - The rhythm element
 */
export const handleSelectRhythmConfirm = async (target) => {
    const rhythmId = target.dataset.rhythmId;
    if (confirm("Load this rhythm? Unsaved changes will be lost.")) {
        await actions.loadRhythm(rhythmId);
        state.uiState.modalOpen = false;
        renderApp();
    }
};

/**
 * Handle trigger file input
 */
export const handleTriggerFileInput = () => {
    const fileInput = document.getElementById('rhythm-file-input');
    if (fileInput) {
        fileInput.click();
    }
};

/**
 * Handle load rhythm file
 * @param {HTMLInputElement} target - The file input element
 */
export const handleLoadRhythmFile = async (target) => {
    const file = target.files?.[0];
    if (file) {
        if (confirm("Load this rhythm file? Unsaved changes will be lost.")) {
            await actions.loadRhythmFromFile(file);
            state.uiState.modalOpen = false;
            renderApp();
        }
        // Reset file input so the same file can be selected again
        target.value = '';
    }
};

/**
 * Handle open user guide
 * @param {HTMLElement} target - The user guide link element
 * @param {boolean} isMobile - Whether on mobile
 */
export const handleOpenUserGuide = (target, isMobile = false) => {
    const lang = target.dataset.lang;
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
            state.uiState.userGuideContent = convertMarkdownToHtml(markdown);
            renderApp();
        })
        .catch(err => {
            state.uiState.userGuideContent = `<div class="text-center text-red-400 py-8">Failed to load user guide: ${err.message}</div>`;
            renderApp();
        });
};

/**
 * Convert markdown to HTML
 * @param {string} markdown - Raw markdown text
 * @returns {string} HTML string
 */
const convertMarkdownToHtml = (markdown) => {
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
            if (cells.every(c => /^[-:]+$/.test(c))) return '';
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

    return `<div class="text-gray-300"><p class="mb-3">${html}</p></div>`;
};
