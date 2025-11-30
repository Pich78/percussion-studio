// file: src/components/InstrumentRow/InstrumentRowModel.js

import { GridModel } from '../GridPanel/GridModel.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class InstrumentRowModel {
    #mode;
    #rowData;
    #onUpdate;
    #gridModel;

    constructor({ initialProps, onUpdate }) {
        if (!initialProps || !onUpdate) {
            logEvent('error', 'InstrumentRowModel', 'constructor', 'Initialization', 'Missing initialProps or onUpdate callback.');
            return;
        }

        this.#mode = initialProps.mode;
        this.#rowData = initialProps.rowData;
        this.#onUpdate = onUpdate;

        this.#gridModel = new GridModel({
            initialProps: {
                notation: this.#rowData.notation,
                metrics: this.#rowData.metrics,
                instrument: this.#rowData.instrument
            },

            onUpdate: () => {
                this.#onUpdate(this);
            }
        });
    }

    // --- GETTERS ---

    get headerTagName() {
        return this.#mode === 'playback' ? 'playback-instrument-header' : 'editor-instrument-header';
    }

    get gridColumnSpan() {
        return this.#rowData.notation.length;
    }

    get instrumentData() {
        return this.#rowData.instrument;
    }

    get gridModel() {
        return this.#gridModel;
    }

    // --- UPDATERS ---

    /**
     * Toggles the mute state of the instrument.
     */
    toggleMute() {
        // A more robust implementation would store the pre-mute volume.
        const currentVolume = this.#rowData.instrument.volume;
        this.#rowData.instrument.volume = currentVolume > 0 ? 0 : 0.8;
        logEvent('info', 'InstrumentRowModel', 'toggleMute', 'State Change', `Volume set to ${this.#rowData.instrument.volume}`);
        
        this.#onUpdate(this);
    }

    /**
     * NEW: Sets the instrument's volume to a specific level.
     * @param {number} newVolume - A value between 0.0 and 1.0.
     */
    setVolume(newVolume) {
        // Clamp the value to be within the valid range.
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        
        if (this.#rowData.instrument.volume !== clampedVolume) {
            this.#rowData.instrument.volume = clampedVolume;
            logEvent('info', 'InstrumentRowModel', 'setVolume', 'State Change', `Volume set to ${clampedVolume}`);
            this.#onUpdate(this);
        }
    }
    
    /**
     * Returns the raw, saveable state of the contained grid.
     */
    getCurrentState() {
        return this.#gridModel.getCurrentState();
    }
}