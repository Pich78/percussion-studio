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
import { WHEEL_ITEM_H, setWheelPosition, animateWheelTo, stopWheelAnimation, settleWheel } from './mobile/dual-mode/wheelPicker.js';

const BPM_MIN = 40;
const BPM_MAX = 240;

// ─── Active drag state ──────────────────────────────────────────────────

let activeDrag = null; // { type, pointerId, element, apply(e), end(cancelled) }

/**
 * True while a slider drag is in flight. Input handlers consult this to
 * classify ticks as gesture-driven regardless of event provenance: on
 * real devices, native range-input events can fire alongside (or instead
 * of) our synthetic ones, without the 'pointer-drag' detail marker.
 */
export const isSliderDragging = () => activeDrag !== null;

// ─── Volume repaint throttle ────────────────────────────────────────────
// Full renders are reconciliations of last resort: one per gesture end,
// never per tick. Leading+trailing 50 ms throttle — the first release in
// a burst paints immediately, subsequent ones coalesce (fast swiping on
// a slow device must not turn into a render storm).
const VOLUME_REPAINT_THROTTLE_MS = 50;
let volumeRepaintLast = 0;
let volumeRepaintTimer = null;

export const scheduleVolumeRepaint = () => {
    const now = performance.now();
    const elapsed = now - volumeRepaintLast;
    if (elapsed >= VOLUME_REPAINT_THROTTLE_MS) {
        volumeRepaintLast = now;
        eventBus.emit('render');
        return;
    }
    if (!volumeRepaintTimer) {
        volumeRepaintTimer = setTimeout(() => {
            volumeRepaintTimer = null;
            volumeRepaintLast = performance.now();
            eventBus.emit('render');
        }, VOLUME_REPAINT_THROTTLE_MS - elapsed);
    }
};

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

// ─── On-device diagnostics (?dragdebug=1) ───────────────────────────────
// Flag-gated corner panel logging the pointer lifecycle (newest first).
// Exists because PWA standalone has no console: reproduce a gesture bug
// on the iPhone, then read the event story off the screen.

let dragDebugEl = null;
let dragDebugT0 = 0;
let dragDebugLastMove = 0;

const dragDebug = (evt, e) => {
    if (!dragDebugEl) return;
    const t = Math.round(performance.now() - dragDebugT0);
    const x = Number.isFinite(e?.clientX) ? Math.round(e.clientX) : '-';
    const line = `${String(t).padStart(6)}ms ${evt} id=${e?.pointerId ?? '-'}`;
    dragDebugEl.textContent =
        `${line} x=${x}\n${dragDebugEl.textContent}`.split('\n').slice(0, 9).join('\n');
};

