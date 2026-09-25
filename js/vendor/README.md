# Vendored Dependencies

Third-party browser scripts are vendored here (instead of loaded from a CDN)
so the service worker snapshot can cache them like any other same-origin
asset and the app boots fully offline.

| File | Origin | Version | License |
|---|---|---|---|
| `js-yaml-4.1.0.min.js` | https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js | 4.1.0 | MIT |
| `tailwind-play-3.4.17.js` | https://cdn.tailwindcss.com/3.4.17 | 3.4.17 | MIT |

Notes:

- `mobile.html` / `desktop.html` load these with local `<script src>` tags;
  the inline `tailwind.config` block must stay after the Tailwind bundle.
- Updating either file is an app change: replace the vendored copy, update
  this table and the `<script>` filename, then regenerate `precache.json`
  (`python3 tools/generate_manifest.py`) so the snapshot hash changes.
- The Tailwind Play CDN build generates utility CSS in the browser at
  runtime; it is pinned to a version here so styling cannot drift with a
  floating CDN release. Replacing it with precompiled CSS would require the
  Tailwind CLI (Node), which the project forbids outside `tests/`.
