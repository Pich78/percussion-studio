// Mimicking TypeScript Enums using frozen Objects

export const InstrumentName = Object.freeze({
    // Batá
    Iya: 'Iya',
    Itotele: 'Itotele',
    Okonkolo: 'Okonkolo',

    // Rumba / Generic
    Quinto: 'Quinto',
    Conga: 'Conga',
    Tumbadora: 'Tumbadora',

    // Small Percussion
    Clave: 'Clave',
    Cata: 'Cata', // Guagua
    Cowbell: 'Cowbell',
    Agogo: 'Agogo',
    Shaker: 'Shaker',
    Maraca: 'Maraca',

    // Others
    Timbales: 'Timbales',
    Bongo: 'Bongo'
});

export const StrokeType = Object.freeze({
    None: '.',
    Open: 'O',
    Slap: 'S',
    Bass: 'B',
    Muff: 'X',
    Touch: 'T',
    Mordito: 'M',
    HalfMordito: 'H',
    Presionado: 'P'
});

// TimeSignature type is just a string '4/4' | '6/8' | '12/8' in JS