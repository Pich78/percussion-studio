/**
 * js/ui/mobile/dual-mode/sectionModal.js
 *
 * Section list popover for the dual-mode mobile view (landscape + portrait).
 * Each row offers: jump-to-section, random-repetitions toggle, and the
 * reps / tempo-acceleration chips that open the custom wheel picker
 * (see wheelPicker.js).
 */

import { state } from '../../../store.js';
import { ArrowTrendingUpIcon } from '../../../icons/arrowTrendingUpIcon.js';
import { ArrowTrendingDownIcon } from '../../../icons/arrowTrendingDownIcon.js';
import { getDisplayReps } from './wheelPicker.js';

const renderAccelerationControl = (section) => {
    const accel = section.tempoAcceleration || 0;
    // Meaningful only for looping sections that repeat (see
    // docs/requirements/tempo-acceleration.md).
    const disabled = section.skip || section.playMode === 'once' || section.playMode === 'adlib' || (section.repetitions || 1) <= 1;

    const isPositive = accel > 0;
    const iconColor = disabled ? 'text-gray-600' : (isPositive ? 'text-green-400' : 'text-red-400');
    const icon = isPositive
        ? ArrowTrendingUpIcon('w-3 h-3 pointer-events-none')
        : (accel < 0 ? ArrowTrendingDownIcon('w-3 h-3 pointer-events-none') : '');

    const displayValue = accel >= 0 ? `+${accel.toFixed(1)}%` : `${accel.toFixed(1)}%`;

    return `
        <div class="flex items-center gap-0.5">
            <div class="flex items-center justify-center w-5 h-7 ${iconColor}">
                ${icon}
            </div>
            <button type="button" ${disabled ? 'disabled' : `data-action="dual-mode-open-accel-picker" data-section-id="${section.id}"`}
                 class="accel-trigger relative w-16 h-7 flex items-center justify-center bg-gray-900 border ${disabled ? 'border-gray-800' : 'border-gray-700'} rounded-lg text-xs font-mono ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-800'}">
                <span class="flex items-center justify-center w-full h-full ${disabled ? 'text-gray-600' : 'text-cyan-400'}">${displayValue}</span>
            </button>
        </div>`;
};

const renderRepsControl = (section) => {
    const display = getDisplayReps(section);
    const isDisabled = section.skip;
    const isAdlib = section.playMode === 'adlib';
    const isPlayOnce = section.playMode === 'once';
    const hasPlayedOnce = isPlayOnce && section._playedOnce;

    let bgClass = 'bg-gray-900 border border-gray-700';
    let textClass = 'text-indigo-400';
    
    if (isDisabled || hasPlayedOnce) {
        bgClass = 'bg-gray-800/50 border border-gray-700/50';
        textClass = 'text-gray-500';
    } else if (isAdlib) {
        bgClass = 'bg-purple-500/20 border border-purple-500/40';
        textClass = 'text-purple-400';
    }

    return `
        <button type="button" data-action="dual-mode-open-reps-picker" data-section-id="${section.id}"
             class="reps-trigger relative w-16 h-9 flex items-center justify-center ${bgClass} rounded-lg text-sm font-mono font-bold ${textClass} hover:bg-gray-800 cursor-pointer">
            <span class="flex items-center justify-center w-full h-full">${display}</span>
        </button>`;
};

export const renderSectionRow = (s, idx, isActive, showAcceleration = false) => {
    const isDisabled = s.skip;
    const isAdlib = s.playMode === 'adlib';
    const isPlayOnce = s.playMode === 'once';
    const hasPlayedOnce = isPlayOnce && s._playedOnce;
    
    let rowBgClass = 'bg-gray-800 border-transparent';
    let nameClass = 'text-gray-200';
    let numberClass = 'bg-gray-700 text-gray-500 border-gray-600';
    
    if (isActive) {
        rowBgClass = 'bg-indigo-500/15 border border-indigo-500/40';
        nameClass = 'text-indigo-400';
        numberClass = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    }
    
    if (isDisabled || hasPlayedOnce) {
        rowBgClass = 'bg-gray-800/40 border-transparent opacity-50';
    } else if (isAdlib) {
        rowBgClass = 'bg-purple-500/10 border border-purple-500/30';
        nameClass = 'text-purple-300';
    }

    return `
    <div class="w-full text-left rounded-xl flex items-stretch transition-colors ${isActive ? 'bg-indigo-500/15 border border-indigo-500/40' : rowBgClass}">
        
        <!-- Left: Clickable Section Area -->
        <button data-action="dual-mode-select-section" data-section-id="${s.id}" class="flex-1 px-3 py-3 flex items-center gap-3 truncate hover:bg-white/5 active:bg-white/10 rounded-l-xl">
            <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border ${isActive ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : numberClass}">
                <span class="text-[10px] font-bold">${idx + 1}</span>
            </div>
            <div class="flex flex-col flex-1 min-w-0 text-left">
                <span class="font-semibold text-sm ${isActive ? 'text-indigo-400' : nameClass} truncate">${s.name}</span>
            </div>
        </button>

        <!-- Right: Inline Rep Controls -->
        <div class="flex items-center gap-2 pr-2.5 flex-shrink-0">
            ${showAcceleration ? renderAccelerationControl(s) : ''}
            
            <!-- Random Toggle - Dice emoji -->
            <button data-action="dual-mode-toggle-random" data-section-id="${s.id}"
                class="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-colors
                       ${s.randomRepetitions ? 'bg-amber-500/20 shadow-inner border border-amber-500/40 opacity-100 grayscale-0' : 'bg-gray-900 border border-gray-700 opacity-50 grayscale hover:opacity-100'}">
                🎲
            </button>
            
            ${renderRepsControl(s)}
        </div>
    </div>`;
};

export const renderSectionModal = (activeSection) => {
    const sections = state.toque.sections;
    const sectionRows = sections.map((s, idx) => renderSectionRow(s, idx, s.id === state.activeSectionId, true)).join('');

    return `
    <div class="fixed bottom-[52px] left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5 w-full max-w-md md:max-w-lg lg:max-w-xl max-h-[60vh] overflow-y-auto z-[65] animate-in fade-in flex flex-col gap-3">
        <div class="flex justify-between items-center pb-2 border-b border-gray-800">
            <div>
                <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Sections</span>
                <span class="text-[10px] text-gray-600 ml-2">Tap to jump • edit reps • set accel</span>
            </div>
            <button data-action="dual-mode-close-popover" class="text-gray-500 hover:text-white text-xs">Done</button>
        </div>
        ${sectionRows}
    </div>`;
};

export const renderPortraitSectionModal = (activeSection) => {
    const sections = state.toque.sections;
    const sectionRows = sections.map((s, idx) => renderSectionRow(s, idx, s.id === state.activeSectionId, true)).join('');

    return `
    <div class="fixed inset-x-0 bottom-20 z-[70] mx-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 max-h-[55vh] overflow-y-auto animate-in fade-in">
        <div class="flex justify-between items-center pb-1 border-b border-gray-800 mb-1">
            <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Sections</span>
            <button data-action="dual-mode-close-popover" class="text-gray-500 hover:text-white text-xs">Done</button>
        </div>
        ${sectionRows}
    </div>
    <div data-action="dual-mode-close-popover"
         class="fixed inset-0 z-[65] bg-black/50" style="bottom: 80px;"></div>`;
};
