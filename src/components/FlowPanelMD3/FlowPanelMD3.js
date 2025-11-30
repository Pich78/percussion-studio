// file: src/components/FlowPanelMD3/FlowPanelMD3.js
import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import './../PatternItemViewMD3/PatternItemViewMD3.js';
const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
display: block;
position: absolute;
top: 0;
left: 0;
height: 100%;
z-index: 20;
--panel-width-collapsed: 56px;
--panel-width-expanded: 360px;
--panel-transition-duration: 0.25s;
container-type: inline-size;
}
code
Code
.side-sheet {
        display: flex;
        height: 100%;
        width: var(--panel-width-collapsed);
        background-color: var(--md-sys-color-surface-container-low);
        border-right: 1px solid var(--md-sys-color-outline-variant);
        transition: width var(--panel-transition-duration) ease-in-out;
        overflow: hidden;
        box-sizing: border-box;
    }

    :host([expanded]) .side-sheet {
        width: var(--panel-width-expanded);
        box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    .collapsed-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding-top: 16px;
        opacity: 1;
        transition: opacity 0.1s linear;
    }

    :host([expanded]) .collapsed-content {
        opacity: 0;
        pointer-events: none;
    }

    .expanded-content {
        width: var(--panel-width-expanded);
        padding: 16px;
        box-sizing: border-box;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease-in-out 0.1s, visibility 0s linear 0.3s;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    :host([expanded]) .expanded-content {
        opacity: 1;
        visibility: visible;
        transition: opacity 0.2s ease-in-out 0.1s, visibility 0s linear 0s;
    }
    
    .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
    }

    .panel-title {
        font-size: var(--md-sys-typescale-title-medium-size, 1.25rem);
        color: var(--md-sys-color-on-surface);
        margin: 0;
    }

    .flow-list {
        flex-grow: 1;
        overflow-y: auto;
        margin: 0 -16px; /* Extend to edges for better scrollbar handling */
        padding: 0 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-height: 0; /* Important for flexbox scrolling */
    }
    .flow-list::-webkit-scrollbar { display: none; }

    .fab-container {
        padding-top: 16px;
        text-align: center;
    }
    
    .add-button {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background-color: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        transition: box-shadow 0.2s ease;
    }
    .add-button:hover {
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    
    /* FIX: Placeholder style now applies to the item being dragged */
    ::slotted(pattern-item-view-md3[is-dragging]) {
        background-color: var(--md-sys-color-surface-container-high);
        border: 2px dashed var(--md-sys-color-outline);
        opacity: 0.8;
    }

    ::slotted(pattern-item-view-md3[is-dragging]) * {
        visibility: hidden;
    }

    /* Generic icon button style */
    .icon-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: var(--md-sys-color-on-surface-variant);
        cursor: pointer;
    }
    .icon-button:hover {
        background-color: rgba(var(--md-sys-color-on-surface-rgb), 0.08);
    }

</style>
<div class="side-sheet" part="side-sheet">
    <div class="collapsed-content">
        <button class="icon-button" id="expand-btn" title="Expand Flow Panel">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 18h16V6H4v12zm10-8h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-4h2v2h-2v-2zm-4 0h2v2H6v-2z" opacity=".3"/><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm4 0h2v2h-2zm4 0h2v2h-2zm-4 4h2v2h-2zm-4 0h2v2H6zm8 0h2v2h-2z"/></svg>
        </button>
    </div>

    <div class="expanded-content">
        <div class="panel-header">
            <h3 class="panel-title">Rhythm Flow</h3>
            <button class="icon-button" id="collapse-btn" title="Collapse Flow Panel">
                 <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
        </div>
        <!-- FIX: Added a slot to render children from light DOM -->
        <div class="flow-list" id="flow-list">
            <slot></slot>
        </div>
        <div class="fab-container">
             <button class="add-button" id="add-btn" title="Add New Pattern to Flow">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </button>
        </div>
    </div>
