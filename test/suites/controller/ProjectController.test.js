// file: test/suites/controller/ProjectController.test.js (Complete, Final Version)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { ProjectController } from '/percussion-studio/src/controller/ProjectController.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    // --- Mocks ---
    const createMockDAL = () => {
        const logger = new MockLogger('DataAccessLayer');
        logger.getManifest = async () => {
            logger.log('getManifest');
            return { instrument_defs: ['drum_kick'] };
        };
        logger.getRhythm = async (id) => {
            logger.log('getRhythm', { id });
            return { sound_kit: { KCK: 'test_pack' }, playback_flow: [{ pattern: 'p1' }] };
        };
        logger.getPattern = async (id) => {
            logger.log('getPattern', { id });
            return { metadata: { name: 'Pattern1' } };
        };
        logger.getInstrumentDef = async (id) => {
            logger.log('getInstrumentDef', { id });
            if (id.includes('kick')) return { symbol: 'KCK', sounds: [{ letter: 'o' }] };
            return { symbol: 'UNKNOWN' };
        };
        logger.getSoundPack = async (symbol, packName) => {
            logger.log('getSoundPack', { symbol, packName });
            return { sound_files: { o: 'kick.wav' } };
        };
        logger.exportRhythmAsZip = async (rhythm, patterns, filename, jszip) => {
            logger.log('exportRhythmAsZip', { filename, rhythm, patterns });
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

    runner.describe('ProjectController - createNewRhythm', () => {
        runner.it('should create a new rhythm structure with a sound_kit', () => {
            const controller = new ProjectController(null, null, null);
            const newRhythm = controller.createNewRhythm();
            runner.expect('sound_kit' in newRhythm).toBe(true);
        });
    });

    runner.describe('ProjectController - loadRhythm (Manifest-Driven)', () => {
        runner.it('should use the manifest to dynamically load all dependencies', async () => {
            const dalMock = createMockDAL();
            const playerMock = createMockPlayer();
            const schedulerMock = createMockScheduler();
            const controller = new ProjectController(dalMock, playerMock, schedulerMock);

            await controller.loadRhythm('my_song');

            dalMock.wasCalledWith('getManifest', undefined);
            dalMock.wasCalledWith('getInstrumentDef', { id: 'drum_kick' });
        });
    });

    runner.describe('ProjectController - saveProject', () => {
        runner.it('should gather user data and call the DAL to export', async () => {
            const dalMock = createMockDAL();
            const controller = new ProjectController(dalMock, null, null);
            const projectToSave = {
                global_bpm: 120,
                sound_kit: { KCK: 'kick_v1' },
                patterns: { patt1: { metadata: { name: 'Verse' } } },
                playback_flow: [{ pattern: 'patt1' }],
            };
            await controller.saveProject(projectToSave, 'my-new-song');
            const expectedRhythm = {
                global_bpm: 120, sound_kit: { KCK: 'kick_v1' }, playback_flow: [{ pattern: 'patt1' }]
            };
            const expectedPatterns = [{ id: 'patt1', data: { metadata: { name: 'Verse' } } }];
            dalMock.wasCalledWith('exportRhythmAsZip', {
                filename: 'my-new-song',
                rhythm: expectedRhythm,
                patterns: expectedPatterns
            });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}