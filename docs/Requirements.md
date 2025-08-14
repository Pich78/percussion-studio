# Software Requirements & Architecture Document
### Project: Web-Based Percussion Practice Tool

---

## 1. High-Level Vision & Scope

This document outlines the requirements for a web-based software application designed for practicing, composing, and editing percussion rhythms. The tool will provide a rich, interactive interface for musicians to load and play pre-existing rhythms, compose new patterns from scratch, and sequence them into full songs. The application is intended to be a powerful practice and composition tool accessible from any modern web browser.

---

## 2. Core Technical Architecture

*   **Platform:** A responsive web application designed to run in any modern browser on desktop (Windows, macOS, Linux) and mobile (iOS, Android) operating systems. The "Playing" view must be fully responsive, while the "Editing" view is primarily designed for desktop use.
*   **Core Technology Stack:** The application will be built exclusively with client-side technologies: **HTML, JavaScript, and CSS**. Modern libraries (e.g., React, Vue, or Svelte for UI management) can be used.
*   **Architecture:** The application must be **"serverless."** All logic, data processing, and rendering are handled on the client-side within the user's browser.
    *   ***Architectural Note:*** *This serverless constraint is the primary driver for the application's data saving/loading mechanism. Since there is no backend server to process requests, the application cannot "save" data in a traditional sense. This leads directly to the "Export to .zip" feature defined in Section 6.3.*
*   **Hosting:** The entire application (HTML, JS, CSS, and all data assets) will be hosted on **GitHub Pages**.

---

## 3. Data Management & Structure

The application's data is organized into a strict file system structure and managed via a central manifest file.

### 3.1. File Naming Conventions & Directory Structure

To ensure clarity and enable powerful tooling, all data files will use a compound extension format.

*   **Instruments:** `*.inst.yaml`
*   **Patterns:** `*.patt.yaml`
*   **Rhythms:** `*.rthm.yaml`

These files are stored in the following directory structure:
*   **/instruments/:** Contains a subdirectory for each unique instrument version (e.g., `acoustic_kick/`). This subdirectory holds the instrument's definition file (`acoustic_kick.inst.yaml`) and all its sound (`.wav`) and image (`.svg`) assets.
*   **/patterns/:** Directly contains all Pattern definition files (e.g., `rock_verse.patt.yaml`).
*   **/rhythms/:** Directly contains all Rhythm definition files (e.g., `my_first_song.rthm.yaml`).

***Architectural Rationale:*** *Using specific extensions like `.patt.yaml` instead of a generic `.yaml` is a deliberate design choice. It provides immediate clarity to developers about a file's purpose and structure. Crucially, it allows for schema-based validation and autocompletion in modern code editors (like VS Code), which dramatically reduces the chance of manual errors when writing or editing data files.*

### 3.2. Data Discovery: The Manifest File

To discover available assets without depending on the GitHub API at runtime, the application will use a central manifest file.

*   **File:** A file named `manifest.json` will be located at the root of the repository.
*   **Content:** This file contains a JSON object listing the unique filenames (without extensions) of all available rhythms, patterns, and instruments.
*   **Function:** On startup, the application makes a single request to fetch `manifest.json`. This file's content is then used to populate all asset lists within the application.
    *   ***Architectural Rationale:*** *The manifest file approach was chosen over making live calls to the GitHub API to avoid risks of API downtime, rate limiting, and performance issues. The manifest file provides a robust, single-request solution that is more stable and performant.*

### 3.3. Data Formats (YAML)

*   **Instrument Definition (`acoustic_kick.inst.yaml`):**
    ```yaml
    name: "Acoustic Kick Drum"
    symbol: "KCK"
    sounds:
      - letter: "o"
        svg: "kick_beater.svg"
        wav: "kick_sound.wav"
    ```

*   **Pattern Definition (`rock_verse.patt.yaml`):**
    ```yaml
    metadata:
      name: "Rock Verse Beat 1"
      metric: "4/4"
      resolution: 16
    pattern_data:
      KCK: "||o---|----|o---|----||"
      SNR: "||----|o---|----|o---||"
    ```

*   **Rhythm Definition (`my_first_song.rthm.yaml`):**
    ```yaml
    global_bpm: 120
    instrument_kit:
      KCK: "acoustic_kick"
      SNR: "rock_snare_1"
    playback_flow:
      - pattern: "rock_verse"
        repetitions: 8
      - pattern: "rock_fill_a"
        repetitions: 1
    ```

---

## 4. Build & Deployment Process

To ensure the `manifest.json` file is always up-to-date, its generation is automated.

### 4.1. Local Development & Debugging

