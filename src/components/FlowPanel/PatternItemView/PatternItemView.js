// file: src/components/RhythmEditorView/FlowPanel/PatternItemView/PatternItemView.js

import { logEvent } from '/percussion-studio/lib/Logger.js';

export class PatternItemView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        this.activeProperty = null;
        this.currentValue = 0;

        this.handleWheel = this.handleWheel.bind(this);
        this.exitActiveMode = this.exitActiveMode.bind(this);

        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('change', this.handleChange.bind(this));
        this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    render(state) {
        const { item, index, globalBPM, isSelected } = state;
        logEvent('debug', 'PatternItemView', 'render', 'State', `Rendering item at index ${index}`, state);
        
        const repsValue = item.repetitions ?? 1;
        const bpmValue = item.bpm ?? globalBPM ?? 80;
        const accelValue = item.bpm_accel_cents ?? 100;
        
        const themeClass = isSelected ? 'selected-state' : 'default-state';

        this.container.innerHTML = `
            <div 
                class="flow-item flex items-center pa2 ${themeClass}" 
                data-index="${index}" 
                data-pattern-id="${item.pattern}"
            >
                <div class="drag-handle flex items-center justify-center self-stretch">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="4" r="1.5"/><circle cx="11" cy="4" r="1.5"/><circle cx="5" cy="8" r="1.5"/><circle cx="11" cy="8" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="11" cy="12" r="1.5"/></svg>
                </div>
                
                <!-- FIX: Removed 'flex-grow-1' to make the content wrapper compact -->
                <div class="item-content-wrapper flex flex-column pl4">
                    <!-- Top Row: Name, Delete Button -->
                    <div class="pattern-item-top-row flex items-center w-100">
                        <div class="flex-grow-1">
                            <select data-property="pattern" class="pattern-name w-100 pa0 pointer">
                                <option selected>${item.pattern}</option>
                            </select>
                        </div>
                        <button data-action="delete" class="delete-btn pa0 bn pointer" title="Remove Item">×</button>
                    </div>

                    <!-- Bottom Row: Modifiers -->
                    <div class="flex items-center modifiers-box mt2 w-100">
                        <div class="modifier-item">
                            <label class="modifier-label">Reps</label>
                            <input data-property="repetitions" type="number" class="modifier-input-number" value="${repsValue}" min="1" max="999">
                        </div>
                        <div class="modifier-item">
                            <label class="modifier-label">BPM</label>
                            <span class="modifier-value" data-property="bpm">${bpmValue}</span>
                        </div>
                        <div class="modifier-item">
                            <label class="modifier-label">Accel</label>
                            <span class="modifier-value" data-property="bpm_accel_cents">${accelValue}</span>
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
            this.callbacks.onDelete?.();
        }
    }

    enterActiveMode(element) {
        this.activeProperty = element.dataset.property;
        this.currentValue = Number(element.textContent);
        element.classList.add('is-active-editing');
        document.body.classList.add('hide-cursor');

        document.addEventListener('wheel', this.handleWheel, { passive: false });
        document.addEventListener('click', this.exitActiveMode, { capture: true, once: true });
    }

    exitActiveMode(event) {
        if (!this.activeProperty) return;

        const activeElement = this.container.querySelector('.is-active-editing');
        if (activeElement) {
            this.callbacks.onPropertyChange?.(this.activeProperty, this.currentValue);
        }

        setTimeout(() => {
            if (event) {
                event.stopPropagation();
            }
            if(activeElement) activeElement.classList.remove('is-active-editing');
            document.body.classList.remove('hide-cursor');
            document.removeEventListener('wheel', this.handleWheel);
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

        if (this.activeProperty === 'bpm') {
            this.currentValue = Math.max(30, Math.min(250, this.currentValue));
        } else if (this.activeProperty === 'bpm_accel_cents') {
            this.currentValue = Math.max(80, Math.min(120, this.currentValue));
        }
        
        const roundedValue = Math.round(this.currentValue);
        const valueDisplay = this.container.querySelector(`.modifier-value[data-property="${this.activeProperty}"]`);
        if (valueDisplay) {
            valueDisplay.textContent = roundedValue;
        }
        this.currentValue = roundedValue; 
    }
    
    handleChange(event) {
        const input = event.target.closest('input[type="number"], select');
        if (input) {
            if (this.activeProperty) this.exitActiveMode();
            const property = input.dataset.property;
            const value = input.type === 'number' ? Number(input.value) : input.value;
            this.callbacks.onPropertyChange?.(property, value);
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
    }
}