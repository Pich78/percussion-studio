/**
 * js/ui/mobile/dual-mode/wheelPicker.js
 *
 * Custom drum-roll wheel picker for the dual-mode mobile view — replaces the
 * third-party mobile-select library. Used for section repetitions and tempo
 * acceleration.
 *
 * Model:
 * - Open state lives in state.uiState.dualModeWheelPicker
 *   ({ type: 'reps'|'accel', sectionId } | null); the picker is part of the
 *   declarative layout (renderWheelPicker below), so no post-render init,
 *   no globals, no inline onclick.
 * - The draft selection lives in the DOM: data-index on the .group/wheel
 *   element, updated only when the wheel settles (settleWheel). Done reads it
 *   and commits (see 'dual-mode-wheel-done' in js/events/mobileEvents.js);
 *   Cancel/backdrop just clears the uiState gate.
 *
 * Rendering: a true 3D drum. Items sit statically on a cylinder
 * (rotateX(i·STEP) translateZ(R) around the window center) inside a
 * preserve-3d list; dragging rotates the whole list via ONE transform, so a
 * frame costs one style write plus opacity/active-class updates on the
 * ~5 visible items (computeWheelFade). The window supplies the perspective
 * and the edge-fade mask.
 *
 * Interaction is driven by the unified pointer machinery in
 * js/ui/pointerDrag.js (a 'wheel' drag type). All visual updates during a
 * drag are targeted DOM writes — no renders mid-gesture, ever.
 */

import { state } from '../../../store.js';

// ─── Value lists ──────────────────────────────────────────────────────────

export const REP_DISPLAY_VALUES = ['∞', 'disabled', 'play once', ...Array.from({ length: 64 }, (_, i) => String(i + 1))];

export const ACCEL_VALUES = Array.from({ length: 201 }, (_, i) => ((i - 100) / 10).toFixed(1));

export const getDisplayReps = (section) => {
    if (section.playMode === 'adlib') return '∞';
    if (section.skip) return 'disabled';
    if (section.playMode === 'once') return 'play once';
    return String(section.repetitions || 1);
};

/**
 * Maps a wheel display value onto the section's playback fields
 * (playMode / skip / repetitions). Unchanged from the old mobile-select
 * picker semantics.
 */
export const setRepetitions = (section, displayValue) => {
    if (displayValue === '∞') {
        section.playMode = 'adlib';
        section.skip = false;
    } else if (displayValue === 'disabled') {
        section.playMode = 'loop';
        section.skip = true;
    } else if (displayValue === 'play once') {
        section.playMode = 'once';
        section.skip = false;
    } else {
        section.playMode = 'loop';
        section.skip = false;
        section.repetitions = parseInt(displayValue) || 1;
    }
    if (section.playMode === 'once') {
        section._playedOnce = false;
    }
};

// ─── Wheel geometry ───────────────────────────────────────────────────────
// Angle per item on the drum; the radius spaces adjacent items ~42px apart
// along the cylinder surface at the front. The window is 5 such rows tall.
// WHEEL_ITEM_H is the px-per-item conversion used by the drag machinery.

export const WHEEL_ITEM_H = 42;
const WHEEL_STEP_DEG = 24;
const WHEEL_RADIUS = Math.round(42 / (2 * Math.sin((WHEEL_STEP_DEG / 2) * Math.PI / 180))); // ≈ 101px
const WHEEL_WINDOW_H = 210; // 5 rows

const ACTIVE_CLASSES = ['text-white', 'font-bold'];
const IDLE_CLASS = 'text-gray-400';

/**
 * Opacity/visibility for the item o steps above/below the drum's front
 * position. Shared by the template (initial paint) and the drag machinery.
 */
export const computeWheelFade = (o) => {
    const dist = Math.abs(o);
    if (dist > 2.8) return { opacity: '0', visibility: 'hidden' };
    return { opacity: Math.max(0, 1 - dist * 0.32).toFixed(3), visibility: 'visible' };
};

// ─── Imperative wheel visuals (called by the pointer machinery) ──────────

/**
 * Rotate the drum to a fractional item position: one transform on the list,
 * plus fade/active-class updates on the visible items. Targeted DOM writes
 * only — safe to call per pointermove.
 */
export const setWheelPosition = (container, pos) => {
    const list = container.firstElementChild;
    if (list) {
        list.style.transform = `translateZ(${-WHEEL_RADIUS}px) rotateX(${(pos * WHEEL_STEP_DEG).toFixed(2)}deg)`;
    }

    const nearest = Math.round(pos);
    for (const el of container.querySelectorAll('.wheel-item')) {
        const i = parseInt(el.dataset.idx, 10);
        const v = computeWheelFade(i - pos);
        el.style.opacity = v.opacity;
        el.style.visibility = v.visibility;
        const isActive = i === nearest;
        if (isActive !== (el.dataset.active === '1')) {
            el.dataset.active = isActive ? '1' : '0';
            if (isActive) {
                el.classList.add(...ACTIVE_CLASSES);
                el.classList.remove(IDLE_CLASS);
            } else {
                el.classList.remove(...ACTIVE_CLASSES);
                el.classList.add(IDLE_CLASS);
            }
        }
    }
};

