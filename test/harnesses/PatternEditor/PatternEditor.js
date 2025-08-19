// file: harnesses/PatternEditor/PatternEditor.js

import { InstrumentRowView } from '/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.js';
import { EditorCursor } from '/percussion-studio/src/components/EditorCursor/EditorCursor.js';
import { RadialSoundSelector } from '/percussion-studio/src/components/RadialSoundSelector/RadialSoundSelector.js';
import { InstrumentSelectionModalView } from '/percussion-studio/src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

const HOLD_DURATION_MS = 200;

/**
 * Acts as the main controller for the pattern editor.
 * It owns the state and orchestrates all the child components and services.
 */
export class PatternEditor {
    constructor(container, modalContainer) {
        this.container = container;
        this.modalContainer = modalContainer;

        // 1. State Management
        this.state = this._getInitialState();

        // 2. Service Instantiation
        this.cursor = new EditorCursor();
        this.radialMenu = new RadialSoundSelector({
            onSoundSelected: this._handleSoundSelected.bind(this)
        });
        this.instrumentModal = new InstrumentSelectionModalView(this.modalContainer, {
            onInstrumentSelected: this._handleInstrumentSelected.bind(this),
            onCancel: () => logEvent('info', 'PatternEditor', 'onCancel', 'Events', 'Instrument selection cancelled.')
        });

        // 3. Interaction State
        this.holdTimeout = null;
        this.mouseDownInfo = null;
        
        // Global listener to always hide the menu on a final mouseup
        window.addEventListener('mouseup', () => {
            if (this.radialMenu.isDragging) {
                this.radialMenu.hide();
            }
        }, true);

        // 4. Initial Render
        this.render();
    }

    // --- Callback Handlers (Events coming UP from children) ---

    _handleCellMouseDown(tickIndex, event, hasNote, instrument) {
        this.mouseDownInfo = { tickIndex, hasNote, instrument };
        
        this.holdTimeout = setTimeout(() => {
            logEvent('info', 'PatternEditor', '_handleCellMouseDown', 'Events', `Hold detected at index ${tickIndex}`);
            this.holdTimeout = null; // Mark as fired
            this.radialMenu.activeInstrumentSymbol = instrument.symbol;
            this.radialMenu.show({
                x: event.clientX,
                y: event.clientY,
                sounds: instrument.sounds,
                activeSoundLetter: this.state.activeSounds[instrument.symbol]
            });
        }, HOLD_DURATION_MS);
    }

    _handleCellMouseUp() {
        if (this.holdTimeout) {
            clearTimeout(this.holdTimeout);
            logEvent('info', 'PatternEditor', '_handleCellMouseUp', 'Events', `Tap detected at index ${this.mouseDownInfo.tickIndex}`);
            
            const { tickIndex, hasNote, instrument } = this.mouseDownInfo;
            const chars = this.state.pattern[instrument.symbol].replace(/\|/g, '').split('');

            if (hasNote) {
                // Action: Delete the note
                chars[tickIndex] = '-';
            } else {
                // Action: Add a new note
                chars[tickIndex] = this.state.activeSounds[instrument.symbol];
            }
            this.state.pattern[instrument.symbol] = `||${chars.join('')}||`;
            this.render(); // Re-render the UI to show the note change
        }
        // If holdTimeout is null, it means the hold action already fired and the radial menu is active, so do nothing.
    }

    _handleRequestInstrumentChange(symbol) {
        logEvent('info', 'PatternEditor', '_handleRequestInstrumentChange', 'Events', `Request to change instrument for ${symbol}`);
        this.instrumentModal.show({
            instrumentDefs: this.state.manifest.instrumentDefs,
            soundPacks: this.state.manifest.soundPacks
        });
    }

    _handleInstrumentSelected(selection) {
        logEvent('info', 'PatternEditor', '_handleInstrumentSelected', 'State', 'New instrument confirmed', selection);
        // In a real application, you would update the state here to load the new instrument data.
        // For this demonstration, we just log the selection.
    }

