// file: lib/TubsGridRenderer/TubsGridRenderer.js

/**
 * A stateless utility module for creating the DOM elements of a TUBS grid.
 * These functions are pure; they take data and return DOM nodes without causing side effects.
 * They are intended to be used by stateful view components like PlaybackGridView and EditingGridView.
 */
export const TubsGridRenderer = {
    /**
     * Creates the main container for a single measure.
     * @returns {HTMLDivElement} A div element representing the measure.
     */
    createMeasureContainer() {
        const measureEl = document.createElement('div');
        measureEl.className = 'measure-container';
        return measureEl;
    },

    /**
     * Creates the header element for a measure.
     * @param {object} measureData - The data for the measure.
     * @param {string} measureData.metric - The metric (e.g., "4/4").
     * @param {number} measureData.resolution - The resolution (e.g., 16).
     * @returns {HTMLDivElement} A div element representing the measure header.
     */
    createMeasureHeader({ metric, resolution }) {
        const headerEl = document.createElement('div');
        headerEl.className = 'measure-header';
        headerEl.innerHTML = `
            <span class="metric">${metric}</span>
            <span class="resolution">${resolution}th</span>
        `;
        return headerEl;
    },

    /**
     * Creates the container for an instrument's row within a single measure.
     * @param {string} instrumentSymbol - The symbol for the instrument (e.g., "KCK").
     * @returns {HTMLDivElement} A div element representing the instrument row.
     */
    createInstrumentRow(instrumentSymbol) {
        const rowEl = document.createElement('div');
        rowEl.className = 'instrument-row';
        rowEl.dataset.instrument = instrumentSymbol;
        return rowEl;
    },

    /**
     * Creates the header for an instrument row, displaying its name.
     * @param {string} instrumentName - The display name of the instrument (e.g., "Kick Drum").
     * @returns {HTMLDivElement} A div element representing the instrument row header.
     */
    createInstrumentHeader(instrumentName) {
        const headerEl = document.createElement('div');
        headerEl.className = 'instrument-header';
        headerEl.textContent = instrumentName;
        return headerEl;
    },

    /**
     * Creates a single, empty grid cell (a tick).
     * @param {number} tickIndex - The zero-based index of this tick within the measure.
     * @returns {HTMLDivElement} A div element representing the grid cell.
     */
    createGridCell(tickIndex) {
        const cellEl = document.createElement('div');
        cellEl.className = 'grid-cell';
        cellEl.dataset.tickIndex = tickIndex;
        return cellEl;
    },

    /**
     * Creates the DOM element for a note, which will be placed inside a grid cell.
     * @param {string} svgContent - The raw SVG string for the note's symbol.
     * @param {string} soundLetter - The letter representing the sound (e.g., "o").
     * @returns {HTMLDivElement} A div element containing the note's SVG.
     */
    createNoteElement(svgContent, soundLetter) {
        const noteEl = document.createElement('div');
        noteEl.className = 'note';
        noteEl.dataset.sound = soundLetter;
        noteEl.innerHTML = svgContent;
        return noteEl;
    },
};