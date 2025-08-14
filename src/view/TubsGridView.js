// file: src/view/TubsGridView.js

export class TubsGridView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
    }

    render(state) {
        const { currentPatternId, rhythm } = state;
        if (!rhythm || !currentPatternId || !rhythm.patterns[currentPatternId]) {
            this.container.innerHTML = '<div>No pattern selected or available.</div>';
            return;
        }

        const pattern = rhythm.patterns[currentPatternId];
        const measure = pattern.pattern_data[0]; // For now, only render the first measure
        const resolution = pattern.metadata.resolution || 16;
        const instruments = Object.keys(measure);

        // Define the grid columns dynamically based on resolution
        const gridStyles = `grid-template-columns: 80px repeat(${resolution}, 1fr);`;

        let gridHtml = `<div class="grid" style="${gridStyles}">`;

        // Add a playback indicator container that spans all rows
        gridHtml += `<div class="playback-indicator" style="grid-row: 1 / -1; grid-column: 2;"></div>`;
        
        // Loop through each instrument to create a row
        instruments.forEach(instrumentSymbol => {
            gridHtml += `<div class="instrument-row">`;
            // Instrument Header
            gridHtml += `<div class="instrument-header">${instrumentSymbol}</div>`;

            const noteString = measure[instrumentSymbol].replace(/\|/g, '');
            
            // Grid Cells for this instrument
            for (let i = 0; i < resolution; i++) {
                const noteChar = noteString[i];
                let cellContent = '';
                if (noteChar && noteChar !== '-') {
                    // This assumes a mapping between the note character ('o', 'x', etc.)
                    // and the actual SVG file. We'll simplify for now.
                    // This path will need to be resolved more robustly in the full app.
                    const instrumentId = rhythm.instrument_kit[instrumentSymbol];
                    // We need a way to map 'o' to 'kick_beater.svg'. This is a placeholder.
                    const svgFile = 'kick_beater.svg'; 
                    cellContent = `<img src="data/instruments/${instrumentId}/${svgFile}" alt="note">`;
                }
                gridHtml += `<div class="grid-cell">${cellContent}</div>`;
            }

            gridHtml += `</div>`;
        });

        gridHtml += `</div>`;
        this.container.innerHTML = gridHtml;
        this.indicator = this.container.querySelector('.playback-indicator');
    }

    /**
     * A dedicated, high-performance method to move the playback indicator.
     * @param {number} tick The current tick to highlight (0-indexed).
     */
    updatePlaybackIndicator(tick) {
        if (!this.indicator) return;
        // The grid columns start at 1. The first column is the header, so ticks start at column 2.
        this.indicator.style.gridColumn = tick + 2;
    }
}