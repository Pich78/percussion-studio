// file: src/components/PlaybackGridView/PlaybackGridView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { PlaybackGridView } from './PlaybackGridView.js';

export async function run() {
    const runner = new TestRunner();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting PlaybackGridView test suite.');

    // --- Mock Data for Tests ---
    const mockResolvedInstruments = {
        KCK: { name: 'Kick', sounds: [{ letter: 'o', svg: '<svg></svg>' }] }
    };
    const mockPattern = {
        metadata: { name: "Test", metric: "4/4", resolution: 16 },
        pattern_data: [{ KCK: "||o---o---o---o---||" }]
    };

    runner.describe('PlaybackGridView Rendering', () => {

        runner.it('should render an empty state message if no pattern is provided', () => {
            const testContainer = document.createElement('div');
            const view = new PlaybackGridView(testContainer);
            view.render({ currentPattern: null });
            runner.expect(testContainer.textContent.includes('No pattern loaded')).toBe(true);
        });

        runner.it('should render a complete grid with valid data', () => {
            const testContainer = document.createElement('div');
            const view = new PlaybackGridView(testContainer);
            view.render({ currentPattern: mockPattern, resolvedInstruments: mockResolvedInstruments });
            
            const measureEl = testContainer.querySelector('.measure-container');
            const headerEl = testContainer.querySelector('.instrument-header');
            const noteEl = testContainer.querySelector('.note');
            
            runner.expect(measureEl).not.toBe(null);
            runner.expect(headerEl).not.toBe(null);
            runner.expect(headerEl.textContent).toBe('Kick');
            runner.expect(noteEl).not.toBe(null);
        });
    });

    runner.describe('PlaybackGridView Playback Indicator', () => {
        runner.it('should position the playback indicator correctly while playing', () => {
            const testContainer = document.createElement('div');
            document.body.appendChild(testContainer); // Must be in DOM for getBoundingClientRect
            const view = new PlaybackGridView(testContainer);
            view.render({ currentPattern: mockPattern, resolvedInstruments: mockResolvedInstruments });
            
            const position = { currentMeasureIndex: 0, currentTickIndex: 4 };
            view.updatePlaybackIndicator(position, true);

            const indicator = view.playbackIndicatorEl;
            const targetCell = testContainer.querySelector('.grid-cell[data-tick-index="4"]');
            
            runner.expect(indicator.style.display).toBe('block');
            runner.expect(parseInt(indicator.style.left, 10)).toBe(targetCell.offsetLeft);

            document.body.removeChild(testContainer); // Clean up
        });

        // =======================================================
        // NEW TEST CASE FOR PAUSE BEHAVIOR
        // =======================================================
        runner.it('should keep the indicator visible and in place when paused', () => {
            const testContainer = document.createElement('div');
            document.body.appendChild(testContainer);
            const view = new PlaybackGridView(testContainer);
            view.render({ currentPattern: mockPattern, resolvedInstruments: mockResolvedInstruments });
            
            const position = { currentMeasureIndex: 0, currentTickIndex: 8 };
            const targetCell = testContainer.querySelector('.grid-cell[data-tick-index="8"]');
            const expectedPosition = targetCell.offsetLeft;

            // 1. Simulate playing at position 8
            view.updatePlaybackIndicator(position, true);

            // 2. Simulate pausing at the same position
            view.updatePlaybackIndicator(position, false);

            const indicator = view.playbackIndicatorEl;
            runner.expect(indicator.style.display).toBe('block'); // Should STILL be visible
            runner.expect(parseInt(indicator.style.left, 10)).toBe(expectedPosition); // Should NOT have moved

            document.body.removeChild(testContainer);
        });

        runner.it('should hide the indicator when playback is stopped', () => {
            const testContainer = document.createElement('div');
            const view = new PlaybackGridView(testContainer);
            view.render({ currentPattern: mockPattern, resolvedInstruments: mockResolvedInstruments });

            // First, show it by simulating play/pause at a non-zero position
            view.updatePlaybackIndicator({ currentMeasureIndex: 0, currentTickIndex: 4 }, true);
            runner.expect(view.playbackIndicatorEl.style.display).toBe('block');

            // Then, simulate stopping by passing isPlaying: false and a zero position
            view.updatePlaybackIndicator({ currentMeasureIndex: 0, currentTickIndex: 0 }, false);
            
            runner.expect(view.playbackIndicatorEl.style.display).toBe('none');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PlaybackGridView test suite finished.');
}