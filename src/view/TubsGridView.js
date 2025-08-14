// file: src/view/TubsGridView.js (Complete and Corrected)

export class TubsGridView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
    }

    render(state) {
        const { currentPatternId, rhythm } = state;
        if (!rhythm || !currentPatternId || !rhythm.patterns?.[currentPatternId]) {
            this.container.innerHTML = '<div>No pattern selected or available.</div>';
            return;
        }

        const pattern = rhythm.patterns[currentPatternId];
        const measure = pattern.pattern_data[0];
        const resolution = pattern.metadata.resolution || 16;
        const instruments = Object.keys(measure);

        const gridStyles = `grid-template-columns: 80px repeat(${resolution}, 1fr);`;
        let gridHtml = `<div class="grid" style="${gridStyles}">`;

        // Add the indicator. It will span all rows by default in the CSS.
        gridHtml += `<div class="playback-indicator"></div>`;
        
        // Loop through each instrument, keeping track of the current row index
        instruments.forEach((instrumentSymbol, rowIndex) => {
            const currentRow = rowIndex + 1; // CSS grid rows are 1-based

            // Instrument Header, placed in the correct row
            gridHtml += `<div class="instrument-header" style="grid-row: ${currentRow}; grid-column: 1;">${instrumentSymbol}</div>`;

            const noteString = measure[instrumentSymbol].replace(/\|/g, '');
            
            // Grid Cells for this instrument, each placed in the correct row and column
            for (let i = 0; i < resolution; i++) {
                const currentColumn = i + 2; // +1 for header, +1 for 1-based index
                const noteChar = noteString[i];
                let cellContent = '';

                if (noteChar && noteChar !== '-') {
                    const instrumentId = rhythm.instrument_kit?.[instrumentSymbol];
                    const instrumentData = rhythm.instruments?.[instrumentId];
                    const soundDef = instrumentData?.sounds?.find(s => s.letter === noteChar);
                    const svgFile = soundDef?.svg;
                    
                    if (instrumentId && svgFile) {
                        const imgSrc = `/percussion-studio/data/instruments/${instrumentId}/${svgFile}`;
                        cellContent = `<img src="${imgSrc}" alt="${instrumentSymbol} note">`;
                    }
                }
                gridHtml += `<div class="grid-cell" style="grid-row: ${currentRow}; grid-column: ${currentColumn};">${cellContent}</div>`;
            }
        });

        gridHtml += `</div>`;
        this.container.innerHTML = gridHtml;
        this.indicator = this.container.querySelector('.playback-indicator');
        this.updatePlaybackIndicator(0);
    }

    updatePlaybackIndicator(tick) {
        if (!this.indicator) return;
        this.indicator.style.gridColumn = tick + 2;
    }
}