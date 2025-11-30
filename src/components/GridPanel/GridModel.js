// file: src/components/GridPanel/GridModel.js

import { logEvent } from '/percussion-studio/lib/Logger.js';

export class GridModel {
    // Per JavaScript language rules, private fields MUST be declared in the class body.
    #notation;
    #metrics;
    #instrument;
    #onUpdate;
    #cells; // Declaration only, initialization happens in the constructor.

    /**
     * Creates a stateful model for a grid.
     * @param {object} config - The configuration object.
     * @param {object} config.initialProps - The initial data for the grid.
     * @param {string} config.initialProps.notation - The notation string (e.g., 'o-x-').
     * @param {object} config.initialProps.metrics - The metrics object for rhythmic rules.
     * @param {object} config.initialProps.instrument - The instrument with sound definitions.
     * @param {Function} config.onUpdate - A callback function that fires when the model's state changes.
     */
    constructor({ initialProps, onUpdate }) {
        if (!initialProps || !onUpdate) {
            logEvent('error', 'GridModel', 'constructor', 'Initialization', 'Missing initialProps or onUpdate callback.');
            return;
        }

        // All instance properties are initialized here in the constructor.
        this.#notation = initialProps.notation;
        this.#metrics = initialProps.metrics;
        this.#instrument = initialProps.instrument;
        this.#onUpdate = onUpdate;

        // The #cells array property is also initialized here.
        this.#cells = []; 
        
        // The initial generation is called after all properties are set.
        this.#generateCells();
    }

    /**
     * [GETTER] Returns the current array of Cell View Model objects.
     * @returns {Array<Object>}
     */
    get cells() {
        return this.#cells;
    }

    /**
     * [UPDATER] Updates the notation for a single cell and regenerates the view model.
     * @param {number} tickIndex - The index of the cell to update.
     * @param {string} newSoundLetter - The new sound character (e.g., 'x', '-')
     */
    updateCell(tickIndex, newSoundLetter) {
        if (tickIndex < 0 || tickIndex >= this.#notation.length) {
            return; // Out of bounds
        }

        const notationArray = this.#notation.split('');
        notationArray[tickIndex] = newSoundLetter;
        this.#notation = notationArray.join('');

        this.#generateCells();
        this.#onUpdate(this.#cells);
    }

    /**
     * [GETTER] Returns the raw, saveable state of the model.
     * @returns {{notation: string}}
     */
    getCurrentState() {
        return {
            notation: this.#notation
        };
    }

    /**
     * @private
     * The core logic engine. Transforms raw props into the #cells view model array.
     */
    #generateCells() {
        const newCells = [];
        const notationChars = this.#notation.split('');
        for (let i = 0; i < notationChars.length; i++) {
            const soundLetter = notationChars[i];
            const hasNote = soundLetter && soundLetter !== '-';
            const sound = hasNote ? this.#instrument.sounds.find(s => s.letter === soundLetter) : null;

            newCells.push({
                key: `cell-${i}`,
                tickIndex: i,
                shadingClass: this.#getShadingClass(i),
                symbolSVG: sound?.svg || null,
                hasNote: hasNote,
            });
        }
        this.#cells = newCells;
    }

    /**
     * @private
     * Determines the correct rhythmic shading CSS class for a given cell index.
     * @param {number} index - The cell's tickIndex.
     * @returns {string} The CSS class name for shading.
     */
    #getShadingClass(index) {
        const { feel, beatGrouping } = this.#metrics;
        if (feel === 'triplet') {
            if (beatGrouping === 3) {
                return `cell-triplet-${(index % beatGrouping) + 1}`;
            } else {
                const posInner = index % 3;
                if (posInner === 0) {
                    return index % beatGrouping === 0 ? 'cell-triplet-1' : 'cell-triplet-2';
                }
                return 'cell-triplet-3';
            }
        } else { // Duple feel
            const pos = index % beatGrouping;
            if (pos === 0) return 'cell-downbeat';
            if (beatGrouping > 2 && pos === beatGrouping / 2) return 'cell-strong-beat';
            return 'cell-weak-beat';
        }
    }
}