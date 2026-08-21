/**
 * js/ui/pointerDrag.js
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
 * and a synthetic 'input' event (detail.source='pointer-drag') is
 * dispatched, so the existing root input listeners apply the model updates
 * (audio gain, BPM, all surface patches). Direct DOM visuals are applied in
 * parallel for snappiness. No repaint happens mid-drag by construction:
 * actions never emit UI events, and drag-tick listeners skip scheduling —
 * a single render on drag end rebuilds every surface from state (full
 * render, not grid-refresh: muted/solo styling is template-bound and
 * grid-refresh only covers #grid-container).
 */

import { eventBus } from '../services/eventBus.js';
import { updateVolumeSliderVisuals, updateBpmSliderVisuals } from './sliderVisuals.js';

const BPM_MIN = 40;
const BPM_MAX = 240;

// ─── Active drag state ──────────────────────────────────────────────────

let activeDrag = null; // { type, pointerId, element, apply(e), end(cancelled) }

// ─── Slider click guard ─────────────────────────────────────────────────
// Belt-and-suspenders for the backdrop common-ancestor click: with
// pointerdown canceled the click can never fire, but consuming one click
// after a drag is harmless insurance across browsers. UI-layer state:
// armed by a successful drag end, consumed (and reset) by the events
// layer's root click handler.

let sliderClickGuard = false;

export const resetSliderClickGuard = () => {
    sliderClickGuard = false;
};

export const consumeSliderClickGuard = () => {
    const armed = sliderClickGuard;
    sliderClickGuard = false;
    return armed;
};

const markDragFinished = (cancelled) => {
    if (!cancelled) sliderClickGuard = true;
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
            input.dispatchEvent(new CustomEvent('input', { bubbles: true, detail: { source: 'pointer-drag' } }));
            if (groupContainer) updateVolumeSliderVisuals(groupContainer, volume);
        },
        end: (cancelled) => {
            markDragFinished(cancelled);
            // Full render, not grid-refresh: muted/solo graying is
            // template-bound and exists on surfaces grid-refresh never
            // touches (dual-mode views, mixer modals).
            if (!cancelled) eventBus.emit('render');
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
            input.dispatchEvent(new CustomEvent('input', { bubbles: true, detail: { source: 'pointer-drag' } }));
            if (groupContainer) updateBpmSliderVisuals(groupContainer, bpm);
        },
        end: (cancelled) => {
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
    if (!e.isPrimary) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // A still-active drag here means its end was lost (element detached by
    // an involuntary re-render, pointercancel swallowed by the browser...).
    // Retire it — cancelled, no refresh — so a zombie can never block the
    // new gesture. New primary presses always win.
    if (activeDrag) {
        activeDrag.end(true);
        activeDrag = null;
    }

    // Reset on new sequence so a drag with no release (e.g. pointercancel)
    // can't swallow a later legitimate click.
    resetSliderClickGuard();

    const drag = resolveDrag(e.target);
    if (!drag) return;

    // Suppress native range behavior, text selection, AND the compatibility
    // mouse events (mousedown/mouseup/click) — a drag that ends over a modal
    // backdrop can no longer synthesize a backdrop click.
    e.preventDefault();

    drag.pointerId = e.pointerId;
    activeDrag = drag;
    drag.apply(e);

    // Keep pointermove/pointerup flowing when the pointer leaves the
    // element or the browser window. Failure is benign (synthetic events
    // in tests have no active pointer; rare capture races self-heal via
    // the lostpointercapture net) — stay silent.
    try {
        drag.element.setPointerCapture(e.pointerId);
    } catch {
        /* capture unavailable — drag still works within the element */
    }
};

const handlePointerMove = (e) => {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;
    activeDrag.apply(e);
};

const handlePointerEnd = (e, cancelled) => {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;
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
 *
 * Robustness nets (a lost gesture end must never wedge the machinery):
 * - lostpointercapture: browser revoked our capture (element detached,
 *   system gesture) — retire the drag cleanly.
 * - eventBus 'render': involuntary re-renders (e.g. sequencer section
 *   transitions) replace the DOM under a live capture; once the element
 *   is detached, cancel instead of leaving a zombie that would block
 *   every later pointerdown.
 * @param {HTMLElement} root - The #root container
 */
export const setupPointerDrags = (root) => {
    injectDragStyles();
    root.addEventListener('pointerdown', handlePointerDown, { passive: false });
    root.addEventListener('pointermove', handlePointerMove);
    root.addEventListener('pointerup', (e) => handlePointerEnd(e, false));
    root.addEventListener('pointercancel', (e) => handlePointerEnd(e, true));
    root.addEventListener('lostpointercapture', (e) => {
        if (activeDrag && e.pointerId === activeDrag.pointerId) {
            handlePointerEnd(e, true);
        }
    });
    // Runs after renderer's own 'render' listener within the same emit,
    // so innerHTML is already swapped when the containment check runs.
    eventBus.on('render', () => {
        if (activeDrag && !document.contains(activeDrag.element)) {
            activeDrag.end(true);
            activeDrag = null;
        }
    });
};
