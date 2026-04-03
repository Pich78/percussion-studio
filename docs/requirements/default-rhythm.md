# Default Rhythm Configuration

## Requirement

The application must support a configurable default rhythm with URL parameter override.

## Behavior

1. **Default Rhythm**: The application loads a default rhythm on startup, defined in the manifest (`manifest.json`).
2. **URL Override**: A URL parameter `?rhythm=<rhythm_id>` overrides the default rhythm.
3. **Fallback**: If the requested rhythm (from URL) is not found in the manifest, it falls back to the default rhythm.

## Configuration

To change the default rhythm:

1. Edit `DEFAULT_RHYTHM` constant in `tools/generate_manifest.py`:
   ```python
   DEFAULT_RHYTHM = "Batà/Yakota/yakota_-_base"
   ```

2. Regenerate the manifest:
   ```bash
   python3 tools/generate_manifest.py
   ```

## Usage

- **Default load**: Open the app without parameters to load the default rhythm
  ```
  https://pich78.github.io/percussion-studio/
  ```

- **Override default**: Specify a rhythm via URL parameter
  ```
  https://pich78.github.io/percussion-studio/?rhythm=Bat%C3%A0/Iyesa/iyesa
  ```

The rhythm ID must match a key in the `rhythms` object of `manifest.json`.