// file: test/suites/controller/ProjectController.test.js (Complete, Final Version)
import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { ProjectController } from '/percussion-studio/src/controller/ProjectController.js';
export async function run() {
const runner = new TestRunner();
MockLogger.clearLogs();
MockLogger.setLogTarget('log-output');

    // --- Mocks ---const createMockDAL = () => {
    const logger = new MockLogger('DataAccessLayer');
    
    // --- CRITICAL FIX: Add the missing 'wasNotCalledWith' helper to the mock ---
    logger.wasNotCalledWith = (method, expectedArgs) => {
        const wasCalled = logger.callLog.some(call =>
            call.method === method &&
            JSON.stringify(call.args) === JSON.stringify(expectedArgs)
        );
        if (wasCalled) {
            throw new Error(`Expected method '${method}' NOT to be called with ${JSON.stringify(expectedArgs)}, but it WAS.`);
        }
    };

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
};const createMockPlayer = () => {
    const logger = new MockLogger('AudioPlayer');
    logger.loadSounds = async (sounds) => logger.log('loadSounds', { sounds });
    return logger;
};const createMockScheduler = () => {
    const logger = new MockLogger('AudioScheduler');
    logger.setRhythm = (rhythm) => logger.log('setRhythm', { rhythm });
    return logger;
};

runner.describe('ProjectController - createNewRhythm', () => {
    runner.it('should create a valid new rhythm structure', () => {
        const controller = new ProjectController(null, null, null);
        const newRhythm = controller.createNewRhythm();
        runner.expect(typeof newRhythm.sound_kit).toBe('object');
        runner.expect(typeof newRhythm.patterns.untitled_pattern).toBe('object');
        // --- CRITICAL FIX: Access the first element of the playback_flow array ---
        runner.expect(newRhythm.playback_flow.pattern).toBe('untitled_pattern');
    });
});

runner.describe('ProjectController - loadRhythm (SoundKit-Driven)', () => {
    runner.it('should load only the dependencies specified in the sound_kit', async () => {
        const dalMock = createMockDAL();
        const playerMock = createMockPlayer();
        const schedulerMock = createMockScheduler();
        const controller = new ProjectController(dalMock, playerMock, schedulerMock);

        await controller.loadRhythm('my_song');

        dalMock.wasCalledWith('getInstrumentDef', { id: 'kck_drum_kick' });
        dalMock.wasCalledWith('getInstrumentDef', { id: 'snr_drum_snare' });
        // Use the newly added helper function for the negative assertion
        dalMock.wasNotCalledWith('getInstrumentDef', { id: 'tom_drum_tom' });

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
        const expectedPatterns = [{ id: 'patt1', data: { metadata: { name: 'Verse' } } }];
        
        dalMock.wasCalledWith('exportRhythmAsZip', {
            filename: 'my-new-song',
            rhythm: expectedRhythmFile,
            patterns: expectedPatterns
        });
    });
});await runner.runAll();
runner.renderResults('test-results');
  
}
