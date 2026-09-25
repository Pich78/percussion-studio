/**
 * js/components/rhythmSwitcherButton.js
 *
 * Rhythm name rendered as the direct rhythm-switcher trigger.
 * One markup shared by the desktop header, Standard mobile header and the
 * Dual Mode landscape/portrait headers — tapping it opens the rhythm browser
 * in a single step (instead of going through the hamburger menu).
 */

import { ChevronDownIcon } from '../icons/chevronDownIcon.js';

export const RhythmSwitcherButton = ({
    name,
    textClass = 'text-sm font-bold text-indigo-400',
    chevronClass = 'text-gray-500',
    className = ''
}) => `
    <button data-action="load-rhythm" title="Switch rhythm"
        class="flex items-center gap-1 min-w-0 overflow-hidden rounded px-1.5 py-1 -mx-1 hover:bg-gray-800/70 active:bg-gray-700 transition-colors ${className}">
        <span class="${textClass} min-w-0 pointer-events-none">${name}</span>
        ${ChevronDownIcon(`w-3.5 h-3.5 flex-shrink-0 pointer-events-none ${chevronClass}`)}
    </button>
`;
