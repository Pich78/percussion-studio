# Percussion Studio - Mobile User Guide

Welcome to Percussion Studio Mobile! This guide covers all features available in the mobile version.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Device Requirements](#device-requirements)
3. [Main Interface Overview](#main-interface-overview)
4. [Menu Options](#menu-options)
5. [Viewing Rhythms](#viewing-rhythms)
6. [Track Controls](#track-controls)
7. [Playback Controls](#playback-controls)

---

## Getting Started

1. Open `mobile.html` on your mobile device's browser
2. **Rotate your device to landscape mode** (required)
3. Wait for the loading screen to complete
4. The default rhythm will load automatically

---

## Device Requirements

- **Orientation**: Landscape mode is required
- **Browser**: Chrome, Safari, or Firefox (latest versions)
- **Audio**: Ensure your device is not in silent mode
- **Screen**: Best experienced on tablets or phones with larger screens

> **Note**: If you see a "Please Rotate Your Device" screen, turn your device sideways to landscape orientation.

---

## Main Interface Overview

The mobile interface is optimized for viewing and playback (read-only).

### Header Bar

| Element | Description |
|---------|-------------|
| **Menu (☰)** | Opens the side menu |
| **Rhythm Name** | Current rhythm (amber text) |
| **Section Name** | Active section (white text) |
| **Rep Counter** | Current / Total repetitions |
| **Live BPM** | Real-time tempo display |
| **Global BPM Slider** | Adjust base tempo |
| **Count-In (CNT)** | Toggle count-in before playback (shows 4 or 6) |
| **Stop (■)** | Stop playback |
| **Play/Pause (▶/❚❚)** | Toggle playback |

### Grid View

- **Track Names**: Fixed on the left side
- **Pattern Grid**: Shows all steps for current section
- **Mute/Volume**: Controls for each track
- **Auto-scroll**: Grid follows playhead during playback

---

## Menu Options

Tap the **☰** icon in the top-left to open the menu.

### Load Rhythm

1. Tap **Load Rhythm**
2. Browse the folder tree (tap ▶ to expand folders)
3. Tap a rhythm name to select it
4. The rhythm loads with a loading screen

### Show Structure

1. Tap **Show Structure**
2. View all sections in the rhythm
3. Tap any section to switch to it
4. Tap **✕** or outside to close

### Share Rhythm

- Tap **Share Rhythm** to copy a link to the current rhythm
- On mobile, this may open your device's share sheet
- Only available for library rhythms (not for locally loaded files)

### User Guide

- Tap **User Guide** to access documentation
- Choose your preferred language (English or Italian)

---

## Viewing Rhythms

The mobile version displays rhythms in a read-only grid view.

### Understanding the Grid

- Each **row** represents an instrument track
- Each **column** represents a time step
- **Filled cells** show active strokes with icons/letters
- **Empty cells** indicate rests (silence)
- **Separators** divide steps into groups based on subdivision

### Step Numbers

- Numbers above the grid indicate step positions (1, 2, 3...)
- Groups help you see the beat structure (e.g., groups of 4 for 4/4 time)

### Current Position

- During playback, the **current step** is highlighted
- The grid automatically scrolls to keep the playhead visible

---

## Track Controls

Each track has controls in the left column.

### Volume Slider

- Drag left/right to adjust volume (0-100%)
- Volume at 0 effectively mutes the track
- Changes apply globally to all occurrences of that instrument

### Mute Button

- Tap the **speaker icon** (🔊) to mute
- Tap again (🔇) to unmute
- Muted tracks appear dimmed with strikethrough names

> **Note**: Volume and mute settings are not saved — they reset when loading a new rhythm.

---

## Playback Controls

### Control Buttons

Located in the header on the right side:

| Button | Description |
|--------|-------------|
| **Stop (■)** | Stops playback and resets to the beginning |
| **Play (▶)** | Starts playback from current position |
| **Pause (❚❚)** | Pauses at current position (button changes state) |

### Global BPM

- Use the slider next to the buttons to adjust tempo
- Range: 40-240 BPM
- Displays current BPM value above the slider

### Live BPM Display

- Shows the actual tempo during playback
- Reflects any tempo acceleration/deceleration
- **Gray** when stopped (shows global BPM)
- **Green** when playing (shows live tempo)

### Repetition Counter

- **Rep X/Y** shows current repetition out of total
- Updates in real-time during playback

### Count-In

The **CNT** button in the header enables a count-in before playback starts.

- **Toggle**: Tap the CNT button to enable/disable
- **Beats**: Automatically set to 4 (4/4 time) or 6 (6/8 or 12/8 time)
- **Visual**: Button shows current beat during count-in with pulse animation
- **Audio**: Plays click sounds before rhythm starts

> **Note**: Count-in only plays when starting from the beginning.

---

## Section Navigation

### Via Structure Modal

1. Tap **☰** → **Show Structure**
2. View all sections with their properties:
   - Name
   - Meter
   - Repetitions
   - Tempo settings
3. Tap any section card to jump to it

### During Playback

- The app follows the natural section order
- Sections repeat according to their repetition count
- When a section completes, playback moves to the next

---

## Tips for Mobile Use

1. **Use landscape mode**: The grid is optimized for horizontal viewing

2. **Adjust volume per track**: Use individual sliders to balance the mix

3. **Mute tracks to focus**: Temporarily mute tracks to practice specific parts

4. **Check the structure**: Use "Show Structure" to see the full rhythm layout

5. **Adjust BPM for practice**: Slow down complex rhythms for learning

---

## Differences from Desktop

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Grid Editing | ✅ Yes | ❌ View Only |
| Add/Remove Tracks | ✅ Yes | ❌ No |
| Add/Remove Sections | ✅ Yes | ❌ No |
| Section Settings | ✅ Full | ❌ View Only |
| Download Rhythm | ✅ Yes | ❌ No |
| Load from PC | ✅ Yes | ❌ No |
| Volume/Mute | ✅ Yes | ✅ Yes |
| Playback | ✅ Yes | ✅ Yes |
| BPM Adjustment | ✅ Yes | ✅ Yes |

| Share Rhythm | ✅ Yes | ✅ Yes |

---

## Shareable Links

You can share and receive direct links to specific rhythms.

### Sharing a Rhythm

1. Open the rhythm you want to share
2. Tap **☰** → **Share Rhythm**
3. Your device's share menu opens (or link is copied)
4. Send the link to anyone!

### Opening a Shared Link

- When you open a link with `?rhythm=...`, that rhythm loads automatically
- Example: `mobile.html?rhythm=Batà/Dadà/dada_base`

> **Note**: Share Rhythm is only available for rhythms from the library.

---

*Enjoy your rhythms on the go! 🥁*
