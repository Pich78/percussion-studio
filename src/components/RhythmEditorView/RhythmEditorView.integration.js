// file: src/components/RhythmEditorView/RhythmEditorView.integration.js
import { RhythmEditorView } from './RhythmEditorView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

export function initIntegration() {
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');

    // The state is identical to what the real EditingApp would manage
    let currentState = {
        rhythm: {
            playback_flow: [
                { pattern: 'verse', repetitions: 4 }, 
                { pattern: 'chorus', repetitions: 2 }
            ],
            patterns: { 
                verse: { metadata: { resolution: 8 }, pattern_data: [{ KCK: 'o-o-o-o-' }] },
                chorus: { metadata: { resolution: 8 }, pattern_data: [{ SNR: 'o-o--o-o' }] }
            }
        },
        currentEditingPatternId: 'verse',
        isFlowPinned: true,
        scrollToLastItem: false
    };

    const container = document.getElementById('view-container');
    const stateDisplay = document.getElementById('current-state-display');

    const rerender = () => {
        logEvent('info', 'Harness', 'rerender', 'State', 'Rerendering integration view...', currentState);
        view.render(currentState);
        currentState.scrollToLastItem = false; // Clear the scroll flag after rendering
        stateDisplay.textContent = `Current State: ${JSON.stringify(currentState, null, 2)}`;
    };

    // Instantiate the REAL RhythmEditorView
    const view = new RhythmEditorView(container, {
        onPinFlowPanel: (isPinned) => {
            logEvent('info', 'Harness', 'onPinFlowPanel', 'Callback', `isPinned: ${isPinned}`);
            currentState.isFlowPinned = isPinned;
            rerender();
        },
        onPatternSelect: (id) => { 
            currentState.currentEditingPatternId = id; 
            rerender(); 
        },
        onAddPattern: () => {
            const newIndex = currentState.rhythm.playback_flow.length + 1;
            const newPatternId = `p${newIndex}`;
            currentState.rhythm.playback_flow.push({ pattern: newPatternId });
            currentState.rhythm.patterns[newPatternId] = { metadata: { resolution: 8 }, pattern_data: [{}] };
            currentState.scrollToLastItem = true;
            logEvent('info', 'Harness', 'onAddPattern', 'Callback', `Added pattern ${newPatternId}`);
            rerender();
        },
        onDeleteFlowItem: (index) => {
            if (index >= 0 && index < currentState.rhythm.playback_flow.length) {
                const removed = currentState.rhythm.playback_flow.splice(index, 1);
                logEvent('info', 'Harness', 'onDeleteFlowItem', 'Callback', `Removed pattern ${removed[0].pattern} at index ${index}`);
                rerender();
            }
        },
        onReorderFlow: (fromIndex, toIndex) => {
            if (fromIndex >= 0 && fromIndex < currentState.rhythm.playback_flow.length && 
                toIndex >= 0 && toIndex < currentState.rhythm.playback_flow.length) {
                const movedItem = currentState.rhythm.playback_flow.splice(fromIndex, 1)[0];
                currentState.rhythm.playback_flow.splice(toIndex, 0, movedItem);
                logEvent('info', 'Harness', 'onReorderFlow', 'Callback', `Moved pattern ${movedItem.pattern} from index ${fromIndex} to ${toIndex}`);
                rerender();
            }
        },
    });

    rerender(); // Initial render
}