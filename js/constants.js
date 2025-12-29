import { InstrumentName, StrokeType } from './types.js';

export const STEPS_DEFAULT = 16;
export const BPM_DEFAULT = 120;

export const INSTRUMENT_COLORS = {
    [InstrumentName.Iya]: 'border-l-4 border-l-rose-600',
    [InstrumentName.Itotele]: 'border-l-4 border-l-amber-600',
    [InstrumentName.Okonkolo]: 'border-l-4 border-l-emerald-600',

    [InstrumentName.Quinto]: 'border-l-4 border-l-cyan-500',
    [InstrumentName.Conga]: 'border-l-4 border-l-blue-600',
    [InstrumentName.Tumbadora]: 'border-l-4 border-l-indigo-600',

    [InstrumentName.Clave]: 'border-l-4 border-l-yellow-400',
    [InstrumentName.Cata]: 'border-l-4 border-l-orange-500',
    [InstrumentName.Cowbell]: 'border-l-4 border-l-slate-400',
    [InstrumentName.Agogo]: 'border-l-4 border-l-purple-500',

    [InstrumentName.Shaker]: 'border-l-4 border-l-stone-400',
    [InstrumentName.Maraca]: 'border-l-4 border-l-stone-500',

    [InstrumentName.Timbales]: 'border-l-4 border-l-zinc-300',
    [InstrumentName.Bongo]: 'border-l-4 border-l-lime-500',
};

export const STROKE_COLORS = {
    [StrokeType.None]: 'text-gray-700 bg-transparent',
    [StrokeType.Open]: 'bg-blue-500 text-white font-bold',
    [StrokeType.Slap]: 'bg-yellow-400 text-black font-bold',
    [StrokeType.Bass]: 'bg-red-600 text-white font-bold',
    [StrokeType.Muff]: 'bg-gray-500 text-white',
    [StrokeType.Touch]: 'bg-gray-800 text-gray-400',
};

// Define valid strokes per instrument category
export const VALID_INSTRUMENT_STROKES = {
    // Congas have the full range
    [InstrumentName.Conga]: [StrokeType.Open, StrokeType.Slap, StrokeType.Bass, StrokeType.Muff, StrokeType.Touch],
    [InstrumentName.Quinto]: [StrokeType.Open, StrokeType.Slap, StrokeType.Bass, StrokeType.Muff, StrokeType.Touch],
    [InstrumentName.Tumbadora]: [StrokeType.Open, StrokeType.Slap, StrokeType.Bass, StrokeType.Muff, StrokeType.Touch],

    // Bata generally don't use the 'Bass' symbol in standard TUBS (Enu head is Open, Chacha is Touch/Slap usually)
    // We allow Open, Slap, Muff, Touch.
    [InstrumentName.Iya]: [StrokeType.Open, StrokeType.Slap, StrokeType.Muff, StrokeType.Touch],
    [InstrumentName.Itotele]: [StrokeType.Open, StrokeType.Slap, StrokeType.Muff, StrokeType.Touch],
    [InstrumentName.Okonkolo]: [StrokeType.Open, StrokeType.Slap, StrokeType.Muff, StrokeType.Touch],

    // Small percussion is simple
    [InstrumentName.Clave]: [StrokeType.Open, StrokeType.Touch],
    [InstrumentName.Cata]: [StrokeType.Open, StrokeType.Touch],
    [InstrumentName.Cowbell]: [StrokeType.Open, StrokeType.Touch],
    [InstrumentName.Agogo]: [StrokeType.Open, StrokeType.Touch],

    // Shakers mainly just 'hit'
    [InstrumentName.Shaker]: [StrokeType.Open],
    [InstrumentName.Maraca]: [StrokeType.Open],

    // Others
    [InstrumentName.Bongo]: [StrokeType.Open, StrokeType.Slap, StrokeType.Muff, StrokeType.Touch],
    [InstrumentName.Timbales]: [StrokeType.Open, StrokeType.Slap, StrokeType.Muff, StrokeType.Touch],
};

const INITIAL_TRACKS_4_4 = [
    {
        id: 'okonkolo',
        instrument: InstrumentName.Okonkolo,
        volume: 1.0,
        muted: false,
        strokes: Array(16).fill(StrokeType.None).map((_, i) =>
            i % 4 === 0 ? StrokeType.Open : (i % 2 === 0 ? StrokeType.Touch : StrokeType.None)
        )
    },
    {
        id: 'itotele',
        instrument: InstrumentName.Itotele,
        volume: 1.0,
        muted: false,
        strokes: Array(16).fill(StrokeType.None).map((_, i) =>
            i % 3 === 0 ? StrokeType.Open : StrokeType.None
        )
    },
    {
        id: 'iya',
        instrument: InstrumentName.Iya,
        volume: 1.0,
        muted: false,
        strokes: Array(16).fill(StrokeType.None).map((_, i) =>
            i === 0 ? StrokeType.Open : (i === 12 ? StrokeType.Slap : StrokeType.None)
        )
    }
];

const INITIAL_TRACKS_6_8 = [
    {
        id: 'okonkolo',
        instrument: InstrumentName.Okonkolo,
        volume: 1.0,
        muted: false,
        strokes: Array(12).fill(StrokeType.None).map((_, i) =>
            i % 3 === 0 ? StrokeType.Open : StrokeType.None
        )
    },
    {
        id: 'itotele',
        instrument: InstrumentName.Itotele,
        volume: 1.0,
        muted: false,
        strokes: Array(12).fill(StrokeType.None)
    },
    {
        id: 'iya',
        instrument: InstrumentName.Iya,
        volume: 1.0,
        muted: false,
        strokes: Array(12).fill(StrokeType.None).map((_, i) =>
            i === 0 ? StrokeType.Open : StrokeType.None
        )
    }
];

export const INITIAL_TOQUE = {
    id: 'default-toque',
    name: "Oru Seco Demo",
    globalBpm: 108,
    sections: [
        {
            id: 'sec-1',
            name: "Basic (4/4)",
            timeSignature: '4/4',
            steps: 16,
            subdivision: 4,
            repetitions: 2,
            tempoAcceleration: 0,
            tracks: INITIAL_TRACKS_4_4
        },
        {
            id: 'sec-2',
            name: "Vuelta 1 (6/8)",
            timeSignature: '6/8',
            // No bpm defined here, it will inherit global
            steps: 12,
            subdivision: 3,
            repetitions: 2,
            tempoAcceleration: 1.5, // Example acceleration
            tracks: INITIAL_TRACKS_6_8
        }
    ]
};

export const STROKE_PALETTE = [
    { type: StrokeType.None, label: 'Rest (.)' },
    { type: StrokeType.Open, label: 'Open (O)' },
    { type: StrokeType.Slap, label: 'Slap (S)' },
    { type: StrokeType.Bass, label: 'Bass (B)' },
    { type: StrokeType.Muff, label: 'Muff (X)' },
    { type: StrokeType.Touch, label: 'Touch (T)' },
];