const initDragDebug = () => {
    if (!new URLSearchParams(location.search).has('dragdebug')) return;
    dragDebugT0 = performance.now();
    dragDebugEl = document.createElement('pre');
    dragDebugEl.style.cssText =
        'position:fixed;left:8px;top:8px;z-index:9999;background:rgba(0,0,0,.75);' +
        'color:#4ade80;font:10px/1.5 monospace;padding:6px 8px;border-radius:6px;' +
        'pointer-events:none;white-space:pre;margin:0';
    document.body.appendChild(dragDebugEl);
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
            // Full render (never grid-refresh): muted/solo graying is
            // template-bound and lives on surfaces grid-refresh never
            // touches (dual-mode views, mixer modals). Throttled so fast
            // repeated swipes coalesce instead of stacking long tasks.
            if (!cancelled) scheduleVolumeRepaint();
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

// ─── Wheel picker drag (dual-mode mobile, see ui/mobile/dual-mode/wheelPicker.js) ──
// Direct manipulation of a drum-roll list: 1:1 finger tracking in item
// units, velocity-tracked flick with projection on release, tap-to-select.
// All visuals are targeted DOM writes (setWheelPosition); the draft lands
// in data-index only when the wheel settles, and the picker's Done action
// reads it. No state writes and no renders mid-gesture.

const WHEEL_FLICK_MS = 160;       // projection horizon for release velocity
const WHEEL_TAP_TOLERANCE_PX = 6; // movement below this counts as a tap

const buildWheelDrag = (container) => {
    const count = parseInt(container.dataset.count, 10) || 0;
    let pos = 0, startY = 0, lastY = 0, lastT = 0, velocity = 0;
    let moved = false, downIdx = null;

    const clampPos = (p) => Math.max(0, Math.min(count - 1, p));

    return {
        type: 'wheel',
        element: container,
        begin: (e) => {
            stopWheelAnimation(container);
            pos = parseFloat(container.dataset.index) || 0;
            startY = lastY = e.clientY;
            lastT = performance.now();
            velocity = 0;
            moved = false;
            const item = e.target.closest('.wheel-item');
            downIdx = item ? parseInt(item.dataset.idx, 10) : null;
        },
        apply: (e) => {
            const now = performance.now();
            const dy = e.clientY - lastY;
            const dt = now - lastT;
            if (Math.abs(e.clientY - startY) > WHEEL_TAP_TOLERANCE_PX) moved = true;
            if (dt > 0) velocity = velocity * 0.7 + (dy / dt) * 0.3;
            pos = clampPos(pos - dy / WHEEL_ITEM_H);
            setWheelPosition(container, pos);
            lastY = e.clientY;
            lastT = now;
        },
        end: (cancelled) => {
            if (cancelled) {
                // Involuntary end (re-render, lost capture): return to the
                // committed draft without changing it.
                const committed = parseFloat(container.dataset.index) || 0;
                animateWheelTo(container, pos, committed, 150, () => settleWheel(container, committed));
                return;
            }
            // A pause before release kills the flick — holding still then
            // letting go must settle in place, not fling (iOS behavior).
            if (performance.now() - lastT > 100) velocity = 0;
            const current = Math.round(pos);
            const isTap = !moved;
            const target = isTap && downIdx != null
                ? clampPos(downIdx)
                : clampPos(Math.round(pos - (velocity * WHEEL_FLICK_MS) / WHEEL_ITEM_H));
            const duration = isTap ? 200 : Math.min(320, 140 + Math.abs(target - pos) * 55);
            animateWheelTo(container, pos, target, duration, () => settleWheel(container, target));
            // Swallow the release click after a real gesture so it can't
            // reach the picker's backdrop (cancel) — same insurance as sliders.
            if (moved || (downIdx != null && downIdx !== current)) {
                markDragFinished(false);
            }
        }
    };
};

/**
 * Resolve the drag target from the pointerdown target.
 */
const resolveDrag = (target) => {
    const wheelContainer = target.closest('.group\\/wheel');
    if (wheelContainer) return buildWheelDrag(wheelContainer);

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
        dragDebug('zombie-retired', { pointerId: activeDrag.pointerId });
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
    dragDebug('down', e);

    drag.pointerId = e.pointerId;
    activeDrag = drag;
    // Drags with a begin hook (wheel) initialize from their committed value
    // instead of applying the pointer position as an immediate value jump.
    if (drag.begin) drag.begin(e); else drag.apply(e);

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
    const now = performance.now();
    if (now - dragDebugLastMove > 100) {
        dragDebugLastMove = now;
        dragDebug('move', e);
    }
    activeDrag.apply(e);
};

const handlePointerEnd = (e, cancelled) => {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;
    const drag = activeDrag;
    // Retire BEFORE end() — releasePointerCapture/lostpointercapture and
    // any listener side-effects must never re-enter this handler.
    activeDrag = null;
    dragDebug(cancelled ? 'cancel' : 'up', e);
    drag.end(cancelled);
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
        .group\\/wheel,
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
    initDragDebug();
    injectDragStyles();
    root.addEventListener('pointerdown', handlePointerDown, { passive: false });
    root.addEventListener('pointermove', handlePointerMove);
    root.addEventListener('pointerup', (e) => handlePointerEnd(e, false));
    root.addEventListener('pointercancel', (e) => handlePointerEnd(e, true));
    root.addEventListener('lostpointercapture', (e) => {
        if (activeDrag && e.pointerId === activeDrag.pointerId) {
            dragDebug('lost-capture', e);
            handlePointerEnd(e, true);
        }
    }, true); // capture phase — lostpointercapture does not bubble
    // Runs after renderer's own 'render' listener within the same emit,
    // so innerHTML is already swapped when the containment check runs.
    eventBus.on('render', () => {
        if (activeDrag && !document.contains(activeDrag.element)) {
            dragDebug('render-cancel', { pointerId: activeDrag.pointerId });
            activeDrag.end(true);
            activeDrag = null;
        }
    });
};
