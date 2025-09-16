// file: src/components/AppLayout/EditorView_workbench.js

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            width: 100%;
            height: 100%;
            background-color: #dc3545;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5em;
            font-weight: bold;
        }
    </style>
    <div>WORKBENCH VIEW: Editor</div>
`;
// UPDATED: Class and custom element tag name
export class EditorViewWorkbench extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}
customElements.define('editor-view-workbench', EditorViewWorkbench);