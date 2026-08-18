import os
import json
import yaml  # pip install pyyaml

# Anchored to the repository root so the script can be run from anywhere
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Configuration
DATA_DIR = os.path.join(REPO_ROOT, "data")
MANIFEST_FILE = os.path.join(REPO_ROOT, "manifest.json")
DEFAULT_RHYTHM = "Batà/Yakota/yakota_-_base"

# Batà Metadata Constants
BATA_METADATA_FILE = os.path.join(DATA_DIR, "rhythms/Batà/bata_metadata.json")
ORISHAS_FILE = os.path.join(DATA_DIR, "rhythms/Batà/orishas.yaml")
CLASSIFICATIONS_LIST = ["Specific", "Shared", "Generic"]


def load_yaml(path):
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def rel_path(path):
    """Returns a repo-root-relative path with forward slashes for the browser."""
    return os.path.relpath(path, REPO_ROOT).replace(os.path.sep, "/")


def scan_instruments():
    """Scans data/instruments for .yaml files.

    Returns {symbol: {name, definition, path}} where:
    - name: lowercase instrument name (folder name in data/sounds/)
    - definition: instrument YAML path
    - path: instrument sound folder path
    """
    instruments = {}
    path = os.path.join(DATA_DIR, "instruments")
    sounds_base = os.path.join(DATA_DIR, "sounds")
    if not os.path.exists(path):
        return instruments

    for f in sorted(os.listdir(path)):
        if not (f.endswith(".yaml") or f.endswith(".yml")):
            continue

        data = load_yaml(os.path.join(path, f))
        symbol = data.get("symbol")
        if not symbol:
            print(f"⚠️ Instrument YAML without symbol: {f}")
            continue

        folder = data.get("name", symbol).strip().lower()
        instruments[symbol] = {
            "name": folder,
            "definition": rel_path(os.path.join(path, f)),
            "path": rel_path(os.path.join(sounds_base, folder)) + "/",
        }

    return instruments


def scan_instrument_sounds():
    """Scans data/sounds/{instrument_name}/ for wav files.

    Parses filenames with the convention:
        {symbol}.{sound-name}.{brand}[.{variant}].wav

    Groups files by pack name (brand + optional variant joined with dots)
    and maps each sound to its letter via the instrument definition.
    """
    instruments = scan_instruments()
    base_path = os.path.join(DATA_DIR, "sounds")
    if not os.path.exists(base_path):
        return instruments

    # Build lookups: lowercase symbol -> symbol, sound name -> letter
    symbol_lookup = {symbol.lower(): symbol for symbol in instruments}

    for symbol, info in instruments.items():
        def_data = load_yaml(info["definition"])
        letter_by_name = {
            s["name"]: s["letter"] for s in def_data.get("sounds", [])
        }
        info["_letter_by_name"] = letter_by_name

        folder_path = os.path.join(base_path, info["name"])
        if not os.path.isdir(folder_path):
            continue

        packs = {}
        for f in sorted(os.listdir(folder_path)):
            if not f.endswith(".wav"):
                continue

            parts = f[:-4].split(".")
            if len(parts) < 3:
                print(f"⚠️ Unrecognized wav filename: {f}")
                continue

            file_symbol = parts[0].lower()
            if file_symbol not in symbol_lookup or symbol_lookup[file_symbol] != symbol:
                print(f"⚠️ Wav {f} does not match instrument {symbol}")
                continue

            sound_name = parts[1]
            letter = letter_by_name.get(sound_name)
            if not letter:
                print(f"⚠️ Wav {f}: sound '{sound_name}' not defined for {symbol}")
                continue

            pack_name = ".".join(parts[2:])
            packs.setdefault(pack_name, {})[letter] = f

        if packs:
            info["packs"] = packs
        else:
            info["packs"] = {}

    for info in instruments.values():
        info.pop("_letter_by_name", None)

    return instruments


