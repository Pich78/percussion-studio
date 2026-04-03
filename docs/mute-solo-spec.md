# Mute and Solo Specification

## Overview

This document defines the behavior of the Mute (M) and Solo (S) controls for tracks in the percussion studio application.

## States

Each track can be in exactly one of three states:

| State | Description |
|-------|-------------|
| **Normal** | Track plays normally, neither M nor S is active |
| **Muted** | Track produces no sound |
| **Soloed** | Only this track plays; all other tracks are muted |

Mute and Solo are mutually exclusive - a track cannot be both Muted and Soloed at the same time.

## Interactions

### Button Clicks

| Current State | Click M | Click S |
|---------------|---------|---------|
| Normal | → Muted | → Soloed |
| Muted | → Normal | → Soloed |
| Soloed | → Muted | → Normal |

**Rules:**
- Clicking the same button twice toggles: Active ↔ Normal
- Clicking one button replaces the other state on the same track
- Only one track can be Soloed at a time; clicking S on a new track clears the previous solo

### Volume Slider

| Current State | Action | Result |
|---------------|--------|--------|
| Normal | Volume → 0 | → Muted |
| Muted | Volume → >0 | → Normal (at slider position) |
| Soloed | Volume → 0 | → Muted |

**Rules:**
- Setting volume to 0 is equivalent to muting the track
- Moving the volume slider from 0 on a Muted track unmutes it
- Unmuting via M button always restores volume to 100% (does not restore previous value)

## Use Cases

| # | Action | Result |
|---|--------|--------|
| 1 | Click M on Normal track | Track becomes Muted |
| 2 | Click S on Normal track | Track becomes Soloed; all others muted |
| 3 | Click M on Muted track | Track becomes Normal at 100% volume |
| 4 | Click S on Soloed track | Track becomes Normal |
| 5 | Click S on Muted track | Track becomes Soloed (M replaced by S) |
| 6 | Click M on Soloed track | Track becomes Muted (S replaced by M) |
| 7 | Click S on track B when track A is Soloed | Track B becomes Soloed; Track A becomes Normal |
| 8 | Drag volume to 0 on Normal track | Track becomes Muted |
| 9 | Drag volume from 0 on Muted track | Track becomes Normal at new volume |
| 10 | Drag volume to 0 on Soloed track | Track becomes Muted |

## UI Behavior

- M button: Highlighted when track is Muted
- S button: Highlighted when track is Soloed
- Volume slider: Disabled when track is Muted (visual only - slider still accepts input)
- Track name: Grayed out when Muted or when another track is Soloed (but not this one)
- Solo indicator: Show "◉" next to track name when Soloed
