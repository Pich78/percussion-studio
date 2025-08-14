// file: test/mocks/MockLogger.js

/**
 * A mock object utility for logging and verifying method calls during tests.
 * Designed to be imported as an ES Module.
 */
export class MockLogger {
    constructor(name = 'Mock') {
        this.name = name;
        this.calls = [];
    }

    /**
     * A generic method to be spied upon. Logs the call to the console and a target HTML element.
     * @param {string} methodName The name of the method being called.
     * @param {object} args The arguments passed to the method.
     */
    log(methodName, args) {
        const logMessage = `[${this.name}] Method Called: ${methodName} with args: ${JSON.stringify(args)}`;
        this.calls.push({ methodName, args: JSON.parse(JSON.stringify(args)) }); // Deep copy args

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

    wasCalledWith(methodName, expectedArgs) {
        const call = this.calls.find(c => c.methodName === methodName && JSON.stringify(c.args) === JSON.stringify(expectedArgs));
        if (!call) {
            const actualCalls = this.calls.map(c => `${c.methodName}(${JSON.stringify(c.args)})`).join(', ') || 'None';
            throw new Error(`Expected method '${methodName}' to be called with ${JSON.stringify(expectedArgs)}, but it was not. Actual calls: [${actualCalls}]`);
        }
    }

    clear() {
        this.calls = [];
    }
    
    /**
     * Sets the HTML element where all mock instances will write their logs.
     * @param {string} elementId The ID of the <pre> or <div> element.
     */
    static setLogTarget(elementId) {
        MockLogger.logTarget = document.getElementById(elementId);
    }

    /**
     * Clears the content of the log target element.
     */
    static clearLogs() {
        if (MockLogger.logTarget) {
            MockLogger.logTarget.textContent = '';
        }
    }
}