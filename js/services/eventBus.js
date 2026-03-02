/**
 * js/services/eventBus.js
 * 
 * Simple pub/sub event bus for decoupling backend services from UI rendering.
 * 
 * Services (sequencer, actions) emit events like 'render', 'step', 'section-changed'.
 * Views subscribe to these events and handle UI updates in their own way.
 * 
 * This enables swappable views: each view can subscribe to the same events
 * but render differently.
 * 
 * Events:
 *   'render'           - Full re-render requested (payload: none)
 *   'step'             - Playback step advanced (payload: { step, measure, rep })
 *   'section-changed'  - Active section changed during playback (payload: none)
 *   'grid-refresh'     - Grid-only refresh requested (payload: none)
 */

const listeners = {};

export const eventBus = {
    /**
     * Subscribe to an event.
     * @param {string} event - Event name
     * @param {function} callback - Handler function
     */
    on(event, callback) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
    },

    /**
     * Unsubscribe from an event.
     * @param {string} event - Event name
     * @param {function} callback - Handler to remove
     */
    off(event, callback) {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter(cb => cb !== callback);
    },

    /**
     * Emit an event to all subscribers.
     * @param {string} event - Event name
     * @param {*} payload - Optional data payload
     */
    emit(event, payload) {
        if (!listeners[event]) return;
        listeners[event].forEach(cb => cb(payload));
    }
};
