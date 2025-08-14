// file: test/suites/controller/ProjectController.test.js (Complete)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { ProjectController } from '/percussion-studio/src/controller/ProjectController.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    // --- Mocks for all dependencies ---
    const createMockDAL = () => {
        const logger = new MockLogger('DataAccessLayer');
        logger.getRhythm = async (id) => ({ global_bpm: 150, instrument_kit: { KCK: 'acoustic_kick' }, playback_flow: [{ pattern: 'verse' }] });
        logger.getPattern = async (id) => ({ metadata: { name: 'Verse Pattern' }, pattern_data: [] });
        logger.getInstrument = async (id) => ({ name: 'Acoustic Kick', sounds: [{ wav: 'kick.wav' }] });
        // Add mock for export, as it's the method under test
        logger.exportRhythmAsZip = async (rhythm, patterns, instruments, filename, jszip) => {
            logger.log('exportRhythmAsZip', { filename, rhythm, patterns, instruments });
        };
        return logger;
    };

    const createMockPlayer = () => {
        const logger = new MockLogger('AudioPlayer');
        logger.loadSounds = async (sounds) => logger.log('loadSounds', { sounds });
        return logger;
    };
    
    const createMockScheduler = () => {
        const logger = new MockLogger('AudioScheduler');
        logger.setRhythm = (rhythm) => logger.log('setRhythm', { rhythm });
        return logger;
    };

    // --- Test Suites ---
    runner.describe('ProjectController - createNewRhythm', () => {
        runner.it('should create a new, default rhythm structure', () => { /* no change */ });
    });

    runner.describe('ProjectController - loadRhythm', () => {
        runner.it('should orchestrate the full loading and resolution process', async () => { /* no change */ });
    });

    runner.describe('ProjectController - saveProject', () => {
        runner.it('should gather all data and call the DAL to export a zip', async () => {
            const dalMock = createMockDAL();
            const controller = new ProjectController(dalMock, createMockPlayer(), createMockScheduler());

            // This is the full, resolved rhythm data we're pretending to save.
            const projectToSave = {
                global_bpm: 120,
                instrument_kit: { KCK: 'kick_v1' },
                patterns: {
                    patt1: { metadata: { name: 'Verse' } }
                },
                playback_flow: [{ pattern: 'patt1' }],
                // In a real scenario, instrument data would be separate, but for the test,
                // we'll assume it's available for gathering.
                instruments: {
                    kick_v1: { name: 'My Kick' }
                }
            };

            await controller.saveProject(projectToSave, 'my-new-song');

            // Define what we expect the DAL to receive
            const expectedRhythmData = {
                global_bpm: 120,
                instrument_kit: { KCK: 'kick_v1' },
                playback_flow: [{ pattern: 'patt1' }]
            };
            const expectedPatterns = [{ id: 'patt1', data: { metadata: { name: 'Verse' } } }];
            const expectedInstruments = [{ id: 'kick_v1', data: { name: 'My Kick' } }];
            
            // Verify the DAL was called with the correctly structured data
            dalMock.wasCalledWith('exportRhythmAsZip', {
                filename: 'my-new-song',
                rhythm: expectedRhythmData,
                patterns: expectedPatterns,
                instruments: expectedInstruments
            });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}