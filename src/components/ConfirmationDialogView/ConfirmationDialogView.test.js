// file: src/components/ConfirmationDialogView/ConfirmationDialogView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { ConfirmationDialogView } from './ConfirmationDialogView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting ConfirmationDialogView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    runner.describe('ConfirmationDialogView Rendering', () => {
        runner.it('should render nothing when state.confirmation is null', () => {
            testContainer.innerHTML = '';
            const view = new ConfirmationDialogView(testContainer);
            view.render({ confirmation: null });
            runner.expect(testContainer.innerHTML).toBe('');
        });

        runner.it('should render the dialog when state.confirmation is populated', () => {
            testContainer.innerHTML = '';
            const view = new ConfirmationDialogView(testContainer);
            view.render({ confirmation: { message: 'Are you sure?' } });
            const dialog = testContainer.querySelector('.modal-dialog');
            runner.expect(dialog === null).toBe(false);
            runner.expect(dialog.textContent.includes('Are you sure?')).toBe(true);
        });

        runner.it('should remove the dialog from the DOM when re-rendered with a null state', () => {
            testContainer.innerHTML = '';
            const view = new ConfirmationDialogView(testContainer);
            view.render({ confirmation: { message: 'Test' } });
            runner.expect(testContainer.querySelector('.modal-dialog') === null).toBe(false);

            view.render({ confirmation: null });
            runner.expect(testContainer.querySelector('.modal-dialog') === null).toBe(true);
        });
    });

    runner.describe('ConfirmationDialogView Callbacks', () => {
        runner.it('should fire the onConfirm callback when the confirm button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const confirmationState = { confirmation: { onConfirm: () => callbackLog.log('onConfirm') } };
            
            const view = new ConfirmationDialogView(testContainer);
            view.render(confirmationState);
            testContainer.querySelector('#confirm-btn').click();

            callbackLog.wasCalledWith('onConfirm');
        });

        runner.it('should fire the onCancel callback when the cancel button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const confirmationState = { confirmation: { onCancel: () => callbackLog.log('onCancel') } };
            
            const view = new ConfirmationDialogView(testContainer);
            view.render(confirmationState);
            testContainer.querySelector('#cancel-btn').click();

            callbackLog.wasCalledWith('onCancel');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'ConfirmationDialogView test suite finished.');
}

export function manualTest() {
    logEvent('info', 'Harness', 'manualTest', 'Setup', 'Setting up manual test for ConfirmationDialogView.');
    const view = new ConfirmationDialogView(document.body);

    const showDialog = () => {
        const state = {
            confirmation: {
                message: 'You have unsaved changes. Proceed?',
                onConfirm: () => {
                    logEvent('info', 'Harness', 'onConfirm', 'Callback', 'User clicked Confirm.');
                    hideDialog();
                },
                onCancel: () => {
                    logEvent('info', 'Harness', 'onCancel', 'Callback', 'User clicked Cancel.');
                    hideDialog();
                }
            }
        };
        view.render(state);
    };

    const hideDialog = () => {
        view.render({ confirmation: null });
    };

    document.getElementById('show-dialog-btn').addEventListener('click', showDialog);
}