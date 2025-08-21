// file: src/components/EditorView/EditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { FlowPanel } from '/percussion-studio/src/components/FlowPanel/FlowPanel.js';
import { PatternEditorView } from '/percussion-studio/src/components/PatternEditorView/PatternEditorView.js';

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
        
        loadCSS('/percussion-studio/src/components/EditorView/EditorView.css');
        logEvent('info', 'EditorView', 'constructor', 'Lifecycle', 'Component created.');
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="editor-view">
                <div class="editor-view-sidepanel"></div>
                <div class="editor-view-main">
                     <div id="modal-container"></div>
                </div>
            </div>
        `;

        const sidePanelContainer = this.container.querySelector('.editor-view-sidepanel');
        const mainContainer = this.container.querySelector('.editor-view-main');
        
        // --- Instantiate Child Components ---

        // FlowPanel
        this.flowPanel = new FlowPanel(sidePanelContainer, {
            onPin: (isPinned) => {
                this.state.isPinned = isPinned;
                this.flowPanel.render(this.getFlowPanelState());
            },
            onPatternSelect: (patternId) => {
                this.state.currentPatternId = patternId;
                logEvent('info', 'EditorView', 'onPatternSelect', 'State', `Pattern changed to: ${patternId}`);
                // Re-render both to update selection highlights
                this.flowPanel.render(this.getFlowPanelState());
                // In a real app, we would now load the pattern data and pass it to the PatternEditor
                // For now, we are just logging.
            },
            // ... other callbacks to be wired up
        });

        // PatternEditorView
        // Note: PatternEditorView will look for '#modal-container' globally.
        // We provide one within our main content area.
        this.patternEditor = new PatternEditorView(mainContainer, {
            instrumentDefs: this.state.manifest.instrumentDefs,
            soundPacks: this.state.manifest.soundPacks
        });

        // --- Initial Render of Children ---
        this.flowPanel.render(this.getFlowPanelState());
        // The PatternEditorView renders itself on construction, so we don't need to call it again.
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
        if (this.flowPanel) this.flowPanel.destroy();
        if (this.patternEditor) this.patternEditor.destroy();
        logEvent('info', 'EditorView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}