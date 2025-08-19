// file: harnesses/PatternEditor/PatternEditor.js

import { InstrumentRowView } from '/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.js';
import { EditorCursor } from '/percussion-studio/src/components/EditorCursor/EditorCursor.js';
import { RadialSoundSelector } from '/percussion-studio/src/components/RadialSoundSelector/RadialSoundSelector.js';
import { InstrumentSelectionModalView } from '/percussion-studio/src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

/**
 * Acts as the main controller for the pattern editor.
 * It owns the state and orchestrates all the child components and services.
 */
export class PatternEditor {
    constructor(container, modalContainer) {
        this.container = container;
        this.modalContainer = modalContainer;

        // --- 1. State Management ---
        // This is the single source of truth for the entire editor.
        this.state = this._getInitialState();

        // --- 2. Service Instantiation ---
        // The editor owns a single instance of each global UI service.
        this.cursor = new EditorCursor();
        this.radialMenu = new RadialSoundSelector({
            onSoundSelected: this._handleSoundSelected.bind(this)
        });
        this.instrumentModal = new InstrumentSelectionModalView(this.modalContainer, {
            onInstrumentSelected: this._handleInstrumentSelected.bind(this),
            onCancel: () => logEvent('info', 'PatternEditor', 'onCancel', 'Events', 'Instrument selection cancelled.')
        });

        // --- 3. Initial Render ---
        this.render();
    }

    // --- 4. Callback Handlers (Events coming UP from children) ---

    _handleRequestInstrumentChange(symbol) {
        logEvent('info', 'PatternEditor', '_handleRequestInstrumentChange', 'Events', `Request to change instrument for ${symbol}`);
        this.instrumentModal.show({
            instrumentDefs: this.state.manifest.instrumentDefs,
            soundPacks: this.state.manifest.soundPacks
        });
    }

    _handleInstrumentSelected(selection) {
        logEvent('info', 'PatternEditor', '_handleInstrumentSelected', 'State', 'New instrument confirmed', selection);
        // In a real app, you would update the state here to load the new instrument.
        // For this demo, we just log it.
    }

    _handleCellMouseDown(tickIndex, event, instrument) {
        logEvent('info', 'PatternEditor', '_handleCellMouseDown', 'Events', `Cell mouse down at index ${tickIndex}`);
        this.radialMenu.activeInstrumentSymbol = instrument.symbol; // Store context
        this.radialMenu.show({
            x: event.clientX,
            y: event.clientY,
            sounds: instrument.sounds,
            activeSoundLetter: this.state.activeSounds[instrument.symbol]
        });
    }

    _handleSoundSelected(selectedLetter) {
        const symbol = this.radialMenu.activeInstrumentSymbol;
        logEvent('info', 'PatternEditor', '_handleSoundSelected', 'State', `New active sound for ${symbol}: ${selectedLetter}`);
        this.state.activeSounds[symbol] = selectedLetter;
        this.radialMenu.hide();
        // No full re-render needed, but in a real app you might update the header
        // to show the newly active sound.
    }

    _handleGridMouseEnter(instrument) {
        const activeLetter = this.state.activeSounds[instrument.symbol];
        const sound = instrument.sounds.find(s => s.letter === activeLetter);
        this.cursor.update({ isVisible: true, svg: sound?.svg });
    }

    _handleGridMouseLeave() {
        this.cursor.update({ isVisible: false, svg: null });
    }

    // --- 5. Render Method ---

    render() {
        this.container.innerHTML = '';
        
        this.state.instruments.forEach(inst => {
            const rowContainer = document.createElement('div');
            this.container.appendChild(rowContainer);

            const view = new InstrumentRowView(rowContainer, {
                onRequestInstrumentChange: (symbol) => this._handleRequestInstrumentChange(symbol),
                onCellMouseDown: (tickIndex, event) => this._handleCellMouseDown(tickIndex, event, inst),
                onGridMouseEnter: (instrument) => this._handleGridMouseEnter(instrument),
                onGridMouseLeave: () => this._handleGridMouseLeave()
            });

            const totalCells = (this.state.metrics.beatsPerMeasure / this.state.metrics.beatUnit) * this.state.metrics.subdivision;
            let densityClass = 'density-medium';
            if (totalCells <= 8) densityClass = 'density-low';
            if (totalCells > 20) densityClass = 'density-high';

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