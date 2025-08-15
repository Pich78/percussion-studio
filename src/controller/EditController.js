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
  
  addTrack(rhythm, { patternId, instrumentSymbol, soundPackName }) {
    const newRhythm = structuredClone(rhythm);
    const patternToUpdate = newRhythm.patterns[patternId];
    const resolution = patternToUpdate.metadata.resolution || 16;
    const emptyTrack = '||' + '-'.repeat(resolution) + '||';

    // Add the track to every measure in the pattern
    patternToUpdate.pattern_data.forEach(measure => {
        if (!measure[instrumentSymbol]) {
            measure[instrumentSymbol] = emptyTrack;
        }
    });

    // Add the instrument to the sound kit if it's not already there
    if (!newRhythm.sound_kit[instrumentSymbol]) {
        newRhythm.sound_kit[instrumentSymbol] = soundPackName;
    }

    return newRhythm;
  }
  
  removeTrack(rhythm, { patternId, instrumentSymbol }) {
    const newRhythm = structuredClone(rhythm);
    const patternToUpdate = newRhythm.patterns[patternId];

    // Remove the track from every measure in the pattern
    patternToUpdate.pattern_data.forEach(measure => {
        delete measure[instrumentSymbol];
    });
    
    // Note: Does not remove from sound_kit, as it might be used in other patterns.
    // This is a safe default behavior.

    return newRhythm;
  }
  
  addPattern(rhythm, { patternId, metadata }) {
    const newRhythm = structuredClone(rhythm);
    if (newRhythm.patterns[patternId]) {
        console.warn(`Pattern with id ${patternId} already exists. Overwriting.`);
    }
    
    const resolution = metadata.resolution || 16;
    newRhythm.patterns[patternId] = {
        metadata,
        pattern_data: [
            // Start with one empty measure
            {} 
        ]
    };

    return newRhythm;
  }
  
  updatePlaybackFlow(rhythm, newFlow) {
    return {
        ...rhythm,
        playback_flow: newFlow
    };
  }
}
