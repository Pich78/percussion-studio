// file: test/mocks/MockViews.js

import { MockLogger } from './MockLogger.js';

export class MockTubsGridView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.logger = new MockLogger('MockTubsGridView');
        this.logger.log('constructor');
    }

    render(state) {
        this.logger.log('render', state);
    }

    updatePlaybackIndicator(tick) {
        this.logger.log('updatePlaybackIndicator', { tick });
    }
}

export class MockPlaybackControlsView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.logger = new MockLogger('MockPlaybackControlsView');
        this.logger.log('constructor');
    }

    render(state) {
        this.logger.log('render', state);
    }
}

export class MockInstrumentMixerView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.logger = new MockLogger('MockInstrumentMixerView');
        this.logger.log('constructor');
    }

    render(state) {
        this.logger.log('render', state);
    }
}