export const stopWheelAnimation = (container) => {
    if (container._wheelAnim) {
        cancelAnimationFrame(container._wheelAnim);
        container._wheelAnim = null;
    }
};

/**
 * Animate the drum from one (possibly fractional) position to an item index
 * with an ease-out cubic. onDone runs once the wheel has visually settled.
 */
export const animateWheelTo = (container, from, to, duration = 220, onDone) => {
    stopWheelAnimation(container);
    if (from === to || duration <= 0) {
        setWheelPosition(container, to);
        if (onDone) onDone();
        return;
    }
    const start = performance.now();
    const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setWheelPosition(container, from + (to - from) * eased);
        if (t < 1) {
            container._wheelAnim = requestAnimationFrame(tick);
        } else {
            container._wheelAnim = null;
            setWheelPosition(container, to);
            if (onDone) onDone();
        }
    };
    container._wheelAnim = requestAnimationFrame(tick);
};

/**
 * Land the drum on an item and record it as the draft selection.
 */
export const settleWheel = (container, idx) => {
    container.dataset.index = String(idx);
    setWheelPosition(container, idx);
};

// ─── Template ─────────────────────────────────────────────────────────────

export const renderWheelPicker = () => {
    const picker = state.uiState.dualModeWheelPicker;
    if (!picker || !state.toque) return '';

    const section = state.toque.sections.find(s => s.id === picker.sectionId);
    if (!section) return '';

    const isReps = picker.type === 'reps';
    const values = isReps ? REP_DISPLAY_VALUES : ACCEL_VALUES;
    const currentValue = isReps ? getDisplayReps(section) : (section.tempoAcceleration || 0).toFixed(1);
    let currentIndex = values.indexOf(currentValue);
    if (currentIndex < 0) currentIndex = 0;

    const title = isReps ? 'Repetitions' : 'Tempo Acceleration';
    const hint = isReps ? '∞ repeat forever • play once • disabled' : '% tempo change per repetition';

    const items = values.map((value, i) => {
        const v = computeWheelFade(i - currentIndex);
        const active = i === currentIndex;
        return `<div data-idx="${i}" data-active="${active ? '1' : '0'}" class="wheel-item ${active ? ACTIVE_CLASSES.join(' ') : IDLE_CLASS}" style="transform: rotateX(${(-i * WHEEL_STEP_DEG).toFixed(2)}deg) translateZ(${WHEEL_RADIUS}px); opacity: ${v.opacity}; visibility: ${v.visibility};">${value}</div>`;
    }).join('');

    return `
    <div data-action="dual-mode-wheel-cancel"
         class="fixed inset-0 z-[75] bg-black/60" style="backdrop-filter: blur(2px);"></div>
    <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] w-72 max-w-[calc(100vw-2rem)]
                bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in">
        <div class="flex justify-between items-center">
            <div class="flex flex-col">
                <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">${title}</span>
                <span class="text-[10px] text-gray-600 truncate">${section.name}</span>
            </div>
            <span class="text-[10px] text-gray-600 text-right leading-tight max-w-[45%]">${hint}</span>
        </div>

        <div class="relative" style="height: ${WHEEL_WINDOW_H}px;">
            <!-- Center highlight band (behind the items) -->
            <div class="absolute inset-x-1 top-1/2 -translate-y-1/2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 pointer-events-none"
                 style="height: 42px;"></div>
            <!-- Drum window: edge fade via mask, depth via perspective -->
            <div class="group/wheel absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
                 data-index="${currentIndex}" data-count="${values.length}"
                 style="perspective: 620px;
                        -webkit-mask-image: linear-gradient(to bottom, transparent, black 22%, black 78%, transparent);
                        mask-image: linear-gradient(to bottom, transparent, black 22%, black 78%, transparent);">
                <div class="wheel-list absolute inset-0"
                     style="transform-style: preserve-3d; transform: translateZ(${-WHEEL_RADIUS}px) rotateX(${(currentIndex * WHEEL_STEP_DEG).toFixed(2)}deg);">
                    ${items}
                </div>
            </div>
        </div>

        <div class="flex gap-2">
            <button data-action="dual-mode-wheel-cancel"
                    class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 border border-gray-700 rounded-xl py-2 text-sm font-bold text-gray-300">Cancel</button>
            <button data-action="dual-mode-wheel-done"
                    class="flex-1 bg-cyan-500/15 hover:bg-cyan-500/25 active:bg-cyan-500/35 border border-cyan-500/40 rounded-xl py-2 text-sm font-bold text-cyan-300">Done</button>
        </div>
    </div>`;
};
