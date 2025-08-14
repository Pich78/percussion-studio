// file: src/view/TubsGridView.js (Complete)

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
        const measure = pattern.pattern_data[0]; // Assuming first measure for now
        const resolution = pattern.metadata.resolution || 16;
        const instruments = Object.keys(measure);

        const gridStyles = `grid-template-columns: 80px repeat(${resolution}, 1fr);`;
        let gridHtml = `<div class="grid" style="${gridStyles}">`;
        gridHtml += `<div class="playback-indicator" style="grid-row: 1 / -1; grid-column: 2;"></div>`;
        
        instruments.forEach(instrumentSymbol => {
            gridHtml += `<div class="instrument-row">`;
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
                    
                    if (instrumentId && svgFile) { // Only render if we have all info
                        const imgSrc = `/percussion-studio/data/instruments/${instrumentId}/${svgFile}`;
                        cellContent = `<img src="${imgSrc}" alt="${instrumentSymbol} note">`;
                    }
                }
                gridHtml += `<div class="grid-cell">${cellContent}</div>`;
            }
            gridHtml += `</div>`;
        });

        gridHtml += `</div>`;
        this.container.innerHTML = gridHtml;
        this.indicator = this.container.querySelector('.playback-indicator');
    }

    updatePlaybackIndicator(tick) {
        if (!this.indicator) return;
        this.indicator.style.gridColumn = tick + 2;
    }
}