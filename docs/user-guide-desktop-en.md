# Percussion Studio - Desktop User Guide

Welcome to Percussion Studio! This guide covers all features available in the desktop version.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Main Interface Overview](#main-interface-overview)
3. [Hamburger Menu](#hamburger-menu)
4. [Timeline & Sections](#timeline--sections)
5. [Grid Editor](#grid-editor)
6. [Track Management](#track-management)
7. [Measure Management](#measure-management)
8. [Playback Controls](#playback-controls)
9. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Getting Started

1. Open `desktop.html` in a modern web browser (Chrome, Firefox, Edge recommended)
2. Wait for the loading screen to complete
3. The default rhythm will load automatically

---

## Main Interface Overview

The desktop interface consists of four main areas:

### Header Bar
- **Hamburger Menu (☰)**: Access file operations and user guide
- **Title**: Shows "Percussion Studio"
- **Rhythm Info**: Current rhythm name, active section, repetition count, and live BPM
- **Global BPM Slider**: Adjust the base tempo (40-240 BPM)
- **Playback Buttons**: Stop (■) and Play/Pause (▶/❚❚)

### Timeline Panel (Left)
- Lists all sections in your rhythm
- Click a section to switch to it
- Drag sections to reorder them

### Grid Editor (Center)
- The main area for viewing and editing patterns
- Visual grid showing all tracks and steps
- Playhead highlights current step during playback

### Stroke Palette (Bottom)
- Select different stroke types to paint in the grid
- Clear button to erase all notes in current section

---

## Hamburger Menu

Click the **☰** icon in the top-left to access:

| Option | Description |
|--------|-------------|
| **New Rhythm** | Create a new empty rhythm (prompts for confirmation) |
| **Load Rhythm...** | Browse and select from available rhythms |
| **Download Rhythm** | Save current rhythm as a YAML file to your computer |
| **User Guide** | Access this documentation (choose language) |

### Loading Rhythms

1. Click **Load Rhythm...**
2. Browse the folder tree (click ▶ to expand folders)
3. Click a rhythm name to load it
4. Alternatively, click **Load from PC** to select a local `.yaml` file

---

## Timeline & Sections

The timeline panel on the left manages your rhythm's structure.

### Section Information

Each section card displays:
- **Name**: Section identifier
- **Time Signature**: 4/4 (binary), 6/8 (ternary), or 12/8
- **Steps**: Number of grid steps (e.g., 16s)
- **Repetitions**: How many times this section repeats (e.g., x4)
- **Tempo**: BPM (amber = custom, gray = global)
- **Acceleration**: Tempo change per repetition (%)

### Section Actions

| Action | How To |
|--------|--------|
| **Select Section** | Click on the section card |
| **Add Section** | Click the **+** button in the timeline header |
| **Duplicate Section** | Hover over section → Click the copy icon |
| **Delete Section** | Hover over section → Click the trash icon |
| **Reorder Sections** | Drag a section by its handle (≡) and drop in new position |
| **Rename Rhythm** | Click the rhythm name at the top and type |

---

## Grid Editor

The central grid is where you create and edit patterns.

### Section Settings Bar

At the top of the grid, configure the current section:

| Setting | Description |
|---------|-------------|
| **Name** | Section name (editable text field) |
| **Time Sig** | Binary (4/4), Ternary (6/8), or 12/8 |
| **Steps** | Number of steps per measure (4-64) |
| **Repeats** | How many times section plays (1-99) |
| **Tempo** | Lock icon toggles global/custom BPM |
| **Accel/Decel %** | Tempo change per repetition (-10% to +10%) |

### Painting Strokes

1. **Select a stroke** from the palette at the bottom:
   - **Open** (O) - Open tone
   - **Slap** (S) - Slap stroke
   - **Bass** (B) - Bass tone
   - **Tip** (T) - Tip/finger stroke
   - **Muff** (M) - Muffled tone
   - **Rest** (-) - Silence (eraser)

2. **Click any grid cell** to paint the selected stroke

3. **Right-click a cell** to quickly clear it

### Visual Feedback

- **Active cells**: Show the stroke icon/letter with color
- **Current step**: Highlighted during playback
- **Muted tracks**: Appear dimmed with strikethrough name
- **Invalid strokes**: Indicated when stroke doesn't exist for that instrument

---

## Track Management

Each row in the grid represents a track (instrument).

### Track Controls

Located in the sticky left column for each track:

| Control | Description |
|---------|-------------|
| **Name** | Click to change instrument/sound pack |
| **Mute (🔊/🔇)** | Toggle audio for this track |
| **Volume Slider** | Adjust track volume (0-100%) |
| **Delete (🗑)** | Remove track from rhythm |

### Adding Tracks

1. Click **+ Add Track** below the last track
2. **Select Instrument** from the left column
3. **Select Sound Pack** from the right column
4. Click **OK** to confirm

### Changing Instruments

1. Click the **track name** to open the instrument modal
2. Choose a new instrument and sound pack
3. Click **OK** to apply

> **Note**: Volume and mute settings are global — they apply to all instances of that instrument across all sections.

---

## Measure Management

Sections can contain multiple measures, providing more complex patterns.

### Measure Controls

Each measure has a header with:

| Action | Description |
|--------|-------------|
| **Duplicate (📄)** | Copy this measure and insert after |
| **Delete (🗑)** | Remove this measure |

### Adding Measures

- Click **+ Add Measure** at the bottom of the grid
- New measure inherits tracks from existing measures

---

## Playback Controls

### Header Controls

| Button | Action |
|--------|--------|
| **Stop (■)** | Stop playback and reset to beginning |
| **Play (▶)** | Start playback from current position |
| **Pause (❚❚)** | Pause playback at current position |

### BPM Controls

- **Global BPM Slider**: Sets the base tempo for all sections
- **Section BPM Override**: Lock icon in section settings to set custom tempo
- **Live BPM Display**: Shows actual tempo during playback (reflects acceleration)

### Repetition Counter

The header shows:
- **Rep**: Current repetition / Total repetitions
- Updates in real-time during playback

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Spacebar** | Toggle Play/Pause |
| **Enter** | Confirm rhythm name edit |

---

## Tips & Best Practices

1. **Use sections for song structure**: Create separate sections for Intro, Verse, Chorus, etc.

2. **Start with existing rhythms**: Load a rhythm similar to what you want, then modify it

3. **Download regularly**: Save your work by downloading the rhythm file

4. **Use tempo acceleration**: Create exciting build-ups with gradual tempo increases

5. **Organize with measures**: Use multiple measures for call-and-response patterns

---

*Happy drumming! 🥁*
