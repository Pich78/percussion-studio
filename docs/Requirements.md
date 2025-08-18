# Software Requirements Specification
### Project: Web-Based Percussion Practice Tool

---

## 1. High-Level Vision & Scope

This document outlines the requirements for a web-based software application designed for practicing, composing, and editing percussion rhythms. The tool will provide a rich, interactive interface for musicians to load and play pre-existing rhythms, compose new patterns from scratch, and sequence them into full musical pieces. The application is intended to be a powerful practice and composition tool accessible from any modern web browser.

---

## 2. Core Technical Architecture

*   **Platform:** A responsive web application built to run in any modern browser on desktop (Windows, macOS, Linux) and mobile (iOS, Android) operating systems. The "Playing" view must be fully responsive for desktop and mobile use. The "Editing" view is primarily designed for the larger screen real estate of desktop environments.
*   **Core Technology Stack:** The application will be built exclusively with client-side technologies: **HTML, Vanilla JavaScript, and CSS**. No front-end frameworks (like React or Vue) will be used.
*   **Architecture:** The application must be **"serverless."** All logic, data processing, and rendering are handled on the client-side within the user's browser.
    *   ***Architectural Rationale:*** *This serverless constraint is the primary driver for the application's data saving/loading mechanism. Since there is no backend server, the application cannot "save" data in a traditional sense. This leads directly to the "Export to .zip" feature defined in Section 6.3.*
*   **Hosting:** The entire application (HTML, JS, CSS, and all data assets) will be hosted on **GitHub Pages**.

---

## 3. Data Management & Structure

The application's data is organized into a strict, decoupled structure that separates instrument definitions from their sounds and patterns. This is managed via a central manifest file. File naming conventions are critical to how the application resolves and links data automatically.

### 3.1. File Naming Conventions & Directory Structure

To enable automated data resolution, all data files use a specific compound extension and naming scheme.

*   **Instrument Definitions:** `*.instdef.yaml` (e.g., `drum_kick.instdef.yaml`)
    *   Defines the abstract properties of an instrument type.
*   **Sound Packs:** `<symbol>.<pack_name>.sndpack.yaml` (e.g., `KCK.test_kick.sndpack.yaml`)
    *   Provides the concrete sound files for an instrument definition. The `<symbol>` in the filename **must** match the `symbol` inside the corresponding Instrument Definition file.
*   **Patterns:** `*.patt.yaml` (e.g., `rock_verse.patt.yaml`)
*   **Rhythms:** `*.rthm.yaml` (e.g., `my_song.rthm.yaml`)

These files are stored in the following directory structure:
*   `/data/instruments/`: Contains all Instrument Definition files (`.instdef.yaml`) and their associated SVG assets. This folder defines "what an instrument is".
*   `/data/sounds/`: Contains subdirectories for each unique Sound Pack (e.g., `test_kick/`)The subdirectory name must match the `<pack_name>` from the filename (e.g., `test_kick/`). This subdirectory holds the Sound Pack's definition file (`KCK.test_kick.sndpack.yaml`) and all its sound (`.wav`) assets. This folder defines "what an instrument sounds like".
*   `/data/patterns/`: Contains all Pattern definition files.
*   `/data/rhythms/`: Contains all Rhythm definition files.

***Architectural Rationale:*** *This decoupled structure is a powerful design choice. It makes both Instrument Definitions and Sound Packs highly reusable. A single `drum_kick.instdef.yaml` can be used by dozens of different Sound Packs (e.g., `KCK.acoustic.sndpack.yaml`, `KCK.808.sndpack.yaml`). The strict naming convention (`KCK.test_kick...`) allows the application's `ProjectController` to automatically discover and link these files without needing explicit paths written in the data files, which makes the system much more robust and maintainable.*

### 3.2. Data Discovery: The Manifest File

To discover available assets without depending on the GitHub API at runtime, the application will use a central manifest file.

