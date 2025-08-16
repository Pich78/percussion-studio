// file: test/mocks/MockPlaybackApp.js

import { MockLogger } from './MockLogger.js';

export class MockPlaybackApp {
    constructor(container, props) {
        this.container = container;
        this.props = props;
        this.logger = new MockLogger('MockPlaybackApp');
        this.logger.log('constructor', { props });
    }

    render() {
        this.container.innerHTML = `
            <div style="padding: 20px; border: 2px dashed green; background-color: #e8f5e9;">
                <h2>PlaybackApp is Active</h2>
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