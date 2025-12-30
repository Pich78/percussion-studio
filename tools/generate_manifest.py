import os
import json
import yaml # pip install pyyaml

# Configuration
DATA_DIR = "data"
MANIFEST_FILE = "manifest.json"

def scan_instruments():
    """Scans data/instruments for .yaml files"""
    instruments = {}
    path = os.path.join(DATA_DIR, "instruments")
    if not os.path.exists(path): return instruments
    
    for f in os.listdir(path):
        if f.endswith(".yaml") or f.endswith(".yml"):
            # ID is the filename without extension (e.g., 'ITO')
            inst_id = os.path.splitext(f)[0]
            # We open the file to get the human-readable name if needed, 
            # but for the manifest, the ID (filename) is enough for the app to fetch it.
            instruments[inst_id] = os.path.join(DATA_DIR, "instruments", f)
            
    return instruments

def scan_sound_packs():
    """Scans data/sounds/PACK_NAME/pack.yaml"""
    packs = {}
    base_path = os.path.join(DATA_DIR, "sounds")
    if not os.path.exists(base_path): return packs
    
    for folder_name in os.listdir(base_path):
        folder_path = os.path.join(base_path, folder_name)
        if os.path.isdir(folder_path):
            # Look for pack.yaml inside
            pack_def = os.path.join(folder_path, "pack.yaml")
            if os.path.exists(pack_def):
                # The Pack ID is the folder name (e.g., 'new_bata')
                packs[folder_name] = pack_def
                
    return packs

def scan_rhythms():
    """Scans data/rhythms for .yaml files"""
    rhythms = {}
    path = os.path.join(DATA_DIR, "rhythms")
    if not os.path.exists(path): return rhythms
    
    for f in os.listdir(path):
        if f.endswith(".yaml") or f.endswith(".yml"):
            r_id = os.path.splitext(f)[0]
            rhythms[r_id] = os.path.join(DATA_DIR, "rhythms", f)
            
    return rhythms

def generate():
    manifest = {
        "instruments": scan_instruments(),
        "sound_packs": scan_sound_packs(),
        "rhythms": scan_rhythms()
    }
    
    with open(MANIFEST_FILE, "w") as f:
        json.dump(manifest, f, indent=2)
        
    print(f"✅ Generated {MANIFEST_FILE}")
    print(f"   - Instruments: {len(manifest['instruments'])}")
    print(f"   - Sound Packs: {len(manifest['sound_packs'])}")
    print(f"   - Rhythms:     {len(manifest['rhythms'])}")

if __name__ == "__main__":
    generate()