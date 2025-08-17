// file: src/components/ErrorModalView/ErrorModalView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { ErrorModalView } from './ErrorModalView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting ErrorModalView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    runner.describe('ErrorModalView Rendering', () => {
        runner.it('should render nothing when state.error is null', () => {
            testContainer.innerHTML = '';
            const view = new ErrorModalView(testContainer, {});
            view.render({ error: null });
            runner.expect(testContainer.innerHTML).toBe('');
        });

        runner.it('should render the dialog when state.error is populated', () => {
            testContainer.innerHTML = '';
            const view = new ErrorModalView(testContainer, {});
            const errorState = { error: { message: 'File not found.', details: '404' } };
            view.render(errorState);

            const dialog = testContainer.querySelector('.modal-dialog');
            runner.expect(dialog === null).toBe(false);
            runner.expect(dialog.textContent.includes('File not found.')).toBe(true);
            runner.expect(dialog.textContent.includes('404')).toBe(true);
        });

        runner.it('should remove the dialog from the DOM when re-rendered with a null state', () => {
            testContainer.innerHTML = '';
            const view = new ErrorModalView(testContainer, {});
            view.render({ error: { message: 'Test' } });
            runner.expect(testContainer.querySelector('.modal-dialog') === null).toBe(false);

            view.render({ error: null });
            runner.expect(testContainer.querySelector('.modal-dialog') === null).toBe(true);
        });
    });

    runner.describe('ErrorModalView Callbacks', () => {
        runner.it('should fire the onErrorDismiss callback when the OK button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new ErrorModalView(testContainer, { onErrorDismiss: () => callbackLog.log('onErrorDismiss') });
            
            view.render({ error: { message: 'Test' } });
            testContainer.querySelector('#error-ok-btn').click();

            callbackLog.wasCalledWith('onErrorDismiss');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'ErrorModalView test suite finished.');
}

export function manualTest() {
    logEvent('info', 'Harness', 'manualTest', 'Setup', 'Setting up manual test for ErrorModalView.');
    const view = new ErrorModalView(document.body, {
        onErrorDismiss: () => {
            logEvent('info', 'Harness', 'onErrorDismiss', 'Callback', 'User dismissed the error.');
            hideDialog();
        }
    });

    const showError = () => {
        const state = {
            error: {
                message: 'Failed to load rhythm file.',
                details: 'The file "ghost.rthm.yaml" was not found on the server (404).'
            }
        };
        view.render(state);
    };

    const hideDialog = () => {
        view.render({ error: null });
    };

    document.getElementById('show-error-btn').addEventListener('click', showError);
}