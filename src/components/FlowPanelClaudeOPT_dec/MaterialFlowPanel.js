// MaterialFlowPanel.js - Main component that composes everything
import { ScrollableList } from './ScrollableList.js';
import { FlowList } from './FlowList.js';
import { PanelController } from './PanelController.js';

export class MaterialFlowPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.panelController = null;
        this.flowList = null;
    }

    static get observedAttributes() {
        return ['pinned', 'title', 'collapsed-width', 'expanded-width', 'overlap-threshold'];
    }

    connectedCallback() {
        this.render();
        this.setupControllers();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        this.teardownControllers();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === 'overlap-threshold' && this.flowList) {
                this.flowList.setOverlapThreshold(parseFloat(newValue || '0.25'));
            }
            if (name === 'pinned' && this.panelController) {
                this.panelController.pinned = this.hasAttribute('pinned');
            }
            this.render();
        }
    }

    get pinned() {
        return this.hasAttribute('pinned');
    }

    set pinned(value) {
        if (value) {
            this.setAttribute('pinned', '');
        } else {
            this.removeAttribute('pinned');
        }
    }

    get title() {
        return this.getAttribute('title') || 'Panel';
    }

    get collapsedWidth() {
        return this.getAttribute('collapsed-width') || '56px';
    }

    get expandedWidth() {
        return this.getAttribute('expanded-width') || '320px';
    }

    get overlapThreshold() {
        return parseFloat(this.getAttribute('overlap-threshold') || '0.25');
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}
            </style>
            <div class="panel" part="panel">
                <!-- Collapsed state title -->
                <div class="collapsed-title" part="collapsed-title">
                    <span class="title-text">${this.title}</span>
                </div>
                
                <!-- Expanded content -->
                <div class="panel-content" part="panel-content">
                    <!-- Header slot -->
                    <div class="header-section" part="header">
                        <slot name="header">
                            <h2 class="default-title">${this.title}</h2>
                        </slot>
                    </div>
                    
                    <!-- Flow list container -->
                    <div class="flow-container" part="flow-container">
                        <flow-list class="flow-list" part="flow-list">
                            <slot name="flow-items"></slot>
                        </flow-list>
                    </div>
                    
                    <!-- Footer slot -->
                    <div class="footer-section" part="footer">
                        <slot name="footer">
                            <button class="add-button" part="add-button">
                                <md-icon>add</md-icon>
                                <span>Add Item</span>
                            </button>
                        </slot>
                    </div>
                </div>
            </div>
        `;

        // Update flow list reference
        this.flowList = this.shadowRoot.querySelector('flow-list');
    }

    getStyles() {
        return `
            /* Material Design 3 Tokens */
            :host {
                --md-sys-color-surface: #fef7ff;
                --md-sys-color-surface-variant: #f5eff7;
                --md-sys-color-on-surface: #1d1b20;
                --md-sys-color-on-surface-variant: #49454f;
                --md-sys-color-outline: #7a757f;
                --md-sys-color-outline-variant: #cac4cf;
                --md-sys-color-primary: #6750a4;
                --md-sys-color-on-primary: #ffffff;
                --md-sys-color-secondary: #625b71;
                --md-sys-color-tertiary: #7e5260;
                --md-sys-color-error: #ba1a1a;
                
                /* Elevation tokens */
                --md-sys-elevation-level0: none;
                --md-sys-elevation-level1: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
                --md-sys-elevation-level2: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15);
                --md-sys-elevation-level3: 0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3);
                
                /* Typography tokens */
                --md-sys-typescale-title-medium-font: 'Roboto', sans-serif;
                --md-sys-typescale-title-medium-size: 16px;
                --md-sys-typescale-title-medium-weight: 500;
                --md-sys-typescale-title-medium-line-height: 24px;
                
                --md-sys-typescale-body-medium-font: 'Roboto', sans-serif;
                --md-sys-typescale-body-medium-size: 14px;
                --md-sys-typescale-body-medium-weight: 400;
                --md-sys-typescale-body-medium-line-height: 20px;
                
                /* Shape tokens */
                --md-sys-shape-corner-large: 16px;
                --md-sys-shape-corner-medium: 12px;
                --md-sys-shape-corner-small: 8px;
                --md-sys-shape-corner-extra-small: 4px;
                
                /* Motion tokens */
                --md-sys-motion-duration-short1: 50ms;
                --md-sys-motion-duration-short2: 100ms;
                --md-sys-motion-duration-short3: 150ms;
                --md-sys-motion-duration-short4: 200ms;
                --md-sys-motion-duration-medium1: 250ms;
                --md-sys-motion-duration-medium2: 300ms;
                --md-sys-motion-duration-medium3: 350ms;
                --md-sys-motion-duration-medium4: 400ms;
                
                --md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
                --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
                
                display: block;
                position: relative;
                height: 100%;
            }

            .panel {
                position: relative;
                height: 100%;
                width: ${this.collapsedWidth};
                background-color: var(--md-sys-color-surface);
                border-radius: var(--md-sys-shape-corner-large);
                border: 1px solid var(--md-sys-color-outline-variant);
                box-shadow: var(--md-sys-elevation-level1);
                transition: width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                box-sizing: border-box;
            }

            :host([pinned]) .panel,
            .panel:hover {
                width: ${this.expandedWidth};
                align-items: flex-start;
                justify-content: flex-start;
                box-shadow: var(--md-sys-elevation-level2);
            }

            /* Collapsed title styling */
            .collapsed-title {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 1;
                transition: opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard);
                writing-mode: vertical-lr;
                text-orientation: mixed;
            }

            .title-text {
                font-family: var(--md-sys-typescale-title-medium-font);
                font-size: var(--md-sys-typescale-title-medium-size);
                font-weight: var(--md-sys-typescale-title-medium-weight);
                color: var(--md-sys-color-on-surface-variant);
                letter-spacing: 0.1em;
                text-transform: uppercase;
            }

            :host([pinned]) .collapsed-title,
            .panel:hover .collapsed-title {
                opacity: 0;
                pointer-events: none;
            }

            /* Panel content */
            .panel-content {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                opacity: 0;
                visibility: hidden;
                transition: opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard),
                           visibility var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard);
                padding: 16px;
                box-sizing: border-box;
            }

            :host([pinned]) .panel-content,
            .panel:hover .panel-content {
                opacity: 1;
                visibility: visible;
            }

            /* Header section */
            .header-section {
                flex-shrink: 0;
                margin-bottom: 16px;
            }

            .default-title {
                font-family: var(--md-sys-typescale-title-medium-font);
                font-size: var(--md-sys-typescale-title-medium-size);
                font-weight: var(--md-sys-typescale-title-medium-weight);
                line-height: var(--md-sys-typescale-title-medium-line-height);
                color: var(--md-sys-color-on-surface);
                margin: 0;
                padding: 0;
            }

            /* Flow container */
            .flow-container {
                flex: 1;
                min-height: 0;
                display: flex;
                flex-direction: column;
                margin-bottom: 16px;
            }

            .flow-list {
                flex: 1;
                min-height: 0;
            }

            /* Footer section */
            .footer-section {
                flex-shrink: 0;
            }

            .add-button {
                width: 100%;
                padding: 12px 16px;
                background-color: var(--md-sys-color-primary);
                color: var(--md-sys-color-on-primary);
                border: none;
                border-radius: var(--md-sys-shape-corner-medium);
                font-family: var(--md-sys-typescale-body-medium-font);
                font-size: var(--md-sys-typescale-body-medium-size);
                font-weight: var(--md-sys-typescale-body-medium-weight);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: background-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard),
                           box-shadow var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
                box-shadow: var(--md-sys-elevation-level1);
            }

            .add-button:hover {
                background-color: color-mix(in srgb, var(--md-sys-color-primary) 90%, transparent);
                box-shadow: var(--md-sys-elevation-level2);
            }

            .add-button:active {
                background-color: color-mix(in srgb, var(--md-sys-color-primary) 80%, transparent);
                box-shadow: var(--md-sys-elevation-level1);
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .panel {
                    width: ${this.collapsedWidth};
                }
                
                :host([pinned]) .panel {
                    width: min(${this.expandedWidth}, 90vw);
                }
            }

            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .panel {
                    border-width: 2px;
                }
                
                .add-button {
                    border: 2px solid var(--md-sys-color-on-primary);
                }
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .panel,
                .panel-content,
                .collapsed-title,
                .add-button {
                    transition: none;
                }
            }

            /* Focus management */
            .panel:focus-within {
                outline: 2px solid var(--md-sys-color-primary);
                outline-offset: 2px;
            }
        `;
    }

    setupControllers() {
        // Initialize panel controller
        this.panelController = new PanelController(this, {
            collapsedWidth: this.collapsedWidth,
            expandedWidth: this.expandedWidth
        });

        // Set initial pinned state
        this.panelController.pinned = this.pinned;
    }

    teardownControllers() {
        if (this.panelController) {
            this.panelController.destroy();
            this.panelController = null;
        }
    }

    setupEventListeners() {
        // Handle add button clicks
        this.addEventListener('click', (event) => {
            const addButton = event.target.closest('[part="add-button"]');
            if (addButton) {
                this.dispatchEvent(new CustomEvent('add-item', {
                    bubbles: true
                }));
            }
        });

        // Forward drag events from flow list
        if (this.flowList) {
            ['drag-start', 'drag-collision', 'drag-end', 'item-reorder'].forEach(eventType => {
                this.flowList.addEventListener(eventType, (event) => {
                    this.dispatchEvent(new CustomEvent(eventType, {
                        detail: event.detail,
                        bubbles: true
                    }));
                });
            });
        }

        // Forward pin change events from panel controller
        this.addEventListener('pin-change', (event) => {
            // Event is already bubbling, just pass it through
        });
    }

    // Public API methods
    addItem(element) {
        element.slot = 'flow-items';
        this.appendChild(element);
    }

    removeItem(index) {
        if (this.flowList) {
            this.flowList.removeItem(index);
        }
    }

    getItems() {
        return this.flowList ? this.flowList.getItems() : [];
    }

    setOverlapThreshold(threshold) {
        const clampedThreshold = Math.max(0.1, Math.min(0.9, threshold));
        this.setAttribute('overlap-threshold', clampedThreshold.toString());
    }

    // Getter for current drag state (useful for debugging)
    get currentDragState() {
        return this.flowList ? this.flowList.getCurrentDragState() : null;
    }
}

// Register the custom element
customElements.define('material-flow-panel', MaterialFlowPanel);