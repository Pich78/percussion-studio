// file: test/suites/controller/EditController.test.js (Complete)
import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { EditController } from '/percussion-studio/src/controller/EditController.js';
export async function run() {
  const runner = new TestRunner();
  MockLogger.clearLogs();
  MockLogger.setLogTarget('log-output');
  
  runner.describe('EditController - Note Editing', () => {
    runner.it('should add a note to the correct position', () => {
        const controller = new EditController();
        const initialRhythm = { patterns: { p1: { metadata: { resolution: 8 }, pattern_data: [{ KCK: '||--------||' }] } } };
        const position = { patternId: 'p1', measureIndex: 0, instrumentSymbol: 'KCK', tick: 2, note: 'o' };
        const updatedRhythm = controller.addNote(initialRhythm, position);
        runner.expect(updatedRhythm.patterns.p1.pattern_data[0].KCK).toBe('||--o-----||');
    });

    runner.it('should remove a note from the correct position', () => {
        const controller = new EditController();
        const initialRhythm = { patterns: { p1: { metadata: { resolution: 8 }, pattern_data: [{ KCK: '||--o-----||' }] } } };
        const position = { patternId: 'p1', measureIndex: 0, instrumentSymbol: 'KCK', tick: 2 };
        const updatedRhythm = controller.removeNote(initialRhythm, position);
        runner.expect(updatedRhythm.patterns.p1.pattern_data[0].KCK).toBe('||--------||');
    });
});

runner.describe('EditController - Track Management', () => {
    runner.it('should add a new track to a pattern', () => {
        const controller = new EditController();
        const initialRhythm = {
            sound_kit: { KCK: 'test_kick' },
            patterns: { p1: { metadata: { resolution: 8 }, pattern_data: [{ KCK: '||o-------||' }, {}] } }
        };
        const position = { patternId: 'p1', instrumentSymbol: 'SNR', soundPackName: 'test_snare' };
        const updatedRhythm = controller.addTrack(initialRhythm, position);

        // Check that the track was added to both measures
        runner.expect(updatedRhythm.patterns.p1.pattern_data[0].SNR).toBe('||--------||');
        runner.expect(updatedRhythm.patterns.p1.pattern_data[1].SNR).toBe('||--------||');
        // Check that the sound kit was updated
        runner.expect(updatedRhythm.sound_kit.SNR).toBe('test_snare');
    });

    runner.it('should remove a track from all measures in a pattern', () => {
        const controller = new EditController();
        const initialRhythm = {
            sound_kit: { KCK: 'test_kick', SNR: 'test_snare' },
            patterns: { p1: { metadata: { resolution: 8 }, pattern_data: [{ KCK: '||o-------||', SNR: '||----o---||' }, { KCK: '||o-------||' }] } }
        };
        const position = { patternId: 'p1', instrumentSymbol: 'KCK' };
        const updatedRhythm = controller.removeTrack(initialRhythm, position);
        
        // Check that the KCK track is gone from both measures
        runner.expect(updatedRhythm.patterns.p1.pattern_data[0].KCK).toBe(undefined);
        runner.expect(updatedRhythm.patterns.p1.pattern_data[1].KCK).toBe(undefined);
        // Check that the SNR track remains
        runner.expect(updatedRhythm.patterns.p1.pattern_data[0].SNR).toBe('||----o---||');
    });
});

runner.describe('EditController - Pattern Management', () => {
    runner.it('should add a new empty pattern to the rhythm', () => {
        const controller = new EditController();
        const initialRhythm = {
            patterns: { p1: { } }
        };
        const newPatternInfo = {
            patternId: 'p2_chorus',
            metadata: { name: 'Chorus', metric: '4/4', resolution: 16 }
        };

        const updatedRhythm = controller.addPattern(initialRhythm, newPatternInfo);

        // Check that the new pattern object exists
        runner.expect(updatedRhythm.patterns.p2_chorus !== undefined).toBe(true);
        // Check that the metadata is correct
        runner.expect(updatedRhythm.patterns.p2_chorus.metadata.name).toBe('Chorus');
        // Check that it created one empty measure
        runner.expect(updatedRhythm.patterns.p2_chorus.pattern_data.length).toBe(1);
    });
});

runner.describe('EditController - Playback Flow', () => {
    runner.it('should update the playback_flow with a new sequence', () => {
        const controller = new EditController();
        const initialRhythm = {
            playback_flow: [{ pattern: 'p1', repetitions: 4 }]
        };
        const newFlow = [
            { pattern: 'p1', repetitions: 2 },
            { pattern: 'p2', repetitions: 1 }
        ];

        const updatedRhythm = controller.updatePlaybackFlow(initialRhythm, newFlow);

        runner.expect(updatedRhythm.playback_flow).toEqual(newFlow);
        runner.expect(initialRhythm.playback_flow).toEqual([{ pattern: 'p1', repetitions: 4 }]);
    });
});
await runner.runAll();
runner.renderResults('test-results');
}
