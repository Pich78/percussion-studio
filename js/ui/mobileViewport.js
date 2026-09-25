/**
 * js/ui/mobileViewport.js
 *
 * Mobile orientation / viewport handling.
 *
 * iOS standalone keeps viewport measurements stale for a while after a
 * rotation (up to ~500ms), and can leave the document scrolled even with an
 * overflow-hidden shell — both can push a non-sticky header out of view.
 * This module listens to `orientationchange`, `resize` and
 * `visualViewport.resize`, and on an actual orientation flip:
 *   1. lets the caller drop orientation-scoped UI (popovers),
 *   2. resets the document scroll,
 *   3. re-renders immediately, then at settle time (~350ms and ~650ms).
 *
 * Plain resizes keep the previous 100ms-debounced single render.
 */

import { eventBus } from '../services/eventBus.js';

const QUICK_RENDER_MS = 100;
const SETTLE_RENDER_MS = 350;
const FINAL_RENDER_MS = 650;

const isPortrait = () => {
    // screen.orientation is the semantic signal: unlike the viewport aspect
    // it does not flip when the on-screen keyboard shrinks the visual
    // viewport in portrait. Fall back to the aspect ratio for engines
    // without the Screen Orientation API.
    const orientationType = window.screen?.orientation?.type;
    if (orientationType) return orientationType.startsWith('portrait');
    return window.innerHeight >= window.innerWidth;
};

/**
 * Attach the viewport listeners. Called once per app boot by
 * setupMobileEvents().
 *
 * @param {object} [options]
 * @param {Function} [options.onOrientationChange] - Called on every real
 *   orientation flip, before the re-render, to drop orientation-scoped UI.
 */
export const setupMobileViewportHandling = ({ onOrientationChange } = {}) => {
    let lastIsPortrait = isPortrait();
    let resizeTimeout = null;
    let settleTimers = [];

    const clearSettleTimers = () => {
        settleTimers.forEach(clearTimeout);
        settleTimers = [];
    };

    const resetDocumentScroll = () => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
    };

    const scheduleSettleRenders = () => {
        clearSettleTimers();
        [SETTLE_RENDER_MS, FINAL_RENDER_MS].forEach((delay) => {
            settleTimers.push(setTimeout(() => {
                resetDocumentScroll();
                eventBus.emit('render');
            }, delay));
        });
    };

    const handleOrientationChange = () => {
        if (onOrientationChange) onOrientationChange();
        resetDocumentScroll();
        clearTimeout(resizeTimeout);
        eventBus.emit('render');
        scheduleSettleRenders();
    };

    const handleViewportEvent = ({ allowPlainResize }) => {
        const nowPortrait = isPortrait();
        if (nowPortrait !== lastIsPortrait) {
            lastIsPortrait = nowPortrait;
            handleOrientationChange();
            return;
        }

        if (!allowPlainResize) return;

        // Plain resize (browser chrome, on-screen keyboard): debounce a
        // single render, as before.
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => eventBus.emit('render'), QUICK_RENDER_MS);
    };

    window.addEventListener('resize', () => handleViewportEvent({ allowPlainResize: true }));

    // orientationchange can fire before the dimensions flip; re-check on the
    // next frame so isPortrait() observes the new orientation.
    window.addEventListener('orientationchange', () => {
        requestAnimationFrame(() => handleViewportEvent({ allowPlainResize: false }));
    });

    // visualViewport.resize catches rotations on engines that do not emit a
    // usable window resize; it is deliberately ignored for plain resizes so
    // the on-screen keyboard cannot trigger re-render churn.
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => handleViewportEvent({ allowPlainResize: false }));
    }
};
