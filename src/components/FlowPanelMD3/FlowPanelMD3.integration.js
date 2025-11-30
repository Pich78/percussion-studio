// file: src/components/FlowPanelMD3/FlowPanelMD3.integration.js
import './FlowPanelMD3.js'; // Import to define the custom element

export class FlowPanelMD3IntegrationHelper {
    /**
     * @param {HTMLElement} container The DOM element where the FlowPanel will be rendered.
     */
    constructor(container) {
        this.container = container;
        this.eventLog = [];
        this.component = document.createElement('flow-panel-md3');
        this.container.appendChild(this.component);
        this._addEventListeners();
    }
    
    _addEventListeners() {
        this.component.addEventListener('expansion-change', e => this.logEvent('expansion-change', e.detail));
        this.component.addEventListener('pattern-select', e => this.logEvent('pattern-select', e.detail));
        this.component.addEventListener('add-pattern', e => this.logEvent('add-pattern', e.detail));
        this.component.addEventListener('delete-flow-item', e => this.logEvent('delete-flow-item', e.detail));
        this.component.addEventListener('reorder-flow', e => this.logEvent('reorder-flow', e.detail));
        this.component.addEventListener('pattern-property-change', e => this.logEvent('pattern-property-change', e.detail));
    }

    /**
     * Renders the FlowPanel with a given state.
     * @param {object} state The state to render.
     */
    render(state) {
        this.component.flowData = state.flow;
        this.component.currentPatternId = state.currentPatternId;
        this.component.globalBPM = state.globalBPM;
        this.component.patternList = state.patternList;
        if (state.isExpanded) {
            this.component.setAttribute('expanded', '');
        } else {
            this.component.removeAttribute('expanded');
        }
    }

    /**
     * Simulates a click on a pattern item.
     * @param {string} patternId The ID of the pattern to click.
     */
    clickPattern(patternId) {
        const item = this.component.shadowRoot.querySelector(`[data-pattern-id="${patternId}"]`);
        if (item) {
            item.click();
        }
    }
    
    /**
     * Simulates a click on the add button.
     */
    clickAddButton() {
        const addButton = this.component.shadowRoot.querySelector('#add-btn');
        if (addButton) {
            addButton.click();
        }
    }
    
    /**
     * Simulates a click on a delete button inside a pattern item.
     * @param {number} index The index of the item to delete.
     */
    clickDeleteButton(index) {
        const item = this.component.shadowRoot.querySelector(`[data-index="${index}"]`);
        if (item) {
            // The actual button is in the item's shadow root.
            const deleteButton = item.shadowRoot.querySelector('button[part="delete-button"]');
            deleteButton?.click();
        }
    }

    /**
     * Logs an event invocation.
     * @param {string} name The name of the event.
     * @param {object} detail The event detail object.
     */
    logEvent(name, detail) {
        this.eventLog.push({ name, detail });
    }

    /**
     * Clears the event log.
     */
    clearLog() {
        this.eventLog = [];
    }

    /**
     * Gets a copy of the current event log.
     * @returns {Array<object>} The logged events.
     */
    getEvents() {
        return [...this.eventLog];
    }
}