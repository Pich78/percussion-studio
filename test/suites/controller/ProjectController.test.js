// file: test/suites/controller/ProjectController.test.js (Complete, Final Version - Fixed)

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
            return { instrument_defs: ['kck_drum_kick', 'snr_drum_snare', 'tom_drum_tom'] };
        };
        logger.getRhythm = async (id) => {
            logger.log('getRhythm', { id });
            return { sound_kit: { KCK: 'acoustic_kick', SNR: 'acoustic_snare' }, playback_flow: [{ pattern: 'p1' }] };
        };
        logger.getPattern = async (id) => {
            logger.log('getPattern', { id });
            // FIX 1: The mock needs to return a patterns object
            // to prevent the test from failing with "Cannot read properties of undefined (reading 'find')"
            return { metadata: { name: 'Pattern1' } };
        };
        logger.getInstrumentDef = async (id) => {
            logger.log('getInstrumentDef', { id });
            if (id.includes('kick')) return { symbol: 'KCK' };
            if (id.includes('snare')) return { symbol: 'SNR' };
            throw new Error(`Unknown instrument definition: ${id}`);
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
        runner.it('should create a valid new rhythm structure', () => {
            const controller = new ProjectController(null, null, null);
            const newRhythm = controller.createNewRhythm();

            runner.expect(newRhythm.global_bpm).toBe(120);
            runner.expect(newRhythm.sound_kit).toBeInstanceOf(Object);
            runner.expect(Object.keys(newRhythm.patterns).length).toBe(1);
            runner.expect(newRhythm.patterns['untitled_pattern']).not.toBe(undefined);
            runner.expect(newRhythm.playback_flow.length).toBe(1);
        });
    });

    runner.describe('ProjectController - loadRhythm (SoundKit-Driven)', () => {
        runner.it('should load only the dependencies specified in the sound_kit', async () => {
            const dalMock = createMockDAL();
            const playerMock = createMockPlayer();
            const schedulerMock = createMockScheduler();
            const controller = new ProjectController(dalMock, playerMock, schedulerMock);

            await controller.loadRhythm('test_rhythm');

            // --- Assertions ---
            // 1. Should have fetched the main rhythm file
            dalMock.wasCalledWith('getRhythm', { id: 'test_rhythm' });

            // 2. Should have fetched only the required instrument definitions (KCK, SNR)
            dalMock.wasCalledWith('getInstrumentDef', { id: 'kck_drum_kick' });
            dalMock.wasCalledWith('getInstrumentDef', { id: 'snr_drum_snare' });

            // 3. Should have fetched only the required sound packs (acoustic_kick, acoustic_snare)
            dalMock.wasCalledWith('getSoundPack', { symbol: 'KCK', packName: 'acoustic_kick' });
            dalMock.wasCalledWith('getSoundPack', { symbol: 'SNR', packName: 'acoustic_snare' });

            // 4. Should have fetched only the patterns specified in the playback flow ('p1')
            dalMock.wasCalledWith('getPattern', { id: 'p1' });

            // 5. Should have instructed the AudioPlayer to load the correct sounds
            playerMock.wasCalledWith('loadSounds', {
                sounds: [
                    { id: 'KCK_o', path: '/percussion-studio/data/sounds/acoustic_kick/kick.wav' },
                    { id: 'SNR_o', path: '/percussion-studio/data/sounds/acoustic_snare/snare.wav' }
                ]
            });

            // 6. Should have instructed the AudioScheduler to set the final rhythm object
            schedulerMock.wasCalledWith('setRhythm', {
                rhythm: {
                    sound_kit: { KCK: 'acoustic_kick', SNR: 'acoustic_snare' },
                    playback_flow: [{ pattern: 'p1' }],
                    patterns: { 'p1': { metadata: { name: 'Pattern1' } } },
                    soundPacks: {
                        'KCK.acoustic_kick': { sound_files: { o: 'kick.wav' } },
                        'SNR.acoustic_snare': { sound_files: { o: 'snare.wav' } }
                    },
                    instrumentDefsBySymbol: {
                        KCK: { symbol: 'KCK' },
                        SNR: { symbol: 'SNR' }
                    }
                }
            });

            // FIX 2: Check for unwanted calls to ensure we don't fetch unnecessary data.
            // Use the corrected method to get the mock instance
            const dalInstance = MockLogger.getMockInstance('DataAccessLayer');
            dalInstance.callLog.forEach(call => {
                if (!['getManifest', 'getRhythm', 'getInstrumentDef', 'getSoundPack', 'getPattern'].includes(call.methodName)) {
                    throw new Error(`Unexpected call to DAL method: ${call.methodName}`);
                }
            });
        });

        runner.it('should throw an error if a data dependency fails to load', async () => {
            const dalMock = createMockDAL();
            // Override the getPattern mock to simulate an error
            dalMock.getPattern = async (id) => {
                throw new Error('File not found');
            };
            const controller = new ProjectController(dalMock, null, null);
            let didThrow = false;

            try {
                await controller.loadRhythm('test_rhythm');
            } catch (e) {
                didThrow = true;
                runner.expect(e.message.includes("File not found")).toBe(true);
            }
            runner.expect(didThrow).toBe(true);
        });
    });

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
                global_bpm: 120, sound_kit: { KCK: 'kick_v1' }, playback_flow: [{ pattern: 'patt1' }]
            };
            // --- FIX 3: Correct the pattern ID to match the test data ---
            const expectedPatterns = [{ id: 'patt1', data: { metadata: { name: 'Verse' } } }];

            dalMock.wasCalledWith('exportRhythmAsZip', {
                filename: 'my-new-song',
                rhythm: expectedRhythmFile,
                patterns: expectedPatterns
            });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}