*   **File:** A file named `manifest.json` will be located at the root of the repository.
*   **Content:** This file contains a JSON object listing the unique filenames (without extensions) of all available rhythms, patterns, instrument definitions, and sound packs.
*   **Function:** On startup, the application makes a single request to fetch `manifest.json`. This file's content is then used to populate all asset lists within the application's UI (e.g., in the "Load Rhythm" dialog).
    *   ***Architectural Rationale:*** *The manifest file approach was chosen over making live calls to the GitHub API to avoid risks of API downtime, rate limiting, and performance issues. The manifest file provides a robust, single-request solution that is more stable and performant.*

### 3.3. Data Formats (YAML)

*   **Instrument Definition (`data/instruments/drum_kick.instdef.yaml`):**
    *   `symbol`: The unique, system-wide identifier for this instrument type (e.g., KCK).
    *   `sounds`: A list of articulations the instrument can produce. Each sound has a `letter` for use in patterns and a default `svg` icon.
    ```yaml
    name: "Drum Kick"
    symbol: "KCK"
    sounds:
      - letter: "o"
        name: "Normal Hit"
        svg: "open.svg"
      - letter: "p"
        name: "Stopped Hit"
        svg: "presionado.svg"
    ```

*   **Sound Pack (`data/sounds/test_kick/KCK.test_kick.sndpack.yaml`):**
    *   `sound_files`: A mapping where the key is a `letter` from the Instrument Definition and the value is the corresponding `.wav` filename.
    ```yaml
    name: "Test Kick Sound Pack"
    sound_files:
      o: "test_kick.normal.wav"
      p: "test_kick.stopped.wav"
    ```

*   **Rhythm Definition (`data/rhythms/my_song.rthm.yaml`):**
    *   `sound_kit`: The "casting list" for the rhythm. The key is an instrument `symbol` (e.g., `KCK`) which will be used in patterns. The value is the `<pack_name>` (e.g., `test_kick`) to be used for that instrument.
    ```yaml
    global_bpm: 120
    sound_kit:
      KCK: "test_kick"
      SNR: "test_snare"
    playback_flow:
      - pattern: "rock_verse"
        repetitions: 8
    ```

*   **Pattern Definition (`data/patterns/rock_verse.patt.yaml`):**
    *   The keys in `pattern_data` now correspond to the `symbol`s defined in the Rhythm's `sound_kit`. The characters in the notation string correspond to the `letter`s from the Instrument Definition.
    ```yaml
    metadata:
      name: "Rock Verse"
      metric: "4/4"
      resolution: 16
    pattern_data:
      - # Measure 1
        KCK: "||o---|p---|o---|----||"
        SNR: "||----|o---|----|o---||"
    ```

## 4. Build & Deployment Process

To ensure the `manifest.json` file is always up-to-date and reflects the true state of the data files in the repository, its generation is automated.

### 4.1. Local Development & Debugging

*   **Manifest Script:** A Python script (`generate_manifest.py`) will reside in the repository's root. This script, when executed, scans the `data` directories for files with the correct compound extensions (`.instdef.yaml`, `.sndpack.yaml`, etc.) and writes the `manifest.json` file.
*   **Local Workflow:** The developer can run `python generate_manifest.py` manually after adding or removing assets to test changes locally before committing.

### 4.2. Automated Production Build (GitHub Actions)

*   **Trigger:** A GitHub Actions workflow will be configured to run automatically on every push to the `main` branch.
*   **Process:** The Action will execute the `generate_manifest.py` script and automatically commit the updated `manifest.json` file back to the repository if any changes are detected.
    *   ***Architectural Rationale:*** *The GitHub Actions approach was chosen over a local Git Hook because it provides a **centralized, guaranteed, and transparent** source of truth for automation that requires zero setup from collaborators, ensuring the manifest is always correct and removing the possibility of human error.*
    
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

#### **5.2. The Editing View (Composition Mode)**

A separate view for creating and modifying rhythms.

