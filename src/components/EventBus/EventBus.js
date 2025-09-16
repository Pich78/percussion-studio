// file: src/components/EventBus.js

/**
 * A simple, powerful Event Bus for decoupled component communication.
 * Implements the Publish/Subscribe pattern to act as a Mediator.
 * This version uses a private class field (#listeners) to ensure true encapsulation.
 */
class EventBus {
    /**
     * @private
     * A private field to store listeners. The # syntax enforces true privacy at the
     * language level, preventing any external access.
     * The structure is an object where keys are event names (string) and
     * values are an array of callback functions.
     */
    #listeners = {};

    /**
     * Subscribes a callback function to a specific event.
     * @param {string} eventName - The name of the event to listen for.
     * @param {Function} callback - The function to execute when the event is published.
     */
    subscribe(eventName, callback) {
        if (typeof callback !== 'function') {
            console.error(`EventBus: Attempted to subscribe to "${eventName}" with a non-function callback.`);
            return;
        }
        if (!this.#listeners[eventName]) {
            this.#listeners[eventName] = [];
        }
        this.#listeners[eventName].push(callback);
    }

    /**
     * Publishes an event, calling all subscribed callbacks for that event.
     * @param {string} eventName - The name of the event to publish.
     * @param {*} [data] - Optional data payload to pass to the listeners' callback functions.
     */
    publish(eventName, data) {
        if (!this.#listeners[eventName]) {
            return; // No one is listening, so do nothing.
        }
        // Call each subscribed callback with the provided data payload.
        this.#listeners[eventName].forEach(callback => callback(data));
    }

    /**
     * Unsubscribes a specific callback function from an event.
     * This is critical for preventing memory leaks when components are destroyed.
     * @param {string} eventName - The name of the event to unsubscribe from.
     * @param {Function} callback - The exact callback function reference used during subscription.
     */
    unsubscribe(eventName, callback) {
        if (!this.#listeners[eventName]) {
            return;
        }
        // Filter out the callback to remove it from the array of listeners.
        this.#listeners[eventName] = this.#listeners[eventName].filter(
            listener => listener !== callback
        );
    }
    
    /**
     * A utility for testing purposes to clear all listeners.
     * This method cannot be called from outside the class if it were private,
     * so it remains public for testing convenience but is intended for that use only.
     * Consider removing it in a production build if not needed.
     */
    _clearAll() {
        this.#listeners = {};
    }
}

/**
 * A single, globally accessible instance of the EventBus (Singleton pattern).
 * Import this instance into any component that needs to communicate.
 */
export const eventBus = new EventBus();