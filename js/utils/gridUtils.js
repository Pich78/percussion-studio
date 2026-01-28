/*
  js/utils/gridUtils.js
  Utility functions for grid rhythmic coloring, guide numbers, and divisor calculations.
*/

// Valid step options for the global grid
export const GRID_STEP_OPTIONS = [4, 6, 8, 12, 16, 24];

// Valid step options for per-instrument subdivision
// Valid step options for per-instrument subdivision (Deprecated/Unused: now calculated dynamicall)
// export const INSTRUMENT_STEP_OPTIONS = [2, 3, 4, 6, 8, 12, 16, 24];

/**
 * Get all divisors of a number
 * @param {number} num - The number to find divisors for
 * @returns {number[]} Array of divisors
 */
export const getDivisors = (num) => {
  const divisors = [];
  for (let i = 1; i <= num; i++) {
    if (num % i === 0) {
      divisors.push(i);
    }
  }
  return divisors;
};

/**
 * Get valid instrument step options for a given grid size
 * @param {number} gridSize - The global grid size
 * @returns {number[]} Array of valid step counts (divisors of gridSize that are in INSTRUMENT_STEP_OPTIONS)
 */
export const getValidInstrumentSteps = (gridSize) => {
  const divisors = getDivisors(gridSize);
  // Filter out 1 (too granular) and gridSize (1:1 mapping, redundant)
  return divisors.filter(step => step !== 1 && step !== gridSize);
};

/**
 * Find the closest valid divisor to a target value
 * @param {number} target - The target step count
 * @param {number} gridSize - The grid size to find divisors of
 * @returns {number} The closest valid divisor
 */
export const getClosestDivisor = (target, gridSize) => {
  const validSteps = getValidInstrumentSteps(gridSize);
  if (validSteps.length === 0) return gridSize;

  return validSteps.reduce((prev, curr) => {
    return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
  });
};

/**
 * Get the rhythmic background class based on step position
 * Uses indigo with varying opacity for visual hierarchy
 * @param {number} index - The step index
 * @param {number} steps - Total steps for this instrument
 * @returns {string} Tailwind CSS class for background
 */
export const getCellBackgroundClass = (index, steps, divisor = null) => {
  const STRONG = 'bg-indigo-500/20'; // Primary accent (Beat)
  const MEDIUM = 'bg-indigo-500/10'; // Secondary accent (Half-beat)
  const WEAK = 'bg-indigo-500/5';    // Subdivision

  // If divisor is provided (Visual Grouping Mode), use it to determine structure
  if (divisor) {
    if (divisor > steps) return WEAK; // Should not happen typically

    const groupSize = steps / divisor; // e.g. 12 steps / 4 beats = 3 steps per beat

    // Is this index a beat start?
    // Floating point check: nearly integer
    const currentBeat = index / groupSize;

    // Precision tolerance for float division keys
    if (Math.abs(currentBeat - Math.round(currentBeat)) < 0.001) {
      // It's a beat start!
      return STRONG;
    }

    // If grouping is even length (e.g. 4 steps per beat), allow secondary accent
    if (groupSize >= 4 && groupSize % 2 === 0) {
      const midPoint = groupSize / 2;
      if (Math.abs((index % groupSize) - midPoint) < 0.001) {
        return MEDIUM;
      }
    }

    return WEAK;
  }

  // Fallback to old heuristic logic if no divisor (Legacy or Global Grid)

  // Ternary patterns (3, 6, 12, 24)
  if (steps % 3 === 0 && steps % 4 !== 0) {
    const pos = index % 3;
    if (pos === 0) return STRONG;
    if (pos === 1) return MEDIUM;
    return WEAK;
  }

  // Quaternary patterns (4, 8, 16)
  if (steps % 4 === 0) {
    const pos = index % 4;
    if (pos === 0) return STRONG;
    if (pos === 2) return MEDIUM;
    return WEAK;
  }

  // Binary pattern (2)
  if (steps === 2) {
    return index % 2 === 0 ? STRONG : WEAK;
  }

  // Default
  return 'bg-transparent';
};

/**
 * Calculate the guide number to display in a cell
 * Uses cyclic counting based on rhythmic pattern
 * @param {number} index - The step index
 * @param {number} steps - Total steps
 * @returns {number} The guide number to display
 */
export const getGuideNumber = (index, steps, divisor = null) => {
  // Visual Grouping Mode
  if (divisor) {
    const groupSize = steps / divisor;
    const currentBeat = index / groupSize;

    // Use epsilon for float safety
    if (Math.abs(currentBeat - Math.round(currentBeat)) < 0.001) {
      return Math.round(currentBeat) + 1;
    }
    return ''; // Hide guide numbers inside the block
  }

  // Fallback (Global Grid)
  // For very few steps, use absolute counting
  if (steps < 6) return index + 1;

  // Ternary: Cycle 1, 2, 3
  if (steps % 3 === 0 && steps % 4 !== 0) {
    return (index % 3) + 1;
  }

  // Quaternary: Cycle 1, 2, 3, 4
  if (steps % 4 === 0) {
    return (index % 4) + 1;
  }

  // Fallback
  return index + 1;
};

/**
 * Get the font size class for guide numbers based on step density
 * @param {number} steps - Total steps
 * @returns {string} Tailwind CSS font size class
 */
export const getGuideNumberSize = (steps) => {
  if (steps > 16) return 'text-xs';     // Very dense
  if (steps > 12) return 'text-sm';     // Dense
  if (steps > 8) return 'text-lg';      // Medium
  if (steps > 4) return 'text-xl';      // Sparse
  return 'text-2xl';                     // Very sparse
};
