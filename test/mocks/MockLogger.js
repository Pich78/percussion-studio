// file: test/mocks/MockLogger.js

class MockLogger {
    constructor(name = 'Mock') {
        this.name = name;
        this.calls = [];
    }

    // A generic method to be spied upon.
    // We can add specific method names if we know them ahead of time.
    log(methodName, args) {
        this.calls.push({ methodName, args });
        console.log(`[${this.name}] Method Called: ${methodName}`, 'with args:', args);
    }

    // Test verification methods
    getCalled(index) {
        return this.calls[index];
    }

    wasCalledWith(methodName, expectedArgs) {
        const call = this.calls.find(c => c.methodName === methodName);
        if (!call) {
            throw new Error(`Expected method '${methodName}' to be called, but it was not.`);
        }
        if (JSON.stringify(call.args) !== JSON.stringify(expectedArgs)) {
            throw new Error(`Method '${methodName}' was called, but with wrong arguments.
                Expected: ${JSON.stringify(expectedArgs)}
                Received: ${JSON.stringify(call.args)}`);
        }
    }

    get callCount() {
        return this.calls.length;
    }

    clear() {
        this.calls = [];
    }
}