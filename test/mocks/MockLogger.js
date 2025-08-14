// file: test/mocks/MockLogger.js

class MockLogger {
    constructor(name = 'Mock') {
        this.name = name;
        this.calls = [];
    }

    // A generic method to be spied upon.
    log(methodName, args) {
        const logMessage = `[${this.name}] Method Called: ${methodName} with args: ${JSON.stringify(args)}`;
        this.calls.push({ methodName, args });

        // Also log to the console for developer convenience
        console.log(logMessage);

        // Append log to the dedicated HTML element if it exists
        if (MockLogger.logTarget) {
            const now = new Date();
            const timestamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
            MockLogger.logTarget.textContent += `[${timestamp}] ${logMessage}\n`;
        }
    }

    // --- (Verification methods like getCalled, wasCalledWith, callCount, clear remain the same) ---
    getCalled(index) { return this.calls[index]; }
    wasCalledWith(methodName, expectedArgs) { /* ... no change ... */ }
    get callCount() { return this.calls.length; }
    clear() { this.calls = []; }


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