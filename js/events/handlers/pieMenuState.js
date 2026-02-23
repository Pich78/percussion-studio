/**
 * js/events/handlers/pieMenuState.js
 * 
 * Encapsulated state manager for pie menu timers and interaction flags.
 * Replaces the module-level mutable variables that were hidden in gridEvents.js.
 * 
 * All pie menu timing state is managed through this explicit API,
 * making the state transitions visible and testable.
 */

// ─── Private State ──────────────────────────────────────────────────────────

let _openTimer = null;       // Timer ID for delayed pie menu open (hover/long-press)
let _closeTimer = null;      // Timer ID for delayed pie menu close (mouse leave)
let _justOpenedByLongPress = false;  // Flag to suppress the click that follows a long-press open

// ─── Open Timer ─────────────────────────────────────────────────────────────

/**
 * Schedule a delayed pie menu open.
 * Cancels any existing open timer first.
 * @param {Function} openFn - Callback to execute after delay
 * @param {number} delayMs - Delay in milliseconds
 */
export const scheduleOpen = (openFn, delayMs) => {
    cancelOpenTimer();
    _openTimer = setTimeout(openFn, delayMs);
};

/**
 * Cancel a pending open timer (e.g., mouse left the cell before delay elapsed).
 */
export const cancelOpenTimer = () => {
    if (_openTimer) {
        clearTimeout(_openTimer);
        _openTimer = null;
    }
};

/** @returns {boolean} Whether an open timer is currently pending */
export const hasOpenTimer = () => _openTimer !== null;

// ─── Close Timer ────────────────────────────────────────────────────────────

/**
 * Schedule a delayed pie menu close.
 * Cancels any existing close timer first.
 * @param {Function} closeFn - Callback to execute after delay
 * @param {number} delayMs - Delay in milliseconds
 */
export const scheduleClose = (closeFn, delayMs) => {
    cancelCloseTimer();
    _closeTimer = setTimeout(closeFn, delayMs);
};

/**
 * Cancel a pending close timer (e.g., mouse re-entered the pie menu area).
 */
export const cancelCloseTimer = () => {
    if (_closeTimer) {
        clearTimeout(_closeTimer);
        _closeTimer = null;
    }
};

/** @returns {boolean} Whether a close timer is currently pending */
export const hasCloseTimer = () => _closeTimer !== null;

// ─── Long-Press Flag ────────────────────────────────────────────────────────

/**
 * Mark that the pie menu was just opened by a long-press.
 * The next cell click should be suppressed to avoid accidental edits.
 */
export const markLongPressOpen = () => {
    _justOpenedByLongPress = true;
};

/**
 * Check and consume the long-press flag.
 * Returns true once after a long-press open, then resets to false.
 * @returns {boolean} Whether the flag was set
 */
export const consumeLongPressFlag = () => {
    if (_justOpenedByLongPress) {
        _justOpenedByLongPress = false;
        return true;
    }
    return false;
};

/**
 * Reset the long-press flag without consuming it.
 */
export const resetLongPressFlag = () => {
    _justOpenedByLongPress = false;
};

// ─── Reset All ──────────────────────────────────────────────────────────────

/**
 * Cancel all timers and reset all flags.
 * Useful when closing the pie menu or stopping playback.
 */
export const resetAll = () => {
    cancelOpenTimer();
    cancelCloseTimer();
    resetLongPressFlag();
};
