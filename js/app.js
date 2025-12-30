/* 
  js/app.js
  Main Entry Point
*/
import { setupEventListeners } from './events.js';
import { renderApp } from './ui/renderer.js';

const init = () => {
    setupEventListeners();
    renderApp();
};

init();