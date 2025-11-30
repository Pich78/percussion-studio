// file: src/components/RowLayout/RowLayout.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import './RowLayout.js';

export async function run() {
    const runner = new TestRunner();
    const testSandbox = document.getElementById('test-sandbox');
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting RowLayout test suite.');

    runner.afterEach(() => {
        testSandbox.innerHTML = '';
    });

    runner.describe('RowLayout: Header Width Attribute', () => {
        runner.it('should use the default width if no attribute is provided', () => {
            const layout = document.createElement('row-layout');
            testSandbox.appendChild(layout);
            const header = layout.shadowRoot.querySelector('.row-layout__header-area');
            // Check the default style from the CSS
            runner.expect(getComputedStyle(header).width).not.toBe('0px');
            // An empty inline style confirms the attribute logic hasn't run
            runner.expect(header.style.width).toBe(''); 
        });

        runner.it('should apply the width when the header-width attribute is set on initialization', () => {
            testSandbox.innerHTML = `<row-layout header-width="150px"></row-layout>`;
            const layout = testSandbox.querySelector('row-layout');
            const header = layout.shadowRoot.querySelector('.row-layout__header-area');
            runner.expect(getComputedStyle(header).width).toBe('150px');
        });

        runner.it('should react and change width when the header-width attribute is changed dynamically', () => {
            const layout = document.createElement('row-layout');
            testSandbox.appendChild(layout);
            const header = layout.shadowRoot.querySelector('.row-layout__header-area');

            layout.setAttribute('header-width', '25%');
            runner.expect(getComputedStyle(header).width).not.toBe('150px'); // Placeholder for a more complex check

            layout.setAttribute('header-width', '120px');
            runner.expect(getComputedStyle(header).width).toBe('120px');
        });

        runner.it('should revert to default width when the attribute is removed', () => {
            const layout = document.createElement('row-layout');
            layout.setAttribute('header-width', '200px');
            testSandbox.appendChild(layout);
            const header = layout.shadowRoot.querySelector('.row-layout__header-area');
            
            // Confirm it was set
            runner.expect(getComputedStyle(header).width).toBe('200px');

            // Remove the attribute and check again
            layout.removeAttribute('header-width');
            runner.expect(header.style.width).toBe(''); // Inline style is removed
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'RowLayout test suite finished.');
}