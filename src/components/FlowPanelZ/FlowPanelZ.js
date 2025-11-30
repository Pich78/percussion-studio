// file: src/components/FlowPanel/FlowPanel.js
class FlowPanel extends HTMLElement {
  constructor() {
    super();
    
    // State variables for drag and drop
    this.draggedIndex = null;
    this.draggedElement = null;
    this.dragStartOffset = 0;
    this.draggedItemHeight = 0;
    this.lastMouseY = 0;
    this.lastDirection = null;
    this.lastAfterElement = null;
    this.lastLoggedCollision = null;
    
    // Configuration parameters
    this.overlapThresholdPercent = 0.25;
    this.scrollZoneSize = 60;
    this.scrollSpeed = 5;
    
    // Create shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Load CSS
    this.loadStyles();
    
    // Create template
    this.template = document.createElement('template');
    this.template.innerHTML = `
      <div class="flow-panel">
        <div class="flow-panel-header">
          <h3 class="flow-panel-title">Rhythm Flow</h3>
        </div>
        <div class="flow-list-container">
          <div class="flow-list">
            <slot id="flow-items-slot"></slot>
          </div>
          <div class="drop-placeholder"></div>
        </div>
        <div class="flow-panel-footer">
          <slot name="add-button"></slot>
        </div>
      </div>
    `;
    
    // Clone template and attach to shadow DOM
    this.shadowRoot.appendChild(this.template.content.cloneNode(true));
    
    // Get references to important elements
    this.flowListContainer = this.shadowRoot.querySelector('.flow-list-container');
    this.flowList = this.shadowRoot.querySelector('.flow-list');
    this.placeholder = this.shadowRoot.querySelector('.drop-placeholder');
    this.slot = this.shadowRoot.querySelector('#flow-items-slot');
    
    // Bind event handlers
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleSlotChange = this.handleSlotChange.bind(this);
    
    // Add event listeners
    this.flowListContainer.addEventListener('dragstart', this.handleDragStart);
    this.flowListContainer.addEventListener('dragover', this.handleDragOver);
    this.flowListContainer.addEventListener('drop', this.handleDrop);
    this.flowListContainer.addEventListener('dragend', this.handleDragEnd);
    this.slot.addEventListener('slotchange', this.handleSlotChange);
  }
  
  connectedCallback() {
    // Initialize draggable items when component is connected
    this.updateDraggableItems();
  }
  
  loadStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Material Expressive 3 Variables */
      :host {
        --md-sys-color-primary: #6750A4;
        --md-sys-color-surface: #FEF7FF;
        --md-sys-color-surface-variant: #E7E0EC;
        --md-sys-color-on-surface: #1C1B1F;
        --md-sys-color-on-surface-variant: #49454F;
        --md-sys-color-outline: #79747E;
        --md-sys-color-shadow: #000000;
        --md-sys-elevation-level1: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
        --md-sys-elevation-level2: 0px 1px 5px 1px rgba(0, 0, 0, 0.15), 0px 2px 4px 0px rgba(0, 0, 0, 0.3);
        --md-sys-shape-corner-extra-small: 4px;
        --md-sys-shape-corner-small: 8px;
        --md-sys-shape-corner-medium: 12px;
        --md-sys-typescale-body-medium-font: 'Roboto';
        --md-sys-typescale-body-medium-size: 14px;
        --md-sys-typescale-body-medium-weight: 400;
        --md-sys-typescale-title-medium-font: 'Roboto';
        --md-sys-typescale-title-medium-size: 16px;
        --md-sys-typescale-title-medium-weight: 500;
        
        display: block;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }
      
