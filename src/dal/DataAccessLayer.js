// file: src/dal/DataAccessLayer.js (CORRECTED for GitHub Pages)

class DataAccessLayer {
    static async getRhythm(id) {
        // Corrected path to be root-relative to the site
        const filePath = `/percussion-studio/data/rhythms/${id}.rthm.yaml`;

        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch rhythm '${id}'. Server responded with status: ${response.status}`);
        }
        const yamlText = await response.text();
        try {
            const data = jsyaml.load(yamlText);
            return data;
        } catch (error) {
            throw new Error(`Failed to parse YAML for rhythm '${id}'. Details: ${error.message}`);
        }
    }
}