*   **Layout:** A two-panel interface.
    *   **Left Panel ("Flow Panel"):** Displays the `playback_flow` from the loaded `rhythm.yaml`. Users can edit properties (repetitions, BPM) in-line, re-order patterns via drag-and-drop, and delete entries (via a hover-to-reveal button with confirmation).
    *   **Center Panel ("Pattern Editor"):** An interactive canvas for the pattern selected from the Flow Panel.

*   **Initial State When Loading a Rhythm:**
    *   When an existing rhythm is loaded, the **Flow Panel** is populated with the rhythm's `playback_flow`. The first pattern in the sequence is selected by default.
    *   The **Pattern Editor** renders the complete grid for this default selected pattern, including all its measures, instrument tracks, and notes as defined in the data files. All editing functionality is immediately available.

*   **Pattern & Measure Management:**
    *   When creating a *new, empty* pattern, the Center Panel displays an "Add Measure" button (`+`), input fields for metric (e.g., 4/4), and a dropdown for resolution (e.g., 16ths).
    *   Measures can be added to or removed from any pattern. The metric and resolution of each measure can be edited in-place from its header.

*   **Instrument & Track Management:**
    *   **Add Track:** A `+ Add Instrument` button below the last track opens a modal dialog.
        *   This modal lists all instrument types from the manifest (e.g., `conga`) in one column and the available sound packs for the selected type in a second column.
    *   **Change Track Instrument:** Clicking on an existing instrument's header re-opens the selection modal.
    *   **Remove Track:** A hover-to-reveal delete button appears on each track header, which removes the track after confirmation.

*   **Note Editing Workflow:** The application employs a powerful and intuitive hybrid model for note entry that is optimized for both touch and mouse input, avoiding reliance on right-clicks or keyboard modifiers.
    *   **Active Sound ("Paintbrush"):** Each instrument track has an "Active Sound." By default (the default sound is the first sound in its instdef.yaml file), or when a rhythm is first loaded, this is the instrument's primary sound. The mouse cursor will change to display the `.svg` icon of the Active Sound for the track it is currently hovering over, providing constant visual feedback.
    *   **Adding and Removing Notes (Tap Gesture):**
        *   A simple **tap** on an *empty* grid cell instantly places the current Active Sound for that track.
        *   A simple **tap** on a *filled* grid cell instantly deletes the note.
    *   **Changing Sounds and Selecting a New Tool (Hold Gesture):**
        *   A **press-and-hold** gesture on any grid cell (empty or filled) will open a circular **Radial Menu** centered on the cursor.
        *   This menu displays all available sounds for that instrument.
        *   Dragging to a sound and releasing the mouse button performs two actions simultaneously:
            1. The note in the target cell is placed or changed to the selected sound.
            2. The selected sound becomes the new **Active Sound** for the entire track, updating the mouse cursor and the behavior of subsequent taps.

---

## 6. Core User Journeys

### 6.1. Creating a New Rhythm

*   A "Create New Rhythm" option in the main menu loads a blank Editing View.
*   The Flow Panel shows one "untitled" pattern entry. The Pattern Editor is empty, prompting the user to "Add Measure" and then "Add Instrument."

### 6.2. Loading an Existing Rhythm

*   A "Load Rhythm" option in the menu opens a list of available rhythms (sourced from `manifest.json`).
*   Selecting a rhythm loads it into the appropriate view (Playing or Editing).

### 6.3. Saving and Exporting Work

*   **In-Memory Model:** All new or modified files exist only in the browser's memory. The application **does not** write directly to the GitHub repository.
*   **Export Process:** Clicking "Save/Export" will generate a `.zip` file containing all new and modified YAML files with their correct names and extensions. The user downloads this `.zip` file to their local machine.
    *   ***Architectural Note:*** *For future enhancement, the **File System Access API** could be explored for a more native "Save As..." experience in supporting browsers. The `.zip` download must remain as the universal fallback.*
*   **Updating the Repository:** The user must **manually** extract the `.zip` file and use Git to add, commit, and push the new/updated files to their repository. The GitHub Action will then automatically update the manifest upon this push.