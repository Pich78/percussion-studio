// file: test/suites/controller/ProjectController.test.js (Complete, Final Version)

// Import necessary modules for the test suite
import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { ProjectController } from '/percussion-studio/src/controller/ProjectController.js';

// The main test function to be exported and run
export async function run() {
    const runner = new TestRunner();
    // Clear logs before starting and set a target for log output
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    // --- Mocks ---
    // A mock Data Access Layer (DAL) to simulate data fetching
    const createMockDAL = () => {
        const logger = new MockLogger('DataAccessLayer');
        logger.getManifest = async () => {
            logger.log('getManifest');
            return { instrument_defs: ['kck_drum_kick', 'snr_drum_snare', 'tom_drum_tom'] };
        };
        logger.getRhythm = async (id) => {
            logger.log('getRhythm', { id });
            return { sound_kit: { KCK: 'acoustic_kick', SNR: 'acoustic_snare' }, playback_flow: [{ pattern: 'p1' }] };
        };
        logger.getPattern = async (id) => {
            logger.log('getPattern', { id });
            return { metadata: { name: 'Pattern1' } };
        };
        logger.getInstrumentDef = async (id) => {
            logger.log('getInstrumentDef', { id });
            if (id.includes('kick')) return { symbol: 'KCK' };
            if (id.includes('snare')) return { symbol: 'SNR' };
            return { symbol: 'UNKNOWN' };
        };
        logger.getSoundPack = async (symbol, packName) => {
            logger.log('getSoundPack', { symbol, packName });
            if (symbol === 'KCK') return { sound_files: { o: 'kick.wav' } };
            if (symbol === 'SNR') return { sound_files: { o: 'snare.wav' } };
            return {};
        };
        logger.exportRhythmAsZip = async (rhythm, patterns, filename, jszip) => {
            logger.log('exportRhythmAsZip', { filename, rhythm, patterns });
        };
        return logger;
    };

    // A mock Audio Player
    const createMockPlayer = () => {
        const logger = new MockLogger('AudioPlayer');
        logger.loadSounds = async (sounds) => logger.log('loadSounds', { sounds });
        return logger;
    };

    // A mock Audio Scheduler
    const createMockScheduler = () => {
        const logger = new MockLogger('AudioScheduler');
        logger.setRhythm = (rhythm) => logger.log('setRhythm', { rhythm });
        return logger;
    };

    // Test suite for the createNewRhythm method
    runner.describe('ProjectController - createNewRhythm', () => {
        runner.it('should create a valid new rhythm structure', () => {
            const controller = new ProjectController(null, null, null);
            const newRhythm = controller.createNewRhythm();
            runner.expect(typeof newRhythm.sound_kit).toBe('object');
            runner.expect(typeof newRhythm.patterns.untitled_pattern).toBe('object');
            runner.expect(newRhythm.playback_flow.pattern).toBe('untitled_pattern');
        });
    });

    // Test suite for the loadRhythm method, focusing on sound kit-driven loading
    runner.describe('ProjectController - loadRhythm (SoundKit-Driven)', () => {
        runner.it('should load only the dependencies specified in the sound_kit', async () => {
            const dalMock = createMockDAL();
            const playerMock = createMockPlayer();
            const schedulerMock = createMockScheduler();
            const controller = new ProjectController(dalMock, playerMock, schedulerMock);

            await controller.loadRhythm('my_song');

            dalMock.wasCalledWith('getInstrumentDef', { id: 'kck_drum_kick' });
            dalMock.wasCalledWith('getInstrumentDef', { id: 'snr_drum_snare' });

            // --- FINAL, CORRECT FIX: Add a check for `call.args` to prevent crash ---
            // This defensive check ensures `call.args.id` is not accessed if `call.args` is undefined.
            const tomCall = dalMock.callLog.find(call => 
                call.method === 'getInstrumentDef' && call.args && call.args.id === 'tom_drum_tom'
            );
            runner.expect(tomCall).toBe(undefined);

            const expectedSounds = [
                { id: 'KCK_o', path: '/percussion-studio/data/sounds/acoustic_kick/kick.wav' },
                { id: 'SNR_o', path: '/percussion-studio/data/sounds/acoustic_snare/snare.wav' }
            ];
            playerMock.wasCalledWith('loadSounds', { sounds: expectedSounds });

            runner.expect(schedulerMock.callLog.some(c => c.method === 'setRhythm')).toBe(true);
        });

        runner.it('should throw an error if a data dependency fails to load', async () => {
            const dalMock = createMockDAL();
            dalMock.getPattern = async () => { throw new Error("File not found"); };
            const controller = new ProjectController(dalMock, createMockPlayer(), createMockScheduler());

            let didThrow = false;
            try {
                await controller.loadRhythm('my_song');
            } catch (e) {
                didThrow = true;
                runner.expect(e.message.includes("File not found")).toBe(true);
            }
            runner.expect(didThrow).toBe(true);
        });
    });

    // Test suite for the saveProject method
    runner.describe('ProjectController - saveProject', () => {
        runner.it('should gather data and call the DAL to export', async () => {
            const dalMock = createMockDAL();
            const controller = new ProjectController(dalMock, null, null);
            const projectToSave = {
                global_bpm: 120,
                sound_kit: { KCK: 'kick_v1' },
                patterns: { patt1: { metadata: { name: 'Verse' } } },
                playback_flow: [{ pattern: 'patt1' }],
            };
            await controller.saveProject(projectToSave, 'my-new-song');
            
            const expectedRhythmFile = {
                global_bpm: 120, sound_kit: { KCK: 'kick_v1' }, playback_flow: [{ pattern: 'p1' }]
            };
            const expectedPatterns = [{ id: 'p1', data: { metadata: { name: 'Verse' } } }];
            
            dalMock.wasCalledWith('exportRhythmAsZip', {
                filename: 'my-new-song',
                rhythm: expectedRhythmFile,
                patterns: expectedPatterns
            });
        });
    });

    // Run all the tests and render the results
    await runner.runAll();
    runner.renderResults('test-results');
    
}
