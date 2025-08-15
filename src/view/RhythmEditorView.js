// file: src/view/RhythmEditorView.js (Corrected)
export class RhythmEditorView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {};
        this.draggedIndex = null; // To track the item being dragged

        // Use event delegation for performance and simplicity
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.container.addEventListener('dragover', this.handleDragOver.bind(this));
        this.container.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.container.addEventListener('drop', this.handleDrop.bind(this));
        this.container.addEventListener('blur', this.handleBlur.bind(this), true); // Use capture phase for blur
    }

    render(state) {
        this.state = state;
        const { rhythm } = state;

        // The critical fix to prevent a crash on initial render:
        // Add a guard clause to handle the initial state where rhythm is null.
        // Without this, the component crashes on the first render call from App.init().
        if (!rhythm || !rhythm.playback_flow) {
            this.container.innerHTML = ''; // Render nothing if there's no data
            return;
        }

        const { playback_flow } = rhythm;

        let html = '<div class="rhythm-editor">';

        playback_flow.forEach((item, index) => {
            html += `
                <div class="flow-item" draggable="true" data-index="${index}">
                    <span class="pattern-name">Pattern: ${item.pattern}</span>
                    <span class="repetitions" contenteditable="true" data-property="repetitions">${item.repetitions}</span>
                    <button class="delete-btn" title="Delete Item">✖</button>
                </div>
            `;
        });

        html += `<button class="add-pattern-btn">+</button></div>`;
        this.container.innerHTML = html;
    }

    // --- Event Handlers (Delegated) ---
    handleClick(event) {
        if (event.target.classList.contains('delete-btn')) {
            const flowItemElement = event.target.closest('.flow-item');
            const indexToDelete = parseInt(flowItemElement.dataset.index, 10);
            
            // NOTE: window.confirm() will not display in this environment. A custom modal UI is required.
            if (window.confirm('Are you sure you want to delete this item?')) {
                const newFlow = this.state.rhythm.playback_flow.filter((_, index) => index !== indexToDelete);
                this.callbacks.onFlowChange?.(newFlow);
            }
        } else if (event.target.classList.contains('add-pattern-btn')) {
            this.callbacks.onAddPatternClick?.();
        }
    }

    handleBlur(event) {
        if (event.target.hasAttribute('contenteditable')) {
            const flowItemElement = event.target.closest('.flow-item');
            const index = parseInt(flowItemElement.dataset.index, 10);
            const property = event.target.dataset.property;
            const newValue = parseInt(event.target.textContent, 10);

            if (isNaN(newValue) || newValue < 1) {
                console.warn('Invalid input for repetitions. Must be a number greater than 0.');
                this.render(this.state); 
                return;
            }

            const newFlow = structuredClone(this.state.rhythm.playback_flow);
            if (newFlow[index][property] !== newValue) {
                newFlow[index][property] = newValue;
                this.callbacks.onFlowChange?.(newFlow);
            }
        }
    }

    // --- Drag and Drop Handlers ---
    handleDragStart(event) {
        if (event.target.classList.contains('flow-item')) {
            this.draggedIndex = parseInt(event.target.dataset.index, 10);
            event.dataTransfer.effectAllowed = 'move';
        }
    }

    handleDragOver(event) {
        event.preventDefault(); // Necessary to allow drop
        const target = event.target.closest('.flow-item');
        if (target) {
            target.classList.add('drag-over');
        }
    }

    handleDragLeave(event) {
        const target = event.target.closest('.flow-item');
        if (target) {
            target.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const targetElement = event.target.closest('.flow-item');
        if (targetElement === null || this.draggedIndex === null) return;
        
        targetElement.classList.remove('drag-over');
        const dropIndex = parseInt(targetElement.dataset.index, 10);

        if (this.draggedIndex === dropIndex) return;

        const flow = [...this.state.rhythm.playback_flow];
        const [draggedItem] = flow.splice(this.draggedIndex, 1);
        flow.splice(dropIndex, 0, draggedItem);
        
        this.draggedIndex = null;
        this.callbacks.onFlowChange?.(flow);
    }
}