def scan_rhythms():
    """Scans data/rhythms for .yaml files recursively"""
    rhythms = {}
    base_path = os.path.join(DATA_DIR, "rhythms")
    if not os.path.exists(base_path):
        return rhythms

    for root, dirs, files in os.walk(base_path):
        for f in files:
            # Exclude configuration files and dynamic metadata files
            if f.lower() == "orishas.yaml" or f.lower().endswith("_metadata.yaml"):
                continue

            if f.endswith(".yaml") or f.endswith(".yml"):
                full_path = os.path.join(root, f)
                # Get path relative to data/rhythms
                rel = os.path.relpath(full_path, base_path)
                # Remove extension for ID
                r_id = os.path.splitext(rel)[0]
                # Force URL-style forward slashes for cross-platform consistency
                r_id = r_id.replace(os.path.sep, "/")
                rhythms[r_id] = rel_path(full_path)

    return rhythms


def generate_bata_metadata(rhythms_map):
    """Generates bata_metadata.json by parsing rhythm YAML files"""
    toques = {}

    count = 0
    # Iterate over folders in rhythms/Batà
    bata_path = os.path.join(DATA_DIR, "rhythms/Batà")
    if not os.path.exists(bata_path):
        return

    for folder_name in sorted(os.listdir(bata_path)):
        folder_full_path = os.path.join(bata_path, folder_name)
        if not os.path.isdir(folder_full_path):
            continue

        # metadata file is now named [folder_name]_metadata.yaml
        # Find the metadata file in the folder
        meta_file = None
        for file in os.listdir(folder_full_path):
            if file.endswith("_metadata.yaml") or file == "metadata.yaml":
                meta_file = os.path.join(folder_full_path, file)
                break

        if meta_file is None or not os.path.exists(meta_file):
            continue

        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                folder_meta = yaml.safe_load(f) or {}
        except Exception as e:
            print(f"⚠️ Error parsing {meta_file}: {e}")
            continue

        # Now find all rhythm files in this folder that are in the rhythms_map
        # We need to match RHYTHM_ID -> FOLDER

        # A rhythm ID looks like: Batà/Folder/Filename
        # So we can just iterate the known rhythms_map items
        for r_id, file_path in sorted(rhythms_map.items()):
            # Ensure we don't pick up the metadata file itself if it somehow got into rhythms_map
            if r_id.startswith(f"Batà/{folder_name}/") and not r_id.endswith(
                "_metadata"
            ):
                # This rhythm belongs to this folder
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = yaml.safe_load(f)

                    toques[r_id] = {
                        "displayName": content.get("name", r_id),
                        "classification": folder_meta.get("classification", "Generic"),
                        "associatedOrishas": folder_meta.get("orisha", []),
                    }
                    count += 1
                except Exception as e:
                    print(f"⚠️ Error parsing rhythm {file_path}: {e}")

    # Load Orishas configuration
    orishas_list = []
    orisha_colors = {}

    if os.path.exists(ORISHAS_FILE):
        try:
            with open(ORISHAS_FILE, "r", encoding="utf-8") as f:
                orisha_data = yaml.safe_load(f) or {}

            for o in orisha_data.get("orishas", []):
                name = o.get("name")
                if name:
                    orishas_list.append(name)
                    if "color" in o:
                        orisha_colors[name] = o["color"]

        except Exception as e:
            print(f"⚠️ Error parsing {ORISHAS_FILE}: {e}")
    else:
        print(f"⚠️ Warning: {ORISHAS_FILE} not found. Orisha list will be empty.")

    # Construct the full metadata object
    metadata = {
        "version": "1.0",
        "orishas": orishas_list,
        "orishaColors": orisha_colors,
        "classifications": CLASSIFICATIONS_LIST,
        "toques": toques,
    }

    # Write to file
    # Ensure directory exists
    os.makedirs(os.path.dirname(BATA_METADATA_FILE), exist_ok=True)

    with open(BATA_METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"Generated {BATA_METADATA_FILE}")
    print(f"   - Batà Rhythms Found: {count}")


def generate():
    rhythms = scan_rhythms()
    instruments = scan_instrument_sounds()

    manifest = {
        "instruments": instruments,
        "rhythms": rhythms,
        "default_rhythm": DEFAULT_RHYTHM,
    }

    with open(MANIFEST_FILE, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"Generated {MANIFEST_FILE}")
    print(f"   - Instruments: {len(manifest['instruments'])}")
    print(f"   - Rhythms:     {len(manifest['rhythms'])}")

    # Generate Batà specific metadata
    generate_bata_metadata(rhythms)


if __name__ == "__main__":
    generate()