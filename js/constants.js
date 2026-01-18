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

// Batà Explorer - Orisha list for filtering
export const ORISHAS_LIST = [
    'Elegua', 'Ogun', 'Ochosi', 'Obatala', 'Shango',
    'Yemaya', 'Oshun', 'Oya', 'Babalu Aye', 'Inle',
    'Osain', 'Aggayu', 'Orisha Oko', 'Ibeyi', 'Dada', 'Oggue'
];

// Batà Explorer - Toque classification types
export const TOQUE_CLASSIFICATIONS = ['Specific', 'Shared', 'Generic'];

// Batà Explorer - Color mapping for Orisha badges
export const ORISHA_COLORS = {
    'Elegua': { border: 'border-red-600', text: 'text-red-500', bg: 'bg-red-950/30' },
    'Ogun': { border: 'border-green-700', text: 'text-green-500', bg: 'bg-green-950/30' },
    'Ochosi': { border: 'border-blue-700', text: 'text-blue-400', bg: 'bg-blue-950/30' },
    'Obatala': { border: 'border-stone-200', text: 'text-stone-200', bg: 'bg-stone-700/30' },
    'Shango': { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-900/30' },
    'Yemaya': { border: 'border-blue-400', text: 'text-blue-300', bg: 'bg-blue-900/30' },
    'Oshun': { border: 'border-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-900/30' },
    'Oya': { border: 'border-purple-600', text: 'text-purple-400', bg: 'bg-purple-900/30' },
    'Babalu Aye': { border: 'border-purple-800', text: 'text-purple-600', bg: 'bg-purple-950/30' },
    'Inle': { border: 'border-teal-500', text: 'text-teal-400', bg: 'bg-teal-950/30' },
    'Osain': { border: 'border-lime-700', text: 'text-lime-500', bg: 'bg-lime-950/30' },
    'Aggayu': { border: 'border-orange-700', text: 'text-orange-600', bg: 'bg-orange-950/30' },
    'Orisha Oko': { border: 'border-pink-300', text: 'text-pink-300', bg: 'bg-pink-900/30' },
    'Ibeyi': { border: 'border-indigo-400', text: 'text-indigo-400', bg: 'bg-indigo-900/30' },
    'Dada': { border: 'border-red-400', text: 'text-red-300', bg: 'bg-red-900/30' },
    'Oggue': { border: 'border-amber-800', text: 'text-amber-700', bg: 'bg-amber-950/30' }
};

// Batà Explorer - Classification zone colors
export const CLASSIFICATION_COLORS = {
    'Specific': { border: 'border-red-900/30', text: 'text-red-400', dot: 'bg-red-500', glow: 'rgba(239,68,68,0.6)' },
    'Shared': { border: 'border-blue-900/30', text: 'text-blue-400', dot: 'bg-blue-500', glow: 'rgba(59,130,246,0.6)' },
    'Generic': { border: 'border-amber-900/30', text: 'text-amber-400', dot: 'bg-amber-500', glow: 'rgba(245,158,11,0.6)' }
};