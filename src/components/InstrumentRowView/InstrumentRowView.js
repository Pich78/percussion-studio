// file: src/components/InstrumentRowView/InstrumentRowView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class InstrumentRowView {
    constructor({ headerPanel, gridPanel }, { callbacks, HeaderComponent, GridPanelComponent, headerProps }) {
        const [Time, ClassName, MethodName, Feature] = [performance.now(), 'InstrumentRowView', 'constructor', 'Lifecycle'];
        
        if (!HeaderComponent || !GridPanelComponent || !headerPanel || !gridPanel) {
            throw new Error('InstrumentRowView requires HeaderComponent, GridPanelComponent, and panel elements.');
        }

        this.headerPanel = headerPanel;
        this.gridPanel = gridPanel;
        this.callbacks = callbacks || {};
        
        this.headerComponent = null;
        this.gridComponent = null;

        loadCSS('/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.css');
        
        // Instantiate the injected header component
        this.headerComponent = new HeaderComponent(this.headerPanel, {
            ...headerProps,
            callbacks: this.callbacks
        });
        
        // Instantiate the injected grid panel component
        this.gridComponent = new GridPanelComponent(this.gridPanel, this.callbacks);
        
        console.log(`[${Time.toFixed(2)}][${ClassName}][${MethodName}][${Feature}][Component created with injected '${HeaderComponent.name}' and '${GridPanelComponent.name}'.]`);
    }

    render({ instrument, notation, metrics, headerProps }) {
        const [Time, ClassName, MethodName, Feature] = [performance.now(), 'InstrumentRowView', 'render', 'State'];
        console.log(`[${Time.toFixed(2)}][${ClassName}][${MethodName}][${Feature}][Delegating render for ${instrument.symbol}]`);
        
        // 1. Delegate rendering to the composed header component
        this.headerComponent.render(headerProps);

        // 2. Delegate rendering to the composed grid panel component
        this.gridComponent.render({
            instrument,
            notation,
            metrics,
        });
    }

    destroy() {
        const [Time, ClassName, MethodName, Feature] = [performance.now(), 'InstrumentRowView', 'destroy', 'Lifecycle'];
        
        this.headerComponent?.destroy();
        this.gridComponent?.destroy();

        if (this.headerPanel) this.headerPanel.innerHTML = '';
        if (this.gridPanel) this.gridPanel.innerHTML = '';
        
        console.log(`[${Time.toFixed(2)}][${ClassName}][${MethodName}][${Feature}][Component destroyed.]`);
    }
}