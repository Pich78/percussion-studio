# Data Specifications & Architecture

This document outlines the data structure, file formats, and organization for the Percussion Studio application. The application relies on a static file system where data is defined in YAML and assets (audio/images) are stored in specific directories.

## 1. Directory Structure

All application data resides in the `data/` folder. A `manifest.json` file at the root acts as the central registry for discovery.

```text
/ (Project Root)
├── manifest.json                # Auto-generated registry of all available resources
├── tools/
│   └── generate_manifest.py     # Python script to build manifest.json
└── data/
    ├── assets/
    │   └── icons/               # Centralized SVG icons for UI (shared across instruments)
    │       ├── open.svg
    │       ├── slap.svg
    │       └── ...
    ├── instruments/             # Abstract Instrument definitions
    │   ├── ITO.yaml
    │   ├── OKO.yaml
    │   └── ...
    ├── sounds/                  # Sound Packs (Folders)
    │   ├── basic_bata/          # Pack Name: "basic_bata"
    │   │   ├── ITO.basic_bata.yaml  # Sound config for Itotele in this pack
    │   │   ├── OKO.basic_bata.yaml  # Sound config for Okonkolo in this pack
    │   │   ├── ito_open.wav
    │   │   └── oko_slap.wav
    │   └── vintage_conga/
    │       ├── CON.vintage_conga.yaml
    │       └── ...
    └── rhythms/                 # Rhythm compositions
        ├── iyakota_1.yaml
        └── ...
```

---

## 2. File Formats (YAML)

### A. Instrument Definition
**Location:** `data/instruments/{INSTRUMENT_SYMBOL}.yaml`
**Purpose:** Defines the abstract capabilities of an instrument type (e.g., "Itotele", "Conga") regardless of the specific audio sample used.

*   **`symbol`**: A unique 3-letter identifier (e.g., `ITO`, `CON`). This is used to link Sound Packs and Rhythms.
*   **`sounds`**: A list of articulations.
    *   `letter`: The character used in rhythm patterns (Case-insensitive).
    *   `svg`: Filename of the icon located in `data/assets/icons/`.

```yaml
name: "Itotele"
symbol: "ITO"
description: "The middle drum of the Batá set."
sounds:
  - letter: "O"
    name: "Open Tone (Enu)"
    svg: "open.svg"
  - letter: "S"
    name: "Slap (Enu)"
    svg: "slap.svg"
  - letter: "P"
    name: "Presionado"
    svg: "closed.svg"
```

### B. Sound Pack Configuration
**Location:** `data/sounds/{PACK_NAME}/{INSTRUMENT_SYMBOL}.{PACK_NAME}.yaml`
**Naming Convention:** The filename **must** follow the format `{SYMBOL}.{PACK_NAME}.yaml`.
**Purpose:** Maps the abstract sound letters defined in an Instrument Definition to concrete audio files for a specific pack.

*   The keys in `files` must match the `letter` defined in the Instrument YAML.
*   Audio files must reside in the same folder as this YAML file.

**Example:** `data/sounds/basic_bata/ITO.basic_bata.yaml`

```yaml
name: "Itotele (Basic Batá Pack)"
description: "Standard studio recording"
files:
  O: "ito_open.wav"
  S: "ito_slap.wav"
  P: "ito_press.wav"
```

### C. Rhythm Definition
**Location:** `data/rhythms/{RHYTHM_ID}.yaml`
**Purpose:** Defines a full musical composition, including the "Kit" (instruments used) and the "Flow" (sequence of patterns).

*   **`sound_kit`**: Defines the "Tracks". Keys are arbitrary IDs (e.g., `itotele_main`).
    *   `instrument`: Must match an Instrument Symbol (filename in `data/instruments/`).
    *   `pack`: Must match a Sound Pack folder name (in `data/sounds/`).
    *   *Logic:* The app will look for the sound config at: `data/sounds/{pack}/{instrument}.{pack}.yaml`.
*   **`playback_flow`**: An ordered list of musical sections.
    *   **`pattern`**: A mapping of Track IDs to ASCII pattern strings.

```yaml
name: "Iyakota Sequence 1"
global_bpm: 108

sound_kit:
  itotele_main:        # Track ID (Arbitrary)
    instrument: "ITO"  # Uses definition: data/instruments/ITO.yaml
    pack: "basic_bata" # Uses sound config: data/sounds/basic_bata/ITO.basic_bata.yaml
  
  okonkolo_main:       # Track ID
    instrument: "OKO"
    pack: "basic_bata" # Uses sound config: data/sounds/basic_bata/OKO.basic_bata.yaml

playback_flow:
  - name: "Intro"
    repetitions: 1
    time_signature: "4/4"
    steps: 16
    pattern:
      itotele_main:  "||O-S-|P---|O---|----||"
      okonkolo_main: "||--T-|--T-|--T-|--T-||"
```

---

## 3. Pattern Syntax Rules

The string format used in `playback_flow` follows these strict rules:

1.  **Rest Character:** A dash `-` represents a rest (silence/no stroke).
2.  **Sound Characters:** Letters (e.g., `O`, `S`, `B`) correspond to the `letter` defined in the Instrument YAML.
3.  **Visual Separators:** The pipe character `|` is purely for human readability. It is stripped out by the parser before processing.
    *   *Example:* `||O---|O---||` is read exactly the same as `O---O---`.
4.  **Resolution:** 1 Character = 1 Step.
    *   A 16-step pattern must contain exactly 16 valid characters (excluding separators).
5.  **Case Sensitivity:** The parser is case-insensitive (e.g., `o` and `O` are treated as the same sound), but uppercase is recommended for consistency.

---

## 4. Manifest (`manifest.json`)

To enable file discovery without server-side logic, a `manifest.json` must be present at the root.

**Generation:**
Run the `tools/generate_manifest.py` script before deploying or committing changes.

**Structure:**
*   **instruments:** Maps Symbol to File Path.
*   **sound_packs:** Maps Pack Name to Directory Path. The application handles constructing the specific filename `{SYMBOL}.{PACK}.yaml`.
*   **rhythms:** Maps Rhythm ID to File Path.

```json
{
  "instruments": {
    "ITO": "data/instruments/ITO.yaml",
    "OKO": "data/instruments/OKO.yaml"
  },
  "sound_packs": {
    "basic_bata": "data/sounds/basic_bata/",
    "vintage_conga": "data/sounds/vintage_conga/"
  },
  "rhythms": {
    "iyakota_1": "data/rhythms/iyakota_1.yaml"
  }
}
```
