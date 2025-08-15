// file: test/suites/view/RhythmEditorView.test.js (Complete, Expanded, and Corrected)
import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { RhythmEditorView } from '/percussion-studio/src/view/RhythmEditorView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    const testContainer = document.getElementById('test-sandbox');

    const getMockState = () => ({
        rhythm: {
            playback_flow: [
                { pattern: 'verse', repetitions: 4 },
                { pattern: 'chorus', repetitions: 8 }
            ],
            patterns: {
                verse: {
                    metadata: { resolution: 16 },
                    pattern_data: [{
                        KCK: '||o---|----|o---|----||', // After stripping |: "o---o---o---" - so tick 0 has 'o', tick 1,2,3 are empty, tick 4 has 'o'
                        SNR: '||----|o---|----|o---||'  // After stripping |: "o---o---o---" - so tick 4 has 'o'
                    }]
                },
                chorus: {
                    metadata: { resolution: 16 },
                    pattern_data: [{
                        KCK: '||o--o|o--o|o--o|o--o||'
                    }]
                }
            },
            instrumentDefsBySymbol: {
                KCK: { symbol: "KCK", name: "Kick", sounds: [{ letter: "o", name: "Hit", svg: "k.svg" }, { letter: "p", name: "Soft", svg: "k2.svg" }] },
                SNR: { symbol: "SNR", name: "Snare", sounds: [{ letter: "o", name: "Hit", svg: "s.svg" }] }
            }
        },
        currentEditingPatternId: 'verse' // Important for grid/palette tests
    });

    const assert = (desc, actual, expected) => {
        if (actual !== expected) throw new Error(`[${desc}] Expected ${actual} to be ${expected}`);
    };

    runner.describe('RhythmEditorView: Flow Panel', () => {
        runner.it('should render flow items and an add button', () => {
            console.log("TEST: Flow Panel - should render flow items");
            testContainer.innerHTML = '';
            const view = new RhythmEditorView(testContainer, {});
            view.render(getMockState());
            assert('Number of flow items', testContainer.querySelectorAll('.flow-item').length, 2);
            assert('Add button exists', testContainer.querySelector('.add-pattern-btn') !== null, true);
        });

        runner.it('should fire onFlowChange with item removed on delete click', () => {
            console.log("TEST: Flow Panel - should fire onFlowChange on delete");
            testContainer.innerHTML = '';
            const log = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { onFlowChange: (nf) => log.log('onFlowChange', nf) });
            view.render(getMockState());
            
            testContainer.querySelector('.delete-btn').click();

            const expectedFlow = [{ pattern: 'chorus', repetitions: 8 }];
            log.wasCalledWith('onFlowChange', expectedFlow);
        });

        runner.it('should fire onAddPatternClick when add button is clicked', () => {
            console.log("TEST: Flow Panel - should fire onAddPatternClick");
            testContainer.innerHTML = '';
            const log = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { onAddPatternClick: () => log.log('onAddPatternClick') });
            view.render(getMockState());

            testContainer.querySelector('.add-pattern-btn').click();
            log.wasCalledWith('onAddPatternClick');
        });

        runner.it('should fire onPatternSelect when a flow item is clicked', () => {
            console.log("TEST: Flow Panel - should fire onPatternSelect");
            testContainer.innerHTML = '';
            const log = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { onPatternSelect: (id) => log.log('onPatternSelect', id) });
            view.render(getMockState());

            // MALFORMED CODE FIX: Select the second item specifically before clicking.
            const secondItem = testContainer.querySelectorAll('.flow-item')[1];
            if (!secondItem) throw new Error("Could not find the second flow item to click");
            secondItem.click();
            
            log.wasCalledWith('onPatternSelect', 'chorus');
        });
    });

    runner.describe('RhythmEditorView: Grid & Palette', () => {
        runner.it('should fire onRemoveNote when a cell with a note is clicked', () => {
            console.log("TEST: Grid - should fire onRemoveNote");
            testContainer.innerHTML = '';
            const log = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { onRemoveNote: (pos) => log.log('onRemoveNote', pos) });
            view.render(getMockState());

            // Based on KCK: '||o---|----|o---|----||' -> after stripping |: "o---o---o---"
            // Tick 0 has 'o', so clicking it should remove the note
            const cell = testContainer.querySelector('.grid-cell[data-symbol="KCK"][data-tick="0"]');
            if (!cell) throw new Error("Could not find grid cell KCK at tick 0");
            
            // Verify the cell actually has content (should have an img tag)
            console.log("  Cell content:", cell.innerHTML);
            console.log("  Cell data-has-note:", cell.dataset.hasNote);
            
            cell.click();

            const expectedPosition = { patternId: 'verse', measureIndex: 0, instrumentSymbol: 'KCK', tick: 0 };
            log.wasCalledWith('onRemoveNote', expectedPosition);
        });

        runner.it('should fire onAddNote when an empty cell is clicked after selecting a note', () => {
            console.log("TEST: Grid/Palette - should fire onAddNote");
            testContainer.innerHTML = '';
            const log = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { onAddNote: (pos) => log.log('onAddNote', pos) });
            const initialState = getMockState();
            view.render(initialState); // Initial render

            console.log("  Step 1: Clicking instrument header to show palette...");
            const header = testContainer.querySelector('.instrument-header[data-symbol="KCK"]');
            if (!header) throw new Error("Could not find KCK instrument header");
            header.click();

            console.log("  Step 2: Clicking palette note to select it...");
            const paletteNote = testContainer.querySelector('.palette-note[data-letter="p"]');
            if (!paletteNote) throw new Error("Could not find palette note 'p'");
            paletteNote.click();
            
            console.log("  Step 3: Clicking empty grid cell to place note...");
            // Based on KCK: '||o---|----|o---|----||' -> after stripping |: "o---o---o---"
            // Tick 1 is empty (-), so we should be able to add a note there
            const emptyCell = testContainer.querySelector('.grid-cell[data-symbol="KCK"][data-tick="1"]');
            if (!emptyCell) throw new Error("Could not find empty KCK cell at tick 1");
            
            // Verify the cell is actually empty
            console.log("  Empty cell content:", emptyCell.innerHTML);
            console.log("  Empty cell data-has-note:", emptyCell.dataset.hasNote);
            
            emptyCell.click();
            
            const expectedPosition = { patternId: 'verse', measureIndex: 0, instrumentSymbol: 'KCK', tick: 1, note: 'p' };
            log.wasCalledWith('onAddNote', expectedPosition);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    console.log("--- Setting up Manual Test for RhythmEditorView ---");
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output');

    const originalConfirm = window.confirm;
    window.confirm = (message) => {
        log.log(`window.confirm called with: "${message}"`);
        return originalConfirm(message);
    };

    let currentState = {
        rhythm: {
            playback_flow: [
                { pattern: 'intro', repetitions: 1 },
                { pattern: 'verse_a', repetitions: 2 },
            ],
            patterns: {
                intro: { metadata: { resolution: 8 }, pattern_data: [{ KCK: '||o-o-o-o-||' }] },
                verse_a: { metadata: { resolution: 16 }, pattern_data: [{ KCK: '||o---|----|o-o-|----||', SNR: '||----|o---|----|o---||' }] }
            },
            instrumentDefsBySymbol: {
                KCK: { symbol: "KCK", name: "Kick", sounds: [{ letter: "o", name: "Hit", svg: "k.svg" }] },
                SNR: { symbol: "SNR", name: "Snare", sounds: [{ letter: "o", name: "Hit", svg: "s.svg" }] }
            }
        },
        currentEditingPatternId: null
    };

    const container = document.getElementById('view-container');
    const view = new RhythmEditorView(container, {
        onFlowChange: (newFlow) => {
            log.log('onFlowChange', { newFlow });
            currentState.rhythm.playback_flow = newFlow;
            view.render(currentState);
        },
        onAddPatternClick: () => log.log('onAddPatternClick'),
        onPatternSelect: (patternId) => {
            log.log('onPatternSelect', { patternId });
            currentState.currentEditingPatternId = patternId;
            view.render(currentState);
        },
        onAddNote: (p) => log.log('onAddNote', p),
        onRemoveNote: (p) => log.log('onRemoveNote', p),
        onAddTrack: (p, s) => log.log('onAddTrack', { pattern: p, symbol: s }),
        onRemoveTrack: (p, s) => log.log('onRemoveTrack', { pattern: p, symbol: s }),
    });

    view.render(currentState);
}