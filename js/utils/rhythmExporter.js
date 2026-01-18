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
    yaml += `global_bpm: ${toque.globalBpm}\n`;

    // Metadata fields (optional)
    if (toque.isBata) {
        yaml += `is_bata: true\n`;
        if (toque.orisha && toque.orisha.length > 0) {
            yaml += `orisha:\n`;
            toque.orisha.forEach(o => {
                yaml += `  - "${o}"\n`;
            });
        }
        if (toque.classification) {
            yaml += `classification: "${toque.classification}"\n`;
        }
        if (toque.description) {
            // Escape quotes in description and use double-quoted string
            const escapedDesc = toque.description.replace(/"/g, '\\"').replace(/\n/g, '\\n');
            yaml += `description: "${escapedDesc}"\n`;
        }
    }
    yaml += `\n`;

    // Sound Kit - build track ID mappings
    yaml += `sound_kit:\n`;
    const trackIdMap = {}; // Maps track.id to track_key
    const keyConfigs = {}; // key -> { instrument, pack }

    toque.sections.forEach((section, sectionIdx) => {
        section.measures.forEach((measure, measureIdx) => {
            const currentMeasureKeys = new Set();

            measure.tracks.forEach((track, trackIdx) => {
                const trackPack = track.pack || 'basic_bata';
                let assignedKey = null;

                // 1. Try to find a reusable key
                for (const [key, config] of Object.entries(keyConfigs)) {
                    if (config.instrument === track.instrument &&
                        config.pack === trackPack &&
                        !currentMeasureKeys.has(key)) {
                        assignedKey = key;
                        break;
                    }
                }

                // 2. If no key found, create a new one
                if (!assignedKey) {
                    const base = track.instrument.toLowerCase();
                    let key = base;

                    // Collision check
                    if (keyConfigs[key]) {
                        let counter = 2;
                        while (keyConfigs[`${base}_${counter}`]) {
                            counter++;
                        }
                        key = `${base}_${counter}`;
                    }

                    assignedKey = key;
                    keyConfigs[key] = { instrument: track.instrument, pack: trackPack };

                    // Append to YAML
                    yaml += `  ${assignedKey}:\n`;
                    yaml += `    instrument: "${track.instrument}"\n`;
                    yaml += `    pack: "${trackPack}"\n`;
                }

                trackIdMap[track.id] = assignedKey;
                currentMeasureKeys.add(assignedKey);
            });
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

        // Export measures
        yaml += `    measures:\n`;
        section.measures.forEach((measure) => {
            yaml += `      - pattern:\n`;
            measure.tracks.forEach((track) => {
                const trackKey = trackIdMap[track.id];
                const patternStr = strokesToPatternString(track.strokes, section.subdivision);
                yaml += `          ${trackKey}: "${patternStr}"\n`;
            });
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
