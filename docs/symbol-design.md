# Symbol Design — Shape-Sound Correspondence in Percussion Studio

The stroke symbols in Percussion Studio are not arbitrary icons. Every shape, fill, and color choice is grounded in **phono-symbolism** — the cross-modal mapping between visual form and sound quality. This document explains the system.

---

## 1. The Bouba/Kiki Effect

In 1929, psychologist Wolfgang Köhler showed people two abstract shapes — one rounded, one jagged — and asked which was "maluma" and which was "takete." Nearly everyone assigned the round word to the round shape and the sharp word to the angular one. Ramachandran and Hubbard (2001) replicated this with "bouba" and "kiki," finding **95% consistency** across languages, cultures, and ages.

The core mapping:

| Visual Quality | Sound Quality |
|---|---|
| Rounded, smooth, curvy | Soft, resonant, sustained, low-frequency |
| Angular, spiky, jagged | Sharp, dry, abrupt, high-frequency |

This is not a metaphor — it is a measurable cognitive bias. The brain automatically links shape to timbre. Percussion Studio's symbol system exploits this: **you can read a stroke's sound quality from its shape before you hear it.**

---

## 2. The Shape Grammar

The symbol system follows three rules:

1. **Shape encodes sound quality** — round = resonant, angular = dry.
2. **Composites are built by superposition** — complex strokes are visually derived from their simpler components.
3. **Fill and size are modifiers** — they adjust density, weight, and volume within a shape family.

### 2.1 The Circle Family (Bouba) — Membrane Sounds

Drums with skin heads (Batá, congas, bongos) produce resonant, sustained tones. Their symbols use **circles** — the universal shape of resonance.

| Symbol | SVG | Shape | Sound | Reading |
|---|---|---|---|---|
| **Open** | `open.svg` | Hollow circle `○` | Open tone — resonant, sustained, full ring | Pure bouba: the drumhead vibrates freely |
| **Bass** | `bass.svg` | Circle + solid core `◎` | Bass tone — deep, heavy, full palm | Round but denser: the filled center reads as weight and low frequency |
| **Muff** | `muff.svg` | Circle + horizontal bar | Muffled tone — resonance blocked | The bar across the circle = "stopped," muted, dampened |
| **Presionado** | `presionado.svg` | Circle + hatching | Pressed tone — controlled, drier resonance | The circle is still there (resonance exists), but hatching = modified, constrained |
| **Dedo** | `dedo.svg` | Small filled dot `●` | Fingertip — quiet, short, high | Small = quiet and brief; filled = no sustain; minimal form for minimal sound |

The **muff** symbol deserves attention: the horizontal bar through the circle reads as "blocked resonance." This is the same compositional logic as the musical notation for a muted note (circle with a slash). The circle tells you the membrane is involved; the bar tells you it is being stopped.

### 2.2 The Angular Family (Kiki) — Wood-on-Wood Sounds

Wooden instruments (clave, catà/guagua, palitos) produce dry, sharp, short sounds with no membrane resonance. Their symbols use **angular, filled, compact shapes** — the visual equivalent of a sharp attack.

| Symbol | SVG | Shape | Sound | Reading |
|---|---|---|---|---|
| **Clave** | `clave.svg` | Vertical bar + leaning slash `\|` + `\` | Clave stick — dry, sharp, no sustain | Two sticks: one stable (vertical = the resting clave), one in motion (slash = the striking stick). Maximally angular, no curves. |
| *(Future)* **Catà left** | `cata_left.svg` | Up triangle `▲` | Left stroke — sharp, wood, directional | Angular = dry; orientation encodes left hand |
| *(Future)* **Catà right** | `cata_right.svg` | Down triangle `▼` | Right stroke — sharp, wood, directional | Angular = dry; orientation encodes right hand |
| *(Future)* **Catà flam** | `cata_flam.svg` | Diamond `◆` | Flam — both strokes combined | Geometric superposition: `▲ + ▼ = ◆`, same logic as mordito = `○ + ✕` |

The clave symbol uses **asymmetric crossing lines** — the vertical bar is slightly longer than the slash, and the slash crosses above center. This asymmetry is what separates it from a symmetric X (which is the slap symbol). The wood-family color (`#D9A066`) reinforces the material.

