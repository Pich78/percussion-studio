// file: src/dal/DataAccessLayer.js (MODERNIZED)

// Import the 'load' function directly from a CDN that serves it as an ES Module.
import { load as loadYaml } from "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs";

class DataAccessLayer {
    static async _fetchAndParse(filePath, entityId, entityType) {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${entityType} '${entityId}'. Server responded with status: ${response.status}`);
        }
        const yamlText = await response.text();
        try {
            // Use our imported and renamed function
            return loadYaml(yamlText);
        } catch (error) {
            throw new Error(`Failed to parse YAML for ${entityType} '${entityId}'. Details: ${error.message}`);
        }
    }

    // The rest of the class uses the internal helper method, so no changes are needed here.
    static async getRhythm(id) {
        const filePath = `/percussion-studio/data/rhythms/${id}.rthm.yaml`;
        return this._fetchAndParse(filePath, id, 'rhythm');
    }
    static async getPattern(id) {
        const filePath = `/percussion-studio/data/patterns/${id}.patt.yaml`;
        return this._fetchAndParse(filePath, id, 'pattern');
    }
    static async getInstrument(id) {
        const filePath = `/percussion-studio/data/instruments/${id}/${id}.inst.yaml`;
        return this._fetchAndParse(filePath, id, 'instrument');
    }
}

// We must EXPORT the class so other modules can import it.
export { DataAccessLayer };