*   **Manifest Script:** A Python script (`generate_manifest.py`) will reside in the repository's root. This script, when executed, scans the data directories for files with the correct compound extensions and writes the `manifest.json` file.
*   **Local Workflow:** The developer can run `python generate_manifest.py` manually after adding or removing assets to test changes locally.

### 4.2. Automated Production Build (GitHub Actions)

*   **Trigger:** A GitHub Actions workflow will be configured to run automatically on every push to the `main` branch.
*   **Process:** The Action will execute the `generate_manifest.py` script and automatically commit the updated `manifest.json` file back to the repository if any changes are detected.
    *   ***Architectural Rationale:*** *The GitHub Actions approach was chosen over a local Git Hook because it provides a **centralized, guaranteed, and transparent** source of truth for automation that requires zero setup from collaborators, ensuring the manifest is always correct.*

---

## 5. Application Views & Functionality

***Implementation Note:*** *All editing operations must be handled in an **in-memory data model**. All edits manipulate JavaScript objects representing the loaded rhythm. New files are only generated from these in-memory objects during the final export step.*

### 5.1. The Playing View (Performance Mode)

The primary interface for practicing, active on first load with a default rhythm.

*   **Main Grid Display:** A visual grid of the current pattern. Rows are instruments, columns are time subdivisions. Note cells display the corresponding `.svg` symbol.
*   **Playback Controls:** Standard Play, Pause, and Stop buttons. A BPM slider with a numerical display allows for live tempo changes.
*   **Metronome:** A toggle switch to enable/disable a two-tone metronome click track (one sound for the downbeat, another for other beats).
*   **Live Interaction:**
    *   **Playback Head:** The currently playing column is visually highlighted.
    *   **Mute/Unmute:** Clicking an instrument's header at the start of a row toggles its mute state instantly.
    *   **Volume Control:** Each instrument track has an individual volume slider.
*   **UI Feedback:**
    *   A progress display indicates the current position within the overall rhythm's `playback_flow`.
    *   If a pattern is chosen randomly from a list, a small notification informs the user of the selection.

### 5.2. The Editing View (Composition Mode)

A separate view for creating and modifying rhythms, accessible from a menu.

*   **Layout:** A three-panel interface.
    *   **Left Panel ("Rhythm Flow"):** Displays the sequence from the loaded `rhythm.yaml`. Users can edit properties (repetitions, BPM) in-line, re-order patterns via drag-and-drop, and delete entries (via a hover-to-reveal button with confirmation).
    *   **Center Panel ("Pattern Grid"):** The interactive editing grid for the pattern selected from the left panel.
    *   **Right Panel ("Instrument Palette"):** Shows available note symbols for instruments in the current rhythm's kit.
*   **Editing Workflow:**
    *   **Note Editing:** Add a note by selecting a symbol from the palette and clicking in the grid. Remove a note by clicking on it.
    *   **Track Management:**
        *   **Add Track:** A dedicated `+` row at the bottom of the grid opens a list of all available instruments to add a new track. The list prioritizes instruments already in the rhythm's kit. If an instrument outside the kit is chosen, it is automatically added to the kit in memory.
        *   **Remove Track:** A hover-to-reveal delete button appears on each track header, which removes the track after confirmation.
    *   **Pattern Management:**
        *   **Add Pattern:** A `+` button at the bottom of the Rhythm Flow panel opens a dialog to either select an existing pattern from the manifest or create a new one by specifying its name, metric, and resolution.
*   **Dedicated Playback:** The view contains two distinct play buttons: "Play Pattern" (loops the current pattern) and "Play Rhythm" (plays the entire sequence).

---

## 6. Core User Journeys

### 6.1. Creating a New Rhythm

*   A "Create New Rhythm" option in the main menu loads a blank Editing View.
*   The Rhythm Flow shows one "untitled" rhythm entry, and the Pattern Grid shows a default, empty 4/4 pattern, ready for the user to add their first instrument track.

### 6.2. Loading an Existing Rhythm

*   A "Load Rhythm" option in the menu opens a list of available rhythms (sourced from `manifest.json`).
*   Selecting a rhythm loads it into the appropriate view (Playing or Editing).

### 6.3. Saving and Exporting Work

*   **File Handling:** All new or modified files exist only in the browser's memory. The application **does not** write directly to the GitHub repository.
*   **Export Process:** Clicking "Save/Export" will generate a `.zip` file containing all new and modified files with their correct compound extensions (e.g., `new_song.rthm.yaml`). The user downloads this `.zip` file.
    *   ***Architectural Note:*** *For future enhancement, the **File System Access API** could be explored for a more native "Save As..." experience in supporting browsers. The `.zip` download must remain as the universal fallback.*
*   **Updating the Repository:** The user must **manually** extract the `.zip` file and use Git to add, commit, and push the new/updated files to their repository. The GitHub Action will then automatically update the manifest upon this push.