import { state } from '../../../store.js';

export const renderBpmModal = () => `
    <div class="fixed bottom-[52px] left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-5 w-72 flex flex-col gap-4 z-[65] animate-in fade-in">
        <div class="flex justify-between items-center">
            <div class="flex flex-col">
                <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Tempo</span>
                <span class="text-xl font-mono text-indigo-400 font-bold">${state.toque.globalBpm} BPM</span>
            </div>
            <button data-action="practitioner-close-popover"
                class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                title="Close">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 pointer-events-none">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div class="relative w-full h-10 flex items-center group/bpm cursor-pointer py-2 px-1">
            <div class="absolute left-1 right-1 h-3 bg-gray-800 rounded-full border border-gray-700"></div>
            <div class="absolute left-1 h-3 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full" style="width: calc(${((state.toque.globalBpm - 40) / 200) * 100}% - 2px)"></div>
            <div class="absolute w-7 h-7 bg-white rounded-full shadow-lg border-2 border-indigo-400 z-[15] touch-none" style="left: calc(${((state.toque.globalBpm - 40) / 200) * 100}% - 14px + 4px)"></div>
            <input type="range" min="40" max="240" value="${state.toque.globalBpm}"
                data-action="update-global-bpm"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
        </div>
        <div class="flex gap-2">
            <button data-action="practitioner-bpm-step" data-delta="-5"
                class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl py-2 text-sm font-bold text-gray-300">−5</button>
            <button data-action="practitioner-bpm-step" data-delta="-1"
                class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl py-2 text-sm font-bold text-gray-300">−1</button>
            <button data-action="practitioner-bpm-step" data-delta="1"
                class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl py-2 text-sm font-bold text-gray-300">+1</button>
            <button data-action="practitioner-bpm-step" data-delta="5"
                class="flex-1 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-xl py-2 text-sm font-bold text-gray-300">+5</button>
        </div>
    </div>`;
