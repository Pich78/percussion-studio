/**
 * js/views/mobilePractitionerView.js
 *
 * View definition for "Dimension D: The Practitioner" —
 * a Dual View where phone orientation drives the experience:
 *   • Landscape → full chromatic notation grid + chips toolbar
 *   • Portrait  → music-player control surface (BPM, mixer, sections)
 */

import { PractitionerLayout } from '../ui/mobile/practitioner/layout.js';

export const mobilePractitionerView = {
    id: 'mobile-practitioner',
    name: 'The Practitioner (Dual)',

    /** Returns the full page HTML */
    layout: PractitionerLayout,

    /**
     * Attach a horizontal swipe listener to the landscape top bar.
     * The header never scrolls horizontally so there is no conflict with the
     * grid's own overflow-x scroll. A swipe > 50px that is more horizontal
     * than vertical navigates to the prev/next section.
     */
    setupEvents: () => {
        let touchStartX = 0;
        let touchStartY = 0;

        const onTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };

        const onTouchEnd = (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;

            // Require a predominantly horizontal swipe of at least 50px
            if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.8) return;

            const header = document.getElementById('practitioner-landscape-header');
            if (!header) return;

            // Fire a synthetic data-action click so the existing mobileEvents router handles it
            const action = dx < 0 ? 'practitioner-next-section' : 'practitioner-prev-section';
            const syntheticTarget = { dataset: { action } };
            // Dispatch to the global mobile action handler via a fake click on a well-known target
            const btn = header.querySelector(`[data-action="${action}"]`);
            if (btn && !btn.disabled) btn.click();
        };

        // Attach to the whole landscape wrapper so the swipe zone is generous.
        // We re-attach on every setupEvents call (view switch) so use a named
        // function so we can clean up stale listeners if needed.
        const root = document.getElementById('root');
        if (root) {
            // Remove any previous listeners from this view (idempotent)
            root.removeEventListener('touchstart', root.__practitionerSwipeStart);
            root.removeEventListener('touchend',   root.__practitionerSwipeEnd);
            root.__practitionerSwipeStart = onTouchStart;
            root.__practitionerSwipeEnd   = onTouchEnd;
            root.addEventListener('touchstart', onTouchStart, { passive: true });
            root.addEventListener('touchend',   onTouchEnd,   { passive: true });
        }
    },

    /**
     * Visual update hook called every sequencer tick.
     * Step highlighting is handled by TubsCell reading state.currentStep on
     * each render — same as all other mobile views. No custom DOM patching needed.
     */
    onStep: () => {}
};
