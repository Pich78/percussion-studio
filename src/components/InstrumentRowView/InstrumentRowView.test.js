// file: src/components/InstrumentRowView/InstrumentRowView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentRowView } from './InstrumentRowView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting InstrumentRowView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockProps = (mode = 'editor') => ({
        mode: mode,
        instrument: { 
            id: 'k1', symbol: 'KCK', name: 'Kick', pack: 'Test Kit', 
            volume: 0.8, muted: false,
            sounds: [{letter: 'o', svg: '<svg>o</svg>'}] 
        },
        notation: 'o---o---',
        metrics: { beatsPerMeasure: 4, beatUnit: 8, subdivision: 8, grouping: 2 },
        densityClass: 'density-medium',
        callbacks: {},
    });

    runner.describe('InstrumentRowView Composition and Rendering', () => {
        let view = null;
        
        runner.afterEach(() => {
            if(view) view.destroy();
        });

        runner.it('should render the EditorRowHeaderView in editor mode', () => {
            testContainer.innerHTML = '';
            view = new InstrumentRowView(testContainer, getMockProps('editor'));
            view.render(getMockProps('editor'));
            
            const editorHeader = testContainer.querySelector('.editor-header');
            const playbackHeader = testContainer.querySelector('.mixer-track');

            runner.expect(editorHeader).not.toBe(null);
            runner.expect(playbackHeader).toBe(null);
        });

        runner.it('should render the PlaybackRowHeaderView in playback mode', () => {
            testContainer.innerHTML = '';
            view = new InstrumentRowView(testContainer, getMockProps('playback'));
            view.render(getMockProps('playback'));

            const editorHeader = testContainer.querySelector('.editor-header');
            const playbackHeader = testContainer.querySelector('.mixer-track');
            
            runner.expect(playbackHeader).not.toBe(null);
            runner.expect(editorHeader).toBe(null);
        });

        runner.it('should render the correct number of grid cells', () => {
            testContainer.innerHTML = '';
            const props = getMockProps();
            view = new InstrumentRowView(testContainer, props);
            view.render(props);
            runner.expect(testContainer.querySelectorAll('.grid-cell').length).toBe(8);
        });

        runner.it('should apply rhythmic shading classes correctly', () => {
            testContainer.innerHTML = '';
            const props = getMockProps();
            view = new InstrumentRowView(testContainer, props);
            view.render(props);
            
            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells[0].classList.contains('cell-downbeat')).toBe(true);
            runner.expect(cells[1].classList.contains('cell-weak-beat')).toBe(true);
            runner.expect(cells[2].classList.contains('cell-strong-beat')).toBe(true);
            runner.expect(cells[4].classList.contains('cell-strong-beat')).toBe(true);
        });
        
        runner.it('should apply triplet shading classes correctly when specified', () => {
            testContainer.innerHTML = '';
            const props = getMockProps();
            props.metrics.feel = 'triplet';
            props.notation = 'o--o--';
            view = new InstrumentRowView(testContainer, props);
            view.render(props);

            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells.length).toBe(6);
            runner.expect(cells[0].classList.contains('cell-triplet-1')).toBe(true);
            runner.expect(cells[1].classList.contains('cell-triplet-2')).toBe(true);
            runner.expect(cells[2].classList.contains('cell-triplet-3')).toBe(true);
            runner.expect(cells[3].classList.contains('cell-triplet-1')).toBe(true);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'InstrumentRowView test suite finished.');
}