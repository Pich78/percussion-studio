// file: src/dal/DataAccessLayer.js

class DataAccessLayer {
    // We add a 'fetchFn' parameter that defaults to the browser's global fetch
    static async _fetchAndParse(filePath, entityId, entityType) {
        // This internal method now uses the passed-in fetch function
        const response = await fetch(filePath); 
        if (!response.ok) {
            throw new Error(`Failed to fetch ${entityType} '${entityId}'. Server responded with status: ${response.status}`);
        }
        const yamlText = await response.text();
        try {
            return jsyaml.load(yamlText);
        } catch (error) {
            throw new Error(`Failed to parse YAML for ${entityType} '${entityId}'. Details: ${error.message}`);
        }
    }

    static async getRhythm(id) {
        const filePath = `/percussion-studio/data/rhythms/${id}.rthm.yaml`;
        // We pass the global fetch function to our internal helper
        return this._fetchAndParse(filePath, id, 'rhythm');
    }
    
    // ... getPattern and getInstrument will also use _fetchAndParse ...
    static async getPattern(id) {
        const filePath = `/percussion-studio/data/patterns/${id}.patt.yaml`;
        return this._fetchAndParse(filePath, id, 'pattern');
    }
    
    static async getInstrument(id) {
        const filePath = `/percussion-studio/data/instruments/${id}/${id}.inst.yaml`;
        return this._fetchAndParse(filePath, id, 'instrument');
    }
}