</div>
`;
export class FlowPanelMD3 extends HTMLElement {
static get observedAttributes() {
return ['expanded', 'flow-data', 'current-pattern-id', 'global-bpm', 'pattern-list'];
}
constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    this._flowData = [];
    this._currentPatternId = null;
    this._globalBPM = 120;
    this._patternList = [];
    
    // --- Custom Drag-and-drop state restored ---
    this.draggedIndex = null;
    this.draggedElement = null;

    this.dragStartOffset = 0;
    this.draggedItemHeight = 0;
    this.lastMouseY = 0;
    this.lastDirection = null;
    this.lastAfterElement = null;
    this.lastLoggedCollision = null;
    
    this.overlapThresholdPercent = 0.25;
    this.scrollZoneSize = 60;
    this.scrollSpeed = 5;
}

connectedCallback() {
    logEvent('info', 'FlowPanelMD3', 'connectedCallback', 'Lifecycle', 'Component connected.');
    this._addEventListeners();
    this.render();
}

attributeChangedCallback(name, oldValue, newValue) {
    logEvent('debug', 'FlowPanelMD3', 'attributeChangedCallback', 'Attributes', `${name} changed from '${oldValue}' to '${newValue}'`);
    if (oldValue === newValue) return;

    switch(name) {
        case 'flow-data':
            this._flowData = JSON.parse(newValue || '[]');
            this.render();
            break;
        case 'current-pattern-id':
            this._currentPatternId = newValue;
            this._updateSelection(); 
            break;
        case 'global-bpm':
            this._globalBPM = Number(newValue);
            this.render();
            break;
         case 'pattern-list':
            this._patternList = JSON.parse(newValue || '[]');
            this.render();
            break;
    }
}

// --- Properties ---
set flowData(data) { this.setAttribute('flow-data', JSON.stringify(data || [])); }
get flowData() { return this._flowData; }
set currentPatternId(id) { this.setAttribute('current-pattern-id', id); }
get currentPatternId() { return this._currentPatternId; }
set globalBPM(value) { this.setAttribute('global-bpm', value); }
get globalBPM() { return this._globalBPM; }
set patternList(list) { this.setAttribute('pattern-list', JSON.stringify(list || [])); }
get patternList() { return this._patternList; }

// --- Public Methods ---
render() {
    // FIX: Render children into the light DOM to allow slotting and CSS ::slotted selectors to work.
    this.innerHTML = ''; 
    this._flowData.forEach((item, index) => {
        const itemView = document.createElement('pattern-item-view-md3');
        itemView.dataset.index = index;
        itemView.dataset.patternId = item.pattern;
        itemView.itemData = item;
        itemView.globalBPM = this.globalBPM;
        itemView.patternList = this.patternList;
        itemView.draggable = true;
        if (item.pattern === this._currentPatternId) {
            itemView.setAttribute('selected', '');
        }
        this.appendChild(itemView);
    });
    logEvent('info', 'FlowPanelMD3', 'render', 'DOM', `${this._flowData.length} items rendered in flow list.`);
}

// --- Private Methods ---
_addEventListeners() {
    const expandBtn = this.shadowRoot.getElementById('expand-btn');
    const collapseBtn = this.shadowRoot.getElementById('collapse-btn');
    const addBtn = this.shadowRoot.getElementById('add-btn');
    const flowList = this.shadowRoot.getElementById('flow-list');

    const toggleExpansion = (expand) => {
        if (expand) this.setAttribute('expanded', '');
        else this.removeAttribute('expanded');
        this.dispatchEvent(new CustomEvent('expansion-change', { detail: { expanded: expand } }));
    };

    expandBtn.addEventListener('click', () => toggleExpansion(true));
    collapseBtn.addEventListener('click', () => toggleExpansion(false));
    addBtn.addEventListener('click', () => this.dispatchEvent(new CustomEvent('add-pattern')));
    
    // Listen for events bubbling up to the host element
    this.addEventListener('click', e => {
        const item = e.target.closest('pattern-item-view-md3');
        if (item && !e.target.closest('button, input, select, .modifier-value')) {
            this.dispatchEvent(new CustomEvent('pattern-select', { detail: { patternId: item.dataset.patternId }}));
        }
    });
    this.addEventListener('delete-item', e => {
        const item = e.target.closest('pattern-item-view-md3');
        if (item) this.dispatchEvent(new CustomEvent('delete-flow-item', { detail: { index: Number(item.dataset.index) } }));
    });
    this.addEventListener('property-change', e => {
        const item = e.target.closest('pattern-item-view-md3');
        if (item) this.dispatchEvent(new CustomEvent('pattern-property-change', { detail: { index: Number(item.dataset.index), ...e.detail } }));
    });
    
    // D&D listeners are on the flowList container inside the shadow DOM
    flowList.addEventListener('dragstart', this._handleDragStart.bind(this));
    flowList.addEventListener('dragover', this._handleDragOver.bind(this));
    flowList.addEventListener('drop', this._handleDrop.bind(this));
    flowList.addEventListener('dragend', this._handleDragEnd.bind(this));
}

_updateSelection() {
    logEvent('debug', 'FlowPanelMD3', '_updateSelection', 'UI-State', `Updating selection to ID: ${this._currentPatternId}`);
    // Children are in the light DOM now
    this.querySelectorAll('pattern-item-view-md3').forEach(item => {
        if (item.dataset.patternId === this._currentPatternId) {
            if (!item.hasAttribute('selected')) item.setAttribute('selected', '');
        } else {
            if (item.hasAttribute('selected')) item.removeAttribute('selected');
        }
    });
}

// --- Custom Drag and Drop Logic (Restored and Adapted) ---

_handleDragStart(event) {
    const target = event.target.closest('pattern-item-view-md3');
    if (target && event.target.closest('[part="drag-handle"]')) {
        // FIX: This is essential for drag-and-drop to start correctly.
        event.dataTransfer.setData('text/plain', target.dataset.patternId);
        event.dataTransfer.effectAllowed = 'move';

        this.draggedElement = target;
        this.draggedIndex = Number(target.dataset.index);
        
        const rect = target.getBoundingClientRect();
        this.dragStartOffset = event.clientY - rect.top;
        this.draggedItemHeight = rect.height;
        this.lastMouseY = event.clientY;
        
        this.lastAfterElement = target.nextElementSibling;
        
        setTimeout(() => {
            target.setAttribute('is-dragging', '');
        }, 0);
         logEvent('info', 'FlowPanelMD3', '_handleDragStart', 'DragDrop', `Drag started for index ${this.draggedIndex} (${target.dataset.patternId})`);
    } else {
        event.preventDefault();
    }
}

_handleDragOver(event) {
    event.preventDefault();
    const flowList = this.shadowRoot.getElementById('flow-list');
    if (!flowList || !this.draggedElement) return;

    const listRect = flowList.getBoundingClientRect();
    if (event.clientY < listRect.top + this.scrollZoneSize) flowList.scrollTop -= this.scrollSpeed;
    else if (event.clientY > listRect.bottom - this.scrollZoneSize) flowList.scrollTop += this.scrollSpeed;

    let direction = event.clientY < this.lastMouseY ? 'up' : (event.clientY > this.lastMouseY ? 'down' : this.lastDirection);
    if (direction !== this.lastDirection) this.lastLoggedCollision = null;
    
    const overlapThreshold = this.draggedItemHeight * this.overlapThresholdPercent;
    const draggedTop = event.clientY - this.dragStartOffset;
    const draggedBottom = draggedTop + this.draggedItemHeight;

    const restingElements = [...this.querySelectorAll('pattern-item-view-md3:not([is-dragging])')];
    let collision = null;
    let afterElement = this.lastAfterElement;

    if (direction === 'up') {
        for (const child of restingElements) {
            const childBox = child.getBoundingClientRect();
            if (draggedTop <= (childBox.bottom - overlapThreshold)) {
                collision = { element: child };
                afterElement = child;
                break;
            }
        }
    } else if (direction === 'down') {
        for (const child of [...restingElements].reverse()) {
            const childBox = child.getBoundingClientRect();
            if (draggedBottom >= (childBox.top + overlapThreshold)) {
                collision = { element: child };
                afterElement = child.nextElementSibling;
                break; 
            }
        }
    }

    if (collision && collision.element !== this.lastLoggedCollision) {
        logEvent('info', 'FlowPanelMD3', 'handleDragOver', 'Overlap-Touch', `Overlap detected with ${collision.element.dataset.patternId}.`);
        this.lastLoggedCollision = collision.element;
    }
    
    if (afterElement !== this.lastAfterElement) {
        this.lastAfterElement = afterElement;
        // The dragged element *is* the placeholder, so we move it.
        if (afterElement === null) this.appendChild(this.draggedElement);
        else this.insertBefore(this.draggedElement, afterElement);
    }

    this.lastMouseY = event.clientY;
    this.lastDirection = direction;
}

_handleDrop(event) {
    event.preventDefault();
    if (this.draggedIndex === null || !this.draggedElement) return;
    
    const children = [...this.querySelectorAll('pattern-item-view-md3')];
    const newIndex = children.indexOf(this.draggedElement);

    if (newIndex !== -1 && this.draggedIndex !== newIndex) {
        logEvent('info', 'FlowPanelMD3', '_handleDrop', 'Events', `Reorder dispatched from ${this.draggedIndex} to ${newIndex}`);
        this.dispatchEvent(new CustomEvent('reorder-flow', {
            detail: { fromIndex: this.draggedIndex, toIndex: newIndex }
        }));
    }
}

_handleDragEnd() {
    if (this.draggedElement) {
        this.draggedElement.removeAttribute('is-dragging');
    }
    
    this.draggedElement = null;
    this.draggedIndex = null;
    this.dragStartOffset = 0;
    this.draggedItemHeight = 0;
    this.lastMouseY = 0;
    this.lastDirection = null;
    this.lastAfterElement = null;
    this.lastLoggedCollision = null;
    logEvent('debug', 'FlowPanelMD3', '_handleDragEnd', 'DragDrop', 'Drag ended and state cleaned up.');
}
}
customElements.define('flow-panel-md3', FlowPanelMD3);