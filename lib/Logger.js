// file: lib/Logger.js

// --- 1. NEW: Updated CSS to support a three-row, grid-based layout ---
const loggerCss = `
    /* The main container for a single log entry */
    .log-entry {
        border-bottom: 1px solid #444;
        padding: 8px;
        margin-bottom: 5px;
    }

    /* Add a colored left border based on log level for quick scanning */
    .log-level-info { border-left: 3px solid #82aaff; }
    .log-level-warn { border-left: 3px solid #ffcb6b; }
    .log-level-error { border-left: 3px solid #ff5370; }
    .log-level-debug { border-left: 3px solid #bbbbbb; }

    /* --- Row 1: Timestamp --- */
    .log-row-time {
        font-family: monospace;
        font-size: 0.8em;
        color: #999999;
    }

    /* --- Row 2: Tags (using CSS Grid for alignment) --- */
    .log-row-tags {
        display: grid;
        /* Define 4 columns: Level, Class, Method, Feature */
        grid-template-columns: 90px 200px 200px 1fr;
        gap: 10px; /* Space between columns */
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.9em;
        margin-top: 4px;
    }

    /* Style for individual tags within the grid */
    .log-row-tags > span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis; /* Use '...' if content is too long for the column */
    }

    /* Color coding for each tag */
    .log-level { font-weight: bold; }
    .log-classname { color: #68d2ff; }
    .log-methodname { color: #f5d37d; }
    .log-feature { color: #c792ea; }
    
    /* Specific colors for the level tag itself */
    .log-level-info .log-level { color: #82aaff; }
    .log-level-warn .log-level { color: #ffcb6b; }
    .log-level-error .log-level { color: #ff5370; }
    .log-level-debug .log-level { color: #bbbbbb; }

    /* --- Row 3: Message --- */
    .log-row-message {
        margin-top: 6px;
        color: #f1f1f1;
        font-size: 1em;
        word-break: break-word;
    }

    /* The <pre> block for additional arguments */
    .log-args {
        width: 100%;
        box-sizing: border-box;
        background-color: #333;
        border: 1px solid #555;
        color: #a9b7c6;
        padding: 8px;
        margin-top: 8px;
        white-space: pre-wrap;
        word-break: break-all;
    }
`;

/**
 * --- 2. Injects CSS into the document head (Unchanged) ---
 */
function injectCss() {
    const styleId = 'app-logger-styles';
    if (document.getElementById(styleId)) {
        return;
    }
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = loggerCss;
    document.head.appendChild(styleElement);
}

// --- Original Logger Code (with minimal changes) ---

const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

let currentLogLevel = LOG_LEVELS.info;
let logTargetElement = null;

function init(config = {}) {
    if (config.level) {
        currentLogLevel = LOG_LEVELS[config.level] ?? LOG_LEVELS.info;
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const levelFromUrl = urlParams.get('log_level');
        if (levelFromUrl && LOG_LEVELS.hasOwnProperty(levelFromUrl)) {
            currentLogLevel = LOG_LEVELS[levelFromUrl];
        }
    }
    console.log(`[Logger] Initialized. Log level set to: ${Object.keys(LOG_LEVELS)[currentLogLevel]}`);
}

function setTarget(elementId) {
    logTargetElement = document.getElementById(elementId);
    if (logTargetElement) {
        console.log(`[Logger] Log target set to element #${elementId}`);
        injectCss();
    } else {
        console.warn(`[Logger] Could not find log target element with ID: ${elementId}`);
    }
}

/**
 * The main logging function used by the entire application.
 */
export function logEvent(level, className, methodName, feature, message, ...args) {
    if (LOG_LEVELS[level] < currentLogLevel) {
        return;
    }

    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}][${level.toUpperCase()}][${className}][${methodName}][${feature}] - ${message}`;

    if (logTargetElement) {
        // --- 3. MODIFICATION: Build the new three-row DOM structure ---
        
        // Main container for the entry
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-level-${level}`;

        // Helper to create styled spans
        const createSpan = (text, className) => {
            const span = document.createElement('span');
            span.textContent = text;
            span.className = className;
            return span;
        };

        // ROW 1: Timestamp
        const timeRow = document.createElement('div');
        timeRow.className = 'log-row-time';
        timeRow.textContent = `[${timestamp}]`;
        logEntry.appendChild(timeRow);

        // ROW 2: Tags
        const tagsRow = document.createElement('div');
        tagsRow.className = 'log-row-tags';
        tagsRow.appendChild(createSpan(`[${level.toUpperCase()}]`, 'log-level'));
        tagsRow.appendChild(createSpan(`[${className}]`, 'log-classname'));
        tagsRow.appendChild(createSpan(`[${methodName}]`, 'log-methodname'));
        tagsRow.appendChild(createSpan(`[${feature}]`, 'log-feature'));
        logEntry.appendChild(tagsRow);

        // ROW 3: Message and Arguments
        const messageRow = document.createElement('div');
        messageRow.className = 'log-row-message';
        messageRow.textContent = message; // Just the message text
        
        if (args.length > 0) {
            const argsPre = document.createElement('pre');
            argsPre.className = 'log-args';
            argsPre.textContent = JSON.stringify(args, null, 2);
            messageRow.appendChild(argsPre);
        }
        logEntry.appendChild(messageRow);

        // Append to target and scroll
        logTargetElement.appendChild(logEntry);
        logTargetElement.scrollTop = logTargetElement.scrollHeight;

    } else {
        // Console logging remains unchanged
        const consoleMethod = console[level] || console.log;
        consoleMethod(formattedMessage, ...args);
    }
}

// Export the configuration functions as a single object (unchanged)
export const Logger = {
    init,
    setTarget,
};