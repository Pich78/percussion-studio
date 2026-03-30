import { state } from '../../../store.js';
import { eventBus } from '../../../services/eventBus.js';
import { ArrowTrendingUpIcon } from '../../../icons/arrowTrendingUpIcon.js';
import { ArrowTrendingDownIcon } from '../../../icons/arrowTrendingDownIcon.js';

const ACCEL_VALUES = Array.from({ length: 201 }, (_, i) => {
    const val = (i - 100) / 10;
    return val.toFixed(1);
});

const REP_VALUES = Array.from({ length: 64 }, (_, i) => String(i + 1));

let mobileSelectInstances = {};

window.openRepsPicker = function(sectionId) {
    const ms = mobileSelectInstances[`reps-${sectionId}`];
    if (ms) {
        ms.show();
    }
};

window.openAccelPicker = function(sectionId) {
    const ms = mobileSelectInstances[`accel-${sectionId}`];
    if (ms) {
        ms.show();
    }
};

const renderAccelerationControl = (section) => {
    const reps = section.repetitions || 1;
    const accel = section.tempoAcceleration || 0;
    const disabled = reps <= 1;

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
            <button type="button" id="prac-accel-${section.id}" ${disabled ? 'disabled' : ''}
                 class="accel-trigger relative w-16 h-7 flex items-center justify-center bg-gray-900 border ${disabled ? 'border-gray-800' : 'border-gray-700'} rounded-lg text-xs font-mono ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-800'}"
                 onclick="${disabled ? '' : `window.openAccelPicker('${section.id}')`}">
                <span class="flex items-center justify-center w-full h-full ${disabled ? 'text-gray-600' : 'text-cyan-400'}">${displayValue}</span>
            </button>
        </div>`;
};

const renderRepsControl = (section) => {
    const reps = section.repetitions || 1;

    return `
        <button type="button" id="prac-reps-${section.id}"
             class="reps-trigger relative w-12 h-9 flex items-center justify-center bg-gray-900 border border-gray-700 rounded-lg text-sm font-mono font-bold text-indigo-400 hover:bg-gray-800 cursor-pointer"
             onclick="window.openRepsPicker('${section.id}')">
            <span class="flex items-center justify-center w-full h-full">${reps}<span class="text-[10px] text-gray-500 ml-0.5">x</span></span>
        </button>`;
};

export const renderSectionRow = (s, idx, isActive, showAcceleration = false) => {
    return `
    <div class="w-full text-left rounded-xl flex items-stretch transition-colors
                ${isActive ? 'bg-indigo-500/15 border border-indigo-500/40' : 'bg-gray-800 border border-transparent'}">
        
        <!-- Left: Clickable Section Area -->
        <button data-action="practitioner-select-section" data-section-id="${s.id}" class="flex-1 px-3 py-3 flex items-center gap-3 truncate hover:bg-white/5 active:bg-white/10 rounded-l-xl">
            <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border
                        ${isActive ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-gray-700 text-gray-500 border-gray-600'}">
                <span class="text-[10px] font-bold">${idx + 1}</span>
            </div>
            <div class="flex flex-col flex-1 min-w-0 text-left">
                <span class="font-semibold text-sm ${isActive ? 'text-indigo-400' : 'text-gray-200'} truncate">${s.name}</span>
            </div>
        </button>

        <!-- Right: Inline Rep Controls -->
        <div class="flex items-center gap-2 pr-2.5 flex-shrink-0">
            ${showAcceleration ? renderAccelerationControl(s) : ''}
            
            <!-- Random Toggle - Dice emoji -->
            <button data-action="practitioner-toggle-random" data-section-id="${s.id}"
                class="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-colors
                       ${s.random ? 'bg-amber-500/20 shadow-inner border border-amber-500/40 opacity-100 grayscale-0' : 'bg-gray-900 border border-gray-700 opacity-50 grayscale hover:opacity-100'}">
                🎲
            </button>
            
            ${renderRepsControl(s)}
        </div>
    </div>`;
};

const initMobileSelect = (sections) => {
    if (typeof MobileSelect === 'undefined') {
        return;
    }

    Object.keys(mobileSelectInstances).forEach(key => {
        if (mobileSelectInstances[key]) {
            mobileSelectInstances[key].destroy();
        }
    });
    mobileSelectInstances = {};

    sections.forEach(section => {
        const reps = section.repetitions || 1;
        const accel = section.tempoAcceleration || 0;

        const repsTrigger = document.getElementById(`prac-reps-${section.id}`);
        if (repsTrigger) {
            try {
                const ms = new MobileSelect({
                    trigger: repsTrigger,
                    title: 'Repetitions',
                    wheels: [{ data: REP_VALUES }],
                    initValue: String(reps),
                    ensureBtnText: 'Done',
                    cancelBtnText: 'Cancel',
                    triggerDisplayValue: true,
                    bgColor: '#1a202c',
                    textColor: '#e5e7eb',
                    titleBgColor: '#1f2937',
                    titleColor: '#f9fafb',
                    ensureBtnColor: '#22d3ee',
                    cancelBtnColor: '#9ca3af',
                    onChange: (data) => {
                        console.log('[sectionModal] reps onChange data:', data);
                        const value = parseInt(data[0]);
                        section.repetitions = value;
                        eventBus.emit('render');
                    }
                });
                mobileSelectInstances[`reps-${section.id}`] = ms;
            } catch (e) {
                console.error('[sectionModal] Error init reps:', e);
            }
        }

        if (reps > 1) {
            const accelTrigger = document.getElementById(`prac-accel-${section.id}`);
            if (accelTrigger) {
                try {
                    const ms = new MobileSelect({
                        trigger: accelTrigger,
                        title: 'Tempo Acceleration',
                        wheels: [{ data: ACCEL_VALUES }],
                        initValue: accel.toFixed(1),
                        ensureBtnText: 'Done',
                        cancelBtnText: 'Cancel',
                        triggerDisplayValue: true,
                        bgColor: '#1a202c',
                        textColor: '#e5e7eb',
                        titleBgColor: '#1f2937',
                        titleColor: '#f9fafb',
                        ensureBtnColor: '#22d3ee',
                        cancelBtnColor: '#9ca3af',
                        onChange: (data) => {
                            console.log('[sectionModal] accel onChange data:', data);
                            const value = parseFloat(data[0]);
                            section.tempoAcceleration = value;
                            eventBus.emit('render');
                        }
                    });
                    mobileSelectInstances[`accel-${section.id}`] = ms;
                } catch (e) {
                    console.error('[sectionModal] Error init accel:', e);
                }
            }
        }
    });
};

export const renderSectionModal = (activeSection) => {
    const sections = state.toque.sections;
    const sectionRows = sections.map((s, idx) => renderSectionRow(s, idx, s.id === state.activeSectionId, true)).join('');

    setTimeout(() => initMobileSelect(sections), 50);

    return `
    <div class="fixed bottom-[52px] left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5 w-80 max-w-[90vw] max-h-[60vh] overflow-y-auto z-[65] animate-in fade-in flex flex-col gap-3">
        <div class="flex justify-between items-center pb-2 border-b border-gray-800">
            <div>
                <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Sections</span>
                <span class="text-[10px] text-gray-600 ml-2">Tap to jump • edit reps • set accel</span>
            </div>
            <button data-action="practitioner-close-popover"
                class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                title="Close">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 pointer-events-none">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        ${sectionRows}
    </div>`;
};

export const renderPortraitSectionModal = (activeSection) => {
    const sections = state.toque.sections;
    const sectionRows = sections.map((s, idx) => renderSectionRow(s, idx, s.id === state.activeSectionId, true)).join('');

    setTimeout(() => initMobileSelect(sections), 50);

    return `
    <div class="fixed inset-x-0 bottom-20 z-[70] mx-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 max-h-[55vh] overflow-y-auto animate-in fade-in">
        <div class="flex justify-between items-center pb-1 border-b border-gray-800 mb-1">
            <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Sections</span>
            <button data-action="practitioner-close-popover" class="text-gray-500 hover:text-white text-xs">Done</button>
        </div>
        ${sectionRows}
    </div>
    <div data-action="practitioner-close-popover"
         class="fixed inset-0 z-[65] bg-black/50" style="bottom: 80px;"></div>`;
};
