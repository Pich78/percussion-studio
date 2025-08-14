// file: src/controller/EditController.js

export class EditController {
    /**
     * Adds a note to a specific position within a pattern's grid.
     * @param {object} rhythm The current rhythm state.
     * @param {object} position The position to add the note, e.g.,
     *   { patternId: 'p1', measureIndex: 0, instrumentSymbol: 'KCK', tick: 4, note: 'o' }
     * @returns {object} A NEW, updated rhythm object.
     */
    addNote(rhythm, position) {
        const { patternId, measureIndex, instrumentSymbol, tick, note } = position;

        // 1. Create a deep copy of the rhythm to ensure immutability.
        // A structuredClone is the modern, robust way to do this.
        const newRhythm = structuredClone(rhythm);

        // 2. Get a reference to the specific measure object we need to change.
        const measureToUpdate = newRhythm.patterns[patternId].pattern_data[measureIndex];

        // 3. Get the current note string for the instrument.
        // If the instrument doesn't have a track yet, create a default empty one.
        const resolution = newRhythm.patterns[patternId].metadata.resolution || 16;
        const emptyTrack = '||' + '-'.repeat(resolution) + '||';
        const originalString = measureToUpdate[instrumentSymbol] || emptyTrack;

        // 4. Modify the string. The note string includes '||' at the start and end,
        // so we must offset the tick index by 2 to modify the correct character.
        const noteArray = originalString.split('');
        noteArray[tick + 2] = note; // +2 to account for the leading '||'
        const newString = noteArray.join('');

        // 5. Update the measure object with the new string.
        measureToUpdate[instrumentSymbol] = newString;

        // 6. Return the new, modified rhythm object.
        return newRhythm;
    }

    /**
     * Removes a note from a specific position within a pattern's grid.
     * @param {object} rhythm The current rhythm state.
     * @param {object} position The position of the note to remove, e.g.,
     *   { patternId: 'p1', measureIndex: 0, instrumentSymbol: 'KCK', tick: 4 }
     * @returns {object} A NEW, updated rhythm object.
     */
    removeNote(rhythm, position) {
        // Implementation to come...
        return rhythm;
    }

    /**
     * Modifies the sequence of patterns in the playback_flow.
     * @param {object} rhythm The current rhythm state.
     * @param {Array<object>} newFlow The new playback flow array.
     * @returns {object} A NEW, updated rhythm object.
     */
    updatePlaybackFlow(rhythm, newFlow) {
        // Implementation to come...
        return rhythm;
    }
}