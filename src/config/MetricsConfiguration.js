// file: src/config/MetricsConfiguration.js

/**
 * @typedef {Object} SubdivisionConfig
 * @property {string} label - The user-friendly label for the UI dropdown.
 * @property {number} totalBoxes - The total number of grid cells for this measure.
 * @property {number} beatGrouping - The number of boxes that constitute a single beat for shading purposes.
 * @property {number[]} groupingPattern - The explicit layout rule. An array of numbers where each number is the box count for a single rendered line.
 * @property {'duple'|'triplet'} feel - The rhythmic feel, for styling purposes.
 */

/**
 * @typedef {Object} TimeSignatureConfig
 * @property {string} label - The user-friendly label for the time signature part of the dropdown.
 * @property {Object.<string, SubdivisionConfig>} subdivisions - A map of available subdivisions.
 */

/**
 * METRICS_CONFIG
 * The single source of truth for all rhythmic layout logic in the application.
 * It defines the options available in the UI and dictates how each measure will be rendered.
 *
 * The layout is determined by the `groupingPattern` property based on these rules:
 * 1.  **Comfort Zone (<= 16 boxes):** Rendered as a single line.
 * 2.  **Tolerance Zone (17-20 boxes):** Rendered as a single line to avoid excessive fragmentation.
 * 3.  **Asymmetrical Split:** For specific meters like 7/4, an explicit, musically-aware split is defined first.
 * 4.  **Symmetric Split (> 20 boxes):** The measure is split into the fewest possible lines, where each line's box count does not exceed 16.
 */
