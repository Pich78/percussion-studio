export class PatternItemViewMD3Z extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.itemData = {
      pattern: '',
      repetitions: 1,
      bpm: null,
      bpm_accel_cents: 100
    };
    this.globalBPM = 120;
    this.isSelected = false;
    this.index = 0;
    this.activeProperty = null;
    this.currentValue = 0;
    this.logEnabled = true;
  }

  log(time, className, methodName, feature, message) {
    if (this.logEnabled) {
      console.log(`[${time}][${className}][${methodName}][${feature}] ${message}`);
    }
  }

  connectedCallback() {
    this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'connectedCallback', 'Lifecycle', 'Component connected to DOM');
    this.render();
    this.attachEventListeners();
  }

  disconnectedCallback() {
    this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'disconnectedCallback', 'Lifecycle', 'Component disconnected from DOM');
    this.removeEventListeners();
  }

  static get observedAttributes() {
    return ['selected', 'data-index', 'data-pattern-id', 'global-bpm'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'attributeChangedCallback', 'Attributes', `Attribute ${name} changed from ${oldValue} to ${newValue}`);
    
    switch (name) {
      case 'selected':
        this.isSelected = newValue === 'true';
        break;
      case 'data-index':
        this.index = parseInt(newValue, 10) || 0;
        break;
      case 'data-pattern-id':
        if (this.itemData.pattern !== newValue) {
          this.itemData.pattern = newValue;
        }
        break;
      case 'global-bpm':
        this.globalBPM = parseInt(newValue, 10) || 120;
        break;
    }
    this.render();
  }

  attachEventListeners() {
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.exitActiveMode = this.exitActiveMode.bind(this);

    this.shadowRoot.addEventListener('click', this.handleClick);
    this.shadowRoot.addEventListener('change', this.handleChange);
    this.shadowRoot.addEventListener('keydown', this.handleKeyDown);
  }

  removeEventListeners() {
    this.shadowRoot.removeEventListener('click', this.handleClick);
    this.shadowRoot.removeEventListener('change', this.handleChange);
    this.shadowRoot.removeEventListener('keydown', this.handleKeyDown);
    this.removeGlobalWheelListener();
  }

  addGlobalWheelListener() {
    document.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  removeGlobalWheelListener() {
    document.removeEventListener('wheel', this.handleWheel);
  }

  setItemData(itemData) {
    this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'setItemData', 'Data', 'Setting item data');
    this.itemData = { ...this.itemData, ...itemData };
    this.render();
  }

  setGlobalBPM(bpm) {
    this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'setGlobalBPM', 'Data', `Setting global BPM to ${bpm}`);
    this.globalBPM = bpm;
    this.render();
  }

  setSelected(selected) {
    this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'setSelected', 'UI', `Setting selected state to ${selected}`);
    this.isSelected = selected;
    this.render();
  }

  render() {
    this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'render', 'Rendering', 'Rendering component with current state');
    
    const repsValue = this.itemData.repetitions ?? 1;
    const bpmValue = this.itemData.bpm ?? this.globalBPM ?? 80;
    const accelValue = this.itemData.bpm_accel_cents ?? 100;
    
    const themeClass = this.isSelected ? 'selected-state' : 'default-state';
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@400;500&display=swap');
      </style>
      <link rel="stylesheet" href="./PatternItemViewMD3Z.css">
      <div class="flow-item ${themeClass}" data-index="${this.index}" data-pattern-id="${this.itemData.pattern}">
        <div class="drag-handle">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6" cy="5" r="1.5" fill="currentColor"/>
            <circle cx="14" cy="5" r="1.5" fill="currentColor"/>
            <circle cx="6" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="14" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="6" cy="15" r="1.5" fill="currentColor"/>
            <circle cx="14" cy="15" r="1.5" fill="currentColor"/>
          </svg>
        </div>
        
        <div class="item-content-wrapper">
          <div class="pattern-item-top-row">
            <div class="pattern-name-container" style="flex: 1;">
              <select data-property="pattern" class="pattern-name">
                <option value="${this.itemData.pattern}" selected>${this.itemData.pattern}</option>
              </select>
            </div>
            <button data-action="delete" class="delete-btn" title="Remove Item" aria-label="Remove pattern">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div class="modifiers-box">
            <div class="modifier-item">
              <label class="modifier-label" for="reps-${this.index}">Reps</label>
              <input 
                data-property="repetitions" 
                type="number" 
                class="modifier-input-number" 
                value="${repsValue}" 
                min="1" 
                max="999"
                id="reps-${this.index}"
                aria-label="Repetitions"
              >
            </div>
            
            <div class="modifier-item">
              <label class="modifier-label" for="bpm-${this.index}">BPM</label>
              <span 
                class="modifier-value" 
                data-property="bpm"
                id="bpm-${this.index}"
                tabindex="0"
                role="spinbutton"
                aria-label="Beats per minute"
                aria-valuemin="30"
                aria-valuemax="250"
                aria-valuenow="${bpmValue}"
              >${bpmValue}</span>
            </div>
            
            <div class="modifier-item">
              <label class="modifier-label" for="accel-${this.index}">Accel</label>
              <span 
                class="modifier-value" 
                data-property="bpm_accel_cents"
                id="accel-${this.index}"
                tabindex="0"
                role="spinbutton"
                aria-label="Acceleration in cents"
                aria-valuemin="80"
                aria-valuemax="120"
                aria-valuenow="${accelValue}"
              >${accelValue}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  handleClick(event) {
    const valueTarget = event.target.closest('.modifier-value');
    
    if (valueTarget) {
      if (this.activeProperty && this.activeProperty !== valueTarget.dataset.property) {
        this.exitActiveMode();
      }
      
      if (!this.activeProperty) {
        event.stopPropagation();
        this.enterActiveMode(valueTarget);
      }
      return;
    }
    
    const deleteTarget = event.target.closest('[data-action="delete"]');
    if (deleteTarget) {
      if (this.activeProperty) this.exitActiveMode();
      this.handleDelete();
    }
  }

  enterActiveMode(element) {
    this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'enterActiveMode', 'Interaction', `Entering active mode for property: ${element.dataset.property}`);
    
    this.activeProperty = element.dataset.property;
    this.currentValue = Number(element.textContent);
    element.classList.add('is-active-editing');
    
    // Update ARIA attributes
    element.setAttribute('aria-valuenow', this.currentValue);
    
    document.body.classList.add('hide-cursor');
    this.addGlobalWheelListener();
    
    // Add click listener to exit mode
    document.addEventListener('click', this.exitActiveMode, { capture: true, once: true });
  }

  exitActiveMode(event) {
    if (!this.activeProperty) return;
    
    this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'exitActiveMode', 'Interaction', `Exiting active mode for property: ${this.activeProperty}`);
    
    const activeElement = this.shadowRoot.querySelector('.is-active-editing');
    if (activeElement) {
      // Update ARIA attributes
      activeElement.setAttribute('aria-valuenow', this.currentValue);
      
      // Dispatch property change event
      this.dispatchPropertyChange(this.activeProperty, this.currentValue);
    }
    
    setTimeout(() => {
      if (event) {
        event.stopPropagation();
      }
      
      if (activeElement) {
        activeElement.classList.remove('is-active-editing');
      }
      
      document.body.classList.remove('hide-cursor');
      this.removeGlobalWheelListener();
      this.activeProperty = null;
    }, 0);
  }

  handleWheel(event) {
    if (!this.activeProperty) return;
    
    event.preventDefault();
    const scrollDirection = -Math.sign(event.deltaY);
    
    let step = this.activeProperty === 'bpm' ? 5 : 1;
    if (event.shiftKey) {
      step *= 5;
    }
    
    this.currentValue += (scrollDirection * step);
    
    // Apply bounds
    if (this.activeProperty === 'bpm') {
      this.currentValue = Math.max(30, Math.min(250, this.currentValue));
    } else if (this.activeProperty === 'bpm_accel_cents') {
      this.currentValue = Math.max(80, Math.min(120, this.currentValue));
    }
    
    const roundedValue = Math.round(this.currentValue);
    const valueDisplay = this.shadowRoot.querySelector(`.modifier-value[data-property="${this.activeProperty}"]`);
    
    if (valueDisplay) {
      valueDisplay.textContent = roundedValue;
      valueDisplay.setAttribute('aria-valuenow', roundedValue);
    }
    
    this.currentValue = roundedValue;
    
    this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'handleWheel', 'Interaction', `Wheel scroll changed ${this.activeProperty} to ${roundedValue}`);
  }

  handleChange(event) {
    const input = event.target.closest('input[type="number"], select');
    if (input) {
      if (this.activeProperty) this.exitActiveMode();
      
      const property = input.dataset.property;
      const value = input.type === 'number' ? Number(input.value) : input.value;
      
      this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'handleChange', 'Interaction', `Input changed ${property} to ${value}`);
      
      this.dispatchPropertyChange(property, value);
    }
  }

  handleKeyDown(event) {
    if (event.key === 'Enter') {
      const input = event.target.closest('input[type="number"]');
      if (input) {
        event.preventDefault();
        this.handleChange({ target: input });
        input.blur();
      }
    }
    
    if (event.key === 'Enter' || event.key === 'Escape') {
      if (this.activeProperty) {
        this.exitActiveMode();
      }
    }
    
    // Handle arrow keys for active modifier values
    if (this.activeProperty && event.target.classList.contains('modifier-value')) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        const direction = event.key === 'ArrowUp' ? 1 : -1;
        let step = this.activeProperty === 'bpm' ? 5 : 1;
        
        if (event.shiftKey) {
          step *= 5;
        }
        
        this.currentValue += (direction * step);
        
        // Apply bounds
        if (this.activeProperty === 'bpm') {
          this.currentValue = Math.max(30, Math.min(250, this.currentValue));
        } else if (this.activeProperty === 'bpm_accel_cents') {
          this.currentValue = Math.max(80, Math.min(120, this.currentValue));
        }
        
        const roundedValue = Math.round(this.currentValue);
        const valueDisplay = this.shadowRoot.querySelector(`.modifier-value[data-property="${this.activeProperty}"]`);
        
        if (valueDisplay) {
          valueDisplay.textContent = roundedValue;
          valueDisplay.setAttribute('aria-valuenow', roundedValue);
        }
        
        this.currentValue = roundedValue;
        
        this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'handleKeyDown', 'Interaction', `Arrow key changed ${this.activeProperty} to ${roundedValue}`);
      }
    }
  }

  handleDelete() {
    this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'handleDelete', 'Interaction', 'Delete action triggered');
    
    this.dispatchEvent(new CustomEvent('delete', {
      detail: { 
        index: this.index,
        patternId: this.itemData.pattern
      },
      bubbles: true,
      composed: true
    }));
  }

  dispatchPropertyChange(property, value) {
    this.log(new Date().toISOString(), 'PatternItemViewMD3Z', 'dispatchPropertyChange', 'Events', `Dispatching property change: ${property} = ${value}`);
    
    // Update internal state
    this.itemData[property] = value;
    
    this.dispatchEvent(new CustomEvent('property-change', {
      detail: { 
        property, 
        value,
        index: this.index,
        patternId: this.itemData.pattern
      },
      bubbles: true,
      composed: true
    }));
  }

  // Public methods for external control
  getProperty(property) {
    return this.itemData[property];
  }

  setProperty(property, value) {
    this.itemData[property] = value;
    this.render();
  }

  focus() {
    const flowItem = this.shadowRoot.querySelector('.flow-item');
    if (flowItem) {
      flowItem.focus();
    }
  }

  blur() {
    if (this.activeProperty) {
      this.exitActiveMode();
    }
    const flowItem = this.shadowRoot.querySelector('.flow-item');
    if (flowItem) {
      flowItem.blur();
    }
  }
}

customElements.define('pattern-item-view-md3z', PatternItemViewMD3Z);