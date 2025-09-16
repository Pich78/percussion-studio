// file: src/components/PlaybackLayout/PlaybackLayout.workbench.js

import './PlaybackLayout.js'; 

console.log('PlaybackLayout Workbench Initialized.');

// --- DOM REFERENCES ---
const placeholders = document.querySelectorAll('.placeholder');

// --- EVENT BINDINGS FOR MOUSEOVER VISUALIZATION ---
placeholders.forEach(el => {
    el.addEventListener('mouseover', () => {
        el.classList.add('area-highlight');
    });

    el.addEventListener('mouseout', () => {
        el.classList.remove('area-highlight');
    });
});