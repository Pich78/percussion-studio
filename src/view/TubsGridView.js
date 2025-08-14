// file: src/view/TubsGridView.js (Final Corrected Version)

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

        // The indicator is a direct child. CSS will position it.
        gridHtml += `<div class="playback-indicator"></div>`;
        
        // Let the elements flow into the grid naturally.
        instruments.forEach(instrumentSymbol => {
            gridHtml += `<div class="instrument-header">${instrumentSymbol}</div>`;
            const noteString = measure[instrumentSymbol].replace(/\|/g, '');
            
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
        // We now position the indicator using left percentage, which is more robust
        // for absolutely positioned elements than changing grid-column.
        const percentage = (tick / (this.rhythm.patterns[this.rhythm.currentPatternId]?.metadata.resolution || 16)) * 100;
        this.indicator.style.left = `calc(80px + ${percentage}%)`; // Offset by header width
    }
}