### 2.3 Composite Symbols — Superposition Principle

Some strokes are physically combinations of simpler techniques. Their symbols reflect this: **a composite symbol is the visual sum of its component symbols.**

| Composite | Components | Visual | Sound |
|---|---|---|---|
| **Mordito** | Open + Slap | `○ + ✕` = circle with X inside | A "bite" — quick muted strike combining resonance with a sharp attack |
| **Half Mordito** | Open + Slap (lighter) | `○ + hatching + ✕` | Softer mordito — hatching adds visual "noise" suggesting reduced intensity |
| **Presionado** | Open (modified) | `○ + hatching` | Pressed open tone — the resonance is present but constrained |

The rule: **if you understand the components, you can read the composite without being told.** The mordito looks like what it is — an open tone with a slap in it. This makes the system self-teaching.

### 2.4 Size and Fill as Modifiers

Within the grammar, two additional dimensions modify meaning:

| Modifier | Meaning | Example |
|---|---|---|
| **Hollow** (outline only) | Resonance, sustain, openness | Open tone `○` — the drumhead rings freely |
| **Filled** (solid fill) | Density, weight, dryness | Bass `◎` (filled core = heavy); Dedo `●` (filled dot = dry, no sustain) |
| **Large** | Loud, prominent, low | Bass circle fills most of the 24px cell |
| **Small** | Quiet, short, high | Dedo dot is intentionally tiny — it reads as "little sound" |

These modifiers work across families. A filled circle (bass) is denser than a hollow one (open). A small filled dot (dedo) is the minimal possible symbol — just as the fingertip stroke is the minimal possible sound.

---

## 3. The Color Language

Each stroke type has a unique **hue** — color is functional, not decorative. At the grid's 24px cell size, color provides a secondary identification channel when shape alone is ambiguous.

| Stroke | Color | Hex | Rationale |
|---|---|---|---|
| Open | Blue | `#60A5FA` | Cool, open, resonant — matches the "open" quality |
| Bass | Red | `#DC2626` | Heavy, deep, warm — reads as "powerful" |
| Slap | Yellow | `#FACC15` | Bright, sharp, attention-grabbing — matches the crack of a slap |
| Mordito | Fuchsia | `#D946EF` | Hybrid color for a hybrid stroke — distinct from both blue (open) and yellow (slap) |
| Half Mordito | Cyan | `#06B6D4` | Cooler than fuchsia — reads as "less intense" mordito |
| Presionado | Green | `#22C55E` | Controlled, constrained — the "pressed" quality |
| Muff | Orange | `#F97316` | Warm but muted — the blocked resonance |
| Clave | Wood/Amber | `#D9A066` | Material color — literally the color of wooden clave sticks |
| Dedo | Light Gray | `#E5E5E5` | Minimal, quiet — the least saturated color for the lightest sound |
| Rest | Context | `currentColor` | Inherits from CSS — not a playable stroke |
| Not Allowed | Red | `#EF4444` | Prohibition sign — universal "no" |

The color choices also optimize for **color-blind accessibility at a glance**: the primary strokes (open/blue, slap/yellow, bass/red) occupy distinct positions in the color space, and their shapes are different enough to be identifiable without color.

---

## 4. Material → Shape Family Mapping

The mapping from instrument material to symbol family is consistent:

| Material | Sound Character | Shape Family | Instruments |
|---|---|---|---|
| **Skin (membrane)** | Resonant, sustained, warm | Circles (bouba) | Batá (iya, itotele, okonkolo), congas, bongos |
| **Wood** | Dry, sharp, short | Small filled angulars (kiki) | Clave, catà/guagua, palitos |
| **Metal** | Sharp attack + sustained ring | Hybrid: sharp outline + hollow interior | Campana, agogô *(reserved: trapezoid `▱`)* |

The metal family is a hybrid — a cowbell has a sharp attack (kiki) but rings (bouba). The proposed trapezoid `▱` captures this: angular outline (sharp attack) with hollow interior (sustain). If open vs. hand-muffled bell distinction is needed later, use hollow vs. filled trapezoid — extending the same fill-as-modifier rule.

