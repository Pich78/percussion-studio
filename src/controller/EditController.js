// file: src/controller/EditController.js (Complete)

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

    removeNote(rhythm, position) {
        const { patternId, measureIndex, instrumentSymbol, tick } = position;
        if (!rhythm.patterns[patternId]?.pattern_data[measureIndex]?.[instrumentSymbol]) {
            return rhythm;
        }

        const newRhythm = structuredClone(rhythm);
        const measureToUpdate = newRhythm.patterns[patternId].pattern_data[measureIndex];
        const originalString = measureToUpdate[instrumentSymbol];
        
        const noteArray = originalString.split('');
        noteArray[tick + 2] = '-';
        measureToUpdate[instrumentSymbol] = noteArray.join('');

        return newRhythm;
    }

    /**
     * Replaces the entire playback_flow with a new one.
     * @param {object} rhythm The current rhythm state.
     * @param {Array<object>} newFlow The new playback flow array.
     * @returns {object} A NEW, updated rhythm object.
     */
    updatePlaybackFlow(rhythm, newFlow) {
        // Create a new object by copying all properties from the original rhythm,
        // but overwrite the playback_flow with the new one.
        return {
            ...rhythm,
            playback_flow: newFlow
        };
    }
}