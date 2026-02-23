/*
  js/utils/strokeCursors.js
  Utility to generate custom cursor URLs from stroke SVG icons.
*/

import { StrokeType } from '../types.js';
import { STROKE_PALETTE } from '../constants.js';

// Cache for raw SVG text
const svgCache = new Map();
// Cache for compiled CSS cursor strings (key: "strokeType_dynamicType")
const cssCursorCache = new Map();

// Cursor size in pixels
const CURSOR_SIZE = 32;
const HOTSPOT = 16; // Center hotspot

/**
 * Fetch raw SVG text for a cursor
 * @param {string} svgPath - Path to the SVG file
 * @returns {Promise<string|null>} Raw SVG string
 */
const loadSvgRaw = async (svgPath) => {
    try {
        const response = await fetch(`data/assets/icons/${svgPath}`);
        if (!response.ok) throw new Error(`Failed to load ${svgPath}`);
        return await response.text();
    } catch (error) {
        console.error(`Error loading cursor SVG: ${svgPath}`, error);
        return null;
    }
};

/**
 * Initialize cursor cache by preloading all raw stroke SVGs
 * Call this on app startup
 */
export const initStrokeCursors = async () => {
    const loadPromises = [];

    for (const item of STROKE_PALETTE) {
        if (item.svg) {
            loadPromises.push(
                loadSvgRaw(item.svg).then(svgText => {
                    if (svgText) svgCache.set(item.type, svgText);
                })
            );
        }
    }

    // Also load the not-allowed cursor
    loadPromises.push(
        loadSvgRaw('not_allowed.svg').then(svgText => {
            if (svgText) svgCache.set('NOT_ALLOWED', svgText);
        })
    );

    await Promise.all(loadPromises);
};

/**
 * Get the cursor CSS value for a stroke type and dynamic
 * @param {string} strokeType - The stroke type (e.g., StrokeType.Open)
 * @param {string} dynamicType - The dynamic level to apply styles for
 * @returns {string} CSS cursor value
 */
export const getCursorForStroke = (strokeType, dynamicType = '-') => {
    const cacheKey = `${strokeType}_${dynamicType}`;
    if (cssCursorCache.has(cacheKey)) {
        return cssCursorCache.get(cacheKey);
    }

    const svgText = svgCache.get(strokeType);
    if (!svgText) return 'pointer';

    let scale = 1;
    let opacity = 1;

    if (dynamicType === 'g') { scale = 0.5; opacity = 0.4; }
    else if (dynamicType === 's') { scale = 0.75; opacity = 0.7; }
    else if (dynamicType === 'l') { scale = 1.25; }
    else if (dynamicType === 'a') { scale = 1.4; }

    const size = Math.round(CURSOR_SIZE * scale);

    // For glow dynamics, add padding so the glow isn't clipped
    const needsGlow = dynamicType === 'l' || dynamicType === 'a';
    const glowPadding = needsGlow ? Math.round(size * 0.4) : 0;
    const totalSize = size + glowPadding * 2;
    const hotspot = Math.round(totalSize / 2);

    let modifiedSvg;

    if (needsGlow) {
        // Build SVG glow filter (native SVG filters work in data URI cursors, CSS filters don't)
        const stdDev = dynamicType === 'l' ? 2.5 : 3.5;
        const color = dynamicType === 'l' ? 'rgb(251,146,60)' : 'rgb(239,68,68)';
        const floodOpacity = dynamicType === 'l' ? 0.9 : 1;

        // Extract the inner content of the original SVG (everything between <svg ...> and </svg>)
        const innerContent = svgText.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');

        // Build a new wrapper SVG with proper structure:
        //   outer <svg> at totalSize (no viewBox, pixel-based)
        //     <defs> with glow filter
        //     <g> translated to center the icon in the padded area
        //       inner content drawn in a nested <svg> at 'size' px with the original viewBox
        modifiedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}">` +
            `<defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%">` +
            `<feGaussianBlur in="SourceAlpha" stdDeviation="${stdDev}" result="blur"/>` +
            `<feFlood flood-color="${color}" flood-opacity="${floodOpacity}" result="color"/>` +
            `<feComposite in="color" in2="blur" operator="in" result="shadow"/>` +
            `<feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>` +
            `</filter></defs>` +
            `<g filter="url(#glow)" transform="translate(${glowPadding},${glowPadding})">` +
            `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">` +
            innerContent +
            `</svg></g></svg>`;
    } else if (opacity < 1) {
        modifiedSvg = svgText.replace(/<svg/, `<svg width="${size}" height="${size}" opacity="${opacity}"`);
    } else {
        modifiedSvg = svgText.replace(/<svg/, `<svg width="${size}" height="${size}"`);
    }

    const encoded = btoa(unescape(encodeURIComponent(modifiedSvg)));
    const cursorStr = `url('data:image/svg+xml;base64,${encoded}') ${hotspot} ${hotspot}, pointer`;

    cssCursorCache.set(cacheKey, cursorStr);
    return cursorStr;
};

/**
 * Get the denial/not-allowed cursor
 * @returns {string} CSS cursor value
 */
export const getInvalidCursor = () => {
    const cacheKey = 'NOT_ALLOWED_';
    if (cssCursorCache.has(cacheKey)) return cssCursorCache.get(cacheKey);

    const svgText = svgCache.get('NOT_ALLOWED');
    if (!svgText) return 'not-allowed';

    let modifiedSvg = svgText
        .replace(/<svg/, `<svg width="${CURSOR_SIZE}" height="${CURSOR_SIZE}"`);

    const encoded = btoa(unescape(encodeURIComponent(modifiedSvg)));
    const cursorStr = `url('data:image/svg+xml;base64,${encoded}') ${HOTSPOT} ${HOTSPOT}, not-allowed`;

    cssCursorCache.set(cacheKey, cursorStr);
    return cursorStr;
};

/**
 * Get cursor for a cell based on stroke type and validity
 * @param {string} selectedStroke - Currently selected stroke type
 * @param {boolean} isValid - Whether the stroke is valid for this instrument
 * @param {string} selectedDynamic - Currently selected dynamic
 * @returns {string} CSS cursor value
 */
export const getCellCursor = (selectedStroke, isValid, selectedDynamic = '-') => {
    if (!isValid) {
        return getInvalidCursor();
    }
    return getCursorForStroke(selectedStroke, selectedDynamic);
};

/**
 * Update the global cursor style for grid cells
 * This injects/updates a style tag to ensure immediate cursor updates
 * @param {string} selectedStroke - Currently selected stroke type
 * @param {string} selectedDynamic - Currently selected dynamic
 */
export const updateGlobalCursor = (selectedStroke, selectedDynamic = '-') => {
    const validCursor = getCursorForStroke(selectedStroke, selectedDynamic);
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
