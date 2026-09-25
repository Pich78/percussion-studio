/**
 * js/ui/mobileViewport.js
 *
 * Mobile orientation / viewport handling.
 *
 * The mobile layouts are pure CSS (the grid cell size is a --cell-size clamp
 * and safe areas are env()-backed), so a rotation needs no re-render at all.
 * This module only handles what CSS cannot:
 *   1. close orientation-scoped popovers (state cleanup + targeted removal of
 *      [data-role="orientation-popover"] subtrees),
 *   2. reset the document scroll (iOS standalone can leave it scrolled, which
 *      pushes the non-sticky header out of view).
 *
 * Listeners: `orientationchange`, `resize` and `visualViewport.resize`.
 * Plain resizes (browser chrome, on-screen keyboard) are ignored — nothing
 * viewport-derived is baked into the markup anymore.
 */

const ORIENTATION_POPOVER_SELECTOR = '[data-role="orientation-popover"]';

const isPortrait = () => {
    // screen.orientation is the semantic signal: unlike the viewport aspect
    // it does not flip when the on-screen keyboard shrinks the visual
    // viewport in portrait. Fall back to the aspect ratio for engines
    // without the Screen Orientation API.
    const orientationType = window.screen?.orientation?.type;
    if (orientationType) return orientationType.startsWith('portrait');
    return window.innerHeight >= window.innerWidth;
};

const resetDocumentScroll = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
};

const removeOrientationPopovers = () => {
    document.querySelectorAll(ORIENTATION_POPOVER_SELECTOR).forEach(el => el.remove());
};

/**
 * Attach the viewport listeners. Called once per app boot by
 * setupMobileEvents().
 *
 * @param {object} [options]
 * @param {Function} [options.onOrientationChange] - Called on every real
 *   orientation flip, before the DOM cleanup, to drop orientation-scoped UI.
 */
export const setupMobileViewportHandling = ({ onOrientationChange } = {}) => {
    let lastIsPortrait = isPortrait();

    const handleOrientationChange = () => {
        if (onOrientationChange) onOrientationChange();
        removeOrientationPopovers();
        resetDocumentScroll();
    };

    const checkOrientation = () => {
        const nowPortrait = isPortrait();
        if (nowPortrait === lastIsPortrait) return;
        lastIsPortrait = nowPortrait;
        handleOrientationChange();
    };

    window.addEventListener('resize', checkOrientation);

    // orientationchange can fire before the dimensions flip; re-check on the
    // next frame so isPortrait() observes the new orientation.
    window.addEventListener('orientationchange', () => requestAnimationFrame(checkOrientation));

    // visualViewport.resize catches rotations on engines that do not emit a
    // usable window resize.
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', checkOrientation);
    }
};
