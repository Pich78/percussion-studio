// file: lib/MockLogger.js
import { logEvent } from './Logger.js';

export class MockLogger {
    constructor(name = 'Mock') {
        this.name = name;
        this.calls = [];
        MockLogger.instances.set(name, this);
    }

    log(methodName, args) {
        // 1. Log its own activity using the new global logger for consistency
        logEvent('debug', this.name, methodName, 'Mock Spy', `Method spied upon`, args);
        
        // 2. Record the call for test assertions
        this.calls.push({ methodName, args });
    }

    get callCount() {
        return this.calls.length;
    }

    wasCalledWith(methodName, expectedArgs) {
        const call = this.calls.find(c => {
            if (c.methodName !== methodName) return false;
            if (expectedArgs === undefined) return c.args === undefined;
            return JSON.stringify(c.args) === JSON.stringify(expectedArgs);
        });

        if (!call) {
            const actualCalls = this.calls.map(c => `${c.methodName}(${JSON.stringify(c.args)})`).join(', ') || 'None';
            throw new Error(`Expected method '${methodName}' to be called with ${JSON.stringify(expectedArgs)}, but it was not. Actual calls: [${actualCalls}]`);
        }
    }

    clear() { 
        this.calls = []; 
    }
    
    // Static registry for convenience
    static instances = new Map();
    static getMockInstance(name) {
        return MockLogger.instances.get(name);
    }
    static clearLogs() { 
        MockLogger.instances.forEach(instance => instance.clear());
    }
}