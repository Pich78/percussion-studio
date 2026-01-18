/* 
  js/services/dataLoader.js
  Handles fetching and parsing of YAML data files based on the Manifest.
  Requires: js-yaml library loaded in index.html (window.jsyaml)
*/

import { config } from '../config.js';

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
            const response = await fetch(this.MANIFEST_URL);
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
     * NOTE: Cache-busting is enabled for development. For production (GitHub Pages),
     * remove the timestamp parameter to allow proper browser caching.
     */
    async _fetchYaml(url) {
        if (!window.jsyaml) {
            throw new Error("js-yaml library is not loaded. Add it to index.html.");
        }

        try {
            // Add cache-busting parameter in development mode
            const cacheBustUrl = config.isDevelopment ? `${url}?_=${Date.now()}` : url;

            if (config.verboseLogging) {
                console.log(`[DataLoader] Fetching YAML from: ${cacheBustUrl}`);
            }

            const fetchOptions = config.isDevelopment ? {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            } : {};

            const response = await fetch(cacheBustUrl, fetchOptions);

            if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
            const text = await response.text();

            if (config.verboseLogging) {
                console.log(`[DataLoader] Loaded ${text.length} bytes from ${url}`);
            }

            const parsed = window.jsyaml.load(text);

            if (config.verboseLogging) {
                console.log(`[DataLoader] Parsed YAML from ${url}:`, parsed);
            }

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

        const path = this.manifest.instruments[symbol];
        if (!path) {
            console.error(`Instrument symbol '${symbol}' not found in manifest.`);
            return null;
        }

        const data = await this._fetchYaml(path);
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
     * Fetches data/sounds/{packName}/{symbol}.{packName}.yaml
     * @param {string} packName - e.g., "basic_bata"
     * @param {string} instrumentSymbol - e.g., "ITO"
     */
    async loadSoundPackConfig(packName, instrumentSymbol) {
        if (!this.manifest) await this.init();

        const packFolder = this.manifest.sound_packs[packName];
        if (!packFolder) {
            console.error(`Sound pack '${packName}' not found in manifest.`);
            return null;
        }

        // Construct the filename based on the Spec: {SYMBOL}.{PACK_NAME}.yaml
        // Ensure packFolder ends with a slash
        const basePath = packFolder.endsWith('/') ? packFolder : packFolder + '/';
        const filename = `${instrumentSymbol}.${packName}.yaml`;
        const fullPath = basePath + filename;

        const data = await this._fetchYaml(fullPath);

        if (data) {
            // Inject the base path into the data object so the Audio Engine knows where to find the .wavs
            data._basePath = basePath;
        }
        return data;
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
        if (this._bataMetadataCache) {
            return this._bataMetadataCache;
        }

        try {
            const url = 'data/rhythms/Batà/bata_metadata.json';
            const cacheBustUrl = config.isDevelopment ? `${url}?_=${Date.now()}` : url;

            const response = await fetch(cacheBustUrl, config.isDevelopment ? {
                cache: 'no-store'
            } : {});

            if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);

            const data = await response.json();
            this._bataMetadataCache = data;
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