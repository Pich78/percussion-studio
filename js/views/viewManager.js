/**
 * js/views/viewManager.js
 * 
 * Central registry for swappable views.
 * 
 * Each view is a self-contained module providing:
 *   - id:           unique string identifier (e.g. 'mobile-grid')
 *   - name:         human-readable label for menus (e.g. 'Classic Grid')
 *   - layout:       () => string   — returns the full page HTML
 *   - setupEvents:  () => void     — attaches DOM event listeners
 *   - onStep:       ({ step, measure, rep }) => void  — playback visual update
 *   - onRender:     () => void     (optional) — hook called after renderApp()
 * 
 * Usage:
 *   import { viewManager } from './views/viewManager.js';
 *   viewManager.registerView(mobileGridView);
 *   viewManager.registerView(desktopEditorView);
 *   viewManager.setActiveView('mobile-grid');
 */

const views = {};
let activeViewId = null;

export const viewManager = {
    /**
     * Register a view definition.
     * @param {object} viewDef - View conforming to the view interface
     */
    registerView(viewDef) {
        if (!viewDef.id || !viewDef.layout || !viewDef.setupEvents) {
            throw new Error(`View registration failed: missing required fields (id, layout, setupEvents). Got: ${JSON.stringify(Object.keys(viewDef))}`);
        }
        views[viewDef.id] = viewDef;
    },

    /**
     * Set the active view by ID.
     * @param {string} id - View ID to activate
     */
    setActiveView(id) {
        if (!views[id]) {
            throw new Error(`View '${id}' not registered. Available: ${Object.keys(views).join(', ')}`);
        }
        activeViewId = id;
    },

    /**
     * Get the currently active view definition.
     * @returns {object} Active view definition
     */
    getActiveView() {
        if (!activeViewId || !views[activeViewId]) {
            return null;
        }
        return views[activeViewId];
    },

    /**
     * Get list of all registered views (for building selector menus).
     * @returns {Array<{id: string, name: string}>}
     */
    getAvailableViews() {
        return Object.values(views).map(v => ({ id: v.id, name: v.name }));
    },

    /**
     * Get the active view ID.
     * @returns {string|null}
     */
    getActiveViewId() {
        return activeViewId;
    }
};
