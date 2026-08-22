/**
 * js/services/eventBus.js
 * 
 * Simple pub/sub event bus for decoupling backend services from UI rendering.
 * 
 * Services (sequencer, actions) emit events; the renderer and views subscribe
 * and handle UI updates in their own way. This enables swappable views: each
 * view can subscribe to the same events but render differently.
 * 
 * Events:
 *   'render'            - Full re-render requested (payload: none)
 *   'transport'         - Ordered playback fact from the sequencer
 *                         (payload: { phase: 'playing'|'countin', ... } — see
 *                         docs/requirements/playback-events.md)
 *   'grid-refresh'      - Grid-only refresh requested (payload: none)
 *   'scroll-to-measure' - Scroll the grid to a measure (payload: { measure })
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
