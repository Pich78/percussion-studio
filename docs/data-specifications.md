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
    ├── sounds/                  # Instrument sound folders (one folder per instrument)
    │   ├── itotele/             # Folder name = lowercase instrument name
    │   │   ├── ito.open.cp.wav      # {symbol}.{sound}.{pack}.wav convention
    │   │   ├── ito.open.cp.chaworo.wav
    │   │   └── ito.slap.basic.wav
    │   ├── clave/
    │   │   └── CLV.clave.sg.cuba.wav
    │   └── ...
    └── rhythms/                 # Rhythm compositions
        ├── iyakota_1.yaml
        └── ...
```

## 2. File Formats (YAML)

### A. Instrument Definition
**Location:** `data/instruments/{INSTRUMENT_SYMBOL}.yaml`
**Purpose:** Defines the abstract capabilities of an instrument type (e.g., "Itotele", "Clave") regardless of the specific audio sample used.

*   **`symbol`**: A unique 3-letter identifier (e.g., `ITO`, `CLV`). This is used to link Sound Packs and Rhythms.
*   **`name`**: The full lowercase instrument name (e.g., `itotele`). This determines the sound folder name in `data/sounds/`.
*   **`sounds`**: A list of articulations.
    *   `letter`: The character used in rhythm patterns (Case-insensitive). E.g. `O` for Open.
    *   `name`: The lowercase sound name (e.g., `open`). Used to build the SVG icon path (`data/assets/icons/{name}.svg`) and the WAV filename convention.
    *   `description`: Human-readable description of the sound.

```yaml
name: "Itotele"
symbol: "ITO"
description: "The middle drum of the Batá set."
sounds:
  - letter: "O"
    name: "open"
    description: "Open tone (Enu)"
  - letter: "P"
    name: "presionado"
    description: "Presionado (Enu)"
  - letter: "S"
    name: "slap"
    description: "Slap (Chacha)"
  - letter: "R"
    name: "mordito"
    description: "Mordito"
  - letter: "H"
    name: "half_mordito"
    description: "Half Mordito"
```

**Note:** There is **no sound pack configuration YAML** anymore. Sound packs are derived entirely from WAV file names (see section B).

### B. Sound Files (Convention-Driven)

**Location:** `data/sounds/{instrument-name}/{symbol}.{sound}.{pack}.wav`

Sound packs are no longer folders or YAML files — they are identified by the **file name** of each WAV file:

```
{SYMBOL}.{SOUND_NAME}.{PACK_NAME}.wav
```

*   `SYMBOL`: Instrument symbol (case-insensitive, e.g., `ito` or `ITO`).
*   `SOUND_NAME`: The sound name as defined in the instrument YAML `sounds[].name`.
*   `PACK_NAME`: The sound pack identifier, e.g. `cp`, `basic`, `sg.cuba`. Packs can have multiple segments separated by dots (e.g., `cp.chaworo` = the "chaworo" variant of the "cp" pack).

**Examples:**

| File | Instrument | Sound | Pack |
|------|-----------|-------|------|
| `ito.open.cp.wav` | Itotele | open | cp |
| `ito.open.cp.chaworo.wav` | Itotele | open | cp.chaworo |
| `ito.slap.basic.wav` | Itotele | slap | basic |
| `CLV.clave.sg.cuba.wav` | Clave | clave | sg.cuba |

**Rules:**
*   Every WAV file **must** match this convention — the manifest generator parses the filename to build the pack → letter → wav mapping.
*   All WAV files of an instrument live in the same folder (`data/sounds/{instrument-name}/`).
*   Audio files must follow the naming convention exactly; if a sound has no WAV file, it simply doesn't appear in any pack (the palette may still show it, e.g. `dedo`/`bass` for future congas).
*   The SVG icon for a sound is auto-derived: `data/assets/icons/{sound-name}.svg` (e.g., `open` → `open.svg`).

### C. Rhythm Definition
**Location:** `data/rhythms/{RHYTHM_ID}.yaml`
**Purpose:** Defines a full musical composition, including the "Kit" (instruments used) and the "Flow" (sequence of patterns).

*   **`sound_kit`**: Defines the "Tracks". Keys are arbitrary IDs (e.g., `itotele_main`).
    *   `instrument`: Must match an Instrument Symbol (filename in `data/instruments/`).
    *   `pack`: Must match a Sound Pack name as derived from WAV filenames (e.g., `cp.chaworo`).
    *   *Logic:* The app resolves the pack through the manifest: `manifest.instruments[instrument].packs[pack]`.
*   **`playback_flow`**: An ordered list of musical sections.
    *   **`measures`**: An ordered list of measures within the section.
        *   **`pattern`**: A mapping of Track IDs to ASCII pattern strings.
        *   **`dynamics`** *(optional)*: A mapping of Track IDs to ASCII dynamics strings. Same format and length as `pattern`. Only needs to be specified for tracks that contain non-normal dynamics.

```yaml
name: "Yakota - Base"
global_bpm: 90

