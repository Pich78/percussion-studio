/*
  js/utils/patternParser.js
  Pure functions for parsing and generating ASCII pattern strings.
  No state dependencies - these are pure data transformations.
*/

import { StrokeType } from '../types.js';

/**
 * Parse ASCII pattern string to stroke array
 * @param {string} str - Pattern string e.g. "||O-S-|---||"
 * @param {number} steps - Expected number of steps
 * @returns {string[]} Array of stroke characters
 * 
 * @example
 * parsePatternString("||O-S-||", 4) // => ['O', ' ', 'S', ' ']
 */
export const parsePatternString = (str, steps) => {
    // Remove visual separators '|'
    const clean = str.replace(/\|/g, '');
    const strokes = [];

    for (let i = 0; i < clean.length; i++) {
        const char = clean[i];
        if (char === '-') {
            strokes.push(StrokeType.None);
        } else {
            strokes.push(char.toUpperCase()); // Keep letter
        }
    }

    // Pad or trim to fit steps
    if (strokes.length < steps) {
        const diff = steps - strokes.length;
        for (let k = 0; k < diff; k++) strokes.push(StrokeType.None);
    } else if (strokes.length > steps) {
        strokes.length = steps;
    }
    return strokes;
};

/**
 * Convert stroke array to ASCII pattern string
 * @param {string[]} strokes - Array of stroke characters
 * @param {number} subdivision - Steps per beat group (for visual separators)
 * @returns {string} Pattern string e.g. "||O-S-|---||"
 * 
 * @example
 * strokesToPatternString(['O', ' ', 'S', ' '], 4) // => "||O-S-||"
 */
export const strokesToPatternString = (strokes, subdivision = 4) => {
    let pattern = '||';
    for (let i = 0; i < strokes.length; i++) {
        const stroke = strokes[i];
        // Convert space (None) to dash
        pattern += (stroke === ' ' || stroke === '.') ? '-' : stroke;
        // Add separator after each group
        if ((i + 1) % subdivision === 0 && i < strokes.length - 1) {
            pattern += '|';
        }
    }
    pattern += '||';
    return pattern;
};

/**
 * Parse ASCII dynamics string to dynamics array
 * @param {string} str - Dynamics string e.g. "||a-g-|---||"
 * @param {number} steps - Expected number of steps
 * @returns {string[]} Array of dynamic characters
 * 
 * @example
 * parseDynamicsString("||a-g-||", 4) // => ['a', '-', 'g', '-']
 */
export const parseDynamicsString = (str, steps) => {
    if (!str) return Array(steps).fill('-');

    // Remove visual separators '|'
    const clean = str.replace(/\|/g, '');
    const dynamics = [];

    for (let i = 0; i < clean.length; i++) {
        const char = clean[i];
        if (char === ' ' || char === '.') {
            dynamics.push('-'); // Normalize space to normal dynamic
        } else {
            dynamics.push(char);
        }
    }

    // Pad or trim to fit steps
    if (dynamics.length < steps) {
        const diff = steps - dynamics.length;
        for (let k = 0; k < diff; k++) dynamics.push('-');
    } else if (dynamics.length > steps) {
        dynamics.length = steps;
    }
    return dynamics;
};

/**
 * Convert dynamics array to ASCII dynamics string perfectly aligned with strokes
 * @param {string[]} dynamics - Array of dynamics characters
 * @param {number} subdivision - Steps per beat group (for visual separators)
 * @returns {string} Dynamics string e.g. "||a-g-|---||"
 * 
 * @example
 * dynamicsToPatternString(['a', '-', 'g', '-'], 4) // => "||a-g-||"
 */
export const dynamicsToPatternString = (dynamics, subdivision = 4) => {
    let pattern = '||';
    for (let i = 0; i < dynamics.length; i++) {
        const dyn = dynamics[i];
        // Convert empty, space, or none to dash ('Normal' dynamic)
        pattern += (!dyn || dyn === ' ' || dyn === '.') ? '-' : dyn;
        // Add separator after each group
        if ((i + 1) % subdivision === 0 && i < dynamics.length - 1) {
            pattern += '|';
        }
    }
    pattern += '||';
    return pattern;
};

/**
 * Validate if a stroke letter is valid for a given instrument
 * @param {string} strokeLetter - The stroke to validate
 * @param {object} instrumentDef - The instrument definition with .sounds array
 * @returns {boolean} True if the stroke is valid
 */
export const isValidStroke = (strokeLetter, instrumentDef) => {
    if (!instrumentDef || !instrumentDef.sounds) return false;
    if (strokeLetter === StrokeType.None) return true;
    return instrumentDef.sounds.some(s =>
        s.letter.toUpperCase() === strokeLetter.toUpperCase()
    );
};

/**
 * Get the display name for a stroke
 * @param {string} strokeLetter - The stroke letter
 * @param {object} instrumentDef - The instrument definition
 * @returns {string} Display name or the letter itself
 */
export const getStrokeDisplayName = (strokeLetter, instrumentDef) => {
    if (!instrumentDef || !instrumentDef.sounds) return strokeLetter;
    const sound = instrumentDef.sounds.find(s =>
        s.letter.toUpperCase() === strokeLetter.toUpperCase()
    );
    return sound ? sound.name : strokeLetter;
};
