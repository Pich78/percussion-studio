// file: src/components/RhythmEditorView/FlowPanel/PatternItemView/PatternItemView.js

import { logEvent } from '/percussion-studio/lib/Logger.js';

export class PatternItemView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        this.container.addEventListener('click', this.handleClick.bind(this));
        // --- FIX: Rely on 'blur' for final value changes, which is more reliable ---
        this.container.addEventListener('blur', this.handleInputBlur.bind(this), true);
    }

    render(state) {
        const { item, index, globalBPM, isSelected } = state;
        logEvent('debug', 'PatternItemView', 'render', 'State', `Rendering item at index ${index}`, state);
        
        const selectedClass = isSelected ? 'bg-washed-blue b--blue' : 'bg-white';
        const bpmValue = item.bpm ?? globalBPM;
        const bpmClass = item.bpm ? 'dark-gray' : 'moon-gray';

        this.container.innerHTML = `
            <div 
                class="flow-item flex items-center pa2 br1 ba b--black-10 ${selectedClass}" 
                data-index="${index}" 
                data-pattern-id="${item.pattern}"
                draggable="true"
            >
                <div class="w-100">
                    <div class="flex items-center justify-between mb2">
                        <select data-property="pattern" class="w-60 bn bg-transparent f6 pointer">
                            <option selected>${item.pattern}</option>
                        </select>
                        <button data-action="delete" class="delete-btn pa1 bn bg-transparent f5 red pointer" title="Remove Item">×</button>
                    </div>
                    <div class="flex items-center justify-between gap2 f7">
                        <div class="flex items-center">
                            <label class="mr1 b">Reps:</label>
                            <input data-property="repetitions" type="number" class="w3 tc bn pa1" value="${item.repetitions || 1}">
                        </div>
                        <div class="flex items-center">
                            <label class="mr1 b">BPM:</label>
                            <input data-property="bpm" type="number" class="w4 tc bn pa1 ${bpmClass}" value="${bpmValue}" placeholder="${globalBPM}">
                        </div>
                        <div class="flex items-center">
                            <label class="mr1 b">Accel:</label>
                            <input data-property="bpm_accel_cents" type="number" class="w4 tc bn pa1" value="${item.bpm_accel_cents || 0}">
                        </div>
                    </div>
                </div>
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
        const input = event.target.closest('input[type="number"], select');
        if (input) {
            const property = input.dataset.property;
            const value = property === 'pattern' ? input.value : Number(input.value);
            logEvent('debug', 'PatternItemView', 'handleInputBlur', 'Events', `Input blur for ${property}: ${value}`);
            this.callbacks.onPropertyChange?.(property, value);
        }
    }
}