    _handleSoundSelected(selectedLetter) {
        const symbol = this.radialMenu.activeInstrumentSymbol;
        logEvent('info', 'PatternEditor', '_handleSoundSelected', 'State', `New active sound for ${symbol}: ${selectedLetter}`);
        this.state.activeSounds[symbol] = selectedLetter;
        // The menu is automatically hidden by the global mouseup listener, so no need to call hide() here.
        // We could re-render if the header needed to be updated to show the newly active sound.
    }

    _handleGridMouseEnter(instrument) {
        const activeLetter = this.state.activeSounds[instrument.symbol];
        const sound = instrument.sounds.find(s => s.letter === activeLetter);
        this.cursor.update({ isVisible: true, svg: sound?.svg });
    }

    _handleGridMouseLeave() {
        this.cursor.update({ isVisible: false, svg: null });
    }

    // --- Render Method ---

    render() {
        this.container.innerHTML = '';
        
        this.state.instruments.forEach(inst => {
            const rowContainer = document.createElement('div');
            this.container.appendChild(rowContainer);

            const view = new InstrumentRowView(rowContainer, {
                onRequestInstrumentChange: (symbol) => this._handleRequestInstrumentChange(symbol),
                onCellMouseDown: (tickIndex, event, hasNote) => this._handleCellMouseDown(tickIndex, event, hasNote, inst),
                onCellMouseUp: () => this._handleCellMouseUp(),
                onGridMouseEnter: (instrument) => this._handleGridMouseEnter(instrument),
                onGridMouseLeave: () => this._handleGridMouseLeave()
            });

            const totalCells = (this.state.metrics.beatsPerMeasure / this.state.metrics.beatUnit) * this.state.metrics.subdivision;
            let densityClass = 'density-medium';
            if (totalCells <= 8) {
                densityClass = 'density-low';
            } else if (totalCells > 20) {
                densityClass = 'density-high';
            }

            view.render({
                instrument: inst,
                notation: this.state.pattern[inst.symbol],
                metrics: this.state.metrics,
                densityClass: densityClass
            });
        });
    }

    _getInitialState() {
        const svg1 = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="8" fill="none"/></svg>';
        const svg2 = '<svg viewBox="0 0 100 100"><line x1="10" y1="10" x2="90" y2="90" stroke="black" stroke-width="8"/><line x1="10" y1="90" x2="90" y2="10" stroke="black" stroke-width="8"/></svg>';
        const svg3 = '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" stroke="black" stroke-width="8" fill="none"/></svg>';
        
        return {
            instruments: [
                { symbol: 'KCK', name: 'Kick Drum (2 Sounds)', sounds: [{letter: 'o', svg: svg1}, {letter: 'p', svg: svg2}] },
                { symbol: 'SNR', name: 'Snare (3 Sounds)', sounds: [{letter: 'x', svg: svg2}, {letter: 'r', svg: svg1}, {letter: 's', svg: svg3}] },
                { symbol: 'HHC', name: 'Hi-Hat (1 Sound)', sounds: [{letter: 'c', svg: svg2}] },
            ],
            pattern: {
                KCK: '||o-p-o-p-o-p-o-p-||',
                SNR: '||----x---r---s---||',
                HHC: '||c-c-c-c-c-c-c-c-||',
            },
            activeSounds: { KCK: 'o', SNR: 'x', HHC: 'c' },
            metrics: { beatsPerMeasure: 4, beatUnit: 4, subdivision: 16, grouping: 4 },
            manifest: { // Data for the instrument selection modal
                instrumentDefs: [{ symbol: 'KCK', name: 'Kick' }, { symbol: 'SNR', name: 'Snare' }],
                soundPacks: [{ symbol: 'KCK', pack_name: 'kick_1', name: 'Acoustic Kick' }, { symbol: 'SNR', pack_name: 'snare_1', name: 'Rock Snare' }]
            }
        };
    }
}