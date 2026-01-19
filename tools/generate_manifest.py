import os
import json
import yaml # pip install pyyaml

# Configuration
DATA_DIR = "data"
MANIFEST_FILE = "manifest.json"

# Batà Metadata Constants
# Batà Metadata Constants
BATA_METADATA_FILE = os.path.join(DATA_DIR, "rhythms/Batà/bata_metadata.json")
ORISHAS_FILE = os.path.join(DATA_DIR, "rhythms/Batà/orishas.yaml")
CLASSIFICATIONS_LIST = ["Specific", "Shared", "Generic"]

def scan_instruments():
    """Scans data/instruments for .yaml files"""
    instruments = {}
    path = os.path.join(DATA_DIR, "instruments")
    if not os.path.exists(path): return instruments
    
    for f in os.listdir(path):
        if f.endswith(".yaml") or f.endswith(".yml"):
            inst_id = os.path.splitext(f)[0]
            # Force URL-style forward slashes
            instruments[inst_id] = f"{DATA_DIR}/instruments/{f}"
            
    return instruments

def scan_sound_packs():
    """Scans data/sounds/PACK_NAME/pack.yaml"""
    packs = {}
    base_path = os.path.join(DATA_DIR, "sounds")
    if not os.path.exists(base_path): return packs
    
    for folder_name in os.listdir(base_path):
        folder_path = os.path.join(base_path, folder_name)
        if os.path.isdir(folder_path):
            # Assume any folder in sounds is a pack
            # Force URL-style forward slashes
            packs[folder_name] = f"{DATA_DIR}/sounds/{folder_name}/"
                
    return packs

def scan_rhythms():
    """Scans data/rhythms for .yaml files recursively"""
    rhythms = {}
    base_path = os.path.join(DATA_DIR, "rhythms")
    if not os.path.exists(base_path): return rhythms
    
    for root, dirs, files in os.walk(base_path):
        for f in files:
            # Exclude configuration files and dynamic metadata files
            if f.lower() == 'orishas.yaml' or f.lower().endswith('_metadata.yaml'):
                continue
            
            if f.endswith(".yaml") or f.endswith(".yml"):
                full_path = os.path.join(root, f)
                # Get path relative to data/rhythms
                rel_path = os.path.relpath(full_path, base_path)
                # Remove extension for ID
                r_id = os.path.splitext(rel_path)[0]
                # Force URL-style forward slashes for cross-platform consistency
                r_id = r_id.replace(os.path.sep, "/")
                rhythms[r_id] = f"{DATA_DIR}/rhythms/{rel_path}".replace(os.path.sep, "/")
            
    return rhythms

def generate_bata_metadata(rhythms_map):
    """Generates bata_metadata.json by parsing rhythm YAML files"""
    toques = {}
    
    count = 0
    # Iterate over folders in rhythms/Batà
    bata_path = os.path.join(DATA_DIR, "rhythms/Batà")
    if not os.path.exists(bata_path):
        return

    for folder_name in os.listdir(bata_path):
        folder_full_path = os.path.join(bata_path, folder_name)
        if not os.path.isdir(folder_full_path):
            continue

        # metadata file is now named [folder_name]_metadata.yaml
        # We need to handle case sensitivity appropriately or just use the folder name as is
        # Assuming folder name matches the file prefix
        meta_filename = f"{folder_name}_metadata.yaml"
        meta_file = os.path.join(folder_full_path, meta_filename)
        
        # Fallback check for old metadata.yaml just in case (optional, but good for safety)
        if not os.path.exists(meta_file) and os.path.exists(os.path.join(folder_full_path, "metadata.yaml")):
             meta_file = os.path.join(folder_full_path, "metadata.yaml")

        if not os.path.exists(meta_file):
            continue

        try:
            with open(meta_file, 'r', encoding='utf-8') as f:
                folder_meta = yaml.safe_load(f) or {}
        except Exception as e:
            print(f"⚠️ Error parsing {meta_file}: {e}")
            continue

        # Now find all rhythm files in this folder that are in the rhythms_map
        # We need to match RHYTHM_ID -> FOLDER
        
        # A rhythm ID looks like: Batà/Folder/Filename
        # So we can just iterate the known rhythms_map items
        for r_id, file_path in rhythms_map.items():
            # Ensure we don't pick up the metadata file itself if it somehow got into rhythms_map
            if r_id.startswith(f"Batà/{folder_name}/") and not r_id.endswith("_metadata"):
                # This rhythm belongs to this folder
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = yaml.safe_load(f)
                    
                    toques[r_id] = {
                        "displayName": content.get('name', r_id),
                        "classification": folder_meta.get('classification', 'Generic'),
                        "associatedOrishas": folder_meta.get('orisha', [])
                    }
                    count += 1
                except Exception as e:
                     print(f"⚠️ Error parsing rhythm {file_path}: {e}")

    # Load Orishas configuration
    orishas_list = []
    orisha_colors = {}
    
    if os.path.exists(ORISHAS_FILE):
        try:
            with open(ORISHAS_FILE, 'r', encoding='utf-8') as f:
                orisha_data = yaml.safe_load(f) or {}
                
            for o in orisha_data.get('orishas', []):
                name = o.get('name')
                if name:
                    orishas_list.append(name)
                    if 'color' in o:
                        orisha_colors[name] = o['color']
                        
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
        "toques": toques
    }
    
    # Write to file
    # Ensure directory exists
    os.makedirs(os.path.dirname(BATA_METADATA_FILE), exist_ok=True)
    
    with open(BATA_METADATA_FILE, "w", encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Generated {BATA_METADATA_FILE}")
    print(f"   - Batà Rhythms Found: {count}")

def generate():
    rhythms = scan_rhythms()
    
    manifest = {
        "instruments": scan_instruments(),
        "sound_packs": scan_sound_packs(),
        "rhythms": rhythms
    }
    
    with open(MANIFEST_FILE, "w") as f:
        json.dump(manifest, f, indent=2)
        
    print(f"✅ Generated {MANIFEST_FILE}")
    print(f"   - Instruments: {len(manifest['instruments'])}")
    print(f"   - Sound Packs: {len(manifest['sound_packs'])}")
    print(f"   - Rhythms:     {len(manifest['rhythms'])}")
    
    # Generate Batà specific metadata
    generate_bata_metadata(rhythms)

if __name__ == "__main__":
    generate()