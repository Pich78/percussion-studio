// file: src/EditingApp.js
import { RhythmEditorView } from './view/RhythmEditorView.js';
import { EditController } from './controller/EditController.js';

export class EditingApp {
    constructor(container, props) {
        this.container = container;
        this.props = props;

        this.editController = new EditController();

        this.state = {
            isDirty: false,
            isUntitled: false,
            currentEditingPatternId: this.props.rhythm.playback_flow[0]?.pattern || null,
        };

        this.rhythmEditorView = new RhythmEditorView(
            this.container,
            {
                // Wire up all callbacks from the view
                onFlowChange: this.handleFlowChange.bind(this),
                onAddNote: this.handleAddNote.bind(this),
                onRemoveNote: this.handleRemoveNote.bind(this),
                onAddTrack: this.handleAddTrack.bind(this),
                onRemoveTrack: this.handleRemoveTrack.bind(this),
                onPatternSelect: this.handlePatternSelect.bind(this),
                onAddPatternClick: this.handleAddPattern.bind(this),
            }
        );
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }
    
    // --- Callback Handlers ---

    handleFlowChange(newFlow) {
        const newRhythm = this.editController.updatePlaybackFlow(this.props.rhythm, newFlow);
        this.props.onRhythmUpdate(newRhythm);
        this.setState({ isDirty: true });
    }

    handleAddNote(position) {
        const newRhythm = this.editController.addNote(this.props.rhythm, position);
        this.props.onRhythmUpdate(newRhythm);
        this.setState({ isDirty: true });
    }

    handleRemoveNote(position) {
        const newRhythm = this.editController.removeNote(this.props.rhythm, position);
        this.props.onRhythmUpdate(newRhythm);
        this.setState({ isDirty: true });
    }

    handleAddTrack(patternId, instrumentSymbol) {
        // For now, we'll need to prompt for the sound pack name.
        // A future implementation might use a file picker or a more advanced UI.
        const soundPackName = prompt(`Enter the sound pack name for instrument "${instrumentSymbol}":`);
        if (!soundPackName) return;

        const payload = { patternId, instrumentSymbol, soundPackName };
        const newRhythm = this.editController.addTrack(this.props.rhythm, payload);
        this.props.onRhythmUpdate(newRhythm);
        this.setState({ isDirty: true });
    }

    handleRemoveTrack(patternId, instrumentSymbol) {
        const payload = { patternId, instrumentSymbol };
        const newRhythm = this.editController.removeTrack(this.props.rhythm, payload);
        this.props.onRhythmUpdate(newRhythm);
        this.setState({ isDirty: true });
    }

    handlePatternSelect(patternId) {
        this.setState({ currentEditingPatternId: patternId });
    }

    handleAddPattern() {
        const patternId = prompt("Enter a unique ID for the new pattern (e.g., 'new_chorus'):");
        if (!patternId) return;

        const payload = {
            patternId,
            metadata: { name: patternId, metric: '4/4', resolution: 16 }
        };
        
        const newRhythm = this.editController.addPattern(this.props.rhythm, payload);
        
        // Also add the new pattern to the end of the playback flow
        const newFlow = [...newRhythm.playback_flow, { pattern: patternId, repetitions: 1 }];
        const finalRhythm = this.editController.updatePlaybackFlow(newRhythm, newFlow);

        this.props.onRhythmUpdate(finalRhythm);
        this.setState({ isDirty: true, currentEditingPatternId: patternId });
    }

    render() {
        const viewState = {
            ...this.state,
            rhythm: this.props.rhythm,
        };
        this.rhythmEditorView.render(viewState);
    }

    destroy() {
        // A more robust implementation would remove the delegated event listener
        // from the container, but for now this is sufficient.
        this.container.innerHTML = '';
    }
}