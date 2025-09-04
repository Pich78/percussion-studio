// file: src/components/RowLayout/RowLayout.workbench.js

import { RowLayout } from './RowLayout.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- DOM REFERENCES ---
const wrapper = document.getElementById('layout-wrapper');
const createBtn = document.getElementById('create-btn');
const destroyBtn = document.getElementById('destroy-btn');

// --- STATE ---
let layoutInstance = null;

/**
 * Measures the dimensions of the layout areas and updates the DOM.
 * This function is designed to be called on creation and on window resize.
 */
function updateDimensions() {
    // If the component doesn't exist, do nothing.
    if (!layoutInstance?.headerArea || !layoutInstance?.gridArea) {
        return;
    }

    const headerRect = layoutInstance.headerArea.getBoundingClientRect();
    const gridRect = layoutInstance.gridArea.getBoundingClientRect();

    const headerDimsEl = document.getElementById('header-dims');
    const gridDimsEl = document.getElementById('grid-dims');

    if (headerDimsEl) {
        headerDimsEl.textContent = `W: ${headerRect.width.toFixed(1)}px, H: ${headerRect.height.toFixed(1)}px`;
    }
    if (gridDimsEl) {
        gridDimsEl.textContent = `W: ${gridRect.width.toFixed(1)}px, H: ${gridRect.height.toFixed(1)}px`;
    }
}

/**
 * Destroys any existing layout instance, removes event listeners, and clears the container.
 */
function destroyLayout() {
    if (layoutInstance) {
        logEvent('info', 'Workbench', 'destroyLayout', 'Action', 'Destroying RowLayout instance and cleaning up listeners.');
        layoutInstance.destroy();
        layoutInstance = null;
        // IMPORTANT: Clean up the event listener to prevent memory leaks
        window.removeEventListener('resize', updateDimensions);
    } else {
        logEvent('warn', 'Workbench', 'destroyLayout', 'Action', 'No layout instance to destroy.');
    }
    wrapper.innerHTML = '<p class="f6 tc gray i">Component destroyed. Click "Create" to begin.</p>';
}

/**
 * Creates a new layout instance, visualizes its areas, and sets up event listeners.
 */
function createLayout() {
    // Clean up previous instance if it exists
    if (layoutInstance) {
        destroyLayout();
    }
    wrapper.innerHTML = ''; // Clear container

    logEvent('info', 'Workbench', 'createLayout', 'Action', 'Creating new RowLayout instance.');
    layoutInstance = new RowLayout(wrapper);

    // --- VISUALIZATION & RULES LOGIC ---
    if (layoutInstance.headerArea) {
        layoutInstance.headerArea.innerHTML = `
            <div class="area-placeholder header-area-viz">
                <p class="b">headerArea</p>
                <p class="live-dims" id="header-dims">Calculating...</p>
                <div class="rules-panel">
                    <strong>CSS Rules:</strong>
                    <p class="ma1"><code class="bg-white pa1 br1">flex-basis: 20%</code></p>
                    <p class="ma1"><code class="bg-white pa1 br1">min-width: 160px</code></p>
                </div>
            </div>
        `;
    }

    if (layoutInstance.gridArea) {
        layoutInstance.gridArea.innerHTML = `
            <div class="area-placeholder grid-area-viz">
                <p class="b">gridArea</p>
                <p class="live-dims" id="grid-dims">Calculating...</p>
                 <div class="rules-panel">
                    <strong>CSS Rules:</strong>
                    <p class="ma1"><code class="bg-white pa1 br1">flex-grow: 1</code> (takes remaining space)</p>
                    <p class="ma1"><code class="bg-white pa1 br1">overflow-x: auto</code></p>
                </div>
            </div>
        `;
    }
    
    // Set up the listener for live updates
    window.addEventListener('resize', updateDimensions);
    
    // Run once immediately to show initial sizes
    // Use requestAnimationFrame to ensure the browser has painted the new elements
    requestAnimationFrame(updateDimensions);
}

// --- UI EVENT BINDINGS ---
createBtn.addEventListener('click', createLayout);
destroyBtn.addEventListener('click', destroyLayout);

// --- INITIALIZATION ---
createLayout(); // Create the layout on page load
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'RowLayout workbench initialized.');