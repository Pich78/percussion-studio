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

        // The indicator is a direct child of the grid. CSS will handle its spanning.
        gridHtml += `<div class="playback-indicator"></div>`;
        
        // Loop through each instrument and add its parts directly to the grid
        instruments.forEach(instrumentSymbol => {
            // Instrument Header
            gridHtml += `<div class="instrument-header">${instrumentSymbol}</div>`;

            const noteString = measure[instrumentSymbol].replace(/\|/g, '');
            
            // Grid Cells for this instrument
            for (let i = 0; i < resolution; i++) {
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
                gridHtml += `<div class="grid-cell">${cellContent}</div>`;
            }
        });

        gridHtml += `</div>`;
        this.container.innerHTML = gridHtml;
        this.indicator = this.container.querySelector('.playback-indicator');
        this.updatePlaybackIndicator(0); // Set initial position
    }

    updatePlaybackIndicator(tick) {
        if (!this.indicator) return;
        // The grid columns start at 1. The first column is the header (col 1), so ticks start at column 2.
        this.indicator.style.gridColumn = tick + 2;
    }
}