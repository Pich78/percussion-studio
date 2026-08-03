# Percussion Studio - Mobile User Guide

Percussion Studio Mobile is optimized for **playback and practice**. It shares the same engine as the desktop version, with a touch-first interface designed around **Dual Mode**: a read-only grid in landscape and a music-player control surface in portrait.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dual Mode Overview](#dual-mode-overview)
3. [Landscape: Top Bar & Navigation](#landscape-top-bar--navigation)
4. [Landscape: The Grid](#landscape-the-grid)
5. [Landscape: The Chips Bar](#landscape-the-chips-bar)
6. [Portrait: Control Surface](#portrait-control-surface)
7. [Navigation Menu](#navigation-menu)
8. [Classic Grid View](#classic-grid-view)
9. [Understanding the Grid](#understanding-the-grid)
10. [Playback Controls](#playback-controls)
11. [Track Controls](#track-controls)
12. [Sections](#sections)
13. [Shareable Links](#shareable-links)
14. [Differences from Desktop](#differences-from-desktop)
15. [Tips for Mobile Use](#tips-for-mobile-use)

---

## Getting Started

1. Open `mobile.html` on your phone (or `index.html` — it detects your device and redirects you).
2. **Landscape** shows the rhythm grid; **Portrait** shows the player control surface.
3. **Full screen** (optional but recommended): use the PWA "Add to Home Screen" on iPhone, or browser full-screen.
4. The default rhythm loads automatically (see [Default Rhythm Configuration](../requirements/default-rhythm.md) for the `?rhythm=` override).

---

## Dual Mode Overview

Dual Mode adapts to how you hold the phone:

| Orientation | What you see |
|-------------|--------------|
| **Landscape** | The full rhythm grid (read-only) with a chips toolbar (BPM / Mixer / Sections) |
| **Portrait** | A control surface: tempo controls, mixer with solo, section picker, play/stop |

You can switch views anytime via **☰ → View Mode** (see [Classic Grid View](#classic-grid-view)).

---

## Landscape: Top Bar & Navigation

The top bar shows:

| Element | Description |
|---------|-------------|
| **☰** | Opens the navigation menu |
| **Rhythm name** | Current rhythm title (indigo) |
| **‹ Section (n/N) ›** | Previous/next section buttons with the section name and position |
| **Rep badge** | Current repetition (e.g. `2/4`), 🎲 for random repetitions, ∞ for Play Forever |
| **Accel badge** | Tempo acceleration per repetition (↑ green for positive, ↓ red for negative) |
| **♩ BPM** | Live tempo — indigo when stopped, green while playing (reflects acceleration) |

### Swipe Navigation

- **Swipe left** → next section.
- **Swipe right** → previous section.
- A swipe counts when it's more horizontal than vertical and longer than ~50px.

---

## Landscape: The Grid

The grid is **read-only** — editing is a desktop feature. Each measure has step numbers above it; cells show strokes and their dynamics (see [Understanding the Grid](#understanding-the-grid)).

### Track Interactions

| Gesture | Action |
|---------|--------|
| **Tap the instrument name** | Mute/unmute the track (muted tracks appear dimmed with a strikethrough name) |
| **Tap the track body** | Cycle the subdivision coloring (the ÷N label shows the current grouping) |

During playback the **current step is highlighted** and the grid **auto-scrolls** to keep the playhead visible.

---

## Landscape: The Chips Bar

The bottom bar contains three chips plus the playback controls:

| Chip | Opens |
|------|-------|
| **♩=BPM** | Tempo popover |
| **🎚 Mixer** | Per-instrument volume and mute popover |
| **Section name (n/N)** | Sections popover (disabled while playing) |

Next to the chips: the **Cnt** count-in button, **Stop (■)**, and **Play/Pause (▶/❚❚)**.

### Tempo Popover

- Big **value display** (e.g. `120 BPM`).
- **Slider** (40-240 BPM).
- **−5 / −1 / +1 / +5** buttons for fine and coarse steps.
- Tap **Done** to close.

### Mixer Popover

For each instrument in the section:

- **Mute/Unmute** button (speaker icon) — unmuting restores the previous volume.
- **Volume slider** (0-100%). Setting volume to 0 is the same as muting.

### Sections Popover

- Shows all sections: tap a row to **jump** to it.
- **🎲 button**: toggles random repetitions (each cycle plays a random number of times between 1 and the set value).
- **Repetitions picker**: tap the number to open the wheel picker with values `1`-`64`, `∞` (Play Forever), `play once`, and `disabled` (skip).
  - ∞ shows purple, disabled and already-played sections show grayed out.
- **Acceleration picker** (only for loop sections with more than 1 repetition): wheel picker from `-10.0%` to `+10.0%` in 0.1 steps.

> **Note**: these section settings are session-only and reset when loading a new rhythm (see [Sections](#sections)).

---

## Portrait: Control Surface

In portrait, the phone becomes a practice player:

### Header & Info

- **☰** menu and rhythm name.
- **Section name + Rep badge** (current/total, 🎲 or ∞, with accel %).
- **Live BPM** — green while playing.

### Tempo Row

- **−1 / +1** buttons and a big **slider** with the current value displayed inside.
- **Count** button toggles the count-in.

### Mixer

One row per track:

| Control | Description |
|---------|-------------|
| **Volume slider** | Adjust the track volume; the instrument name is shown inside (with ◉ when soloed) |
| **S** | Solo button — amber when active; only the soloed track plays |
| **Mute** | Speaker button — toggles mute; unmuting restores the previous volume |

Mute and solo are mutually exclusive, and only one track can be soloed at a time.

### Section Bar

- Shows the current section (**n/N**).
- Tap it to open the full sections sheet (same controls as the landscape popover).
- Disabled while playing.

### Play Bar

- **Stop** and **Play/Pause** buttons at the bottom, sized for one-handed use.

---

## Navigation Menu

Tap **☰** to open the menu:

| Option | Description |
|--------|-------------|
| **Load Rhythm** | Browse and load rhythms (folder tree + Batà Explorer) |
| **Show Structure** | Read-only view of all sections — tap a section to jump to it |
| **View Mode** | Switch between **Standard** (Classic Grid) and **Dual Mode ↔** |
| **Share Rhythm** | Share the current rhythm (device share sheet or clipboard, library rhythms only) |
| **User Guide** | Open this documentation (English or Italiano) |

---

## Classic Grid View

The original mobile layout is still available via **☰ → View Mode → Standard**:

- **Landscape only**: in portrait it shows a "Please Rotate Your Device" prompt.
- Header: menu, rhythm name, **section dropdown**, Rep badge, live BPM, **Global BPM slider**, **Cnt**, Stop/Play.
- The same read-only grid and menu as Dual Mode.

Dual Mode is the default and recommended view.

---

## Understanding the Grid

- Each **row** is an instrument track.
- Each **column** is a time step.
- **Filled cells** show active strokes with icons/letters.
- **Empty cells** are rests (silence).
- **Separators** divide steps into groups based on the subdivision (groups of 4 for 4/4, groups of 3 for 6/8).
- **Dynamics** are visual: ghost/soft strokes are smaller and faded; loud/accent strokes are larger with a glow.
- **Step numbers** above the grid mark positions (1, 2, 3...).
- During playback the **current step** is highlighted and the grid **auto-scrolls** to follow it.

---

## Playback Controls

### Buttons

| Button | Description |
|--------|-------------|
| **Stop (■)** | Stops playback and resets to the beginning |
| **Play (▶)** | Starts playback (from the beginning with count-in when stopped) |
| **Pause (❚❚)** | Pauses at the current position |

### BPM

- Landscape: **Tempo popover** (chips bar) with slider and −5/−1/+1/+5.
- Portrait: **slider** with −1/+1 buttons.
- The live BPM display reflects any tempo acceleration.

### Repetition Counter

- **Rep X/Y** shows the current repetition out of the total and updates in real time (🎲 for random repetitions).

### Count-In

The **Cnt** (landscape) / **Count** (portrait) button enables a count-in before playback:

- Beats: automatically 4 (4/4 time) or 6 (6/8 or 12/8 time).
- Visual: the button shows the current beat and pulses.
- Audio: click sounds before the rhythm starts (higher pitch on beat 1).

> **Note**: count-in plays only when starting from the beginning.

### Play Modes

Sections can play in different modes (set in the Sections popover / sheet):

- **Loop (1-64 reps)**: plays the set number of times, then the next section.
- **∞ Play Forever**: repeats until you press Stop.
- **Play Once**: plays once per session (grayed out afterwards).
- **Disabled**: never plays.

---

## Track Controls

| Control | Where |
|---------|-------|
| **Mute** | Tap the instrument name on the grid (landscape), or the speaker button in any mixer |
| **Volume** | Mixer popover (landscape) or mixer rows (portrait) |
| **Solo** | Portrait mixer only (S button, one at a time) |

> **Note**: Volume, mute, and solo settings are not saved — they reset when loading a new rhythm.

---

## Sections

### Navigating

- **Landscape**: ‹ › arrows, swipe on the top bar, or the Sections chip.
- **Portrait**: the section bar at the bottom of the player.
- **Menu**: Show Structure lists all sections; tap one to jump.

### Editing

In the Sections popover/sheet you can change, per section: repetitions (or ∞/play once/disabled), random repetitions (🎲), and tempo acceleration. These settings are **session-only** — they are not written to the downloaded YAML.

---

## Shareable Links

You can share and receive direct links to specific rhythms.

### Sharing a Rhythm

1. Tap **☰ → Share Rhythm**.
2. Your device's share sheet opens (or the link is copied to the clipboard).

### Opening a Shared Link

- A link with `?rhythm=...` loads that rhythm automatically (overriding the default).
- Example: `mobile.html?rhythm=Batà/Dadà/dada_base`

> **Note**: Share Rhythm is available only for rhythms from the library.

---

## Differences from Desktop

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Grid editing | ✅ Yes | ❌ Read-only |
| Add/Remove tracks | ✅ Yes | ❌ No |
| Add/Remove sections | ✅ Yes | ❌ No |
| Section name / meter / tempo override | ✅ Yes | ❌ No |
| Section play modes (reps, ∞, once, disabled) | ✅ Yes | ✅ Yes |
| Random repetitions (🎲) | ✅ Yes | ✅ Yes |
| Tempo acceleration | ✅ Yes | ✅ Yes |
| Mixer (volume + mute) | ✅ Yes | ✅ Yes |
| Solo | ❌ No | ✅ Yes (portrait) |
| Download rhythm | ✅ Yes | ❌ No |
| Load from PC | ✅ Yes | ❌ No |
| BPM adjustment | ✅ Yes | ✅ Yes |
| Count-in | ✅ Yes | ✅ Yes |
| Share rhythm | ✅ Yes | ✅ Yes |

---

## Tips for Mobile Use

1. **Use Dual Mode**: landscape to follow the grid, portrait to practice with the player.
2. **Mute tracks to focus**: tap the instrument name, or use the mixer.
3. **Use solo (portrait)** to isolate a single instrument.
4. **Slow down with the tempo popover** for learning complex rhythms.
5. **Explore sections** with the arrows, swipe, or the Sections chip.

---

*Enjoy your rhythms on the go! 🥁*
