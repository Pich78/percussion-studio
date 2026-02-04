/*
  js/services/bataEmulation.js
  Batá drum sound emulation utilities.
  
  This module provides functions to emulate missing Batá drum sounds
  by combining and manipulating available samples. Used when a sound
  pack doesn't include all stroke types (like Mordito or Half Mordito).
  
  Batá drums: IYA (mother), ITO (child), OKO (middle)
*/

/**
 * Batá drum symbols
 * @type {string[]}
 */
const BATA_DRUMS = ['IYA', 'ITO', 'OKO'];

/**
 * Check if an instrument is a Batá drum
 * @param {string} instrumentSymbol - Instrument symbol (e.g., 'ITO')
 * @returns {boolean} True if it's a Batá drum
 */
export const isBataDrum = (instrumentSymbol) => {
    return BATA_DRUMS.includes(instrumentSymbol);
};

/**
 * Play a sound with shortened duration (for Presionado emulation).
 * Creates a muted/dampened effect by cutting off the sound early.
 * 
 * @param {AudioContext} ctx - The audio context
 * @param {AudioBuffer} buffer - The audio buffer to play
 * @param {number} time - Absolute audio context time
 * @param {GainNode} instrumentGain - The instrument's gain node
 * @param {number} volume - Track-level volume multiplier (0-1)
 * @param {number} cutRatio - Fraction of buffer to play (default 0.08 = 8%)
 */
export const playShortenedSound = (ctx, buffer, time, instrumentGain, volume = 1.0, cutRatio = 0.08) => {
    const playTime = Math.max(time, ctx.currentTime);

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Per-note gain for track volume
    const noteGain = ctx.createGain();
    noteGain.gain.value = volume;

    // Route: Source -> NoteGain -> InstrumentGain -> MasterGain
    source.connect(noteGain);
    noteGain.connect(instrumentGain);

    source.start(playTime);
    source.stop(playTime + (buffer.duration * cutRatio));
};

/**
 * Play multiple sounds layered together.
 * Used for compound strokes like Mordito (Slap + Open).
 * 
 * @param {AudioContext} ctx - The audio context
 * @param {AudioBuffer[]} buffers - Array of audio buffers to play simultaneously
 * @param {number} time - Absolute audio context time
 * @param {GainNode} instrumentGain - The instrument's gain node
 * @param {number} volume - Track-level volume (0-1)
 */
export const playLayeredSounds = (ctx, buffers, time, instrumentGain, volume = 1.0) => {
    const playTime = Math.max(time, ctx.currentTime);

    buffers.forEach(buffer => {
        if (!buffer) return;

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const noteGain = ctx.createGain();
        noteGain.gain.value = volume;

        source.connect(noteGain);
        noteGain.connect(instrumentGain);

        source.start(playTime);
    });
};

/**
 * Emulate missing Batá drum sounds using available samples.
 * 
 * Emulation strategies:
 * - R (Mordito): Slap + Open played together
 * - P (Presionado): Open tone with shortened duration (8%)
 * - H (Half Mordito): Slap + Presionado (or Slap + shortened Open)
 * 
 * @param {AudioContext} ctx - The audio context
 * @param {object} instBuffers - Object containing loaded buffers for the instrument
 * @param {string} stroke - The stroke letter to emulate (R, P, or H)
 * @param {number} time - Absolute audio context time
 * @param {GainNode} instrumentGain - The instrument's gain node
 * @param {number} volume - Track-level volume (0-1)
 * @returns {boolean} True if emulation was performed, false if no emulation available
 */
export const emulateStroke = (ctx, instBuffers, stroke, time, instrumentGain, volume) => {
    if (!instBuffers) return false;

    const openBuffer = instBuffers['O'];
    const slapBuffer = instBuffers['S'];
    const presionadoBuffer = instBuffers['P'];

    switch (stroke) {
        case 'R': // Mordito = Slap + Open
            if (slapBuffer && openBuffer) {
                playLayeredSounds(ctx, [slapBuffer, openBuffer], time, instrumentGain, volume);
                return true;
            }
            break;

        case 'P': // Presionado = Shortened Open
            if (openBuffer) {
                playShortenedSound(ctx, openBuffer, time, instrumentGain, volume, 0.08);
                return true;
            }
            break;

        case 'H': // Half Mordito = Slap + Presionado
            if (slapBuffer) {
                if (presionadoBuffer) {
                    playLayeredSounds(ctx, [slapBuffer, presionadoBuffer], time, instrumentGain, volume);
                    return true;
                } else if (openBuffer) {
                    // Play slap normally
                    const playTime = Math.max(time, ctx.currentTime);
                    const source = ctx.createBufferSource();
                    source.buffer = slapBuffer;
                    const noteGain = ctx.createGain();
                    noteGain.gain.value = volume;
                    source.connect(noteGain);
                    noteGain.connect(instrumentGain);
                    source.start(playTime);

                    // Play shortened open
                    playShortenedSound(ctx, openBuffer, time, instrumentGain, volume, 0.08);
                    return true;
                }
            }
            break;
    }

    return false;
};
