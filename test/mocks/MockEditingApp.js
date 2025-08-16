// file: test/mocks/MockEditingApp.js

import { MockLogger } from './MockLogger.js';

export class MockEditingApp {
    constructor(container, props) {
        this.container = container;
        this.props = props;
        this.logger = new MockLogger('MockEditingApp');
        this.logger.log('constructor', { props });
    }

    render() {
        this.container.innerHTML = `
            <div style="padding: 20px; border: 2px dashed blue; background-color: #e3f2fd;">
                <h2>EditingApp is Active</h2>
                <p>Received rhythm: <strong>${this.props.rhythm?.global_bpm ? 'Yes' : 'No'}</strong></p>
            </div>
        `;
        this.logger.log('render');
    }

    destroy() {
        this.container.innerHTML = '';
        this.logger.log('destroy');
    }
}