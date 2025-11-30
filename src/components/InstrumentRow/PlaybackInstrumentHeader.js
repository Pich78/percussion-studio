// file: src/components/InstrumentRow/PlaybackInstrumentHeader.js

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
            /* Add a transition for the background color change */
            transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
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
        .volume-slider {
            width: 100%;
            margin-top: 0.25rem;
        }

        /* --- NEW: STYLES FOR THE MUTED STATE --- */
        .is-muted {
            background-color: var(--header-muted-bg, #e9ecef);
            opacity: 0.6;
        }
        .is-muted .pack-name {
            color: #adb5bd;
        }
    </style>
    <div class="header-container">
        <div class="text-info">
            <div class="instrument-name"></div>
            <div class="pack-name"></div>
        </div>
        <input type="range" class="volume-slider" min="0" max="1" step="0.01" />
    </div>
`;

export class PlaybackInstrumentHeader extends HTMLElement {
    #nameEl;
    #packEl;
    #sliderEl;
    #containerEl;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.#nameEl = this.shadowRoot.querySelector('.instrument-name');
        this.#packEl = this.shadowRoot.querySelector('.pack-name');
        this.#sliderEl = this.shadowRoot.querySelector('.volume-slider');
        this.#containerEl = this.shadowRoot.querySelector('.header-container');
        
        this.#addEventListeners();
    }

    /**
     * [PUBLIC API] Sets the instrument data and updates the view.
     * This now includes the logic to apply the 'is-muted' class.
     */
    set instrument(data) {
        if (!data) return;
        this.#nameEl.textContent = data.name || 'Unnamed';
        this.#packEl.textContent = data.pack || 'Default';
        
        const volume = data.volume ?? 0.8;
        this.#sliderEl.value = volume;

        // --- NEW: LOGIC TO APPLY THE MUTED VISUAL STATE ---
        // If volume is 0, apply the 'is-muted' class. Otherwise, remove it.
        if (volume === 0) {
            this.#containerEl.classList.add('is-muted');
        } else {
            this.#containerEl.classList.remove('is-muted');
        }
    }

    #addEventListeners() {
        this.#sliderEl.addEventListener('click', (e) => e.stopPropagation());
        
        this.#sliderEl.addEventListener('input', () => {
            this.dispatchEvent(new CustomEvent('volume-changed', {
                detail: { volume: parseFloat(this.#sliderEl.value) },
                bubbles: true,
                composed: true
            }));
        });
        
        const textInfo = this.shadowRoot.querySelector('.text-info');
        textInfo.addEventListener('click', () => {
             this.dispatchEvent(new CustomEvent('mute-toggled', {
                bubbles: true,
                composed: true
            }));
        });
    }
}

customElements.define('playback-instrument-header', PlaybackInstrumentHeader);