// file: test/mocks/MockLogger.js (Complete and Corrected)

export class MockLogger {
    static instances = new Map();
    static logTarget = null;

    constructor(name = 'Mock') {
        this.name = name;
        this.calls = [];
        MockLogger.instances.set(name, this);
    }

    log(methodName, args) {
        const logMessage = `[${this.name}] Method Called: ${methodName}` + (args ? ` with args: ${JSON.stringify(args)}` : '');
        this.calls.push({ methodName, args });

        console.log(logMessage);

        if (MockLogger.logTarget) {
            const now = new Date();
            const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
            MockLogger.logTarget.textContent += `[${timestamp}] ${logMessage}\n`;
        }
    }

    get callCount() {
        return this.calls.length;
    }

    /**
     * Checks if a method was called with the expected arguments.
     * This version handles the 'undefined' arguments case robustly.
     */
    wasCalledWith(methodName, expectedArgs) {
        const call = this.calls.find(c => {
            if (c.methodName !== methodName) return false;
            // Robustly handle the case where no arguments are expected.
            if (expectedArgs === undefined) {
                return c.args === undefined;
            }
            return JSON.stringify(c.args) === JSON.stringify(expectedArgs);
        });

        if (!call) {
            const actualCalls = this.calls.map(c => `${c.methodName}(${JSON.stringify(c.args)})`).join(', ') || 'None';
            throw new Error(`Expected method '${methodName}' to be called with ${JSON.stringify(expectedArgs)}, but it was not. Actual calls: [${actualCalls}]`);
        }
    }

    clear() { this.calls = []; }
    
    static getMockInstance(name) {
        const instance = MockLogger.instances.get(name);
        if (!instance) {
            throw new Error(`MockLogger instance with name '${name}' not found.`);
        }
        return instance;
    }
    
    static setLogTarget(elementId) { MockLogger.logTarget = document.getElementById(elementId); }
    static clearLogs() {
        if (MockLogger.logTarget) MockLogger.logTarget.textContent = '';
        MockLogger.instances.clear(); // Clear all instances when clearing logs
    }
}
