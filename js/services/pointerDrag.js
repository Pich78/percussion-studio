/**
 * js/services/pointerDrag.js
 *
 * Unified pointer-based drag machinery (Pointer Events + setPointerCapture).
 * Replaces the legacy per-platform mousedown/mousemove/mouseup and
 * touchstart/touchmove/touchend implementations for all sliders, on
 * desktop and mobile.
 *
 * Why pointer events:
 * - One code path for mouse, touch and pen across all modern browsers.
 * - setPointerCapture keeps pointermove/pointerup flowing when the pointer
 *   leaves the element or the browser window (fixes stuck drags when the
 *   button is released outside the window).
 * - preventDefault() on pointerdown suppresses native range behavior AND the
 *   compatibility mousedown/mouseup/click events, so a drag that ends over
 *   a modal backdrop can never synthesize the backdrop click that used to
 *   close mixer modals/popovers.
 *
 * Model-driven UI: state (state.mix, playback) is the single source of
 * truth. On every move the underlying input[data-action] element is updated
 * and a synthetic 'input' event is dispatched, so the existing root input
 * listeners apply the model updates (audio gain, BPM, all surface patches).
 * Direct DOM visuals are applied in parallel for snappiness (no re-render
 * mid-drag — the __volumeDragging/__bpmDragging flags keep grid-refresh
 * suppressed until the drag ends, then a single grid-refresh/render rebuilds
 * every surface from state).
 */

import { eventBus } from './eventBus.js';
import { updateVolumeSliderVisuals, updateBpmSliderVisuals } from '../ui/sliderVisuals.js';

const BPM_MIN = 40;
const BPM_MAX = 240;

// ─── Active drag state ──────────────────────────────────────────────────

let activeDrag = null; // { type, element, apply(e), end(cancelled) }

const markDragFinished = (cancelled) => {
    // Belt-and-suspenders for the backdrop common-ancestor click: with
    // pointerdown canceled the click can never fire, but consuming one
    // click after a drag is harmless insurance across browsers.
    if (!cancelled) window.__sliderDragFinished = true;
};

const buildVolumeDrag = (container) => {
    const input = container.matches('[data-action="update-volume"]')
        ? container
        : container.querySelector('input[data-action="update-volume"]');
    if (!input) return null;
    const groupContainer = container.matches('.group\\/vol') ? container : null;
    const rect = container.getBoundingClientRect();

    return {
        type: 'vol',
        element: container,
        apply: (e) => {
            let fraction = (e.clientX - rect.left) / rect.width;
            fraction = Math.max(0, Math.min(1, fraction));
            const volume = parseFloat(fraction.toFixed(2));
            input.value = volume;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            if (groupContainer) updateVolumeSliderVisuals(groupContainer, volume);
        },
        end: (cancelled) => {
            window.__volumeDragging = false;
            markDragFinished(cancelled);
            if (!cancelled) eventBus.emit('grid-refresh');
        }
    };
};

const buildBpmDrag = (container) => {
    const input = container.matches('[data-action="update-global-bpm"]')
        ? container
        : container.querySelector('input[data-action="update-global-bpm"]');
    if (!input) return null;
    const groupContainer = container.matches('.group\\/bpm') ? container : null;
    const rect = container.getBoundingClientRect();

    return {
        type: 'bpm',
        element: container,
        apply: (e) => {
            let fraction = (e.clientX - rect.left) / rect.width;
            fraction = Math.max(0, Math.min(1, fraction));
            const bpm = Math.round(BPM_MIN + fraction * (BPM_MAX - BPM_MIN));
            input.value = bpm;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            if (groupContainer) updateBpmSliderVisuals(groupContainer, bpm);
        },
        end: (cancelled) => {
            window.__bpmDragging = false;
            markDragFinished(cancelled);
            if (!cancelled) eventBus.emit('render');
        }
    };
};

/**
 * Resolve the drag target from the pointerdown target.
 */
const resolveDrag = (target) => {
    const volContainer = target.closest('.group\\/vol') || target.closest('[data-action="update-volume"]');
    if (volContainer) return buildVolumeDrag(volContainer);

    const bpmContainer = target.closest('.group\\/bpm') || target.closest('[data-action="update-global-bpm"]');
    if (bpmContainer) return buildBpmDrag(bpmContainer);

    return null;
};

// ─── Event handlers ─────────────────────────────────────────────────────

const handlePointerDown = (e) => {
    if (activeDrag) return;
    if (!e.isPrimary) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // Reset on new sequence so a drag with no release (e.g. pointercancel)
    // can't swallow a later legitimate click.
    window.__sliderDragFinished = false;

    const drag = resolveDrag(e.target);
    if (!drag) return;

    // Suppress native range behavior, text selection, AND the compatibility
    // mouse events (mousedown/mouseup/click) — a drag that ends over a modal
    // backdrop can no longer synthesize a backdrop click.
    e.preventDefault();

    // Set the drag flag before the first apply so mid-drag grid-refresh
    // stays suppressed (snappiness: no re-render while dragging).
    if (drag.type === 'vol') window.__volumeDragging = true;
    else window.__bpmDragging = true;

    activeDrag = drag;
    drag.apply(e);

    // Keep pointermove/pointerup flowing when the pointer leaves the
    // element or the browser window.
    try {
        drag.element.setPointerCapture(e.pointerId);
    } catch (err) {
        console.error('[PointerDrag] setPointerCapture failed:', err);
    }
};

const handlePointerMove = (e) => {
    if (!activeDrag) return;
    activeDrag.apply(e);
};

const handlePointerEnd = (e, cancelled) => {
    if (!activeDrag) return;
    if (activeDrag.element.hasPointerCapture && activeDrag.element.hasPointerCapture(e.pointerId)) {
        activeDrag.element.releasePointerCapture(e.pointerId);
    }
    activeDrag.end(cancelled);
    activeDrag = null;
};

// ─── Styles ─────────────────────────────────────────────────────────────
// touch-action: none is required so touch drags don't scroll/zoom the page
// and pointermove keeps firing. user-select: none avoids text selection
// during drags. Injected once, idempotent, no markup changes needed.

let stylesInjected = false;

const injectDragStyles = () => {
    if (stylesInjected) return;
    stylesInjected = true;
    const style = document.createElement('style');
    style.textContent = `
        .group\\/vol,
        .group\\/bpm,
        [data-action="update-volume"],
        [data-action="update-global-bpm"] {
            touch-action: none;
            user-select: none;
        }
    `;
    document.head.appendChild(style);
};

/**
 * Set up the unified drag machinery. Delegated on root so it survives
 * re-renders (sliders are rebuilt on every 'render' event).
 * @param {HTMLElement} root - The #root container
 */
export const setupPointerDrags = (root) => {
    injectDragStyles();
    root.addEventListener('pointerdown', handlePointerDown, { passive: false });
    root.addEventListener('pointermove', handlePointerMove);
    root.addEventListener('pointerup', (e) => handlePointerEnd(e, false));
    root.addEventListener('pointercancel', (e) => handlePointerEnd(e, true));
};
