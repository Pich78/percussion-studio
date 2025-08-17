// file: lib/Logger.js

const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

let currentLogLevel = LOG_LEVELS.info; // Default log level
let logTargetElement = null;

/**
 * Initializes the logger, setting the global log level.
 * In a test harness, force the level. In the main app, read from URL.
 * @param {object} [config={}] - Configuration options.
 * @param {string} [config.level='info'] - The desired log level ('debug', 'info', 'warn', 'error').
 */
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

/**
 * Sets a DOM element as the target for log output. If not set, logs go to the console.
 * @param {string} elementId - The ID of the DOM element to append logs to.
 */
function setTarget(elementId) {
    logTargetElement = document.getElementById(elementId);
    if (logTargetElement) {
        console.log(`[Logger] Log target set to element #${elementId}`);
    } else {
        console.warn(`[Logger] Could not find log target element with ID: ${elementId}`);
    }
}

/**
 * The main logging function used by the entire application.
 * @param {'debug'|'info'|'warn'|'error'} level - The severity level of the log.
 * @param {string} className - The name of the class logging the event.
 * @param {string} methodName - The name of the method logging the event.
 * @param {string} feature - A feature tag (e.g., 'Lifecycle', 'BPM', 'State').
 * @param {string} message - The log message.
 * @param {...any} [args] - Additional objects to log.
 */
export function logEvent(level, className, methodName, feature, message, ...args) {
    if (LOG_LEVELS[level] < currentLogLevel) {
        return; // Don't log messages below the current level
    }

    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}][${level.toUpperCase()}][${className}][${methodName}][${feature}] - ${message}`;

    if (logTargetElement) {
        const logEntry = document.createElement('div');
        logEntry.textContent = formattedMessage;
        if (args.length > 0) {
            const argsPre = document.createElement('pre');
            argsPre.textContent = JSON.stringify(args, null, 2);
            logEntry.appendChild(argsPre);
        }
        logTargetElement.appendChild(logEntry);
        logTargetElement.scrollTop = logTargetElement.scrollHeight;
    } else {
        // Use appropriate console methods based on level
        const consoleMethod = console[level] || console.log;
        consoleMethod(formattedMessage, ...args);
    }
}

// Export the configuration functions as a single object
export const Logger = {
    init,
    setTarget,
};