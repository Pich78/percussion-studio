// file: src/view/RhythmEditorView.js (Complete)

export class RhythmEditorView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {}; // To hold the current state for event handlers
        // Bind the event handler to 'this' instance
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
    }

    render(state) {
        this.state = state; // Store the current state
        const { playback_flow } = state.rhythm;

        if (!playback_flow) {
            this.container.innerHTML = '';
            return;
        }

        let html = '<div class="rhythm-editor">';
        
        playback_flow.forEach((item, index) => {
            html += `
                <div class="flow-item" data-index="${index}">
                    <span class="pattern-name">Pattern: ${item.pattern}</span>
                    <span class="repetitions">Repetitions: ${item.repetitions}</span>
                    <button class="delete-btn" title="Delete Item">✖</button>
                </div>
            `;
        });

        html += '</div>';
        this.container.innerHTML = html;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const deleteButtons = this.container.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', this.handleDeleteClick);
        });
    }

    handleDeleteClick(event) {
        const flowItemElement = event.target.closest('.flow-item');
        const indexToDelete = parseInt(flowItemElement.dataset.index, 10);

        // Create a *new* flow array without the deleted item (immutability)
        const newFlow = this.state.rhythm.playback_flow.filter((item, index) => {
            return index !== indexToDelete;
        });

        // Fire the callback with the new, updated flow
        this.callbacks.onFlowChange?.(newFlow);
    }
}