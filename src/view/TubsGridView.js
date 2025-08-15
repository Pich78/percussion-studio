// file: src/view/TubsGridView.js (Complete, with Verbose Logging)

export class TubsGridView {
    constructor(container, callbacks) {
    console.log('[TubsGridView] constructor called.');
    this.container = container;
    this.callbacks = callbacks || {};
    this.state = {};
    this.lastRenderedPatternId = null;
    this.lastRenderedMeasureIndex = null;

    // Use event delegation for better performance
        this.container.addEventListener('click', this.handleGridClick.bind(this));
    }

    handleGridClick(event) {
        const header = event.target.closest('.instrument-header');
        if (header && this.callbacks.onToggleMute) {
            const instrumentSymbol = header.dataset.symbol;
            console.log(`[TubsGridView] Instrument header clicked for symbol: ${instrumentSymbol}. Firing onToggleMute callback.`);
            this.callbacks.onToggleMute(instrumentSymbol);
        }
    }

    render(state) {
        this.state = state;
        const { currentPatternId, currentMeasureIndex = 0, rhythm } = this.state;
        
        console.log(`[TubsGridView] render() called. Pattern: ${currentPatternId}, Measure: ${currentMeasureIndex}. Last rendered: ${this.lastRenderedPatternId}, ${this.lastRenderedMeasureIndex}`);

        if (currentPatternId === this.lastRenderedPatternId && currentMeasureIndex === this.lastRenderedMeasureIndex) {
            console.log('[TubsGridView] Skipping render: pattern and measure have not changed.');
            return;
        }

        if (!rhythm || !currentPatternId || !rhythm.patterns?.[currentPatternId]) {
            console.log('[TubsGridView] Rendering empty: No pattern available.');
            this.container.innerHTML = '<div>No pattern selected or available.</div>';
            this.lastRenderedPatternId = null;
            this.lastRenderedMeasureIndex = null;
            return;
        }

        this.lastRenderedPatternId = currentPatternId;
        this.lastRenderedMeasureIndex = currentMeasureIndex;
        console.log('[TubsGridView] Full re-render initiated for pattern:', currentPatternId, 'measure:', currentMeasureIndex);
        
        const pattern = rhythm.patterns[currentPatternId];
        
        if (!pattern.pattern_data || pattern.pattern_data.length <= currentMeasureIndex) {
            console.error(`[TubsGridView] Invalid measure index (${currentMeasureIndex}) for pattern with ${pattern.pattern_data.length} measures.`);
            this.container.innerHTML = `<div>Error: Invalid measure index.</div>`;
            return;
        }
        
        const measure = pattern.pattern_data[currentMeasureIndex];
        const resolution = pattern.metadata.resolution || 16;
        const instruments = Object.keys(measure);

        const gridStyles = `grid-template-columns: 80px repeat(${resolution}, 1fr);`;
        let gridHtml = `<div class="grid" style="${gridStyles}">`;
        gridHtml += `<div class="playback-indicator"></div>`;
        
        instruments.forEach(instrumentSymbol => {
            // Add data-symbol attribute for identifying the instrument in click events
            gridHtml += `<div class="instrument-header" data-symbol="${instrumentSymbol}">${instrumentSymbol}</div>`;
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
            // This can happen if a render hasn't occurred yet, not necessarily an error.
            // console.warn('[TubsGridView] updatePlaybackIndicator called but indicator element not found.');
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

        // console.log(`[TubsGridView] Updating indicator for tick ${tick}. Left: "${leftStyle}", Width: "${widthStyle}"`);

        this.indicator.style.left = leftStyle;
        this.indicator.style.width = widthStyle;
    }
}