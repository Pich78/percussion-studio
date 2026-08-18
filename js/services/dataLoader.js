/* 
  js/services/dataLoader.js
  Handles fetching and parsing of YAML data files based on the Manifest.
  Requires: js-yaml library loaded in index.html (window.jsyaml)
*/

class DataLoaderService {
    constructor() {
        this.manifest = null;
        this.MANIFEST_URL = './manifest.json';
    }

    /**
     * Initializes the loader by fetching the master manifest.json.
     * This must be called before loading other assets.
     */
    async init() {
        try {
            const response = await fetch(this.MANIFEST_URL, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Failed to load manifest: ${response.status}`);
            this.manifest = await response.json();
            console.log('✅ Manifest loaded:', this.manifest);
        } catch (error) {
            console.error('CRITICAL: Could not load manifest.json', error);
            throw error;
        }
    }

    /**
     * Helper: Generic fetcher for YAML files
     * Always fetches with cache: 'no-store' so updates to data files are
     * never served stale, both in development and on GitHub Pages.
     */
    async _fetchYaml(url) {
        if (!window.jsyaml) {
            throw new Error("js-yaml library is not loaded. Add it to index.html.");
        }

        try {
            const response = await fetch(url, { cache: 'no-store' });

            if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
            const text = await response.text();

            const parsed = window.jsyaml.load(text);

            return parsed;
        } catch (error) {
            console.error(`Error loading YAML at ${url}:`, error);
            return null;
        }
    }

    /**
     * 1. Load Instrument Definition
     * Fetches data/instruments/{SYMBOL}.yaml
     * @param {string} symbol - e.g., "ITO"
     */
    async loadInstrumentDefinition(symbol) {
        if (!this.manifest) await this.init();

        const instData = this.manifest.instruments[symbol];
        if (!instData) {
            console.error(`Instrument symbol '${symbol}' not found in manifest.`);
            return null;
        }

        const data = await this._fetchYaml(instData.definition);
        if (data) {
            // Validation: Ensure the loaded symbol matches the requested one
            if (data.symbol !== symbol) {
                console.warn(`Warning: Loaded file for '${symbol}' but file content says '${data.symbol}'`);
            }
        }
        return data;
    }

    /**
     * 2. Load Sound Pack Configuration
     * Reads the letter -> wav file mapping directly from the manifest.
     * @param {string} packName - e.g., "cp"
     * @param {string} instrumentSymbol - e.g., "ITO"
     */
    async loadSoundPackConfig(packName, instrumentSymbol) {
        if (!this.manifest) await this.init();

        const instData = this.manifest.instruments[instrumentSymbol];
        if (!instData) {
            console.error(`Instrument '${instrumentSymbol}' not found in manifest.`);
            return null;
        }

        const files = instData.packs?.[packName];
        if (!files) {
            console.error(`Sound pack '${packName}' not found for instrument '${instrumentSymbol}'.`);
            return null;
        }

        return {
            // Inject the base path so the Audio Engine knows where to find the .wavs
            _basePath: instData.path,
            files,
        };
    }

    /**
     * 3. Load Rhythm Definition
     * Fetches data/rhythms/{ID}.yaml
     * @param {string} rhythmId - e.g., "iyakota_1"
     */
    async loadRhythmDefinition(rhythmId) {
        if (!this.manifest) await this.init();

        const path = this.manifest.rhythms[rhythmId];
        if (!path) {
            console.error(`Rhythm ID '${rhythmId}' not found in manifest.`);
            return null;
        }

        return await this._fetchYaml(path);
    }

    /**
     * 4. Load Batà Metadata
     * Fetches data/rhythms/Batà/bata_metadata.json
     * Contains Orisha associations, classifications, and descriptions for Batà rhythms
     */
    async loadBataMetadata() {
        // Always fetch fresh data - no caching
        try {
            const url = 'data/rhythms/Batà/bata_metadata.json';
            const response = await fetch(url, { cache: 'no-store' });

            if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);

            const data = await response.json();
            console.log('✅ Batà metadata loaded:', Object.keys(data.toques).length, 'rhythms');
            return data;
        } catch (error) {
            console.error('Error loading Batà metadata:', error);
            return null;
        }
    }
}

// Export a singleton instance
export const dataLoader = new DataLoaderService();