# Percussion Studio

**A web-based percussion pattern sequencer for Afro-Cuban rhythms and beyond.**

🎵 **Live Demo:** [https://pich78.github.io/percussion-studio/](https://pich78.github.io/percussion-studio/)

## Overview

Percussion Studio is a browser-based application for creating, editing, and playing percussion patterns. It features a grid-based sequencer with support for multiple instruments, sound packs, and complex multi-measure compositions.

![Percussion Studio Interface](screenshot.png)

### Key Features

- 🥁 **Multi-track sequencer** with visual grid interface
- 🎼 **Multiple instruments** (Batá drums, congas, and more)
- 🔊 **Sound pack system** for different audio samples
- 📊 **Multi-measure sections** with repeats and tempo control
- 🎵 **Count-in** with automatic beat detection (4 for 4/4, 6 for 6/8 or 12/8)
- 💾 **Import/Export rhythms** as YAML files
- 🎨 **Modern, responsive UI** with real-time playback

## Getting Started

### Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/pich78/percussion-studio.git
   cd percussion-studio
   ```

2. Start a local web server:
   ```bash
   python -m http.server 8000
   ```

3. Open your browser to `http://localhost:8000`

### Project Structure

```
percussion-studio/
├── index.html              # Main application entry point
├── manifest.json           # Auto-generated resource registry
├── data_specifications.md  # Detailed data format documentation
├── js/                     # Application source code
├── data/                   # All content data
│   ├── instruments/        # Instrument definitions
│   ├── sounds/             # Sound packs with audio files
│   ├── rhythms/            # Rhythm compositions
│   └── assets/             # Shared assets (icons, etc.)
└── tools/                  # Utility scripts
    └── generate_manifest.py
```

## Creating Content

### 1. Creating a New Instrument

Instruments define the abstract capabilities of a percussion instrument type (e.g., what sounds it can make).

**Location:** `data/instruments/{SYMBOL}.yaml`

**Example:** `data/instruments/CON.yaml` (Conga)

```yaml
name: "Conga"
symbol: "CON"
description: "A tall, narrow, single-headed drum from Cuba"
sounds:
  - letter: "O"
    name: "Open Tone"
    svg: "open.svg"
  - letter: "S"
    name: "Slap"
    svg: "slap.svg"
  - letter: "B"
    name: "Bass"
    svg: "bass.svg"
  - letter: "T"
    name: "Tip"
    svg: "tip.svg"
```

**Field Descriptions:**
- `name`: Full display name of the instrument
- `symbol`: 3-letter unique identifier (uppercase, used in file references)
- `description`: Brief description of the instrument
- `sounds`: List of articulations/strokes
  - `letter`: Single character used in rhythm patterns (A-Z)
  - `name`: Display name for this stroke
  - `svg`: Icon filename from `data/assets/icons/`

### 2. Creating a Sound Pack

Sound packs map instrument articulations to actual audio files.

**Location:** `data/sounds/{PACK_NAME}/{SYMBOL}.{PACK_NAME}.yaml`

**Example:** `data/sounds/studio_conga/CON.studio_conga.yaml`

```yaml
name: "Conga (Studio Recording)"
description: "High-quality studio recorded conga samples"
files:
  O: "conga_open.wav"
  S: "conga_slap.wav"
  B: "conga_bass.wav"
  T: "conga_tip.wav"
```

**Steps:**
1. Create a folder in `data/sounds/` with your pack name (e.g., `studio_conga`)
2. Add audio files (WAV, MP3, or OGG format) to this folder
3. Create a YAML file for each instrument: `{SYMBOL}.{PACK_NAME}.yaml`
4. Map each sound letter to its audio file

**Field Descriptions:**
- `name`: Display name for this sound pack variant
- `description`: Brief description
- `files`: Map of letter → audio filename
  - Keys must match the `letter` values from the instrument definition
  - Values are audio filenames in the same directory

### 3. Creating a Rhythm

Rhythms define complete compositions with multiple instruments and patterns.

**Location:** `data/rhythms/{RHYTHM_NAME}.yaml`

**Example:** `data/rhythms/basic_conga_pattern.yaml`

```yaml
name: "Basic Conga Pattern"
global_bpm: 120

sound_kit:
  conga_1:
    instrument: "CON"
    pack: "studio_conga"
  
  conga_2:
    instrument: "CON"
    pack: "studio_conga"

playback_flow:
  - name: "Main Pattern"
    repetitions: 4
    subdivision: 4      # 4 for binary (4/4), 3 for ternary (6/8)
    steps: 16
    measures:
      - pattern:
          conga_1: "||O---|S---|O---|S---|"
          conga_2: "||--B-|--B-|--B-|--B-|"
      - pattern:
          conga_1: "||O---|S-T-|O---|S---|"
          conga_2: "||--B-|--B-|--B-|--B-|"
```

**Field Descriptions:**

**Top Level:**
- `name`: Display name of the rhythm
- `global_bpm`: Default tempo (can be overridden per section)

**sound_kit:**
- Define each track with a unique ID (e.g., `conga_1`, `itotele_main`)
- `instrument`: Symbol matching an instrument file
- `pack`: Name of the sound pack folder

**playback_flow:**
- Array of sections, each with:
  - `name`: Section name (e.g., "Intro", "Verse", "Chorus")
  - `repetitions`: How many times to repeat this section
  - `subdivision`: 3 (Ternary) or 4 (Binary) - Determines visual grouping
  - `steps`: Number of steps per measure (e.g., 16 for 4/4, 12 for 6/8)
  - `bpm`: (Optional) Override global BPM for this section
  - `tempo_acceleration`: (Optional) Percentage change per repetition
  - `measures`: Array of measures
    - `pattern`: Map of track IDs to pattern strings

**Pattern Syntax:**
- `-` = Rest (silence)
- Letters (O, S, B, etc.) = Play the corresponding sound
- `|` = Visual separator (ignored by parser)
- One character = one step

**Examples:**
```yaml
# 16-step pattern with visual grouping
"||O---|S---|O---|S---|"

# Same pattern without separators
"O---S---O---S---"

# Complex pattern
"||O-S-|--B-|O-T-|S-B-|"
```

### 4. Creating Batà Rhythms

Batà rhythms have a special structure and metadata system.

**Location:** `data/rhythms/Batà/{Folder}/`

**Structure:**
- Each rhythm family gets its own folder (e.g., `Yakota`, `Alumbanche`)
- **Metadata File:** A file named `{Folder}_metadata.yaml` defines properties for the whole group (Orishas, Classification)
- **Rhythm Files:** Individual `.yaml` files for each variation

**Example:** `data/rhythms/Batà/Yakota/`
- `Yakota_metadata.yaml`
- `yakota_base.yaml`
- `yakota_llamada.yaml`

**Metadata File Format (`Yakota_metadata.yaml`):**
```yaml
classification: "Generic"  # or "Specific", "Shared"
orisha:
  - "Elegua"
  - "Ogun"
  - "Ochosi"
```
*Note: Do not include a `description` field in this file.*

**Orisha Configuration:**
The list of available Orishas and their display colors is defined in `data/rhythms/Batà/orishas.yaml`. To add a new Orisha, simply edit this file and regenerate the manifest.

### 5. Updating the Manifest

After creating or modifying any data files, regenerate the manifest:

```bash
cd tools
python generate_manifest.py
```

This updates `manifest.json` so the application can discover your new content.

## Pattern Writing Tips

### Meter and Subdivision

- **Binary (4/4)**: Use 16 steps, subdivision of 4
- **Ternary (6/8)**: Use 12 steps, subdivision of 3
- **Compound (12/8)**: Use 24 steps, subdivision of 3

### Common Patterns

**Basic 4/4 Beat:**
```yaml
"||O---|O---|O---|O---|"  # Quarter notes
"||O-O-|O-O-|O-O-|O-O-|"  # Eighth notes
```

**6/8 Pattern:**
```yaml
"||O--|S--|O--|S--|"      # 12 steps, grouped by 3
```

**Syncopation:**
```yaml
"||O-S-|--O-|S---|O-S-|"  # Off-beat accents
```

## Advanced Features

### Section-Specific Tempo

Override the global BPM for individual sections:

```yaml
playback_flow:
  - name: "Slow Intro"
    bpm: 80
    # ...
  - name: "Fast Section"
    bpm: 140
    # ...
```

### Tempo Acceleration

Gradually speed up or slow down during repetitions:

```yaml
playback_flow:
  - name: "Accelerating Pattern"
    repetitions: 8
    tempo_acceleration: 2.0  # Increase by 2% each repetition
    # ...
```

### Multi-Measure Sections

Create complex forms with multiple measures:

```yaml
measures:
  - pattern:
      drum_1: "||O---|S---|O---|S---|"
  - pattern:
      drum_1: "||O-S-|--O-|S---|O---|"
  - pattern:
      drum_1: "||O---|O---|S---|S---|"
```

## Audio File Guidelines

- **Formats**: WAV (recommended), MP3, or OGG
- **Sample Rate**: 44.1kHz or 48kHz
- **Bit Depth**: 16-bit or 24-bit
- **Length**: Keep samples short (< 2 seconds) for best performance
- **Naming**: Use descriptive names (e.g., `conga_open.wav`, `bongo_slap.wav`)

## Contributing

Contributions are welcome! To add new instruments, sound packs, or rhythms:

1. Fork the repository
2. Create your content following the guides above
3. Run `python tools/generate_manifest.py`
4. Test your changes locally
5. Submit a pull request

## Shareable Links

You can share direct links to specific rhythms using URL parameters:

### URL Format

```
https://yoursite.com/desktop.html?rhythm=Batà/Dadà/dada_base
https://yoursite.com/mobile.html?rhythm=Batà/Yakota/yakota_-_base
```

### How It Works

1. **Direct Links**: Share a URL with `?rhythm=<rhythm-id>` to load a specific rhythm
2. **Share Button**: Use the "Share Rhythm" button in the menu to copy the current rhythm's URL
3. **Fallback**: If the specified rhythm isn't found, the app loads the default rhythm

### Examples

| Rhythm | Desktop Link | Mobile Link |
|--------|-------------|-------------|
| Dadà Base | `desktop.html?rhythm=Batà/Dadà/dada_base` | `mobile.html?rhythm=Batà/Dadà/dada_base` |
| Yakota Base | `desktop.html?rhythm=Batà/Yakota/yakota_-_base` | `mobile.html?rhythm=Batà/Yakota/yakota_-_base` |

> **Note**: Only rhythms from the library (defined in `manifest.json`) can be shared via URL. Rhythms loaded from local files or newly created ones cannot be shared.

## User Guides

Comprehensive guides for using Percussion Studio:

| Platform | English | Italiano |
|----------|---------|----------|
| **Desktop** | [User Guide (EN)](docs/user-guide-desktop-en.md) | [Guida Utente (IT)](docs/user-guide-desktop-it.md) |
| **Mobile** | [User Guide (EN)](docs/user-guide-mobile-en.md) | [Guida Utente (IT)](docs/user-guide-mobile-it.md) |

## Documentation

- **[data_specifications.md](data_specifications.md)**: Detailed technical specifications
- **GitHub Pages**: [https://pich78.github.io/percussion-studio/](https://pich78.github.io/percussion-studio/)

## License

This project is open source. See the repository for license details.

## Credits

Developed for creating and studying Afro-Cuban percussion patterns, with support for various percussion instruments and rhythmic traditions.