sound_kit:
  itotele_main:        # Track ID (Arbitrary)
    instrument: "ITO"  # Uses definition: data/instruments/ITO.yaml
    pack: "cp.chaworo" # Uses pack: data/sounds/itotele/ito.*.cp.chaworo.wav

  okonkolo_main:       # Track ID
    instrument: "OKO"
    pack: "cp.chaworo"

playback_flow:
  - name: "Intro"
    repetitions: 1
    subdivision: 4      # 4 for binary (4/4), 3 for ternary (6/8)
    steps: 16
    measures:
      - pattern:
          itotele_main:  "||O-S-|P---|O---|----||"
          okonkolo_main: "||--T-|--T-|--T-|--T-||"
        dynamics:
          itotele_main:  "||a---|s---|l---|----||"
      - pattern:
          itotele_main:  "||O-S-|----|O---|P---||"
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

### Dynamics Syntax

Dynamics strings follow the same separator and resolution rules as pattern strings. Each character maps to a dynamic level that controls volume and visual intensity:

| Character | Level    | Volume Multiplier | Visual Effect                              |
|-----------|----------|-------------------:|--------------------------------------------|
| `g`       | Ghost    |               0.3× | Half size (50%), faded (40% opacity)       |
| `s`       | Soft     |               0.6× | Reduced size (75%), slightly faded (70%)   |
| `-`       | Normal   |               1.0× | Default size and brightness                |
| `l`       | Loud     |               1.3× | Enlarged (120%), orange glow               |
| `a`       | Accent   |               1.6× | Largest (140%), red glow                   |

*   A `-` in the dynamics string means **Normal** (default volume), not a rest.
*   If a track's dynamics are entirely Normal, it can be omitted from the `dynamics` block.
*   If the `dynamics` block is omitted entirely from a measure, all tracks default to Normal.
*   The dynamics string must have the same number of valid characters (excluding `|`) as the corresponding pattern string.

---

## 4. Manifest (`manifest.json`)

To enable file discovery without server-side logic, a `manifest.json` must be present at the root.

**Generation:**
Run the `tools/generate_manifest.py` script before deploying or committing changes (regenerates both the manifest and the Batà metadata).

**Structure:**
*   **instruments:** Maps Symbol to an object with:
    *   `name`: lowercase instrument name (sound folder name)
    *   `definition`: path to the instrument YAML
    *   `path`: the instrument sound folder
    *   `packs`: map of pack name → letter → wav filename
*   **rhythms:** Maps Rhythm ID to File Path.

```json
{
  "instruments": {
    "ITO": {
      "name": "itotele",
      "definition": "data/instruments/ITO.yaml",
      "path": "data/sounds/itotele/",
      "packs": {
        "cp": {
          "O": "ito.open.cp.wav",
          "P": "ito.presionado.cp.wav",
          "S": "ito.slap.cp.wav",
          "R": "ito.mordito.cp.wav"
        },
        "cp.chaworo": {
          "O": "ito.open.cp.chaworo.wav",
          "P": "ito.presionado.cp.chaworo.wav",
          "S": "ito.slap.cp.chaworo.wav",
          "R": "ito.mordito.cp.chaworo.wav"
        },
        "basic": {
          "O": "ito.open.basic.wav",
          "S": "ito.slap.basic.wav"
        }
      }
    },
    "CLV": {
      "name": "clave",
      "definition": "data/instruments/CLV.yaml",
      "path": "data/sounds/clave/",
      "packs": {
        "sg.cuba": { "C": "CLV.clave.sg.cuba.wav" }
      }
    }
  },
  "rhythms": {
    "Batà/Yakota/yakota_-_base": "data/rhythms/Batà/Yakota/yakota_-_base.yaml"
  }
}
```

**Note:** There is no top-level `sound_packs` key anymore. Pack information is nested under each instrument.

---

## 5. Adding a New Instrument

See [docs/adding-instruments.md](adding-instruments.md) for the step-by-step guide.