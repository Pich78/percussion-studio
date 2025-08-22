// file: src/components/EditorView/EditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { FlowPanel } from '/percussion-studio/src/components/FlowPanel/FlowPanel.js';
import { PatternEditorView } from '/percussion-studio/src/components/PatternEditorView/PatternEditorView.js';
// FIX: Import the new playback controls component
import { EditorPlaybackControlsView } from '/percussion-studio/src/components/EditorPlaybackControlsView/EditorPlaybackControlsView.js';

export class EditorView {
    constructor(container, { flow, manifest }) {
        this.container = container;
        this.state = {
            flow,
            manifest,
            currentPatternId: flow.length > 0 ? flow[0].pattern : null,
            isPinned: false,
            globalBPM: 120
        };

        this.flowPanel = null;
        this.patternEditor = null;
        // FIX: Add property for the new component instance
        this.playbackControls = null;
        
        loadCSS('/percussion-studio/src/components/EditorView/EditorView.css');
        logEvent('info', 'EditorView', 'constructor', 'Lifecycle', 'Component created.');
        this.render();
    }

    render() {
        // FIX: Update HTML structure with top bar and content areas
        this.container.innerHTML = `
            <div class="editor-view">
                <div class="editor-view-topbar"></div>
                <div class="editor-view-content">
                    <div class="editor-view-sidepanel"></div>
                    <div class="editor-view-main">
                        <div id="modal-container"></div>
                    </div>
                </div>
            </div>
        `;
        
        // FIX: Get references to new containers
        const topBarContainer = this.container.querySelector('.editor-view-topbar');
        const sidePanelContainer = this.container.querySelector('.editor-view-sidepanel');
        const mainContainer = this.container.querySelector('.editor-view-main');
        
        // --- Instantiate Child Components ---

        // FIX: Instantiate EditorPlaybackControlsView
        this.playbackControls = new EditorPlaybackControlsView(topBarContainer, {
            onTransport: ({ action }) => {
                const context = this.state.isPinned ? 'Rhythm Flow' : `Pattern: ${this.state.currentPatternId}`;
                logEvent('info', 'EditorView', 'onTransport', 'Playback', `Action '${action}' triggered for context: ${context}`);
            },
            onSettingsChange: (settings) => {
                const context = this.state.isPinned ? 'Rhythm Flow' : `Pattern: ${this.state.currentPatternId}`;
                logEvent('info', 'EditorView', 'onSettingsChange', 'Playback', `Settings changed for context: ${context}`, settings);
                if (settings.bpm !== undefined) {
                    this.state.globalBPM = settings.bpm;
                    // Re-render flow panel to update BPM displays
                    this.flowPanel.render(this.getFlowPanelState());
                }
            }
        });

        // FlowPanel
        this.flowPanel = new FlowPanel(sidePanelContainer, {
            onPin: (isPinned) => {
                this.state.isPinned = isPinned;
                this.flowPanel.render(this.getFlowPanelState());
                // FIX: Update playback context when pinning
                this._updatePlaybackContext();
            },
            onPatternSelect: (patternId) => {
                this.state.currentPatternId = patternId;
                logEvent('info', 'EditorView', 'onPatternSelect', 'State', `Pattern changed to: ${patternId}`);
                this.flowPanel.render(this.getFlowPanelState());
                // FIX: Update playback context when selecting a new pattern
                this._updatePlaybackContext();
                // In a real app, we would now load the pattern data and pass it to the PatternEditor
            },
            // ... other callbacks to be wired up
        });

        // PatternEditorView
        this.patternEditor = new PatternEditorView(mainContainer, {
            instrumentDefs: this.state.manifest.instrumentDefs,
            soundPacks: this.state.manifest.soundPacks
        });

        // --- Initial Render of Children ---
        this.flowPanel.render(this.getFlowPanelState());
        
        // FIX: Set the initial playback context
        this._updatePlaybackContext();
    }
    
    // FIX: New method to manage playback context and UI feedback
    _updatePlaybackContext() {
        const sidePanelContainer = this.container.querySelector('.editor-view-sidepanel');
        const mainContainer = this.container.querySelector('.editor-view-main');

        if (this.state.isPinned) {
            // Context is the entire rhythm flow
            this.playbackControls.updateDisplayText('Rhythm Flow');
            sidePanelContainer.classList.add('playback-target');
            mainContainer.classList.remove('playback-target');
            logEvent('debug', 'EditorView', '_updatePlaybackContext', 'UI', 'Playback context set to Rhythm Flow');

        } else {
            // Context is the currently selected pattern
            this.playbackControls.updateDisplayText(this.state.currentPatternId || 'No Pattern Selected');
            sidePanelContainer.classList.remove('playback-target');
            mainContainer.classList.add('playback-target');
            logEvent('debug', 'EditorView', '_updatePlaybackContext', 'UI', `Playback context set to Pattern: ${this.state.currentPatternId}`);
        }
    }

    getFlowPanelState() {
        return {
            flow: this.state.flow,
            currentPatternId: this.state.currentPatternId,
            isPinned: this.state.isPinned,
            globalBPM: this.state.globalBPM
        };
    }
    
    destroy() {
        if (this.playbackControls) this.playbackControls.destroy();
        if (this.flowPanel) this.flowPanel.destroy();
        if (this.patternEditor) this.patternEditor.destroy();
        logEvent('info', 'EditorView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}