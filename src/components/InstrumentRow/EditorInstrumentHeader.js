// file: src/components/InstrumentRow/EditorInstrumentHeader.js

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            height: 100%;
        }
        .header-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
            padding: 0.5rem;
            box-sizing: border-box;
            background-color: var(--header-bg, #f8f9fa);
            cursor: pointer;
            user-select: none;
            border: 2px solid transparent;
        }
        .header-container:hover {
            border-color: #007bff;
        }
        .instrument-name {
            font-weight: bold;
            font-size: 0.9rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .pack-name {
            font-size: 0.75rem;
            color: #6c757d;
        }
    </style>
    <div class="header-container">
        <div class="instrument-name"></div>
        <div class="pack-name"></div>
    </div>
`;

export class EditorInstrumentHeader extends HTMLElement {
    #instrumentData = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.addEventListener('click', this.#handleClick);
    }
    
    set instrument(data) {
        if (!data) return;
        this.#instrumentData = data;
        this.shadowRoot.querySelector('.instrument-name').textContent = data.name || 'Unnamed';
        this.shadowRoot.querySelector('.pack-name').textContent = data.pack || 'Default';
    }

    #handleClick() {
        if (!this.#instrumentData) return;
        
        this.dispatchEvent(new CustomEvent('edit-instrument-requested', {
            detail: { instrumentId: this.#instrumentData.id },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('editor-instrument-header', EditorInstrumentHeader);