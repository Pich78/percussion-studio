// file: src/components/RowLayout/RowLayout.js

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            height: 100%;
            width: 100%;
        }

        .row-layout {
            display: flex;
            flex-direction: row;
            align-items: stretch;
            height: 100%;
            width: 100%;
        }

        .row-layout__header-area {
            flex-shrink: 0;
            flex-grow: 0;
            /* Default width, can be overridden by the header-width attribute */
            width: 10rem; 
        }
        
        .row-layout__grid-area {
            flex-grow: 1;
            min-width: 0; 
        }
    </style>
    <div class="row-layout">
        <div class="row-layout__header-area">
            <slot name="header"></slot>
        </div>
        <div class="row-layout__grid-area">
            <slot name="grid"></slot>
        </div>
    </div>
`;

export class RowLayout extends HTMLElement {
    /** @private */
    #headerArea;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        // Store a private reference to the internal element for efficiency
        this.#headerArea = this.shadowRoot.querySelector('.row-layout__header-area');
    }

    /**
     * Specifies which attributes to observe for changes.
     * @returns {string[]} An array of attribute names.
     */
    static get observedAttributes() {
        return ['header-width'];
    }

    /**
     * Called when an observed attribute has been added, removed, or changed.
     * @param {string} name - The name of the attribute that changed.
     * @param {string|null} oldValue - The attribute's old value.
     * @param {string|null} newValue - The attribute's new value.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'header-width' && oldValue !== newValue) {
            this.#setHeaderWidth(newValue);
        }
    }

    /**
     * Private method to apply the width style to the header element.
     * @param {string|null} widthValue - The CSS width value (e.g., '150px', '25%').
     */
    #setHeaderWidth(widthValue) {
        if (this.#headerArea) {
            // If the attribute is removed (newValue is null), it will revert to the default CSS.
            // Otherwise, it sets the specified width.
            this.#headerArea.style.width = widthValue || '';
        }
    }
}

customElements.define('row-layout', RowLayout);