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
            currentPattern: { name: 'New Pattern', measures: [] }, // Simplified for now
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
                // In a real app, this would bubble down to the correct measure editor
            },
            onCancel: () => logEvent('info', 'EditorView', 'onModalCancel', 'Callback', 'Modal cancelled.'),
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
        
        // 4. Pattern Editor (The main content of the FlowPanel)
        this.patternEditor = new PatternEditorView(mainContainer, {
            soundPacks: this.state.manifest.soundPacks,
            onSave: (data) => logEvent('info', 'EditorView', 'onSavePattern', 'Callback', 'Save requested', data),
            // Pass down a callback that allows the child to request the modal
            onRequestInstrumentChange: () => {
                logEvent('info', 'EditorView', 'onRequestInstrumentChange', 'Callback', 'Child requested instrument change modal.');
                this.instrumentModal.show({ soundPacks: this.state.manifest.soundPacks });
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