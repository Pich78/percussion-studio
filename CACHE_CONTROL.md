# Cache Control Configuration

## Development vs Production

The application has a configuration file (`js/config.js`) that controls caching behavior:

### Development Mode (Current Setting)
```javascript
isDevelopment: true
verboseLogging: true
```

**What it does:**
- Forces browser to always fetch fresh YAML files (no caching)
- Adds detailed console logging for debugging
- Prevents stale data issues during development

**When to use:** Local development with `python -m http.server`

### Production Mode (GitHub Pages)
```javascript
isDevelopment: false
verboseLogging: false
```

**What it does:**
- Enables browser caching for better performance
- Reduces console logging
- Improves load times for users

**When to use:** Before deploying to GitHub Pages

## How to Switch Modes

1. Open `js/config.js`
2. Change `isDevelopment` to `false` for production
3. Change `verboseLogging` to `false` to reduce console output
4. Commit and push to GitHub Pages

## Additional Cache Control

The `index.html` file includes meta tags that prevent caching during development:

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

**For production deployment:** You may want to remove or comment out these meta tags to allow the browser to cache the HTML page itself.

## Summary

- **Development:** Keep `isDevelopment: true` - Always get fresh files
- **Production:** Set `isDevelopment: false` - Enable caching for performance
- **Debugging:** Set `verboseLogging: true` - See detailed logs
- **Clean console:** Set `verboseLogging: false` - Minimal logging