---

## 5. Design Principles for New Symbols

When adding a new instrument with new stroke types, follow these rules:

### Rule 1: Extend the grammar, don't invent a new one

Every new symbol must use shapes, fills, and compositions that are consistent with the existing system. Ask: "Does this shape tell me something about the sound?"

### Rule 2: Match the shape family to the material

| If the instrument is... | Use shapes from... |
|---|---|
| A membrane drum | The circle family |
| Wood-on-wood | The angular family |
| Metal | The hybrid family (angular + hollow) |

### Rule 3: Build composites by superposition

If a new stroke is a combination of existing techniques, combine the existing symbols visually. The new symbol should be readable as "component A + component B."

### Rule 4: Respect the modifier system

- **Hollow** = resonant/sustained
- **Filled** = dense/dry
- **Small** = quiet/short
- **Large** = loud/prominent

Don't use fill or size to mean something new.

### Rule 5: Legibility at 24×24px

All symbols must be identifiable at the grid's native 24×24 pixel cell size. Test at actual size before committing. Avoid fine details that disappear at small scale.

### Rule 6: One symbol per sound type

A symbol represents a **sound category** (e.g., "open tone"), not a specific sample. Different sound packs (studio, live, etc.) provide different audio for the same symbol. Don't create multiple symbols for the same stroke type across packs.

---

## 6. Symbol Reference

| Stroke | Letter | SVG File | Shape | Color | Family | Instruments |
|---|---|---|---|---|---|---|
| Rest | ` ` | `rest.svg` | Rounded rectangle | `currentColor` | UI | All |
| Open | `O` | `open.svg` | Hollow circle `○` | Blue `#60A5FA` | Circle (bouba) | Iya, Itotele, Okonkolo |
| Presionado | `P` | `presionado.svg` | Circle + hatching | Green `#22C55E` | Circle (bouba) | Itotele |
| Slap | `S` | `slap.svg` | X cross `✕` | Yellow `#FACC15` | Angular (kiki) | Iya, Itotele, Okonkolo |
| Mordito | `R` | `mordito.svg` | Circle + X `○✕` | Fuchsia `#D946EF` | Composite | Iya, Itotele, Okonkolo |
| Half Mordito | `H` | `half_mordito.svg` | Circle + hatching + X | Cyan `#06B6D4` | Composite | Iya, Itotele |
| Bass | `B` | `bass.svg` | Circle + solid core `◎` | Red `#DC2626` | Circle (bouba) | *(Reserved: congas)* |
| Dedo | `D` | `dedo.svg` | Small filled dot `●` | Gray `#E5E5E5` | Circle (bouba) | *(Reserved: congas, bongos)* |
| Muff | `M` | `muff.svg` | Circle + bar | Orange `#F97316` | Circle (bouba) | Iya |
| Clave | `C` | `clave.svg` | Vertical + slash `\|+\` | Wood `#D9A066` | Angular (kiki) | Clave |
| Not Allowed | — | `not_allowed.svg` | Circle + slash `∅` | Red `#EF4444` | UI | *(cursor only)* |

### Reserved Shapes (Future Instruments)

| Shape | Intended Use | Rationale |
|---|---|---|
| Up triangle `▲` | Catà left stroke | Angular = wood/kiki; orientation = hand |
| Down triangle `▼` | Catà right stroke | Angular = wood/kiki; orientation = hand |
| Diamond `◆` | Catà flam | Superposition: `▲ + ▼ = ◆` |
| Trapezoid `▱` | Campana (cowbell) | Silhouette of a cowbell; hollow = metal sustain |

---

## References

- Köhler, W. (1929). *Gestalt Psychology.* Liveright.
- Ramachandran, V.S. & Hubbard, E.M. (2001). Synaesthesia — A window into perception, thought and language. *Journal of Consciousness Studies,* 8(12), 3–34.
- [Bouba/kiki effect — Wikipedia](https://en.wikipedia.org/wiki/Bouba/kiki_effect)
- Fort, M. & Schwartz, J.-L. (2022). Direct sound-symbol mappings in the vocal imitation of non-speech environmental sounds. *Journal of the Acoustical Society of America.*
