// file: src/components/RowLayout/RowLayout.workbench.js

import './RowLayout.js'; 

console.log('RowLayout Workbench Initialized.');

// --- DOM REFERENCES ---
const placeholders = document.querySelectorAll('.placeholder');
const layoutToControl = document.getElementById('interactive-layout');
const widthInput = document.getElementById('width-input');
const applyButton = document.getElementById('apply-btn');

// --- EVENT BINDINGS FOR LIVE CONTROLS ---
applyButton.addEventListener('click', () => {
    const newWidth = widthInput.value.trim();
    if (newWidth) {
        console.log(`Setting header-width attribute to: "${newWidth}"`);
        layoutToControl.setAttribute('header-width', newWidth);
    } else {
        console.log('Removing header-width attribute.');
        layoutToControl.removeAttribute('header-width');
    }
});

// --- EVENT BINDINGS FOR MOUSEOVER VISUALIZATION ---
placeholders.forEach(el => {
    el.addEventListener('mouseover', () => {
        el.classList.add('area-highlight');
    });

    el.addEventListener('mouseout', () => {
        el.classList.remove('area-highlight');
    });
});