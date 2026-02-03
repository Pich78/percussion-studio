/*
  js/utils/strokeCursors.js
  Utility to generate custom cursor URLs from stroke SVG icons.
*/

import { StrokeType } from '../types.js';
import { STROKE_PALETTE } from '../constants.js';

// Cache for generated cursor data URIs
const cursorCache = new Map();

// Cursor size in pixels
const CURSOR_SIZE = 32;
const HOTSPOT = 16; // Center hotspot

/**
 * Generate a data URI for a cursor from an SVG path
 * @param {string} svgPath - Path to the SVG file (e.g., 'open.svg')
 * @returns {Promise<string>} Data URI string
 */
const loadSvgAsCursor = async (svgPath) => {
    try {
        const response = await fetch(`data/assets/icons/${svgPath}`);
        if (!response.ok) throw new Error(`Failed to load ${svgPath}`);

        let svgText = await response.text();

        // Ensure SVG has proper size attributes for cursor
        svgText = svgText.replace(/<svg/, `<svg width="${CURSOR_SIZE}" height="${CURSOR_SIZE}"`);

        // Convert to data URI
        const encoded = btoa(unescape(encodeURIComponent(svgText)));
        return `url('data:image/svg+xml;base64,${encoded}') ${HOTSPOT} ${HOTSPOT}, pointer`;
    } catch (error) {
        console.error(`Error loading cursor SVG: ${svgPath}`, error);
        return 'pointer';
    }
};

/**
 * Initialize cursor cache by preloading all stroke cursors
 * Call this on app startup
 */
export const initStrokeCursors = async () => {
    const loadPromises = [];

    for (const item of STROKE_PALETTE) {
        if (item.svg) {
            loadPromises.push(
                loadSvgAsCursor(item.svg).then(cursor => {
                    cursorCache.set(item.type, cursor);
                })
            );
        }
    }

    // Also load the not-allowed cursor
    loadPromises.push(
        loadSvgAsCursor('not_allowed.svg').then(cursor => {
            cursorCache.set('NOT_ALLOWED', cursor);
        })
    );

    await Promise.all(loadPromises);
};

/**
 * Get the cursor CSS value for a stroke type
 * @param {string} strokeType - The stroke type (e.g., StrokeType.Open)
 * @returns {string} CSS cursor value
 */
export const getCursorForStroke = (strokeType) => {
    return cursorCache.get(strokeType) || 'pointer';
};

/**
 * Get the denial/not-allowed cursor
 * @returns {string} CSS cursor value
 */
export const getInvalidCursor = () => {
    return cursorCache.get('NOT_ALLOWED') || 'not-allowed';
};

/**
 * Get cursor for a cell based on stroke type and validity
 * @param {string} selectedStroke - Currently selected stroke type
 * @param {boolean} isValid - Whether the stroke is valid for this instrument
 * @returns {string} CSS cursor value
 */
export const getCellCursor = (selectedStroke, isValid) => {
    if (!isValid) {
        return getInvalidCursor();
    }
    return getCursorForStroke(selectedStroke);
};

/**
 * Update the global cursor style for grid cells
 * This injects/updates a style tag to ensure immediate cursor updates
 * @param {string} selectedStroke - Currently selected stroke type
 */
export const updateGlobalCursor = (selectedStroke) => {
    const validCursor = getCursorForStroke(selectedStroke);
    const invalidCursor = getInvalidCursor();

    // Find or create the dynamic style element
    let styleEl = document.getElementById('stroke-cursor-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'stroke-cursor-style';
        document.head.appendChild(styleEl);
    }

    // Update the CSS rules for grid cells
    styleEl.textContent = `
        [data-role="tubs-cell"]:not(.stroke-invalid) {
            cursor: ${validCursor} !important;
        }
        [data-role="tubs-cell"].stroke-invalid {
            cursor: ${invalidCursor} !important;
        }
    `;
};
