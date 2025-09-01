// file: src/components/MeasureEditorView/MeasureEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { METRICS_CONFIG } from '/percussion-studio/src/config/MetricsConfiguration.js';
import { MeasureLayoutView as DefaultMeasureLayoutView } from '/percussion-studio/src/components/MeasureLayoutView/MeasureLayoutView.js';
import { EditorRowHeaderView } from '/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.js';

export class MeasureEditorView {
    static nextTrackId = 1;
    static generateTrackId() { return `track-${MeasureEditorView.nextTrackId++}`; }

    constructor(container, { soundPacks, callbacks, initialInstruments }, dependencies = {}) {
        this.container = container;
        this.callbacks = callbacks || {}; 
        this.soundPacks = soundPacks || [];
        this.layoutView = null;

        this.MeasureLayoutView = dependencies.MeasureLayoutView || DefaultMeasureLayoutView;
        
        this.state = {
            instruments: initialInstruments || [],
            rhythmKey: Object.keys(METRICS_CONFIG)[0],
            subdivisionKey: Object.keys(METRICS_CONFIG[Object.keys(METRICS_CONFIG)[0]].subdivisions)[0],
        };

        loadCSS('/percussion-studio/src/components/MeasureEditorView/MeasureEditorView.css');
        
        this._boundHandleClick = this._handleClick.bind(this);
        this.container.addEventListener('click', this._boundHandleClick);
        this._boundHandleMetricsChange = this._handleMetricsChange.bind(this);
        this.container.addEventListener('change', this._boundHandleMetricsChange);

        this.render();
        logEvent('info', 'MeasureEditorView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render() {
        this.container.innerHTML = '';
        this.container.className = 'measure-editor-view';

        this.container.appendChild(this._renderHeaderControls());
        
        const layoutHost = document.createElement('div');
        this.container.appendChild(layoutHost);
        
        if (this.layoutView) {
            this.layoutView.destroy();
        }
        this.layoutView = new this.MeasureLayoutView(layoutHost, this.callbacks);

        const currentConfig = METRICS_CONFIG[this.state.rhythmKey]?.subdivisions?.[this.state.subdivisionKey];
        if (!currentConfig) {
            logEvent('error', 'MeasureEditorView', 'render', 'State', 'Could not find config for current rhythm selection.');
            return;
        }

        this.layoutView.render({
            groupingPattern: currentConfig.groupingPattern,
            metrics: currentConfig,
            instruments: this.state.instruments,
            HeaderComponent: EditorRowHeaderView,
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'add-instrument-btn';
        addBtn.textContent = '+ Add Instrument';
        this.container.appendChild(addBtn);
    }

    _renderHeaderControls() {
        const header = document.createElement('div');
        header.className = 'measure-editor-header';

        let optionsHtml = '';
        for (const timeSigKey in METRICS_CONFIG) {
            const timeSigConfig = METRICS_CONFIG[timeSigKey];
            for (const subKey in timeSigConfig.subdivisions) {
                const subConfig = timeSigConfig.subdivisions[subKey];
                const value = `${timeSigKey}|${subKey}`;
                const isSelected = this.state.rhythmKey === timeSigKey && this.state.subdivisionKey === subKey;
                optionsHtml += `<option value="${value}" ${isSelected ? 'selected' : ''}>${timeSigConfig.label}, ${subConfig.label}</option>`;
            }
        }

        header.innerHTML = `
            <div>
                <label class="f6 b db mb2">Rhythm Configuration</label>
                <select data-control="rhythm-select">${optionsHtml}</select>
            </div>
        `;
        return header;
    }

    _handleMetricsChange(event) {
        const target = event.target;
        if (target.dataset.control !== 'rhythm-select') return;

        const [rhythmKey, subdivisionKey] = target.value.split('|');
        this.state.rhythmKey = rhythmKey;
        this.state.subdivisionKey = subdivisionKey;
        
        const newConfig = METRICS_CONFIG[rhythmKey].subdivisions[subdivisionKey];
        logEvent('info', 'MeasureEditorView', '_handleMetricsChange', 'State', 'Metrics changed', newConfig);

        this.state.instruments.forEach(inst => {
            const currentPattern = inst.pattern.replace(/\|/g, '');
            let newPattern = currentPattern.slice(0, newConfig.totalBoxes);
            if (newPattern.length < newConfig.totalBoxes) {
                newPattern += '-'.repeat(newConfig.totalBoxes - newPattern.length);
            }
            inst.pattern = newPattern;
        });

        this.render();
        this.callbacks.onMetricsChange?.(newConfig);
    }

    _handleClick(event) {
        const addBtn = event.target.closest('.add-instrument-btn');
        if (addBtn) this.callbacks.onRequestAddInstrument?.();
    }

    addInstrument(selection) {
        const soundPack = this.soundPacks.find(p => p.symbol === selection.symbol && p.pack_name === selection.packName);
        if (!soundPack) return;

        const currentConfig = METRICS_CONFIG[this.state.rhythmKey].subdivisions[this.state.subdivisionKey];
        const newInstrument = { 
            ...soundPack, 
            pattern: '-'.repeat(currentConfig.totalBoxes),
            trackId: MeasureEditorView.generateTrackId()
        };

        this.state.instruments.push(newInstrument);
        this.render();
    }
    
    getState() {
        return {
            instruments: this.state.instruments,
            metrics: METRICS_CONFIG[this.state.rhythmKey].subdivisions[this.state.subdivisionKey]
        };
    }

    destroy() {
        this.container.removeEventListener('click', this._boundHandleClick);
        this.container.removeEventListener('change', this._boundHandleMetricsChange);
        this.layoutView?.destroy();
        logEvent('info', 'MeasureEditorView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}