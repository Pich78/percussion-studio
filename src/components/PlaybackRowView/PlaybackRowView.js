// file: src/components/PlaybackRowView/PlaybackRowView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentMixerView } from '../InstrumentMixerView/InstrumentMixerView.js';

export class PlaybackRowView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.isRendered = false; // --- NEW: State to track initial render
        this.mixer = null;       // --- NEW: To hold the mixer instance
        this.gridEl = null;      // --- NEW: To hold the grid DOM element

        loadCSS('/percussion-studio/src/components/PlaybackRowView/PlaybackRowView.css');
        logEvent('debug', 'PlaybackRowView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render(props) {
        logEvent('debug', 'PlaybackRowView', 'render', 'State', `Render called for ${props.instrument.symbol}`);

        if (!this.isRendered) {
            this._initialRender(props);
        } else {
            this._updateDOM(props);
        }
    }

    _initialRender(props) {
        // Create the component's root element
        const rowEl = document.createElement('div');
        rowEl.className = `playback-row-view ${props.densityClass}`;

        // --- PART 1: The Mixer ---
        const mixerContainerEl = document.createElement('div');
        mixerContainerEl.className = 'playback-row-mixer';
        
        // Create the mixer instance and store it
        this.mixer = new InstrumentMixerView(mixerContainerEl, {
            onVolumeChange: (instrumentId, vol) => this.callbacks.onVolumeChange?.(instrumentId, vol),
            onToggleMute: (instrumentId) => this.callbacks.onToggleMute?.(instrumentId),
        });
        
        // --- PART 2: The Grid ---
        this.gridEl = document.createElement('div');
        this.gridEl.className = 'playback-row-grid';
        this.gridEl.addEventListener('mouseenter', () => this.callbacks.onGridMouseEnter?.(props.instrument));
        this.gridEl.addEventListener('mouseleave', () => this.callbacks.onGridMouseLeave?.());
        
        // Assemble the component
        rowEl.appendChild(mixerContainerEl);
        rowEl.appendChild(this.gridEl);
        this.container.appendChild(rowEl);

        // Perform the first render of children and self
        this._updateDOM(props);

        this.isRendered = true;
        logEvent('debug', 'PlaybackRowView', '_initialRender', 'DOM', `Full render for ${props.instrument.symbol}.`);
    }

    _updateDOM(props) {
        const { instrument, notation, metrics, densityClass, id, volume, muted } = props;

        // --- Update Mixer ---
        this.mixer.render({ id, name: instrument.name, volume, muted });
        
        // --- Update Grid (by recreating its inner content) ---
        this.gridEl.innerHTML = ''; // Clear previous cells

        const totalCells = (metrics.beatsPerMeasure / metrics.beatUnit) * metrics.subdivision;
        const notationChars = notation.replace(/\|/g, '');

        for (let i = 0; i < totalCells; i++) {
            const cellEl = document.createElement('div');
            cellEl.className = 'grid-cell';
            cellEl.dataset.tickIndex = i;

            if ((i % metrics.grouping) === 0) cellEl.classList.add('highlighted-beat');
            else if (metrics.subdivision >= 32) {
                const sixteenthGrouping = metrics.grouping / 2;
                if ((i % sixteenthGrouping) === 0) cellEl.classList.add('sub-beat-line');
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
            
            cellEl.addEventListener('mouseup', (event) => this.callbacks.onCellMouseUp?.(i, event));

            this.gridEl.appendChild(cellEl);
        }
        
        // Update density class on the root
        this.container.firstChild.className = `playback-row-view ${densityClass}`;
        logEvent('debug', 'PlaybackRowView', '_updateDOM', 'DOM', `Targeted update for ${instrument.symbol}.`);
    }
}