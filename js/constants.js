/* 
  js/constants.js
  Static constants for UI styling and default values.
  Dynamic data (valid strokes, initial rhythms) has been moved to YAML files.
*/

import { StrokeType } from './types.js';

export const STEPS_DEFAULT = 16;
export const BPM_DEFAULT = 120;

// UI Colors mapped by Instrument Symbol (from YAML)
// If a symbol loaded from YAML matches one of these keys, it gets the specific color.
export const INSTRUMENT_COLORS = {
    // Bata
    'IYA': 'border-l-4 border-l-blue-600',
    'ITO': 'border-l-4 border-l-yellow-600',
    'OKO': 'border-l-4 border-l-red-600',

    // Rumba / Generic
    'QTO': 'border-l-4 border-l-cyan-500', // Quinto
    'CON': 'border-l-4 border-l-emerald-600', // Conga
    'TUM': 'border-l-4 border-l-indigo-600', // Tumbadora

    // Small Percussion
    'CLV': 'border-l-4 border-l-white-400', // Clave
    'CAM': 'border-l-4 border-l-slate-400',   // Campana
    'CAT': 'border-l-4 border-l-orange-500', // Cata (Guagua)

    // Shakers
    'CHE': 'border-l-4 border-l-stone-400',   // Chekere
    'MAR': 'border-l-4 border-l-stone-500',   // Maraca

    // Others
    'TIM': 'border-l-4 border-l-zinc-300',    // Timbales
    'BON': 'border-l-4 border-l-lime-500',    // Bongo
};

export const STROKE_COLORS = {
    [StrokeType.None]: 'text-gray-700 bg-transparent',
    [StrokeType.Open]: 'bg-blue-500 text-white font-bold',
    [StrokeType.Presionado]: 'bg-cyan-600 text-white',
    [StrokeType.Slap]: 'bg-yellow-400 text-black font-bold',
    [StrokeType.Mordito]: 'bg-purple-600 text-white',
    [StrokeType.HalfMordito]: 'bg-pink-500 text-white',
    [StrokeType.Bass]: 'bg-red-600 text-white font-bold',
    [StrokeType.Dedo]: 'bg-gray-800 text-gray-400',
    [StrokeType.Muff]: 'bg-gray-500 text-white',
};

export const STROKE_PALETTE = [

    { type: StrokeType.None, label: 'Rest', svg: 'rest.svg' },
    { type: StrokeType.Open, label: 'Open', svg: 'open.svg' },
    { type: StrokeType.Presionado, label: 'Presionado', svg: 'presionado.svg' },
    { type: StrokeType.Slap, label: 'Slap', svg: 'slap.svg' },
    { type: StrokeType.Mordito, label: 'Mordito', svg: 'mordito.svg' },
    { type: StrokeType.HalfMordito, label: 'Half Mordito', svg: 'half_mordito.svg' },
    { type: StrokeType.Bass, label: 'Bass', svg: 'bass.svg' },
    { type: StrokeType.Dedo, label: 'Dedo', svg: 'dedo.svg' },
    { type: StrokeType.Muff, label: 'Muff', svg: 'muff.svg' },

];