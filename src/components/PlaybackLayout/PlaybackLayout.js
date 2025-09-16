// file: src/components/PlaybackLayout/PlaybackLayout.js

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            height: 100%; /* Fill the height of its parent container */
            width: 100%;
        }

        .playback-layout {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }

        .playback-layout__top-area {
            flex-shrink: 0; /* Prevent the top area from shrinking */
            border-bottom: 1px solid #dee2e6; /* A subtle separator */
        }
        
        .playback-layout__bottom-area {
            flex-grow: 1; /* Allow the bottom area to take all available space */
            overflow-y: auto; /* Allow content to scroll if it overflows */
            position: relative;
        }
    </style>
    <div class="playback-layout">
        <header class="playback-layout__top-area">
            <slot name="top"></slot>
        </header>
        <main class="playback-layout__bottom-area">
            <slot name="bottom"></slot>
        </main>
    </div>
`;

export class PlaybackLayout extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define('playback-layout', PlaybackLayout);