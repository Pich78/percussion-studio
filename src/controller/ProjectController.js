// file: src/controller/ProjectController.js (Complete, Corrected Version)
import { DataAccessLayer } from '../dal/DataAccessLayer.js';
import JSZip from "https://esm.sh/jszip@3.10.1";
export class ProjectController {
  constructor(dal, audioPlayer, audioScheduler) {
    this.dal = dal;
    this.audioPlayer = audioPlayer;
    this.audioScheduler = audioScheduler;
    this.manifest = null;
    console.log('[ProjectController] Initialized.');
  }

  async loadManifest() {
    if (!this.manifest) {
      console.log('[ProjectController] Manifest not cached. Fetching...');
      this.manifest = await this.dal.getManifest();
      console.log('[ProjectController] Manifest loaded and cached.', this.manifest);
    }
  }

  createNewRhythm() {
    console.log('[ProjectController] Creating new default rhythm structure.');
    return {
      global_bpm: 120,
      sound_kit: {},
      patterns: {
        'untitled_pattern': {
          metadata: { name: 'Untitled Pattern', resolution: 16, metric: '4/4' },
          pattern_data: [{}] // Start with one empty measure
        }
      },
      playback_flow: [{ pattern: 'untitled_pattern', repetitions: 1 }],
      instrumentDefsBySymbol: {},
      soundPacks: {}
    };
  }

  async loadRhythm(id) {
    console.log(`[ProjectController] Starting to load rhythm with id: "${id}"`);
    try {
      // 1. Ensure manifest is loaded
      await this.loadManifest();

      // 2. Fetch the main rhythm file
      console.log(`[ProjectController] Fetching main rhythm file: ${id}.rthm.yaml`);
      const rhythmData = await this.dal.getRhythm(id);
      const soundKit = rhythmData.sound_kit;
      console.log('[ProjectController] Rhythm file loaded. Sound kit:', soundKit);

      // 3. Fetch all required Instrument Definitions based on the rhythm's sound_kit
      const requiredSymbols = Object.keys(soundKit);
      console.log('[ProjectController] Required instrument symbols:', requiredSymbols);
      const instDefPromises = requiredSymbols.map(symbol => {
        // Find the full instrument def name from the manifest (e.g., 'drum_kick' from 'KCK')
        const defName = this.manifest.instrument_defs.find(def => def.startsWith(symbol.toLowerCase()));
        if (!defName) throw new Error(`Instrument definition for symbol '${symbol}' not found in manifest.`);
        console.log(`[ProjectController]   - Found mapping in manifest: ${symbol} -> ${defName}`);
        return this.dal.getInstrumentDef(defName);
      });
      const instrumentDefs = await Promise.all(instDefPromises);
      console.log('[ProjectController] All required instrument definitions loaded.', instrumentDefs);

      // 4. Fetch all required Sound Packs based on the sound_kit
      const soundPackPromises = requiredSymbols.map(symbol => {
        const packName = soundKit[symbol];
        return this.dal.getSoundPack(symbol, packName);
      });
      const soundPacks = await Promise.all(soundPackPromises);
      console.log('[ProjectController] All required sound packs loaded.', soundPacks);

      // 5. Fetch all unique Pattern files
      const patternIds = [...new Set(rhythmData.playback_flow.map(item => item.pattern))];
      console.log('[ProjectController] Required pattern IDs:', patternIds);
      const patternPromises = patternIds.map(pId => this.dal.getPattern(pId));
      const patterns = await Promise.all(patternPromises);
      console.log('[ProjectController] All required patterns loaded.', patterns);

      // 6. Assemble the list of .wav files for the AudioPlayer
      const soundList = [];
      soundPacks.forEach((pack, index) => {
        const symbol = requiredSymbols[index];
        const packName = soundKit[symbol];
        const instDef = instrumentDefs.find(def => def.symbol === symbol);
        if (!instDef) return;

        Object.entries(pack.sound_files).forEach(([letter, wavFile]) => {
          soundList.push({
            id: `${symbol}_${letter}`,
            path: `/percussion-studio/data/sounds/${packName}/${wavFile}`
          });
        });
      });
      console.log('[ProjectController] Assembled sound list for AudioPlayer:', soundList);
      await this.audioPlayer.loadSounds(soundList);
      console.log('[ProjectController] AudioPlayer has finished loading sounds.');

      // 7. Assemble the final, resolved rhythm object
      const resolvedRhythm = {
        ...rhythmData,
        patterns: {},
        soundPacks: {},
        instrumentDefsBySymbol: {}
      };
      
      instrumentDefs.forEach(def => { resolvedRhythm.instrumentDefsBySymbol[def.symbol] = def; });
      patternIds.forEach((pId, i) => { resolvedRhythm.patterns[pId] = patterns[i]; });
      requiredSymbols.forEach((symbol, i) => {
        const packName = soundKit[symbol];
        resolvedRhythm.soundPacks[`${symbol}.${packName}`] = soundPacks[i];
      });

      console.log('[ProjectController] Successfully assembled final resolved rhythm object.', resolvedRhythm);
      this.audioScheduler.setRhythm(resolvedRhythm);
      return resolvedRhythm;

    } catch (error) {
      console.error(`[ProjectController] A critical error occurred while loading rhythm "${id}":`, error);
      // Re-throw the error so the App layer can catch it and display it to the user.
      throw new Error(`Failed to load rhythm project "${id}". Reason: ${error.message}`);
    }
  }

  async saveProject(projectData, filename) {
    console.log(`[ProjectController] Preparing to save project data as "${filename}.zip"`);
    const rhythmFileContent = {
      global_bpm: projectData.global_bpm,
      sound_kit: projectData.sound_kit,
      playback_flow: projectData.playback_flow
    };
    const patternsToSave = Object.entries(projectData.patterns).map(([id, data]) => ({ id, data }));
    console.log('[ProjectController] Data prepared for export:', { rhythmFileContent, patternsToSave });

    await this.dal.exportRhythmAsZip(rhythmFileContent, patternsToSave, filename, JSZip);
    console.log('[ProjectController] Export complete.');
  }
}
