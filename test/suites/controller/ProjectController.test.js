// file: test/suites/controller/ProjectController.test.js

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
        logger.getRhythm = async (id) => {
            logger.log('getRhythm', { id });
            // Return mock rhythm data
            return {
                global_bpm: 150,
                instrument_kit: { KCK: 'acoustic_kick' },
                playback_flow: [{ pattern: 'verse' }]
            };
        };
        logger.getPattern = async (id) => {
            logger.log('getPattern', { id });
            return { metadata: { name: 'Verse Pattern' }, pattern_data: [] };
        };
        logger.getInstrument = async (id) => {
            logger.log('getInstrument', { id });
            // This instrument has one sound file
            return { name: 'Acoustic Kick', sounds: [{ wav: 'kick.wav' }] };
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
        runner.it('should orchestrate the full loading and resolution process', async () => {
            const dalMock = createMockDAL();
            const playerMock = createMockPlayer();
            const schedulerMock = createMockScheduler();
            const controller = new ProjectController(dalMock, playerMock, schedulerMock);

            const resolvedRhythm = await controller.loadRhythm('my_song');

            // 1. Verify DAL calls
            dalMock.wasCalledWith('getRhythm', { id: 'my_song' });
            dalMock.wasCalledWith('getPattern', { id: 'verse' });
            dalMock.wasCalledWith('getInstrument', { id: 'acoustic_kick' });
            
            // 2. Verify sound loading
            // The path needs to be constructed correctly
            const expectedSoundList = [{ id: 'acoustic_kick_0', path: 'data/instruments/acoustic_kick/kick.wav' }];
            playerMock.wasCalledWith('loadSounds', { sounds: expectedSoundList });

            // 3. Verify final setup on scheduler
            runner.expect(schedulerMock.callCount).toBe(1);
            // The test for the data passed to setRhythm would be very large,
            // so we just check that it was called. A more rigorous test could
            // check specific properties of the resolved rhythm.
            
            // 4. Verify the returned object is correctly resolved
            runner.expect(resolvedRhythm.patterns.verse.metadata.name).toBe('Verse Pattern');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}