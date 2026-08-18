# Percussion Studio - Desktop User Guide

Welcome to Percussion Studio! This guide covers all features available in the desktop version.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Main Interface Overview](#main-interface-overview)
3. [Hamburger Menu](#hamburger-menu)
4. [Loading Rhythms (Library & Batà)](#loading-rhythms-library--batà)
5. [Timeline & Sections](#timeline--sections)
6. [Section Settings Bar](#section-settings-bar)
7. [Grid Editor](#grid-editor)
8. [Editing Modes](#editing-modes)
9. [Track Management](#track-management)
10. [Measure Management](#measure-management)
11. [Mixer](#mixer)
12. [Playback Controls](#playback-controls)
13. [Keyboard Shortcuts](#keyboard-shortcuts)
14. [Shareable Links](#shareable-links)
15. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

1. Open `desktop.html` in a modern web browser (Chrome, Firefox, Edge recommended).
2. Wait for the loading screen to complete.
3. The default rhythm loads automatically (see [Default Rhythm Configuration](../requirements/default-rhythm.md) for the `?rhythm=` URL override).

---

## Main Interface Overview

The desktop interface consists of four main areas:

### Header Bar

| Element | Description |
|---------|-------------|
| **Hamburger Menu (☰)** | File operations, editing options, and user guide |
| **Title** | Shows "Percussion Studio" |
| **Rhythm Info** | Current rhythm name, active section name, and repetition badge |
| **Live BPM** | Actual tempo during playback (green while playing, reflects acceleration) |
| **Mixer (🎚)** | Opens the per-instrument volume/mute mixer modal |
| **Global BPM Slider** | Adjust the base tempo (40-240 BPM) |
| **Count Button** | Toggles count-in (shows 4 or 6 beats, pulses during count-in) |
| **Playback Buttons** | Stop (■) and Play/Pause (▶/❚❚) |

The **repetition badge** shows the active section's play state:
- **Loop**: `current/total` repetitions (e.g. `2/4`)
- **Random repetitions**: 🎲 icon — a 🎲 with the effective count appears while playing
- **Play Forever**: ∞
- **Play Once**: `1×` (becomes ✓ once played)

### Timeline Panel (Left)

- Lists all sections of the rhythm.
- Click a section to switch to it.
- Drag sections to reorder them (see [Timeline & Sections](#timeline--sections)).

### Grid Editor (Center)

- The main area for viewing and editing patterns.
- Visual grid showing all tracks, measures, and steps.
- The playhead highlights the current step during playback.

### Bottom Bar

- **Dynamics selector** (top row): Ghost, Soft, Normal, Loud, Accent.
- **Stroke palette** (bottom row): Rest, Open, Presionado, Slap, Mordito, Half Mordito, Bass, Dedo, Muff.
- **Clear button**: erases all notes in the current section.

---

## Hamburger Menu

Click the **☰** icon in the top-left to access:

| Option | Description |
|--------|-------------|
| **New Rhythm** | Create a new empty rhythm (asks for confirmation; unsaved changes are lost) |
| **Load Rhythm...** | Open the rhythm browser (folder tree + Batà Explorer) |
| **Download Rhythm** | Save the current rhythm as a YAML file to your computer |
| **Share Rhythm** | Copy a shareable link (only for library rhythms, see [Shareable Links](#shareable-links)) |
| **Editing Options** | Configure how you paint strokes (see [Editing Modes](#editing-modes)) |
| **User Guide** | Open this documentation (English or Italiano) |

> **Note**: Share Rhythm is available only when the app is hosted on GitHub Pages and the current rhythm comes from the library. Rhythms loaded from local files or created fresh show it as disabled (N/A).

---

## Loading Rhythms (Library & Batà)

### Rhythm Browser (non-Batà rhythms)

1. Click **Load Rhythm...** to open the browser.
2. Navigate the folder tree — click ▶ to expand folders.
3. Click a rhythm name to load it.
4. **Local Files**: click **Load from PC** to open a `.yaml` file from your computer.

### Batà Explorer

Batà toques have their own browser with search and filters:

1. Open **Load Rhythm...** — Batà families appear as cards.
2. Use the **search bar** to find a toque by name, family, or variation.
3. Use the **Orisha** and **Classification** filter dropdowns (Specific, Shared, Generic). When an Orisha filter is active, results are organized in colored zones.
4. Click a family card to open its details (classification badge, associated Orishas, available variations).
5. Click a variation to load it.
6. If nothing matches, use **Clear all filters**.

---

## Timeline & Sections

The timeline panel on the left manages the rhythm's structure.

### Rhythm Name

- The rhythm name is an editable text field at the top of the timeline.
- Click it and type; press **Enter** to confirm.

### Section Information

Each section card displays:

| Element | Description |
|---------|-------------|
| **Name** | Section identifier |
| **Meter** | Time signature and steps (e.g., 4/4 (16), 6/8 (12)) |
| **Play badge** | Repetitions (`3`), random repetitions (🎲3), ∞ for Play Forever, `1×`/`✓` for Play Once |
| **Tempo** | ♩=BPM (amber = custom, gray = global) |
| **Acceleration** | Tempo change per repetition (↑/↓ icons, e.g. 5%) |

### Section Actions

| Action | How To |
|--------|--------|
| **Select Section** | Click on the section card |
| **Add Section** | Click the **+** button in the timeline header |
| **Duplicate Section** | Hover over section → click the copy icon |
| **Delete Section** | Hover over section → click the trash icon (hidden for the last section) |
| **Reorder Sections** | Drag a section by its handle (≡) and drop it in the new position |
| **Disable/Enable** | Click the green/red toggle on the left of the card — disabled sections are skipped during playback and shown dimmed |

### Batà Metadata

When the loaded rhythm is a Batà toque, its description appears under the rhythm name.

---

## Section Settings Bar

The settings bar sits at the top of the grid and configures the active section:

| Setting | Description |
|---------|-------------|
| **Name** | Section name (editable text field) |
| **Meter** | Presets: 4/4 (4), 4/4 (8), 4/4 (16), 6/8 (6), 6/8 (12), 6/8 (24) — or **Custom** with a Steps input (1-64) |
| **Play Mode** | Dropdown: **Repetitions**, **Play Forever**, **Play Once** |
| **Repeats** | How many times the section plays (1-99, only in Repetitions mode) |
| **Random (🎲)** | Toggle random repetitions — each cycle the section plays a random number of times between 1 and the set value |
| **Tempo** | Lock icon toggles between Global BPM and a custom BPM input (40-300) |
| **Accel/Decel %** | Tempo change per repetition (-10% to +10%, 0.1 steps) — available only in Repetitions mode with more than 1 repetition |

### Play Modes

| Mode | Behavior |
|------|----------|
| **Repetitions** | Plays the section the set number of times, then moves to the next |
| **Play Forever** | Repeats indefinitely until you press Stop |
| **Play Once** | Plays once per session, then is skipped on subsequent cycles. Shows **Played** — click it to reset and play it again |

> **Note**: Play modes, random repetitions, and disabled flags are session-only. Downloading the rhythm exports loop mode with the set repetitions (tempo acceleration is exported).

---

## Grid Editor

The central grid is where you create and edit patterns.

### Measures and Step Numbers

- Each measure has a header with its label (**Measure 1**, **Measure 2**, ...) and step numbers (1, 2, 3...).
- Step groups are separated according to the section's subdivision (4/4 → groups of 4, 6/8 → groups of 3).

### Track Rows

Each row is a track (instrument). The sticky left column contains:

| Control | Description |
|---------|-------------|
| **Instrument Name** | Click to **mute/unmute** the track (muted tracks appear dimmed with a strikethrough name) |
| **÷** | Track subdivision — click to cycle the visual grouping for this track |
| **⊞** | Snap toggle — when ON, painted strokes snap to the subdivision groups |
| **📦** | Sound pack — opens the Change Instrument modal |
| **🗑** | Remove the track from the rhythm |

The edit controls (÷, ⊞, 📦, 🗑) appear only while playback is stopped.

### Painting Strokes

1. Select a stroke from the palette at the bottom (see [Editing Modes](#editing-modes) for alternatives).
2. **Left-click** any grid cell to paint the selected stroke.
3. **Right-click** a cell to quickly clear it to a Rest.

### Visual Feedback

- **Active cells**: show the stroke icon/letter with color.
- **Current step**: highlighted during playback.
- **Muted tracks**: dimmed with strikethrough name.
- **Invalid strokes**: a stroke that doesn't exist for the hovered instrument is indicated in the cell.

### Dynamics

Dynamics control the **volume and visual intensity** of individual steps. The selector sits above the stroke palette.

1. Select a dynamic level from the selector bar.
2. Paint strokes as usual — each stroke receives the selected dynamic.
3. Steps with non-normal dynamics show visual changes in the grid.

| Level | Effect | Visual Hint |
|-------|--------|-------------|
| **Ghost** | Very quiet (30%) | Small, faded icon |
| **Soft** | Quiet (60%) | Slightly smaller, slightly faded |
| **Normal** | Default (100%) | Standard icon |
| **Loud** | Loud (130%) | Larger icon with orange glow |
| **Accent** | Strong (160%) | Largest icon with red glow |

> **Tip**: Dynamics are saved in the YAML file and preserved when downloading or loading rhythms.

---

## Editing Modes

Open **☰ → Editing Options** to choose how you add symbols to the grid:

1. **Standard (Bottom Palette)**
   - Click a stroke in the palette at the bottom, then left-click cells to paint.
   - Right-click a cell to clear it to a Rest.

2. **Pie Menu**
   - A quick radial menu that appears under your cursor, showing only the sounds valid for the hovered track.
   - **Trigger**: Right Click (recommended), Long Press, or Hover. For Long Press and Hover you can set the delay in milliseconds.
   - **Behavior**:
     - *Update Palette Tool on Select* — the bottom palette follows your pie menu choice.
     - *Hide Current Tool from Menu* — the tool you're currently holding is hidden from the menu.

3. **Mouse Wheel**
   - Hover over any cell and scroll the mouse wheel up or down to cycle through the instrument's symbols.
   - Left-click to drop the symbol.

---

## Track Management

### Adding Tracks

1. Click **+ Add Track** below the last track of a measure.
2. Choose an **Instrument Type** (left column) — e.g., IYA, ITO, OKO, CON.
3. Choose a **Sound Pack** (right column) — packs are listed in two columns; selecting one shows its sound names in two columns, its open tone plays automatically, and you can click any name to hear it before choosing.
4. Click **OK** (enabled once both are selected) or **Cancel**.

### Changing Instrument or Sound Pack

1. Click the **📦** button on a track row (playback stopped).
2. Select a different Instrument or Sound Pack — the sound names are listed in two columns so you can hear them before applying.
3. Click **OK** to apply.

> **Note**: Volume and mute settings are global per instrument — they apply to every occurrence of that instrument in all sections. They are **not saved** and reset when loading a new rhythm.

---

## Measure Management

Sections can contain multiple measures for more complex patterns.

### Measure Controls

Each measure header allows you to:
- **Duplicate** (copy icon): copies the measure's play pattern to a new measure.
- **Delete** (trash icon): removes the measure.

### Adding Measures

- Click **+ Add Measure** at the bottom of the grid.
- The new measure inherits the tracks of the existing measures.

---

## Mixer

The Mixer gives you per-instrument volume and mute control.

1. Click the **Mixer (🎚)** button in the header.
2. For each instrument in the section you can:
   - **Mute/Unmute** with the speaker button — unmuting restores the previous volume.
   - Adjust the **volume slider** (0-100%). Setting volume to 0 is the same as muting.
3. Close the mixer with the **✕**, **Done**, or by clicking the backdrop.

---

## Playback Controls

### Header Controls

| Button | Action |
|--------|--------|
| **Stop (■)** | Stop playback and reset to the beginning |
| **Play (▶)** | Start playback from the current position (from the beginning with count-in when stopped) |
| **Pause (❚❚)** | Pause playback at the current position |

### BPM Controls

- **Global BPM Slider**: the header slider sets the base tempo (40-240 BPM).
- **Section BPM Override**: use the lock icon in the Section Settings Bar to give a section a custom tempo.
- **Live BPM Display**: shows the actual tempo during playback and reflects acceleration.
- **Acceleration**: sections with Accel/Decel % change the live tempo by that percentage at every repetition.

### Repetition Counter

- The header badge shows the current repetition / total (`Rep 2/4`).
- It updates in real time during playback and reflects random repetitions while playing.

### Count-In

The **Count** button in the header enables a count-in before playback starts.

| Setting | Description |
|---------|-------------|
| **Toggle** | Click the button to enable/disable |
| **Beats** | Automatically 4 (for 4/4) or 6 (for 6/8 or 12/8 time) |
| **Visual** | The button shows the current beat and pulses during count-in |
| **Audio** | Click sounds (higher pitch on beat 1) |

> **Note**: Count-in plays only when starting from the beginning (after Stop). Resuming from pause skips it.

### Play Modes in Action

- **Repetitions** sections loop N times, then the next section plays.
- **Play Forever** sections repeat until you press Stop.
- **Play Once** sections play once per session (badge shows ✓ afterwards).
- **Disabled** sections are skipped entirely.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Spacebar** | Toggle Play/Pause (ignored while typing in an input field) |
| **Enter** | Confirm rhythm name edit |

---

## Shareable Links

You can share and receive direct links to specific rhythms.

### Sharing a Rhythm

1. Open the rhythm you want to share.
2. Click **☰ → Share Rhythm**.
3. The link is copied to your clipboard.
4. Send the link to anyone!

### Opening a Shared Link

- Opening a URL with `?rhythm=<id>` loads that rhythm automatically (it overrides the default rhythm).

> **Note**: Share Rhythm is available only for rhythms from the library (GitHub repository), on the hosted site. Rhythms loaded from local files or newly created cannot be shared via URL.

---

## Tips & Best Practices

1. **Use sections for song structure**: create separate sections for Intro, Verse, Chorus, etc.
2. **Start from existing rhythms**: load something similar, then modify it.
3. **Use play modes**: Play Once for intros, Play Forever for solos, disable sections you don't need.
4. **Experiment with random repetitions (🎲)** for organic, changing patterns.
5. **Use tempo acceleration** to build excitement with gradual tempo increases.
6. **Organize with measures** for call-and-response patterns.
7. **Download regularly** to save your work.

---

*Happy drumming! 🥁*
