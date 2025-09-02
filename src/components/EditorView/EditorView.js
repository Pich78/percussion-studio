// file: src/components/EditorView/EditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { FlowPanel } from '/percussion-studio/src/components/FlowPanel/FlowPanel.js';
import { PatternEditorView } from '/percussion-studio/src/components/PatternEditorView/PatternEditorView.js';
import { InstrumentSelectionModalView } from '/percussion-studio/src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.js';
import { EditorPlaybackControlsView } from '/percussion-studio/src/components/EditorPlaybackControlsView/EditorPlaybackControlsView.js';

export class EditorView {
    constructor(container, { flow, manifest }) {
        this.container = container;
        this.state = {
            flow,
            manifest,
            currentPattern: { name: 'New Pattern', measures: [] },
            isPinned: false,
        };

        // Component Instances
        this.flowPanel = null;
        this.patternEditor = null;
        this.playbackControls = null;
        this.instrumentModal = null;
        
        loadCSS('/percussion-studio/src/components/EditorView/EditorView.css');
        logEvent('info', 'EditorView', 'constructor', 'Lifecycle', 'Component created.');
        this.render();
    }

    // Helper method to generate instrument definitions from sound packs
    _generateInstrumentDefs(soundPacks) {
        const uniqueInstruments = new Map();
        
        soundPacks.forEach(pack => {
            if (!uniqueInstruments.has(pack.symbol)) {
                uniqueInstruments.set(pack.symbol, {
                    symbol: pack.symbol,
                    name: this._getInstrumentNameFromSymbol(pack.symbol)
                });
            }
        });
        
        return Array.from(uniqueInstruments.values());
    }

    // Helper method to convert symbol to readable instrument name
    _getInstrumentNameFromSymbol(symbol) {
        const symbolNames = {
            'KCK': 'Kick Drum',
            'SNR': 'Snare Drum',
            'HH': 'Hi-Hat',
            'CYM': 'Cymbal',
            'TOM': 'Tom',
            'PERC': 'Percussion'
        };
        
        return symbolNames[symbol] || symbol;
    }

    render() {
        this.container.innerHTML = `
            <div class="editor-view">
                <div class="editor-view-topbar"></div>
                <div class="editor-view-content">
                    <div class="editor-view-sidepanel"></div>
                    <div class="editor-view-main"></div>
                </div>
                <div id="modal-container"></div>
            </div>
        `;
        
        const topBarContainer = this.container.querySelector('.editor-view-topbar');
        const sidePanelContainer = this.container.querySelector('.editor-view-sidepanel');
        const mainContainer = this.container.querySelector('.editor-view-main');
        const modalContainer = this.container.querySelector('#modal-container');
        
        // --- Instantiate All Child Components ---

        // 1. Modal (owned by this top-level component)
        this.instrumentModal = new InstrumentSelectionModalView(modalContainer, {
            onInstrumentSelected: (selection) => {
                logEvent('info', 'EditorView', 'onInstrumentSelected', 'Callback', 'Instrument selected', selection);
                
                // Pass the selection to the PatternEditorView
                if (this.patternEditor && this.patternEditor.handleInstrumentSelected) {
                    this.patternEditor.handleInstrumentSelected(selection);
                } else {
                    logEvent('error', 'EditorView', 'onInstrumentSelected', 'Error', 'PatternEditorView not available or missing handleInstrumentSelected method');
                }
            },
            onCancel: () => {
                logEvent('info', 'EditorView', 'onModalCancel', 'Callback', 'Modal cancelled.');
                // Also notify PatternEditorView about cancellation if needed
                if (this.patternEditor && this.patternEditor._handleModalCancel) {
                    this.patternEditor._handleModalCancel();
                }
            },
        });

        // 2. Playback Controls
        this.playbackControls = new EditorPlaybackControlsView(topBarContainer, { /* ... callbacks ... */ });

        // 3. Flow Panel
        this.flowPanel = new FlowPanel(sidePanelContainer, {
            onPatternSelect: (patternId) => {
                logEvent('info', 'EditorView', 'onPatternSelect', 'State', `Pattern changed to: ${patternId}`);
                // In a real app, load the pattern data and re-render the PatternEditorView
            },
        });
        
        // 4. Pattern Editor (The main content area)
        this.patternEditor = new PatternEditorView(mainContainer, {
            soundPacks: this.state.manifest.soundPacks,
            onSave: (data) => logEvent('info', 'EditorView', 'onSavePattern', 'Callback', 'Save requested', data),
            // Pass down a callback that allows the child to request the modal
            onRequestInstrumentChange: () => {
                logEvent('info', 'EditorView', 'onRequestInstrumentChange', 'Callback', 'Child requested instrument change modal.');
                
                // Generate instrument definitions from sound packs
                const instrumentDefs = this._generateInstrumentDefs(this.state.manifest.soundPacks);
                logEvent('debug', 'EditorView', 'onRequestInstrumentChange', 'Data', 'Generated instrumentDefs:', instrumentDefs);
                
                this.instrumentModal.show({ 
                    instrumentDefs: instrumentDefs,
                    soundPacks: this.state.manifest.soundPacks 
                });
            }
        });

        // Initial render of children with state
        this.flowPanel.render({ flow: this.state.flow, currentPatternId: null, isPinned: false });
    }
    
    destroy() {
        this.playbackControls?.destroy();
        this.flowPanel?.destroy();
        this.patternEditor?.destroy();
        this.instrumentModal?.destroy();
        this.container.innerHTML = '';
        logEvent('info', 'EditorView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}