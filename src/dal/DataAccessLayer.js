// file: src/dal/DataAccessLayer.js (Complete, Updated Version)

import { load as loadYaml, dump as dumpYaml } from "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs";

export class DataAccessLayer {

    /**
     * Centralized private method to perform a fetch request and check for a successful response.
     * @param {string} filePath - The URL to fetch.
     * @param {string} entityId - The ID of the entity being fetched.
     * @param {string} entityType - The type of entity (e.g., 'manifest', 'rhythm').
     * @returns {Promise<Response>} - The successful response object.
     * @private
     */
    static async _fetchAndCheck(filePath, entityId, entityType) {
        const response = await fetch(filePath);
        if (!response.ok) {
            // Throw a specific error for the caller to handle.
            throw new Error(`Failed to fetch ${entityType} '${entityId}'. Server responded with status: ${response.status}`);
        }
        return response;
    }

    /**
     * Fetches and parses the main application manifest file.
     * @returns {Promise<object>}
     */
    static async getManifest() {
        const filePath = `/percussion-studio/manifest.json`;
        const response = await this._fetchAndCheck(filePath, 'manifest.json', 'manifest');
        return response.json();
    }

    /**
     * Fetches and parses a rhythm definition file.
     * @param {string} id - The ID of the rhythm to fetch.
     * @returns {Promise<object>}
     */
    static async getRhythm(id) {
        const filePath = `/percussion-studio/data/rhythms/${id}.rthm.yaml`;
        return this._fetchAndParse(filePath, id, 'rhythm');
    }

    /**
     * Fetches and parses a pattern definition file.
     * @param {string} id - The ID of the pattern to fetch.
     * @returns {Promise<object>}
     */
    static async getPattern(id) {
        const filePath = `/percussion-studio/data/patterns/${id}.patt.yaml`;
        return this._fetchAndParse(filePath, id, 'pattern');
    }

    /**
     * Fetches and parses an instrument definition file.
     * @param {string} id - The ID of the instrument to fetch.
     * @returns {Promise<object>}
     */
    static async getInstrumentDef(id) {
        const filePath = `/percussion-studio/data/instruments/${id}.instdef.yaml`;
        return this._fetchAndParse(filePath, id, 'instrument definition');
    }

    /**
     * Fetches and parses a sound pack definition file.
     * @param {string} instrumentSymbol - The symbol for the instrument.
     * @param {string} packName - The name of the sound pack.
     * @returns {Promise<object>}
     */
    static async getSoundPack(instrumentSymbol, packName) {
        const filename = `${instrumentSymbol}.${packName}.sndpack.yaml`;
        const filePath = `/percussion-studio/data/sounds/${packName}/${filename}`;
        return this._fetchAndParse(filePath, filename, 'sound pack');
    }

    /**
     * Private method to fetch a YAML file and parse its contents.
     * @param {string} filePath - The URL of the YAML file.
     * @param {string} entityId - The ID of the entity.
     * @param {string} entityType - The type of entity.
     * @returns {Promise<object>} - The parsed YAML object.
     * @private
     */
    static async _fetchAndParse(filePath, entityId, entityType) {
        const response = await this._fetchAndCheck(filePath, entityId, entityType);
        const yamlText = await response.text();
        try {
            return loadYaml(yamlText);
        } catch (error) {
            // Re-throw a more descriptive error if YAML parsing fails.
            throw new Error(`Failed to parse YAML for ${entityType} '${entityId}'. Details: ${error.message}`);
        }
    }

    /**
     * Exports rhythm and pattern data into a downloadable .zip file.
     * This method is now decoupled from the DOM and returns a Blob.
     * The caller is responsible for handling the download.
     * @param {object} rhythmData - The rhythm data object.
     * @param {Array<object>} patternsData - The patterns data array.
     * @param {string} filename - The desired base filename for the zip file.
     * @param {any} JSZip - The JSZip library class.
     * @returns {Promise<Blob>} - A promise that resolves with the zip file as a Blob.
     */
    static async exportRhythmAsZip(rhythmData, patternsData, filename, JSZip) {
        const zip = new JSZip();

        // Add the rhythm file to the root of the zip.
        const rhythmYaml = dumpYaml(rhythmData);
        zip.file(`${filename}.rthm.yaml`, rhythmYaml);

        // Add the patterns to a sub-folder.
        const patternsFolder = zip.folder("patterns");
        patternsData.forEach(pattern => {
            const patternYaml = dumpYaml(pattern.data);
            patternsFolder.file(`${pattern.id}.patt.yaml`, patternYaml);
        });

        // Generate the zip file and return the Blob.
        return await zip.generateAsync({ type: "blob" });
    }
}
