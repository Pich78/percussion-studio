/**
 * js/events.js
 * 
 * Event listener setup — delegates to the active view's setupEvents().
 * The view manager determines which view is active.
 */

import { viewManager } from './views/viewManager.js';

export const setupEventListeners = () => {
    const view = viewManager.getActiveView();
    view.setupEvents();
};