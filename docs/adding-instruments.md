# Adding a New Instrument

This guide explains how to add a new instrument to Percussion Studio. The system is **convention-driven**: once you name your files correctly, the manifest generator does the rest.

## Overview

To add an instrument you need to:

1. Create an instrument definition YAML (`data/instruments/{SYMBOL}.yaml`)
2. Create a sound folder (`data/sounds/{instrument-name}/`)
3. Drop your WAV files in that folder following the naming convention
4. (Optional) Add an SVG icon for each new sound type in `data/assets/icons/`
5. Run the manifest generator

**You never write sound pack YAML files** — sound packs are derived from WAV filenames automatically.

## Step 1: Instrument Definition

**Location:** `data/instruments/{SYMBOL}.yaml`

```yaml
name: "Conga"
symbol: "CON"
description: "A tall, narrow, single-headed drum from Cuba"
sounds:
  - letter: "O"
    name: "open"
    description: "Open tone"
  - letter: "S"
    name: "slap"
    description: "Slap"
  - letter: "B"
    name: "bass"
    description: "Bass tone"
  - letter: "D"
    name: "dedo"
    description: "Finger (dedo) stroke"
```

Rules:

- `symbol` is the unique identifier used in rhythm patterns (e.g. `CON`).
- `name` is the lowercase instrument name. It **must** match the sound folder name (step 2).
- Each sound has:
  - `letter`: the character used in pattern strings (e.g. `O`)
  - `name`: lowercase sound name — used for WAV filenames and SVG icon lookup
  - `description`: human-readable description
- The SVG icon for a sound is auto-derived: `data/assets/icons/{sound-name}.svg`. Create a new SVG there if the sound is new (e.g. `dedo.svg`), or reuse an existing icon if it fits.

## Step 2: Sound Folder

**Location:** `data/sounds/{instrument-name}/`

The folder name is the lowercase instrument `name` from the YAML (e.g. `conga` for the Conga).

## Step 3: WAV File Naming Convention

Every WAV file must follow this pattern:

```
{SYMBOL}.{SOUND_NAME}.{PACK_NAME}.wav
```

| Part | Meaning | Example |
|------|---------|---------|
| `SYMBOL` | Instrument symbol (case-insensitive) | `CON` or `con` |
| `SOUND_NAME` | Sound name from the instrument YAML | `open`, `slap` |
| `PACK_NAME` | Sound pack identifier; can have multiple dot-separated segments | `cp`, `basic`, `sg.cuba`, `cp.chaworo` |

**Examples** for a Conga:

```
data/sounds/conga/
  con.open.studio.wav      # "open" sound, "studio" pack
  con.slap.studio.wav      # "slap" sound, "studio" pack
  con.bass.studio.wav
  con.open.studio.live.wav # "open" sound, "studio.live" pack
  con.open.remix.wav       # "open" sound, "remix" pack
```

**Rules:**

- All WAV files of an instrument live in the same folder.
- Filename segments are joined with dots; the pack name is everything after the sound name (excluding `.wav`).
- Sound names must match the instrument YAML exactly.
- If a sound has no WAV file for a pack, it simply isn't available in that pack (it may still appear in the palette via the instrument definition).
- Adding a new sound pack = just drop more WAV files with that pack name. No YAML, no folder changes.

## Step 4: SVG Icons

The app looks up the icon at `data/assets/icons/{sound-name}.svg`. Most sounds share existing icons (`open.svg`, `slap.svg`, `mordito.svg`, `presionado.svg`, `half_mordito.svg`, `muff.svg`, `bass.svg`, `dedo.svg`, `clave.svg`, `rest.svg`). Create a new SVG only when the sound is unique to your instrument.

## Step 5: Run the Generator

From the repository root:

```bash
python3 tools/generate_manifest.py
```

This regenerates `manifest.json` (and the Batà metadata). The generator:

1. Scans `data/instruments/` for instrument definitions
2. Scans `data/sounds/{name}/` for WAV files
3. Parses each filename to build the pack → letter → wav mapping
4. Writes the new manifest

You can also run `python3 launch_local.py` to regenerate and serve the app locally on port 8000.

## Registering the Instrument in the App

If the new instrument has its own color and enum entries, add them in:

- `js/types.js` → `InstrumentName` enum
- `js/constants.js` → `INSTRUMENT_COLORS`

These are UI conveniences; the manifest alone is enough for data discovery.

## Quick Checklist

- [ ] `data/instruments/{SYMBOL}.yaml` exists with correct `symbol` and lowercase `name`
- [ ] `data/sounds/{name}/` folder exists
- [ ] WAV files follow `{SYMBOL}.{sound}.{pack}.wav`
- [ ] (If needed) SVG icons exist in `data/assets/icons/`
- [ ] `python3 tools/generate_manifest.py` ran successfully
- [ ] Instrument appears in the manifest under `instruments`