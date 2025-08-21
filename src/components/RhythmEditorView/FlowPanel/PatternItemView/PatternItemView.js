// file: src/components/RhythmEditorView/FlowPanel/PatternItemView/PatternItemView.js

import { logEvent } from '/percussion-studio/lib/Logger.js';

export class PatternItemView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        // Listen on the container, which will wrap the component and its delete button
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('blur', this.handleInputBlur.bind(this), true);
        this.container.addEventListener('change', this.handleSelectChange.bind(this));
    }

    render(state) {
        const { item, index, globalBPM, isSelected } = state;
        logEvent('debug', 'PatternItemView', 'render', 'State', `Rendering item at index ${index}`, state);
        
        const repsValue = item.repetitions ?? 1;
        const bpmValue = item.bpm ?? globalBPM ?? 80;
        const accelValue = item.bpm_accel_cents ?? 0;
        
        const themeClass = isSelected ? 'selected-state' : 'default-state';
        const bpmClass = item.bpm ? '' : 'o-60';

        // Helper string for input validation to enforce 3-digit max
        const numberInputValidation = `
            max="999" 
            oninput="if(this.value.length > 3) this.value = this.value.slice(0, 3);"
        `;

        this.container.innerHTML = `
            <div class="pattern-item-wrapper">
                <div 
                    class="flow-item flex items-center pa2 ${themeClass}" 
                    data-index="${index}" 
                    data-pattern-id="${item.pattern}"
                >
                    <!-- Pattern Name (Left Side) -->
                    <div class="flex-grow-1 ph2">
                        <select data-property="pattern" class="pattern-name w-100 pa0 pointer">
                            <option selected>${item.pattern}</option>
                        </select>
                    </div>

                    <!-- Vertical Separator -->
                    <div class="v-separator h2 mh2"></div>

                    <!-- Modifiers (Right Side) -->
                    <div class="flex items-center">
                        <div class="modifier-item flex items-center mr2">
                            <label class="modifier-label mr2">Reps</label>
                            <input data-property="repetitions" type="number" class="modifier-input" value="${repsValue}" ${numberInputValidation}>
                        </div>
                        <div class="modifier-item flex items-center mr2">
                            <label class="modifier-label mr2">BPM</label>
                            <input data-property="bpm" type="number" class="modifier-input ${bpmClass}" value="${bpmValue}" placeholder="${globalBPM}" ${numberInputValidation}>
                        </div>
                        <div class="modifier-item flex items-center">
                            <label class="modifier-label mr2">Accel</label>
                            <input data-property="bpm_accel_cents" type="number" class="modifier-input" value="${accelValue}" ${numberInputValidation}>
                        </div>
                    </div>
                </div>
                
                <!-- Delete Button (Positioned by CSS relative to wrapper) -->
                <button data-action="delete" class="delete-btn pa0 bn pointer" title="Remove Item">×</button>
            </div>
        `;
    }

    handleClick(event) {
        const target = event.target.closest('[data-action]');
        if (target?.dataset.action === 'delete') {
            logEvent('debug', 'PatternItemView', 'handleClick', 'Events', 'Delete button clicked');
            this.callbacks.onDelete?.();
        }
    }
    
    handleInputBlur(event) {
        const input = event.target.closest('input[type="number"]');
        if (input) {
            const property = input.dataset.property;
            const value = Number(input.value);
            logEvent('debug', 'PatternItemView', 'handleInputBlur', 'Events', `Input blur for ${property}: ${value}`);
            this.callbacks.onPropertyChange?.(property, value);
        }
    }
    
    handleSelectChange(event) {
        const select = event.target.closest('select');
        if (select) {
            const property = select.dataset.property;
            const value = select.value;
            logEvent('debug', 'PatternItemView', 'handleSelectChange', 'Events', `Select change for ${property}: ${value}`);
            this.callbacks.onPropertyChange?.(property, value);
        }
    }
}