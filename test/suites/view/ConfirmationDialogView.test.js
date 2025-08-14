// file: test/suites/view/ConfirmationDialogView.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { ConfirmationDialogView } from '/percussion-studio/src/view/ConfirmationDialogView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    
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
            const confirmationState = {
                confirmation: {
                    message: 'Are you sure?',
                    onConfirm: () => {},
                    onCancel: () => {}
                }
            };
            view.render(confirmationState);

            const dialog = testContainer.querySelector('.modal-dialog');
            runner.expect(dialog === null).toBe(false);
            runner.expect(dialog.textContent.includes('Are you sure?')).toBe(true);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output');

    // In a real app, the body would be the container
    const view = new ConfirmationDialogView(document.body);

    const showDialog = () => {
        const state = {
            confirmation: {
                message: 'You have unsaved changes. Proceed?',
                onConfirm: () => {
                    log.log('onConfirm');
                    hideDialog(); // Close the dialog after confirming
                },
                onCancel: () => {
                    log.log('onCancel');
                    hideDialog(); // Close the dialog after cancelling
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