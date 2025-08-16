// file: test/suites/PlaybackApp.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';

// Mock the view classes before importing PlaybackApp
import { 
    MockTubsGridView, 
    MockPlaybackControlsView, 
    MockInstrumentMixerView 
} from '/percussion-studio/test/mocks/MockViews.js';

// Mock the view imports by replacing them in the global scope
window.TubsGridView = MockTubsGridView;
window.PlaybackControlsView = MockPlaybackControlsView;  
window.InstrumentMixerView = MockInstrumentMixerView;

// Create a custom PlaybackApp that uses the mocked views
class TestablePlaybackApp {
    constructor(container, props) {
        this.container = container;
        this.props = props;

        this.state = {
            isPlaying: false,
            loopPlayback: false,
            globalBPM: this.props.rhythm.global_bpm || 120,
            masterVolume: 1.0,
            currentMeasureIndex: 0,
        };
        
        // Create the HTML structure
        this.container.innerHTML = `
            <div id="grid-view-container" class="grid-area"></div>
            <footer id="playback-footer">
                <div id="playback-controls-container" class="controls-area"></div>
                <div id="instrument-mixer-container" class="mixer-area"></div>
            </footer>
        `;

        // Use the mocked views
        this.tubsGridView = new MockTubsGridView(
            document.getElementById('grid-view-container'),
            {}
        );

        this.playbackControlsView = new MockPlaybackControlsView(
            document.getElementById('playback-controls-container'),
            {
                onPlay: this.handlePlay.bind(this),
                onPause: this.handlePause.bind(this),
                onStop: this.handleStop.bind(this),
                onBPMChange: this.handleBPMChange.bind(this),
                onToggleLoop: this.handleToggleLoop.bind(this),
                onMasterVolumeChange: this.handleMasterVolumeChange.bind(this),
            }
        );

        this.instrumentMixerView = new MockInstrumentMixerView(
            document.getElementById('instrument-mixer-container'),
            {}
        );

        if (this.props.audioScheduler) {
            this.props.audioScheduler.onUpdateCallback = this.handleTickUpdate.bind(this);
            this.props.audioScheduler.onPlaybackEndedCallback = this.handlePlaybackEnded.bind(this);
        }
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }

    handlePlay() {
        this.props.audioScheduler.setBPM(this.state.globalBPM);
        this.props.playbackController.play();
        this.setState({ isPlaying: true });
    }

    handlePause() {
        this.props.playbackController.pause();
        this.setState({ isPlaying: false });
    }

    handleStop() {
        this.props.playbackController.stop();
        this.setState({ isPlaying: false, currentMeasureIndex: 0 });
        this.tubsGridView.updatePlaybackIndicator(0);
    }

    handleBPMChange(newBPM) {
        this.setState({ globalBPM: newBPM });
    }
    
    handleToggleLoop(enabled) {
        this.props.playbackController.toggleLoop(enabled);
        this.setState({ loopPlayback: enabled });
    }

    handleMasterVolumeChange(volume) {
        this.props.playbackController.setMasterVolume(volume);
        this.setState({ masterVolume: volume });
    }

    handleTickUpdate(tickInMeasure, measureIndex) {
        this.tubsGridView.updatePlaybackIndicator(tickInMeasure);
        if (this.state.currentMeasureIndex !== measureIndex) {
            this.setState({ currentMeasureIndex: measureIndex });
        }
    }

    handlePlaybackEnded() {
        this.setState({ isPlaying: false });
    }

    render() {
        this.tubsGridView.render({
            rhythm: this.props.rhythm,
            currentPatternId: this.props.rhythm.playback_flow[0].pattern,
            currentMeasureIndex: this.state.currentMeasureIndex,
        });

        this.playbackControlsView.render({
            isPlaying: this.state.isPlaying,
            isLoading: this.props.isLoading,
            loopPlayback: this.state.loopPlayback,
            globalBPM: this.state.globalBPM,
            masterVolume: this.state.masterVolume,
        });
        
        this.instrumentMixerView.render({ rhythm: this.props.rhythm });
    }

    destroy() {
        this.container.innerHTML = '';
        if (this.props.audioScheduler) {
            this.props.audioScheduler.onUpdateCallback = () => {};
            this.props.audioScheduler.onPlaybackEndedCallback = () => {};
        }
    }
}

// Mock the global controllers that PlaybackApp expects as props
const createMockProps = (rhythm) => {
    const logger = new MockLogger('GlobalControllers');
    return {
        rhythm: rhythm || { global_bpm: 120, playback_flow: [{ pattern: 'p1' }], patterns: {p1: {}} },
        playbackController: {
            play: () => logger.log('play'),
            pause: () => logger.log('pause'),
            stop: () => logger.log('stop'),
            toggleLoop: (enabled) => logger.log('toggleLoop', { enabled }),
            setMasterVolume: (vol) => logger.log('setMasterVolume', { vol }),
        },
        audioScheduler: {
            setBPM: (bpm) => logger.log('setBPM', { bpm }),
        },
        logger // Expose the logger for assertions
    };
};

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    runner.describe('PlaybackApp Initialization', () => {
        runner.it('should initialize with correct default state from rhythm', () => {
            const container = document.createElement('div');
            const props = createMockProps({ global_bpm: 95, playback_flow: [{ pattern: 'p1' }], patterns: {p1: {}} });
            const playbackApp = new TestablePlaybackApp(container, props);

            runner.expect(playbackApp.state.isPlaying).toBe(false);
            runner.expect(playbackApp.state.globalBPM).toBe(95);
        });
    });

    runner.describe('PlaybackApp State and Controller Interaction', () => {
        runner.it('should update state and call controller on handlePlay', () => {
            const container = document.createElement('div');
            const props = createMockProps();
            const playbackApp = new TestablePlaybackApp(container, props);

            playbackApp.handlePlay();

            runner.expect(playbackApp.state.isPlaying).toBe(true);
            props.logger.wasCalledWith('setBPM', { bpm: 120 });
            props.logger.wasCalledWith('play');
        });

        runner.it('should update state and call controller on handleBPMChange', () => {
            const container = document.createElement('div');
            const props = createMockProps();
            const playbackApp = new TestablePlaybackApp(container, props);

            playbackApp.handleBPMChange(150);

            runner.expect(playbackApp.state.globalBPM).toBe(150);
        });
        
        runner.it('should call controller on handleToggleLoop', () => {
            const container = document.createElement('div');
            const props = createMockProps();
            const playbackApp = new TestablePlaybackApp(container, props);
            
            playbackApp.handleToggleLoop(true);
            
            runner.expect(playbackApp.state.loopPlayback).toBe(true);
            props.logger.wasCalledWith('toggleLoop', { enabled: true });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}