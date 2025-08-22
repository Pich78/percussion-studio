// file: src/components/PlaybackRowView/PlaybackRowView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentMixerView } from '../InstrumentMixerView/InstrumentMixerView.js';

export class PlaybackRowView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};

        loadCSS('/percussion-studio/src/components/PlaybackRowView/PlaybackRowView.css');
        logEvent('debug', 'PlaybackRowView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render(props) {
        const { instrument, notation, metrics, densityClass, id, volume, muted } = props;
        logEvent('debug', 'PlaybackRowView', 'render', 'State', `Rendering row for ${instrument.symbol} (id: ${id})`);

        // Create a new root element for the component in memory
        const rowEl = document.createElement('div');
        rowEl.className = `playback-row-view ${densityClass}`;

        // --- PART 1: The Mixer ---
        // Create a container for the mixer and instantiate it
        const mixerContainerEl = document.createElement('div');
        mixerContainerEl.className = 'playback-row-mixer';
        
        const mixer = new InstrumentMixerView(mixerContainerEl, {
            onVolumeChange: (instrumentId, vol) => this.callbacks.onVolumeChange?.(instrumentId, vol),
            onToggleMute: (instrumentId) => this.callbacks.onToggleMute?.(instrumentId),
        });
        mixer.render({ id, name: instrument.name, volume, muted });


        // --- PART 2: The Grid (Adapted from InstrumentRowView) ---
        const gridEl = document.createElement('div');
        gridEl.className = 'playback-row-grid';
        gridEl.addEventListener('mouseenter', () => this.callbacks.onGridMouseEnter?.(instrument));
        gridEl.addEventListener('mouseleave', () => this.callbacks.onGridMouseLeave?.());

        const totalCells = (metrics.beatsPerMeasure / metrics.beatUnit) * metrics.subdivision;
        const notationChars = notation.replace(/\|/g, '');

        for (let i = 0; i < totalCells; i++) {
            const cellEl = document.createElement('div');
            cellEl.className = 'grid-cell';
            cellEl.dataset.tickIndex = i;

            if ((i % metrics.grouping) === 0) {
                cellEl.classList.add('highlighted-beat');
            } else if (metrics.subdivision >= 32) {
                const sixteenthGrouping = metrics.grouping / 2;
                if ((i % sixteenthGrouping) === 0) {
                    cellEl.classList.add('sub-beat-line');
                }
            }

            const soundLetter = notationChars[i];
            const hasNote = soundLetter && soundLetter !== '-';
            if (hasNote) {
                const sound = instrument.sounds.find(s => s.letter === soundLetter);
                if (sound?.svg) {
                    const noteEl = document.createElement('div');
                    noteEl.className = 'note';
                    noteEl.innerHTML = sound.svg;
                    cellEl.appendChild(noteEl);
                }
            }
            
            cellEl.addEventListener('mousedown', (event) => {
                event.preventDefault();
                this.callbacks.onCellMouseDown?.(i, event, hasNote);
            });
            
            cellEl.addEventListener('mouseup', (event) => {
                this.callbacks.onCellMouseUp?.(i, event);
            });

            gridEl.appendChild(cellEl);
        }

        // Assemble the component in memory
        rowEl.appendChild(mixerContainerEl);
        rowEl.appendChild(gridEl);

        // As the final step, safely replace the container's content
        this.container.innerHTML = '';
        this.container.appendChild(rowEl);
    }
}