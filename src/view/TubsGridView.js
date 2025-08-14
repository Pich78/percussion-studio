// file: src/view/TubsGridView.js (Complete, Corrected Version)

export class TubsGridView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {};
    }

    render(state) {
        this.state = state;

        const { currentPatternId, rhythm } = this.state;
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
        gridHtml += `<div class="playback-indicator"></div>`;
        
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
        this.container.innerHTML = html;
        this.indicator = this.container.querySelector('.playback-indicator');
        this.updatePlaybackIndicator(0);
    }

    updatePlaybackIndicator(tick) {
        if (!this.indicator || !this.state.rhythm) return;

        const pattern = this.state.rhythm.patterns?.[this.state.currentPatternId];
        if (!pattern) return;

        const resolution = pattern.metadata.resolution || 16;
        const multiplier = tick / resolution;

        this.indicator.style.left = `calc(80px + (100% - 80px) * ${multiplier})`;
        this.indicator.style.width = `calc((100% - 80px) / ${resolution})`;
    }
}