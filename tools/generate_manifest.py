import os
import json
import yaml # pip install pyyaml

# Configuration
DATA_DIR = "data"
MANIFEST_FILE = "manifest.json"

# Batà Metadata Constants
BATA_METADATA_FILE = os.path.join(DATA_DIR, "rhythms/Batà/bata_metadata.json")
ORISHAS_LIST = [
    "Elegua", "Ogun", "Ochosi", "Obatala", "Chango", 
    "Yemaya", "Oshun", "Oya", "Babalu Aye", "Inle",
    "Osain", "Aggayu", "Orisha Oko", "Ibeyi", "Dada", "Oggue",
    "Orula", "Eggun"
]
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
    
    print("⏳ Scanning for Batà rhythms...")
    
    count = 0
    for r_id, file_path in rhythms_map.items():
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = yaml.safe_load(f)
                
                # Check if it's a Batà rhythm
                # 1. Explicit flag
                # 2. Inferred from presence of metadata fields
                is_bata = content.get('is_bata', False)
                if not is_bata:
                    # heuristic inference
                    if 'orisha' in content or 'classification' in content:
                        is_bata = True
                
                if is_bata:
                    # Extract metadata
                    toques[r_id] = {
                        "displayName": content.get('name', r_id),
                        "classification": content.get('classification', 'Generic'),
                        "associatedOrishas": content.get('orisha', []),
                        "description": content.get('description', ''),
                        "timeSignature": content.get('time_signature', '6/8')
                    }
                    count += 1
                    
        except Exception as e:
            print(f"⚠️ Error parsing {file_path}: {e}")

    # Construct the full metadata object
    metadata = {
        "version": "1.0",
        "orishas": ORISHAS_LIST,
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