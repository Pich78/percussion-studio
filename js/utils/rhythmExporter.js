/**
 * Helper function to convert stroke array to pattern string
 * Example: ['O', '.', 'S', '.'] => "||O-S-||"
 */
const strokesToPatternString = (strokes, subdivision = 4) => {
    let pattern = '||';
    for (let i = 0; i < strokes.length; i++) {
        const stroke = strokes[i];
        // Convert space (None) to dash
        pattern += (stroke === ' ' || stroke === '.') ? '-' : stroke;
        // Add separator after each group
        if ((i + 1) % subdivision === 0 && i < strokes.length - 1) {
            pattern += '|';
        }
    }
    pattern += '||';
    return pattern;
};

/**
 * Exports the current rhythm state to YAML format
 * Returns a YAML string that can be saved to a file
 */
export const exportRhythmToYAML = (state) => {
    const toque = state.toque;
    if (!toque) return null;

    let yaml = '';

    // Header
    yaml += `name: "${toque.name}"\n`;
    yaml += `global_bpm: ${toque.globalBpm}\n\n`;

    // Sound Kit - build track ID mappings
    yaml += `sound_kit:\n`;
    const trackIdMap = {}; // Maps track.id to track_key

    toque.sections.forEach((section, sectionIdx) => {
        section.tracks.forEach((track, trackIdx) => {
            // Generate a unique track key if not already mapped
            if (!trackIdMap[track.id]) {
                const trackKey = `${track.instrument.toLowerCase()}_${Object.keys(trackIdMap).length + 1}`;
                trackIdMap[track.id] = trackKey;

                yaml += `  ${trackKey}:\n`;
                yaml += `    instrument: "${track.instrument}"\n`;
                yaml += `    pack: "${track.pack || 'basic_bata'}"\n`;
            }
        });
    });

    yaml += `\n`;

    // Playback Flow
    yaml += `playback_flow:\n`;
    toque.sections.forEach((section, idx) => {
        yaml += `  - name: "${section.name}"\n`;
        yaml += `    repetitions: ${section.repetitions || 1}\n`;
        yaml += `    time_signature: "${section.timeSignature}"\n`;
        yaml += `    steps: ${section.steps}\n`;

        // Add optional BPM override
        if (section.bpm !== undefined) {
            yaml += `    bpm: ${section.bpm}\n`;
        }

        // Add optional tempo acceleration
        if (section.tempoAcceleration && section.tempoAcceleration !== 0) {
            yaml += `    tempo_acceleration: ${section.tempoAcceleration}\n`;
        }

        yaml += `    pattern:\n`;
        section.tracks.forEach((track) => {
            const trackKey = trackIdMap[track.id];
            const patternStr = strokesToPatternString(track.strokes, section.subdivision);
            yaml += `      ${trackKey}: "${patternStr}"\n`;
        });
    });

    return yaml;
};

/**
 * Triggers a download of the current rhythm as a YAML file
 */
export const downloadRhythm = (state) => {
    const yaml = exportRhythmToYAML(state);
    if (!yaml) {
        alert('No rhythm to download');
        return;
    }

    // Create a blob and download link
    const blob = new Blob([yaml], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Generate filename from rhythm name
    const filename = `${state.toque.name.toLowerCase().replace(/\s+/g, '_')}.yaml`;

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Downloaded rhythm: ${filename}`);
};
