// file: src/dal/DataAccessLayer.js (MODERNIZED)

// Import the 'load' function directly from a CDN that serves it as an ES Module.
import { load as loadYaml, dump as dumpYaml } from "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs";
import JSZip from "https://esm.sh/jszip@3.10.1";

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

    /**
     * Creates a .zip file using a provided JSZip constructor.
     * @param {object} rhythmData The main rhythm object.
     * @param {Array<object>} patternsData Array of pattern objects.
     * @param {Array<object>} instrumentsData Array of instrument objects.
     * @param {string} filename The base name for the zip file.
     * @param {class} JSZip The constructor for the JSZip library (injected dependency).
     */
    static async exportRhythmAsZip(rhythmData, patternsData, instrumentsData, filename, JSZip) {
        // This relies on the JSZip library being loaded globally or imported.
        const zip = new JSZip();

        // 1. Add the main rhythm file to the root of the zip
        const rhythmYaml = dumpYaml(rhythmData);
        zip.file(`${filename}.rthm.yaml`, rhythmYaml);

        // 2. Add all pattern files to the 'patterns' folder
        const patternsFolder = zip.folder("patterns");
        for (const pattern of patternsData) {
            const patternYaml = dumpYaml(pattern.data);
            patternsFolder.file(`${pattern.id}.patt.yaml`, patternYaml);
        }

        // 3. Add all instrument files to their respective subfolders
        const instrumentsFolder = zip.folder("instruments");
        for (const instrument of instrumentsData) {
            const instrumentFolder = instrumentsFolder.folder(instrument.id);
            const instrumentYaml = dumpYaml(instrument.data);
            instrumentFolder.file(`${instrument.id}.inst.yaml`, instrumentYaml);
        }

        // 4. Generate the zip file as a binary blob
        const content = await zip.generateAsync({ type: "blob" });

        // 5. Trigger the download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `${filename}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// We must EXPORT the class so other modules can import it.
export { DataAccessLayer };