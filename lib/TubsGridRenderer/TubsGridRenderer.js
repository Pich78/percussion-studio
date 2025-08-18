// file: lib/TubsGridRenderer/TubsGridRenderer.js

/**
 * A stateless utility module for creating the DOM elements of a TUBS grid.
 */
export const TubsGridRenderer = {
    createMeasureContainer() {
        const measureEl = document.createElement('div');
        measureEl.className = 'measure-container';
        return measureEl;
    },

    createMeasureHeader({ metric, resolution }) {
        const headerEl = document.createElement('div');
        headerEl.className = 'measure-header';

        const [beats, beatType] = metric.split('/');
        const resolutionOptions = [4, 8, 16, 32, 64];

        headerEl.innerHTML = `
            <div class="metric-controls">
                <input type="number" class="metric-input" data-prop="beats" value="${beats}" min="1">
                <span class="metric-separator">/</span>
                <input type="number" class="metric-input" data-prop="beatType" value="${beatType}" min="1">
            </div>
            <div class="resolution-controls">
                <select class="resolution-select" data-prop="resolution">
                    ${resolutionOptions.map(res => `
                        <option value="${res}" ${res === resolution ? 'selected' : ''}>${res}th</option>
                    `).join('')}
                </select>
            </div>
            <button class="apply-btn" data-action="apply-metric" disabled>Apply</button>
        `;
        return headerEl;
    },

    createInstrumentRow(instrumentSymbol) {
        const rowEl = document.createElement('div');
        rowEl.className = 'instrument-row';
        rowEl.dataset.instrument = instrumentSymbol;
        return rowEl;
    },

    createInstrumentHeader(instrumentName) {
        const headerEl = document.createElement('div');
        headerEl.className = 'instrument-header';
        headerEl.textContent = instrumentName;
        return headerEl;
    },

    createGridCell(tickIndex) {
        const cellEl = document.createElement('div');
        cellEl.className = 'grid-cell';
        cellEl.dataset.tickIndex = tickIndex;
        return cellEl;
    },

    createNoteElement(svgContent, soundLetter) {
        const noteEl = document.createElement('div');
        noteEl.className = 'note';
        noteEl.dataset.sound = soundLetter;
        noteEl.innerHTML = svgContent;
        return noteEl;
    },
};