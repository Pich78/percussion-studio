// file: src/components/RowLayout/RowLayout.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

/**
 * A layout component that creates a two-column row.
 * - A fixed-width header area on the left.
 * - A flexible grid area on the right.
 * It exposes the container elements for these areas as public properties.
 */
export class RowLayout {
    /**
     * @param {HTMLElement} container - The DOM element to render the layout into.
     */
    constructor(container) {
        logEvent('debug', 'RowLayout', 'constructor', 'Lifecycle', 'Creating RowLayout component.');
        this.container = container;

        /** @type {HTMLElement|null} The container element for the header component. */
        this.headerArea = null;
        /** @type {HTMLElement|null} The container element for the grid component. */
        this.gridArea = null;

        loadCSS('/percussion-studio/src/components/RowLayout/RowLayout.css');
        this._render();
    }

    /**
     * Creates the component's DOM structure and assigns area properties.
     * @private
     */
    _render() {
        this.container.innerHTML = `
            <div class="row-layout">
                <div class="row-layout__header-area"></div>
                <div class="row-layout__grid-area"></div>
            </div>
        `;
        this.headerArea = this.container.querySelector('.row-layout__header-area');
        this.gridArea = this.container.querySelector('.row-layout__grid-area');
        logEvent('debug', 'RowLayout', '_render', 'DOM', 'RowLayout DOM structure created and areas assigned.');
    }

    /**
     * Clears the component's content from the container.
     */
    destroy() {
        this.container.innerHTML = '';
        logEvent('debug', 'RowLayout', 'destroy', 'Lifecycle', 'RowLayout component destroyed.');
    }
}