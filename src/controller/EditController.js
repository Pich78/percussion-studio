// file: src/controller/EditController.js

export class EditController {
    addNote(rhythm, position) {
        const { patternId, measureIndex, instrumentSymbol, tick, note } = position;
        const newRhythm = structuredClone(rhythm);
        const measureToUpdate = newRhythm.patterns[patternId].pattern_data[measureIndex];
        const resolution = newRhythm.patterns[patternId].metadata.resolution || 16;
        const emptyTrack = '||' + '-'.repeat(resolution) + '||';
        const originalString = measureToUpdate[instrumentSymbol] || emptyTrack;

        const noteArray = originalString.split('');
        noteArray[tick + 2] = note;
        measureToUpdate[instrumentSymbol] = noteArray.join('');

        return newRhythm;
    }

    /**
     * Removes a note from a specific position within a pattern's grid by replacing it with '-'.
     * @param {object} rhythm The current rhythm state.
     * @param {object} position The position of the note to remove, e.g.,
     *   { patternId: 'p1', measureIndex: 0, instrumentSymbol: 'KCK', tick: 4 }
     * @returns {object} A NEW, updated rhythm object.
     */
    removeNote(rhythm, position) {
        const { patternId, measureIndex, instrumentSymbol, tick } = position;

        // Ensure the track exists to prevent errors. If not, there's nothing to remove.
        if (!rhythm.patterns[patternId]?.pattern_data[measureIndex]?.[instrumentSymbol]) {
            return rhythm;
        }

        const newRhythm = structuredClone(rhythm);
        const measureToUpdate = newRhythm.patterns[patternId].pattern_data[measureIndex];
        const originalString = measureToUpdate[instrumentSymbol];

        // Create a new note string by replacing the character at the given tick with a hyphen.
        const noteArray = originalString.split('');
        noteArray[tick + 2] = '-'; // +2 to account for the leading '||'
        measureToUpdate[instrumentSymbol] = noteArray.join('');

        return newRhythm;
    }

    updatePlaybackFlow(rhythm, newFlow) {
        // Implementation to come...
        return rhythm;
    }
}