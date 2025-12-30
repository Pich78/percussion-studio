/* 
  js/app.js
  Main Entry Point (Async)
  Handles initialization of Data Layer and Startup Logic.
*/

import { setupEventListeners } from './events.js';
import { dataLoader } from './services/dataLoader.js';
import { actions } from './actions.js';

const init = async () => {
    // 1. Setup global event listeners (Event Delegation)
    // We do this first so the UI is responsive as soon as it renders.
    setupEventListeners();

    // 2. Initialize Data Layer (Fetch manifest.json)
    try {
        await dataLoader.init();
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
    // We check the manifest for available rhythms.
    const rhythmIds = Object.keys(dataLoader.manifest.rhythms || {});

    if (rhythmIds.length > 0) {
        // Automatically load the first rhythm found (e.g., 'iyakota_1')
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