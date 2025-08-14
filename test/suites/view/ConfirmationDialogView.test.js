// file: test/suites/view/ConfirmationDialogView.test.js (Complete, Final Version)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { ConfirmationDialogView } from '/percussion-studio/src/view/ConfirmationDialogView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    
    // The test sandbox will act as the "app container" for the tests.
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
            runner.expect(testContainer.innerHTML).toBe('');
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

            callbackLog.wasCalledWith('onConfirm', undefined);
        });

        runner.it('should fire the onCancel callback when the cancel button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const confirmationState = { confirmation: { onCancel: () => callbackLog.log('onCancel') } };
            
            const view = new ConfirmationDialogView(testContainer);
            view.render(confirmationState);
            testContainer.querySelector('#cancel-btn').click();

            callbackLog.wasCalledWith('onCancel', undefined);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output');

    // The live view should attach to the main document body.
    const view = new ConfirmationDialogView(document.body);

    const showDialog = () => {
        const state = {
            confirmation: {
                message: 'You have unsaved changes. Proceed?',
                onConfirm: () => {
                    log.log('onConfirm');
                    hideDialog();
                },
                onCancel: () => {
                    log.log('onCancel');
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