      /* Flow Panel Styles */
      .flow-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background-color: var(--md-sys-color-surface);
        border-radius: var(--md-sys-shape-corner-medium);
        box-shadow: var(--md-sys-elevation-level1);
        overflow: hidden;
        font-family: var(--md-sys-typescale-body-medium-font);
        color: var(--md-sys-color-on-surface);
      }
      
      .flow-panel-header {
        padding: 16px;
        border-bottom: 1px solid var(--md-sys-color-outline);
      }
      
      .flow-panel-title {
        margin: 0;
        font-family: var(--md-sys-typescale-title-medium-font);
        font-size: var(--md-sys-typescale-title-medium-size);
        font-weight: var(--md-sys-typescale-title-medium-weight);
        color: var(--md-sys-color-on-surface);
      }
      
      .flow-list-container {
        flex: 1;
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
      }
      
      .flow-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .flow-list::-webkit-scrollbar {
        width: 6px;
      }
      
      .flow-list::-webkit-scrollbar-track {
        background: var(--md-sys-color-surface-variant);
        border-radius: 3px;
      }
      
      .flow-list::-webkit-scrollbar-thumb {
        background-color: var(--md-sys-color-outline);
        border-radius: 3px;
      }
      
      .flow-panel-footer {
        padding: 16px;
        border-top: 1px solid var(--md-sys-color-outline);
      }
      
      /* Drop Placeholder Styles */
      .drop-placeholder {
        display: none;
        height: 60px;
        background-color: var(--md-sys-color-surface-variant);
        border: 2px dashed var(--md-sys-color-outline);
        border-radius: var(--md-sys-shape-corner-small);
        margin: 4px 0;
      }
      
      /* Dragging Styles */
      .dragging {
        opacity: 0.4;
      }
      
      /* Default styles for slotted items */
      ::slotted(*) {
        background-color: var(--md-sys-color-surface);
        border-radius: var(--md-sys-shape-corner-small);
        box-shadow: var(--md-sys-elevation-level1);
        padding: 12px;
        margin-bottom: 8px;
        cursor: move;
        transition: box-shadow 0.2s ease;
      }
      
      ::slotted(:hover) {
        box-shadow: var(--md-sys-elevation-level2);
      }
      
      /* Add Button Slot */
      ::slotted([slot="add-button"]) {
        width: 100%;
        padding: 12px;
        background-color: var(--md-sys-color-primary);
        color: white;
        border: none;
        border-radius: var(--md-sys-shape-corner-small);
        font-family: var(--md-sys-typescale-body-medium-font);
        font-size: var(--md-sys-typescale-body-medium-size);
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      ::slotted([slot="add-button"]:hover) {
        background-color: #5140A0;
      }
    `;
    
    this.shadowRoot.appendChild(style);
  }
  
  handleSlotChange() {
    // Update draggable items when slot content changes
    this.updateDraggableItems();
  }
  
  updateDraggableItems() {
    const items = this.slot.assignedElements();
    items.forEach(item => {
      item.draggable = true;
    });
  }
  
  handleDragStart(event) {
    const item = event.target;
    if (!item || !item.draggable) return;
    
    // Store the dragged element and its index
    this.draggedElement = item;
    const items = this.slot.assignedElements();
    this.draggedIndex = items.indexOf(item);
    
    // Set up drag data
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', item.outerHTML);
    
    // Store initial position data
    this.lastMouseY = event.clientY;
    const rect = item.getBoundingClientRect();
    this.dragStartOffset = event.clientY - rect.top;
    this.draggedItemHeight = rect.height;
    this.lastAfterElement = item.nextElementSibling;
    
    // Add visual feedback
    item.classList.add('dragging');
    this.placeholder.style.display = 'block';
    this.placeholder.style.height = `${this.draggedItemHeight}px`;
    
    // Insert placeholder after the dragged item
    this.flowList.insertBefore(this.placeholder, item.nextElementSibling);
  }
  
  handleDragOver(event) {
    event.preventDefault();
    if (!this.draggedElement) return;
    
    // Auto-scrolling when near edges
    const listRect = this.flowListContainer.getBoundingClientRect();
    if (event.clientY < listRect.top + this.scrollZoneSize) {
      this.flowListContainer.scrollTop -= this.scrollSpeed;
    } else if (event.clientY > listRect.bottom - this.scrollZoneSize) {
      this.flowListContainer.scrollTop += this.scrollSpeed;
    }
    
    // Determine drag direction
    let direction = event.clientY < this.lastMouseY ? 'up' : 
                   (event.clientY > this.lastMouseY ? 'down' : this.lastDirection);
    
    // Reset collision tracking when direction changes
    if (direction !== this.lastDirection) {
      this.lastLoggedCollision = null;
    }
    
    // Calculate dragged item position
    const draggedTop = event.clientY - this.dragStartOffset;
    const draggedBottom = draggedTop + this.draggedItemHeight;
    
    // Get all items except the dragged one
    const items = this.slot.assignedElements().filter(item => item !== this.draggedElement);
    let collision = null;
    let afterElement = this.lastAfterElement;
    
    // Overlap threshold
    const overlapThreshold = this.draggedItemHeight * this.overlapThresholdPercent;
    
    // Collision detection based on direction
    if (direction === 'up') {
      for (const child of items) {
        const childBox = child.getBoundingClientRect();
        if (draggedTop <= (childBox.bottom - overlapThreshold)) {
          collision = { element: child, direction: 'up' };
          afterElement = child;
          break;
        }
      }
    } else if (direction === 'down') {
      for (const child of items.reverse()) {
        const childBox = child.getBoundingClientRect();
        if (draggedBottom >= (childBox.top + overlapThreshold)) {
          collision = { element: child, direction: 'down' };
          let nextSibling = child.nextElementSibling;
          if (nextSibling === this.placeholder) {
            nextSibling = nextSibling.nextElementSibling;
          }
          afterElement = nextSibling;
          break;
        }
      }
    }
    
    // Log collision for debugging
    if (collision && collision.element !== this.lastLoggedCollision) {
      console.log('Collision detected:', collision);
      this.lastLoggedCollision = collision.element;
    }
    
    // Update placeholder position if needed
    if (afterElement !== this.lastAfterElement) {
      this.lastAfterElement = afterElement;
      if (afterElement === null) {
        this.flowList.appendChild(this.placeholder);
      } else {
        this.flowList.insertBefore(this.placeholder, afterElement);
      }
    }
    
    // Update last mouse position and direction
    this.lastMouseY = event.clientY;
    this.lastDirection = direction;
  }
  
  handleDrop(event) {
    event.preventDefault();
    if (!this.draggedElement) return;
    
    // Calculate new index
    const items = this.slot.assignedElements();
    const placeholderIndex = Array.from(this.flowList.children).indexOf(this.placeholder);
    
    // Find the new index in the original items array
    let newIndex = 0;
    for (let i = 0; i < placeholderIndex; i++) {
      const child = this.flowList.children[i];
      if (child !== this.placeholder && items.includes(child)) {
        newIndex++;
      }
    }
    
    // Only reorder if the position actually changed
    if (this.draggedIndex !== newIndex) {
      // Dispatch reorder event
      this.dispatchEvent(new CustomEvent('reorder', {
        detail: {
          oldIndex: this.draggedIndex,
          newIndex: newIndex
        },
        bubbles: true,
        composed: true
      }));
    }
  }
  
  handleDragEnd() {
    // Clean up visual feedback
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
    }
    
    // Hide placeholder
    this.placeholder.style.display = 'none';
    
    // Reset state variables
    this.draggedIndex = null;
    this.draggedElement = null;
    this.dragStartOffset = 0;
    this.draggedItemHeight = 0;
    this.lastLoggedCollision = null;
    this.lastAfterElement = null;
    this.lastMouseY = 0;
    this.lastDirection = null;
  }
}

// Define the custom element
customElements.define('flow-panel', FlowPanel);