export const METRICS_CONFIG = {
    // Key format: 'numerator/denominator'
    '2/4': {
        label: '2/4 Time',
        subdivisions: {
            '8':  { label: '8th Notes',  totalBoxes: 4,  beatGrouping: 2, groupingPattern: [4],           feel: 'duple' },
            '16': { label: '16th Notes', totalBoxes: 8,  beatGrouping: 4, groupingPattern: [8],           feel: 'duple' },
            '32': { label: '32nd Notes', totalBoxes: 16, beatGrouping: 8, groupingPattern: [16],          feel: 'duple' },
            '64': { label: '64th Notes', totalBoxes: 32, beatGrouping: 16, groupingPattern: [16, 16],      feel: 'duple' },
        }
    },
    '3/4': {
        label: '3/4 Time',
        subdivisions: {
            '8':  { label: '8th Notes',  totalBoxes: 6,  beatGrouping: 2, groupingPattern: [6],           feel: 'duple' },
            '16': { label: '16th Notes', totalBoxes: 12, beatGrouping: 4, groupingPattern: [12],          feel: 'duple' },
            '32': { label: '32nd Notes', totalBoxes: 24, beatGrouping: 8, groupingPattern: [8, 8, 8],     feel: 'duple' },
            '64': { label: '64th Notes', totalBoxes: 48, beatGrouping: 16, groupingPattern: [16, 16, 16],  feel: 'duple' },
        }
    },
    '4/4': {
        label: '4/4 Time',
        subdivisions: {
            '8':  { label: '8th Notes',  totalBoxes: 8,  beatGrouping: 2, groupingPattern: [8],           feel: 'duple' },
            '16': { label: '16th Notes', totalBoxes: 16, beatGrouping: 4, groupingPattern: [16],          feel: 'duple' },
            '32': { label: '32nd Notes', totalBoxes: 32, beatGrouping: 8, groupingPattern: [16, 16],      feel: 'duple' },
            '64': { label: '64th Notes', totalBoxes: 64, beatGrouping: 16, groupingPattern: [16, 16, 16, 16], feel: 'duple' },
        }
    },
    '5/4': {
        label: '5/4 Time',
        subdivisions: {
            '8':  { label: '8th Notes',  totalBoxes: 10, beatGrouping: 2, groupingPattern: [10],          feel: 'duple' },
            '16': { label: '16th Notes', totalBoxes: 20, beatGrouping: 4, groupingPattern: [20],          feel: 'duple' },
            '32': { label: '32nd Notes', totalBoxes: 40, beatGrouping: 8, groupingPattern: [8, 8, 8, 8, 8], feel: 'duple' },
            '64': { label: '64th Notes', totalBoxes: 80, beatGrouping: 16, groupingPattern: [16, 16, 16, 16, 16], feel: 'duple' },
        }
    },
    '6/4': {
        label: '6/4 Time',
        subdivisions: {
            '8':  { label: '8th Notes',  totalBoxes: 12, beatGrouping: 2, groupingPattern: [12],          feel: 'duple' },
            '16': { label: '16th Notes', totalBoxes: 24, beatGrouping: 4, groupingPattern: [12, 12],      feel: 'duple' },
            '32': { label: '32nd Notes', totalBoxes: 48, beatGrouping: 8, groupingPattern: [16, 16, 16],  feel: 'duple' },
            '64': { label: '64th Notes', totalBoxes: 96, beatGrouping: 16, groupingPattern: [16, 16, 16, 16, 16, 16], feel: 'duple' },
        }
    },
    '7/4': {
        label: '7/4 Time (4+3)',
        subdivisions: {
            '8':  { label: '8th Notes',  totalBoxes: 14, beatGrouping: 2, groupingPattern: [8, 6],        feel: 'duple' },
            '16': { label: '16th Notes', totalBoxes: 28, beatGrouping: 4, groupingPattern: [16, 12],      feel: 'duple' },
            '32': { label: '32nd Notes', totalBoxes: 56, beatGrouping: 8, groupingPattern: [16, 16, 12, 12], feel: 'duple' },
            '64': { label: '64th Notes', totalBoxes: 112, beatGrouping: 16, groupingPattern: [16, 16, 16, 16, 16, 16, 16], feel: 'duple' },
        }
    },
    '3/8': {
        label: '3/8 Time',
        subdivisions: {
            '8':  { label: '8th Notes',  totalBoxes: 3,  beatGrouping: 1, groupingPattern: [3],           feel: 'triplet' },
            '16': { label: '16th Notes', totalBoxes: 6,  beatGrouping: 2, groupingPattern: [6],           feel: 'duple' },
            '32': { label: '32nd Notes', totalBoxes: 12, beatGrouping: 4, groupingPattern: [12],          feel: 'duple' },
            '64': { label: '64th Notes', totalBoxes: 24, beatGrouping: 8, groupingPattern: [12, 12],      feel: 'duple' },
        }
    },
    '6/8': {
        label: '6/8 Time',
        subdivisions: {
            '8':  { label: '8th Notes',  totalBoxes: 6,  beatGrouping: 3, groupingPattern: [6],           feel: 'triplet' },
            '16': { label: '16th Notes', totalBoxes: 12, beatGrouping: 3, groupingPattern: [12],          feel: 'triplet' },
            '32': { label: '32nd Notes', totalBoxes: 24, beatGrouping: 6, groupingPattern: [12, 12],      feel: 'triplet' },
            '64': { label: '64th Notes', totalBoxes: 48, beatGrouping: 12, groupingPattern: [12, 12, 12, 12], feel: 'triplet' },
        }
    },
    '9/8': {
        label: '9/8 Time',
        subdivisions: {
            '8':  { label: '8th Notes',  totalBoxes: 9,  beatGrouping: 3, groupingPattern: [9],           feel: 'triplet' },
            '16': { label: '16th Notes', totalBoxes: 18, beatGrouping: 3, groupingPattern: [18],          feel: 'triplet' },
            '32': { label: '32nd Notes', totalBoxes: 36, beatGrouping: 6, groupingPattern: [12, 12, 12],  feel: 'triplet' },
            '64': { label: '64th Notes', totalBoxes: 72, beatGrouping: 12, groupingPattern: [12, 12, 12, 12, 12, 12], feel: 'triplet' },
        }
    },
    '12/8': {
        label: '12/8 Time',
        subdivisions: {
            '8':  { label: '8th Notes',  totalBoxes: 12, beatGrouping: 3, groupingPattern: [12],          feel: 'triplet' },
            '16': { label: '16th Notes', totalBoxes: 24, beatGrouping: 3, groupingPattern: [12, 12],      feel: 'triplet' },
            '32': { label: '32nd Notes', totalBoxes: 48, beatGrouping: 6, groupingPattern: [12, 12, 12, 12], feel: 'triplet' },
            '64': { label: '64th Notes', totalBoxes: 96, beatGrouping: 12, groupingPattern: [16, 16, 16, 16, 16, 16], feel: 'triplet' },
        }
    },
};