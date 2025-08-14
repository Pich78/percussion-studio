// file: src/dal/DataAccessLayer.js

class DataAccessLayer {
    static async getRhythm(id) {
        const filePath = `/percussion-studio/data/rhythms/${id}.rthm.yaml`;
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch rhythm '${id}'. Server responded with status: ${response.status}`);
        }
        const yamlText = await response.text();
        try {
            return jsyaml.load(yamlText);
        } catch (error) {
            throw new Error(`Failed to parse YAML for rhythm '${id}'. Details: ${error.message}`);
        }
    }

    /**
     * Fetches and parses a pattern file.
     * @param {string} id The unique identifier of the pattern (e.g., "test_pattern").
     * @returns {Promise<object>}
     */
    static async getPattern(id) {
        const filePath = `/percussion-studio/data/patterns/${id}.patt.yaml`;
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch pattern '${id}'. Server responded with status: ${response.status}`);
        }
        const yamlText = await response.text();
        try {
            return jsyaml.load(yamlText);
        } catch (error) {
            throw new Error(`Failed to parse YAML for pattern '${id}'. Details: ${error.message}`);
        }
    }

    /**
     * Fetches and parses an instrument file.
     * @param {string} id The unique identifier of the instrument (e.g., "test_kick").
     * @returns {Promise<object>}
     */
    static async getInstrument(id) {
        // Instruments are in a subdirectory named after themselves.
        const filePath = `/percussion-studio/data/instruments/${id}/${id}.inst.yaml`;
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch instrument '${id}'. Server responded with status: ${response.status}`);
        }
        const yamlText = await response.text();
        try {
            return jsyaml.load(yamlText);
        } catch (error) {
            throw new Error(`Failed to parse YAML for instrument '${id}'. Details: ${error.message}`);
        }
    }
}