// file: src/components/EventBus.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js'; // Assuming TestRunner is in a shared lib
import { MockLogger } from '/percussion-studio/lib/MockLogger.js'; // Assuming a mock logger for tests
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { eventBus } from './EventBus.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting EventBus test suite.');

    // Use a fresh instance for each test suite by clearing listeners
    runner.beforeEach(() => {
        eventBus._clearAll(); // Use the private utility for a clean test state
    });

    runner.describe('EventBus: Subscription', () => {
        runner.it('should allow a callback to subscribe to an event', () => {
            let wasCalled = false;
            const callback = () => { wasCalled = true; };
            
            eventBus.subscribe('test-event', callback);
            eventBus.publish('test-event');
            
            runner.expect(wasCalled).toBe(true);
        });

        runner.it('should allow multiple callbacks to subscribe to the same event', () => {
            let callCount = 0;
            const callback1 = () => { callCount++; };
            const callback2 = () => { callCount++; };

            eventBus.subscribe('multi-event', callback1);
            eventBus.subscribe('multi-event', callback2);
            eventBus.publish('multi-event');

            runner.expect(callCount).toBe(2);
        });

        runner.it('should not trigger a callback for a different event', () => {
            let wasCalled = false;
            const callback = () => { wasCalled = true; };

            eventBus.subscribe('correct-event', callback);
            eventBus.publish('wrong-event');

            runner.expect(wasCalled).toBe(false);
        });
    });

    runner.describe('EventBus: Publishing with Data', () => {
        runner.it('should pass a data payload (object) to the subscribed callback', () => {
            let receivedData = null;
            const payload = { user: 'Gemini', id: 123 };

            eventBus.subscribe('data-event', (data) => {
                receivedData = data;
            });
            eventBus.publish('data-event', payload);

            runner.expect(receivedData).toEqual(payload);
        });

        runner.it('should pass a data payload (primitive) to the subscribed callback', () => {
            let receivedData = null;
            const payload = "hello world";

            eventBus.subscribe('primitive-event', (data) => {
                receivedData = data;
            });
            eventBus.publish('primitive-event', payload);

            runner.expect(receivedData).toBe("hello world");
        });
    });

    runner.describe('EventBus: Unsubscription', () => {
        runner.it('should not call a callback after it has been unsubscribed', () => {
            let callCount = 0;
            const callback = () => { callCount++; };

            eventBus.subscribe('unsub-event', callback);
            eventBus.publish('unsub-event'); // Should be called once
            
            eventBus.unsubscribe('unsub-event', callback);
            eventBus.publish('unsub-event'); // Should NOT be called again

            runner.expect(callCount).toBe(1);
        });

        runner.it('should only remove the specified callback when multiple are subscribed', () => {
            let wasCallback1Called = false;
            let wasCallback2Called = false;
            const callback1 = () => { wasCallback1Called = true; };
            const callback2 = () => { wasCallback2Called = true; };

            eventBus.subscribe('partial-unsub', callback1);
            eventBus.subscribe('partial-unsub', callback2);

            eventBus.unsubscribe('partial-unsub', callback1); // Remove only the first one
            eventBus.publish('partial-unsub');

            runner.expect(wasCallback1Called).toBe(false);
            runner.expect(wasCallback2Called).toBe(true);
        });

        runner.it('should handle unsubscribing from an event that has no listeners', () => {
            // This test passes if it doesn't throw an error.
            const callback = () => {};
            eventBus.unsubscribe('non-existent-event', callback);
            runner.expect(true).toBe(true); // Assertion to show test ran
        });
    });

    // Run all defined tests and render the results
    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'EventBus test suite finished.');
}