import { PatternItemViewMD3Z } from '../PatternItemViewMD3Z/PatternItemViewMD3Z.js';

export class FlowPanelMD3Z extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      flow: [],
      currentPatternId: null,
      isPinned: false,
      globalBPM: 120
    };
    this.draggedIndex = null;
    this.patternItemViews = [];
    this.dragStartOffset = 0;
    this.draggedItemHeight = 0;
    this.lastLoggedCollision = null;
    this.lastAfterElement = null;
    this.lastMouseY = 0;
    this.lastDirection = null;
    this.overlapThresholdPercent = 0.25;
    this.scrollZoneSize = 60;
    this.scrollSpeed = 5;
    this.logEnabled = true;
  }

  log(time, className, methodName, feature, message) {
    if (this.logEnabled) {
      console.log(`[${time}][${className}][${methodName}][${feature}] ${message}`);
    }
  }

  connectedCallback() {
    this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'connectedCallback', 'Lifecycle', 'Component connected to DOM');
    this.render();
    this.attachEventListeners();
  }

  disconnectedCallback() {
    this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'disconnectedCallback', 'Lifecycle', 'Component disconnected from DOM');
    this.removeEventListeners();
  }

  static get observedAttributes() {
    return ['is-pinned', 'global-bpm'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'attributeChangedCallback', 'Attributes', `Attribute ${name} changed from ${oldValue} to ${newValue}`);
    
    if (name === 'is-pinned') {
      this.state.isPinned = newValue === 'true';
    } else if (name === 'global-bpm') {
      this.state.globalBPM = parseInt(newValue, 10) || 120;
    }
    this.render();
  }

  attachEventListeners() {
    this.handleGlobalClick = this.handleGlobalClick.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);

    document.addEventListener('click', this.handleGlobalClick);
    this.addEventListener('dragstart', this.handleDragStart);
    this.addEventListener('dragover', this.handleDragOver);
    this.addEventListener('drop', this.handleDrop);
    this.addEventListener('dragend', this.handleDragEnd);
  }

  removeEventListeners() {
    document.removeEventListener('click', this.handleGlobalClick);
    this.removeEventListener('dragstart', this.handleDragStart);
    this.removeEventListener('dragover', this.handleDragOver);
    this.removeEventListener('drop', this.handleDrop);
    this.removeEventListener('dragend', this.handleDragEnd);
  }

  setState(newState) {
    this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'setState', 'State', 'Updating component state');
    this.state = { ...this.state, ...newState };
    this.render();
  }

  getFlow() {
    return this.state.flow;
  }

  setFlow(flow) {
    this.setState({ flow });
  }

  addPattern(pattern) {
    this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'addPattern', 'Data', `Adding pattern: ${pattern}`);
    const newFlow = [...this.state.flow, { pattern, repetitions: 1 }];
    this.setState({ flow: newFlow });
    this.dispatchEvent(new CustomEvent('pattern-added', { 
      detail: { pattern, flow: newFlow },
      bubbles: true,
      composed: true
    }));
  }

  removePattern(index) {
    this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'removePattern', 'Data', `Removing pattern at index: ${index}`);
    const newFlow = this.state.flow.filter((_, i) => i !== index);
    this.setState({ flow: newFlow });
    this.dispatchEvent(new CustomEvent('pattern-removed', { 
      detail: { index, flow: newFlow },
      bubbles: true,
      composed: true
    }));
  }

  reorderFlow(from, to) {
    this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'reorderFlow', 'Data', `Reordering pattern from ${from} to ${to}`);
    const newFlow = [...this.state.flow];
    const [item] = newFlow.splice(from, 1);
    newFlow.splice(to, 0, item);
    this.setState({ flow: newFlow });
    this.dispatchEvent(new CustomEvent('flow-reordered', { 
      detail: { from, to, flow: newFlow },
      bubbles: true,
      composed: true
    }));
  }

  updatePatternProperty(index, property, value) {
    this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'updatePatternProperty', 'Data', `Updating pattern ${index} property ${property} to ${value}`);
    const newFlow = [...this.state.flow];
    if (newFlow[index]) {
      newFlow[index] = { ...newFlow[index], [property]: value };
      this.setState({ flow: newFlow });
      this.dispatchEvent(new CustomEvent('pattern-property-changed', { 
        detail: { index, property, value, item: newFlow[index] },
        bubbles: true,
        composed: true
      }));
    }
  }

  selectPattern(patternId, focusTarget = null) {
    this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'selectPattern', 'Selection', `Selecting pattern: ${patternId}`);
    this.setState({ currentPatternId: patternId });
    this.dispatchEvent(new CustomEvent('pattern-selected', { 
      detail: { patternId, focusTarget },
      bubbles: true,
      composed: true
    }));
  }

  togglePin() {
    this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'togglePin', 'UI', `Toggling pin state: ${!this.state.isPinned}`);
    this.setState({ isPinned: !this.state.isPinned });
    this.dispatchEvent(new CustomEvent('pin-toggled', { 
      detail: { isPinned: !this.state.isPinned },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'render', 'Rendering', 'Rendering component with current state');
    const { flow, currentPatternId, isPinned, globalBPM } = this.state;
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
      </style>
      <link rel="stylesheet" href="./FlowPanelMD3Z.css">
      <div class="editor-panel ${isPinned ? 'is-pinned' : ''}">
        <div class="vertical-text">Rhythm Flow</div>
        <div class="panel-content">
          <div class="flow-list"></div>
          <button class="add-pattern-button" data-action="add-pattern">
            <span>+</span>
            <span>Add Pattern</span>
          </button>
        </div>
      </div>
    `;

    const flowListContainer = this.shadowRoot.querySelector('.flow-list');
    this.patternItemViews = [];

    flow.forEach((item, index) => {
      const isSelected = item.pattern === currentPatternId;
      const itemHost = document.createElement('div');
      itemHost.className = 'flow-item-host';
      itemHost.draggable = true;
      itemHost.dataset.action = 'select-pattern';
      itemHost.dataset.patternId = item.pattern;
      itemHost.dataset.index = index;

      const itemView = new PatternItemViewMD3Z();
      itemView.setAttribute('data-index', index);
      itemView.setAttribute('data-pattern-id', item.pattern);
      itemView.setAttribute('selected', isSelected);
      itemView.setItemData(item);
      itemView.setGlobalBPM(globalBPM);

      itemView.addEventListener('delete', () => {
        if (confirm('Remove this pattern from the flow?')) {
          this.removePattern(index);
        }
      });

      itemView.addEventListener('property-change', (e) => {
        const { property, value } = e.detail;
        this.updatePatternProperty(index, property, value);
      });

      this.patternItemViews.push(itemView);
      itemHost.appendChild(itemView);
      flowListContainer.appendChild(itemHost);
    });
  }

  handleGlobalClick(event) {
    const isClickInside = event.composedPath().includes(this);
    
    if (isClickInside) {
      if (!this.state.isPinned) {
        this.togglePin();
      }
      
      const target = event.composedPath()[0];
      const actionElement = target.closest('[data-action]');
      
      if (actionElement) {
        const action = actionElement.dataset.action;
        this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'handleGlobalClick', 'Events', `Action triggered: ${action}`);
        
        switch (action) {
          case 'select-pattern':
            const patternHost = actionElement.closest('.flow-item-host');
            if (patternHost) {
              const patternId = patternHost.dataset.patternId;
              let focusTarget = null;
              const interactiveElement = target.closest('input, .modifier-value');
              if (interactiveElement) {
                focusTarget = { property: interactiveElement.dataset.property };
              }
              this.selectPattern(patternId, focusTarget);
            }
            break;
            
          case 'add-pattern':
            const newId = `Pattern ${this.state.flow.length + 1}`;
            this.addPattern(newId);
            break;
        }
      }
    } else {
      if (this.state.isPinned) {
        this.togglePin();
      }
    }
  }

  handleDragStart(event) {
    const itemHost = event.target.closest('.flow-item-host');
    if (itemHost) {
      this.draggedIndex = parseInt(itemHost.dataset.index, 10);
      event.dataTransfer.effectAllowed = 'move';
      this.lastMouseY = event.clientY;
      const rect = itemHost.getBoundingClientRect();
      this.dragStartOffset = event.clientY - rect.top;
      this.draggedItemHeight = rect.height;
      this.lastAfterElement = itemHost.nextElementSibling;
      
      setTimeout(() => {
        itemHost.classList.add('drag-placeholder');
      }, 0);
      
      this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'handleDragStart', 'Drag', `Drag started for item at index ${this.draggedIndex}`);
    }
  }

  handleDragOver(event) {
    event.preventDefault();
    const listContainer = this.shadowRoot.querySelector('.flow-list');
    const placeholder = this.shadowRoot.querySelector('.drag-placeholder');
    
    if (!listContainer || !placeholder || this.draggedIndex === null) return;
    
    const listRect = listContainer.getBoundingClientRect();
    
    // Auto-scroll
    if (event.clientY < listRect.top + this.scrollZoneSize) {
      listContainer.scrollTop -= this.scrollSpeed;
    } else if (event.clientY > listRect.bottom - this.scrollZoneSize) {
      listContainer.scrollTop += this.scrollSpeed;
    }
    
    // Determine direction
    let direction = event.clientY < this.lastMouseY ? 'up' : (event.clientY > this.lastMouseY ? 'down' : this.lastDirection);
    if (direction !== this.lastDirection) {
      this.lastLoggedCollision = null;
    }
    
    // Calculate overlap and find drop position
    const overlapThreshold = this.draggedItemHeight * this.overlapThresholdPercent;
    const draggedTop = event.clientY - this.dragStartOffset;
    const draggedBottom = draggedTop + this.draggedItemHeight;
    const restingElements = [...listContainer.querySelectorAll('.flow-item-host:not(.drag-placeholder)')];
    
    let collision = null;
    let afterElement = this.lastAfterElement;
    
    if (direction === 'up') {
      for (const child of restingElements) {
        const childBox = child.getBoundingClientRect();
        if (draggedTop <= (childBox.bottom - overlapThreshold)) {
          collision = { element: child, direction: 'up' };
          afterElement = child;
          break;
        }
      }
    } else if (direction === 'down') {
      for (const child of restingElements.reverse()) {
        const childBox = child.getBoundingClientRect();
        if (draggedBottom >= (childBox.top + overlapThreshold)) {
          collision = { element: child, direction: 'down' };
          let nextSibling = child.nextElementSibling;
          if (nextSibling && nextSibling.classList.contains('drag-placeholder')) {
            nextSibling = nextSibling.nextElementSibling;
          }
          afterElement = nextSibling;
          break;
        }
      }
    }
    
    // Log collision detection
    if (collision && collision.element !== this.lastLoggedCollision) {
      const draggedItemName = this.state.flow[this.draggedIndex].pattern;
      const restingItemName = collision.element.dataset.patternId;
      const logMessage = collision.direction === 'up'
        ? `Dragged Item: ${draggedItemName} - ${this.overlapThresholdPercent * 100}% overlap detected with ${restingItemName} (lower border).`
        : `Dragged Item: ${draggedItemName} - ${this.overlapThresholdPercent * 100}% overlap detected with ${restingItemName} (upper border).`;
      
      this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'handleDragOver', 'Overlap-Touch', `${logMessage} Mouse Y: ${event.clientY}`);
      
      const afterElementName = afterElement ? afterElement.dataset.patternId : 'the end of the list';
      this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'handleDragOver', 'Drop-Area', `Drop area created for '${draggedItemName}' before '${afterElementName}'. Mouse Y: ${event.clientY}`);
      
      this.lastLoggedCollision = collision.element;
    }
    
    // Update drop position
    if (afterElement !== this.lastAfterElement) {
      this.lastAfterElement = afterElement;
      if (afterElement === null) {
        listContainer.appendChild(placeholder);
      } else {
        listContainer.insertBefore(placeholder, afterElement);
      }
    }
    
    this.lastMouseY = event.clientY;
    this.lastDirection = direction;
  }

  handleDrop(event) {
    event.preventDefault();
    const placeholder = this.shadowRoot.querySelector('.drag-placeholder');
    
    if (this.draggedIndex !== null && placeholder) {
      const listContainer = this.shadowRoot.querySelector('.flow-list');
      const newIndex = Array.from(listContainer.children).indexOf(placeholder);
      
      if (this.draggedIndex !== newIndex) {
        this.reorderFlow(this.draggedIndex, newIndex);
      }
      
      this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'handleDrop', 'Drag', `Dropped item from index ${this.draggedIndex} to index ${newIndex}`);
    }
  }

  handleDragEnd() {
    const placeholder = this.shadowRoot.querySelector('.drag-placeholder');
    if (placeholder) {
      placeholder.classList.remove('drag-placeholder');
    }
    
    this.draggedIndex = null;
    this.dragStartOffset = 0;
    this.draggedItemHeight = 0;
    this.lastLoggedCollision = null;
    this.lastAfterElement = null;
    this.lastMouseY = 0;
    this.lastDirection = null;
    
    this.log(new Date().toISOString(), 'FlowPanelMD3Z', 'handleDragEnd', 'Drag', 'Drag operation ended');
  }
}

customElements.define('flow-panel-md3z', FlowPanelMD3Z);