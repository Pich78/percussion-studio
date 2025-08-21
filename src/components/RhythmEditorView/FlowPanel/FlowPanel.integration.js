// file: src/components/RhythmEditorView/FlowPanel/FlowPanel.integration.js
import { FlowPanel } from './FlowPanel.js';

export class FlowPanelIntegrationHelper {
    /**
     * @param {HTMLElement} container The DOM element where the FlowPanel will be rendered.
     */
    constructor(container) {
        this.container = container;
        this.callbackLog = [];
        this.callbacks = {
            onPin: (isPinned) => this.logCallback('onPin', { isPinned }),
            onPatternSelect: (id) => this.logCallback('onPatternSelect', { id }),
            onAddPattern: () => this.logCallback('onAddPattern', null),
            onDeleteFlowItem: (index) => this.logCallback('onDeleteFlowItem', { index }),
            onReorderFlow: (from, to) => this.logCallback('onReorderFlow', { from, to }),
            onPatternPropertyChange: (index, property, value) => this.logCallback('onPatternPropertyChange', { index, property, value }),
        };
        this.flowPanel = new FlowPanel(this.container, this.callbacks);
    }

    /**
     * Renders the FlowPanel with a given state.
     * @param {object} state The state to render.
     */
    render(state) {
        this.flowPanel.render(state);
    }

    /**
     * Simulates a click on a pattern item.
     * @param {string} patternId The ID of the pattern to click.
     */
    clickPattern(patternId) {
        const item = this.container.querySelector(`[data-pattern-id="${patternId}"]`);
        if (item) {
            item.click();
        }
    }
    
    /**
     * Simulates a click on the add button.
     */
    clickAddButton() {
        const addButton = this.container.querySelector('[data-action="add-pattern"]');
        if (addButton) {
            addButton.click();
        }
    }
    
    /**
     * Simulates a click on a delete button.
     * @param {number} index The index of the item to delete.
     */
    clickDeleteButton(index) {
        const deleteButton = this.container.querySelector(`[data-action="delete-flow-item"][data-index="${index}"]`);
        if (deleteButton) {
            // Need to mock the window.confirm to avoid blocking tests
            const originalConfirm = window.confirm;
            window.confirm = () => true;
            deleteButton.click();
            window.confirm = originalConfirm;
        }
    }

    /**
     * Logs a callback invocation.
     * @param {string} name The name of the callback.
     * @param {object} args The arguments passed to the callback.
     */
    logCallback(name, args) {
        this.callbackLog.push({ name, args });
    }

    /**
     * Clears the callback log.
     */
    clearLog() {
        this.callbackLog = [];
    }

    /**
     * Gets a copy of the current callback log.
     * @returns {Array<object>} The logged callbacks.
     */
    getCallbacks() {
        return [...this.callbackLog];
    }
}