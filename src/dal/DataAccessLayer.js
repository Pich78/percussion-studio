// file: src/dal/DataAccessLayer.js (Complete, Updated Version)

import { load as loadYaml, dump as dumpYaml } from "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs";

export class DataAccessLayer {

    /**
     * Fetches and parses the main application manifest file.
     * @returns {Promise<object>}
     */
    static async getManifest() {
        const filePath = `/percussion-studio/manifest.json`;
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch manifest.json. Server responded with status: ${response.status}`);
        }
        return response.json();
    }

    static async getRhythm(id) {
        const filePath = `/percussion-studio/data/rhythms/${id}.rthm.yaml`;
        return this._fetchAndParse(filePath, id, 'rhythm');
    }

    static async getPattern(id) {
        const filePath = `/percussion-studio/data/patterns/${id}.patt.yaml`;
        return this._fetchAndParse(filePath, id, 'pattern');
    }

    static async getInstrumentDef(id) {
        const filePath = `/percussion-studio/data/instruments/${id}.instdef.yaml`;
        return this._fetchAndParse(filePath, id, 'instrument definition');
    }

    static async getSoundPack(instrumentSymbol, packName) {
        const filename = `${instrumentSymbol}.${packName}.sndpack.yaml`;
        const filePath = `/percussion-studio/data/sounds/${packName}/${filename}`;
        return this._fetchAndParse(filePath, filename, 'sound pack');
    }

    static async _fetchAndParse(filePath, entityId, entityType) {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${entityType} '${entityId}'. Server responded with status: ${response.status}`);
        }
        const yamlText = await response.text();
        try {
            return loadYaml(yamlText);
        } catch (error) {
            throw new Error(`Failed to parse YAML for ${entityType} '${entityId}'. Details: ${error.message}`);
        }
    }

    static async exportRhythmAsZip(rhythmData, patternsData, filename, JSZip) {
        const zip = new JSZip();

        const rhythmYaml = dumpYaml(rhythmData);
        zip.file(`${filename}.rthm.yaml`, rhythmYaml);

        const patternsFolder = zip.folder("patterns");
        patternsData.forEach(pattern => {
            const patternYaml = dumpYaml(pattern.data);
            patternsFolder.file(`${pattern.id}.patt.yaml`, patternYaml);
        });
        
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `${filename}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}