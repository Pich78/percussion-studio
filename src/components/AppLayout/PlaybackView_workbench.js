// file: src/components/AppLayout/PlaybackView_workbench.js

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            width: 100%;
            height: 100%;
            background-color: #28a745;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5em;
            font-weight: bold;
        }
    </style>
    <div>WORKBENCH VIEW: Playback</div>
`;
// UPDATED: Class and custom element tag name
export class PlaybackViewWorkbench extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}
customElements.define('playback-view-workbench', PlaybackViewWorkbench);