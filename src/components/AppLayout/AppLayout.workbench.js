// file: src/components/AppLayout/AppLayout.workbench.js

import './AppLayout.js'; 

console.log('AppLayout Workbench Initialized (Dynamic Mode).');

const appLayout = document.getElementById('app-shell');
const modeControls = document.querySelectorAll('input[name="app-mode"]');

modeControls.forEach(radio => {
    radio.addEventListener('change', (event) => {
        const selectedMode = event.target.value;
        console.log(`Control changed: Switching to "${selectedMode}" view.`);
        appLayout.showView(selectedMode);
    });
});

let lastHighlighted = null;
appLayout.addEventListener('mouseover', (event) => {
    const target = event.target;
    // UPDATED: Match new workbench view tag names
    if (target.classList.contains('placeholder') || target.matches('editor-view-workbench, playback-view-workbench')) {
        if (lastHighlighted && lastHighlighted !== target) {
            lastHighlighted.classList.remove('area-highlight');
        }
        target.classList.add('area-highlight');
        lastHighlighted = target;
    }
});

appLayout.addEventListener('mouseout', () => {
    if (lastHighlighted) {
        lastHighlighted.classList.remove('area-highlight');
        lastHighlighted = null;
    }
});

const initialMode = document.querySelector('input[name="app-mode"]:checked').value;
appLayout.showView(initialMode);
console.log(`Initial view set to: "${initialMode}"`);