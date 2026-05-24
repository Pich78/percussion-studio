/**
 * js/views/mobileDualModeView.js
 *
 * View definition for "Dual Mode" —
 * a Dual View where phone orientation drives the experience:
 *   • Landscape → full chromatic notation grid + chips toolbar
 *   • Portrait  → music-player control surface (BPM, mixer, sections)
 */

import { DualModeLayout } from '../ui/mobile/dual-mode/layout.js';
import { updateVisualStep, scrollToMeasure, updateBpmUi } from '../ui/playheadUtils.js';
import { setupMobileEvents } from '../events/mobileEvents.js';
import { state, playback } from '../store.js';

export const mobileDualModeView = {
    id: 'mobile-dual-mode',
    name: 'Dual Mode ↔',

    /** Returns the full page HTML */
    layout: DualModeLayout,

    /**
     * Attach a horizontal swipe listener to the landscape top bar.
     * The header never scrolls horizontally so there is no conflict with the
     * grid's own overflow-x scroll. A swipe > 50px that is more horizontal
     * than vertical navigates to the prev/next section.
     */
    setupEvents: () => {
        setupMobileEvents();

        let touchStartX = 0;
        let touchStartY = 0;

        const onTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };

        const onTouchEnd = (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;

            if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.8) return;

            const header = document.getElementById('dual-mode-landscape-header');
            if (!header) return;

            const action = dx < 0 ? 'dual-mode-next-section' : 'dual-mode-prev-section';
            const syntheticTarget = { dataset: { action } };
            const btn = header.querySelector(`[data-action="${action}"]`);
            if (btn && !btn.disabled) btn.click();
        };

        const root = document.getElementById('root');
        if (root) {
            root.removeEventListener('touchstart', root.__dualModeSwipeStart);
            root.removeEventListener('touchend',   root.__dualModeSwipeEnd);
            root.__dualModeSwipeStart = onTouchStart;
            root.__dualModeSwipeEnd   = onTouchEnd;
            root.addEventListener('touchstart', onTouchStart, { passive: true });
            root.addEventListener('touchend',   onTouchEnd,   { passive: true });
        }
    },

    onStep: ({ step, measure, rep }) => {
        updateVisualStep(step, measure);
        scrollToMeasure(measure);

        if (step === 0) {
            const repEl = document.getElementById('dual-mode-rep-count');
            const repElPortrait = document.getElementById('dual-mode-rep-count-portrait');

            const reps = state.toque?.sections?.find(s => s.id === state.activeSectionId)?.repetitions || 1;
            const currentRep = playback.repetitionCounter || 1;
            const repText = `${currentRep}/${reps}`;

            if (repEl) repEl.textContent = repText;
            if (repElPortrait) repElPortrait.textContent = repText;

            updateBpmUi();
        }
    }
};