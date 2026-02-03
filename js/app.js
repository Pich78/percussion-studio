/* 
  js/app.js
  Main Entry Point (Async)
  Handles initialization of Data Layer and Startup Logic.
*/

import { setupEventListeners } from './events.js';
import { dataLoader } from './services/dataLoader.js';
import { actions } from './actions.js';
import { initStrokeCursors, updateGlobalCursor } from './utils/strokeCursors.js';
import { state } from './store.js';

// Expose actions to global scope for inline onclick handlers
window.actions = actions;
window.dataLoader = dataLoader;

const init = async () => {
    // 1. Setup global event listeners (Event Delegation)
    // We do this first so the UI is responsive as soon as it renders.
    setupEventListeners();

    // 2. Initialize Data Layer (Fetch manifest.json)
    try {
        await dataLoader.init();
        // Load Batà metadata (Orishas, colors, etc.) immediately so it's available for UI
        await dataLoader.loadBataMetadata();
        // Preload stroke cursors for custom cursor feature
        await initStrokeCursors();
        // Initialize global cursor with default stroke
        updateGlobalCursor(state.selectedStroke);
    } catch (error) {
        console.error("Critical: Failed to load manifest.", error);
        document.getElementById('root').innerHTML = `
            <div class="flex h-screen items-center justify-center flex-col gap-4 text-gray-500">
                <h2 class="text-xl font-bold text-red-400">Configuration Error</h2>
                <p>Could not load manifest.json.</p>
                <p class="text-sm">Ensure you are running a local server (e.g., python -m http.server)</p>
            </div>
        `;
        return;
    }

    // 3. Load Initial Content
    // Check for rhythm specified in URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const requestedRhythm = urlParams.get('rhythm');

    // We check the manifest for available rhythms.
    const rhythmIds = Object.keys(dataLoader.manifest.rhythms || {});

    if (requestedRhythm) {
        // URL parameter specified - try to load that rhythm
        if (rhythmIds.includes(requestedRhythm)) {
            console.log(`Startup: Loading rhythm from URL parameter '${requestedRhythm}'`);
            await actions.loadRhythm(requestedRhythm);
        } else {
            // Rhythm not found in manifest
            console.warn(`Startup: Requested rhythm '${requestedRhythm}' not found in manifest.`);
            console.log(`Available rhythms:`, rhythmIds);

            // Show brief error then load default
            if (rhythmIds.length > 0) {
                console.log(`Startup: Falling back to default rhythm '${rhythmIds[0]}'`);
                await actions.loadRhythm(rhythmIds[0]);
            } else {
                actions.createNewRhythm();
            }
        }
    } else if (rhythmIds.length > 0) {
        // No URL parameter - load the first rhythm found (default behavior)
        console.log(`Startup: Loading default rhythm '${rhythmIds[0]}'`);
        await actions.loadRhythm(rhythmIds[0]);
    } else {
        // No rhythms defined in manifest? Initialize a blank state.
        console.log("Startup: No rhythms found, creating new.");
        actions.createNewRhythm();
    }
};

// Start the application
init();