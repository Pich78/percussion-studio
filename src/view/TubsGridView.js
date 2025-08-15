// file: src/view/TubsGridView.js (Complete, with Verbose Logging)

export class TubsGridView {
    constructor(container, callbacks) {
        console.log('[TubsGridView] constructor called.');
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {};
        this.lastRenderedPatternId = null;
    }

    render(state) {
        console.log('[TubsGridView] render() called. New pattern:', state.currentPatternId, 'Last pattern:', this.lastRenderedPatternId);
        this.state = state;
        const { currentPatternId, rhythm } = this.state;

        if (currentPatternId === this.lastRenderedPatternId) {
            console.log('[TubsGridView] Skipping render: pattern has not changed.');
            return;
        }

        if (!rhythm || !currentPatternId || !rhythm.patterns?.[currentPatternId]) {
            console.log('[TubsGridView] Rendering empty: No pattern available.');
            this.container.innerHTML = '<div>No pattern selected or available.</div>';
            this.lastRenderedPatternId = null;
            return;
        }

        this.lastRenderedPatternId = currentPatternId;
        console.log('[TubsGridView] Full re-render initiated for pattern:', currentPatternId);
        
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
                    const instrumentDef = rhythm.instrumentDefsBySymbol?.[instrumentSymbol];
                    const soundDef = instrumentDef?.sounds?.find(s => s.letter === noteChar);
                    const svgFile = soundDef?.svg;
                    
                    if (svgFile) {
                        const imgSrc = `/percussion-studio/data/instruments/${svgFile}`;
                        cellContent = `<img src="${imgSrc}" alt="${instrumentSymbol} note">`;
                    }
                }
                gridHtml += `<div class="grid-cell">${cellContent}</div>`;
            }
        });

        gridHtml += `</div>`;
        this.container.innerHTML = gridHtml;
        this.indicator = this.container.querySelector('.playback-indicator');
        console.log('[TubsGridView] Render complete. Initializing indicator.');
        this.updatePlaybackIndicator(0);
    }

    updatePlaybackIndicator(tick) {
        if (!this.indicator) {
            console.warn('[TubsGridView] updatePlaybackIndicator called but indicator element not found.');
            return;
        }
        if (!this.state.rhythm) {
            console.warn('[TubsGridView] updatePlaybackIndicator called but state.rhythm is missing.');
            return;
        }

        const pattern = this.state.rhythm.patterns?.[this.state.currentPatternId];
        if (!pattern) {
            console.warn('[TubsGridView] updatePlaybackIndicator called but current pattern is missing.');
            return;
        }

        const resolution = pattern.metadata.resolution || 16;
        const multiplier = tick / resolution;
        const leftStyle = `calc(80px + (100% - 80px) * ${multiplier})`;
        const widthStyle = `calc((100% - 80px) / ${resolution})`;

        console.log(`[TubsGridView] Updating indicator for tick ${tick}. Left: "${leftStyle}", Width: "${widthStyle}"`);

        this.indicator.style.left = leftStyle;
        this.indicator.style.width = widthStyle;
    }
}