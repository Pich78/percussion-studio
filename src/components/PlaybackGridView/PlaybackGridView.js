// file: src/components/PlaybackGridView/PlaybackGridView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { TubsGridRenderer } from '/percussion-studio/lib/TubsGridRenderer/TubsGridRenderer.js';

export class PlaybackGridView {
    constructor(container) {
        this.container = container;
        this.playbackIndicatorEl = null;
        this.gridContainer = null;

        loadCSS('/percussion-studio/src/components/PlaybackGridView/PlaybackGridView.css');
        logEvent('info', 'PlaybackGridView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render(state) {
        logEvent('debug', 'PlaybackGridView', 'render', 'State', 'Rendering with state:', state);
        const { currentPattern, resolvedInstruments, playbackPosition, isPlaying } = state;

        this.container.innerHTML = ''; // Clear previous content

        if (!currentPattern || !currentPattern.pattern_data || !resolvedInstruments) {
            this.container.innerHTML = `<div class="f5 gray i tc pa4">No pattern loaded.</div>`;
            this.gridContainer = null;
            this.playbackIndicatorEl = null;
            return;
        }

        // Main grid container with relative positioning for the indicator
        this.gridContainer = document.createElement('div');
        this.gridContainer.className = 'playback-grid-view-container';
        
        // Use TubsGridRenderer to build the grid
        currentPattern.pattern_data.forEach((measureData, measureIndex) => {
            const measureEl = TubsGridRenderer.createMeasureContainer();
            measureEl.dataset.measureIndex = measureIndex;
            
            const measureHeader = TubsGridRenderer.createMeasureHeader(currentPattern.metadata);
            measureEl.appendChild(measureHeader);

            const instrumentSymbols = Object.keys(measureData);
            instrumentSymbols.forEach(symbol => {
                const instrument = resolvedInstruments[symbol];
                if (!instrument) {
                    logEvent('warn', 'PlaybackGridView', 'render', 'Data', `Instrument with symbol "${symbol}" not found in resolvedInstruments.`);
                    return; // Skip rendering this row if instrument data is missing
                }

                const notation = measureData[symbol].replace(/\|/g, ''); // Remove pipes for easier processing
                const rowEl = TubsGridRenderer.createInstrumentRow(symbol);
                rowEl.appendChild(TubsGridRenderer.createInstrumentHeader(instrument.name));

                for (let i = 0; i < notation.length; i++) {
                    const cellEl = TubsGridRenderer.createGridCell(i);
                    const soundLetter = notation.charAt(i);

                    if (soundLetter !== '-') {
                        const sound = instrument.sounds.find(s => s.letter === soundLetter);
                        if (sound && sound.svg) {
                            cellEl.appendChild(TubsGridRenderer.createNoteElement(sound.svg, sound.letter));
                        }
                    }
                    rowEl.appendChild(cellEl);
                }
                measureEl.appendChild(rowEl);
            });
            this.gridContainer.appendChild(measureEl);
        });

        // Create and append the playback indicator
        this.playbackIndicatorEl = document.createElement('div');
        this.playbackIndicatorEl.className = 'playback-indicator';
        this.gridContainer.appendChild(this.playbackIndicatorEl);

        this.container.appendChild(this.gridContainer);

        this.updatePlaybackIndicator(playbackPosition, isPlaying);
    }

    updatePlaybackIndicator(position, isPlaying) {
        if (!this.playbackIndicatorEl || !this.gridContainer) return;

        // On stop (isPlaying is false and position is at the start or null)
        if (!isPlaying && (!position || (position.currentMeasureIndex === 0 && position.currentTickIndex === 0))) {
            this.playbackIndicatorEl.style.display = 'none';
            this.playbackIndicatorEl.style.left = '0px';
            return;
        }

        if (!position) return;

        // Find the correct measure and cell
        const targetMeasureEl = this.gridContainer.querySelector(`.measure-container[data-measure-index="${position.currentMeasureIndex}"]`);
        if (!targetMeasureEl) return;

        const firstRow = targetMeasureEl.querySelector('.instrument-row');
        if (!firstRow) return;

        const targetCell = firstRow.querySelector(`.grid-cell[data-tick-index="${position.currentTickIndex}"]`);
        if (!targetCell) return;

        // Calculate position and size relative to the grid container
        const gridRect = this.gridContainer.getBoundingClientRect();
        const cellRect = targetCell.getBoundingClientRect();
        const left = cellRect.left - gridRect.left;
        const width = cellRect.width; // Get the dynamic width of the cell

        this.playbackIndicatorEl.style.left = `${left}px`;
        this.playbackIndicatorEl.style.width = `${width}px`; // Set the width dynamically
        this.playbackIndicatorEl.style.display = 'block';
    }
}