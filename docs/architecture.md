# Final Architecture & Design Document

## 1. Introduction

This document outlines the final software architecture for the Percussion Practice Application. It is a complete blueprint for implementation, incorporating all functional and technical requirements. The architecture prioritizes modularity, maintainability, and performance within the specified technology stack.

## 2. High-Level Architecture & Principles

The application is built on a **State-Driven, Component-Based Architecture** using **Vanilla JavaScript**. The central principle is a strict **one-way data flow** for predictable state management:

1.  A user interaction in the **View** triggers a callback to a **Controller**.
2.  The **Controller** executes the required logic and produces a new, immutable **State** object.
3.  The main **App** class receives this new State and passes it to the **View**.
4.  The **View** re-renders the necessary parts of the UI to reflect the new State.

The application `state` object will include flags to manage UI behavior, such as `{ error: object | null, confirmation: object | null, isPlaying: boolean, isLoading: boolean, loopPlayback: boolean, isUntitled: boolean, isDirty: boolean }`.

## 3. Core Modules & Components

The application is divided into four primary layers: **Controller**, **Audio**, **View**, and **Data Access**.

### 3.1. The Controller Layer

This layer is responsible for all application logic, broken down into specialized classes.

*   **`App` (Main Orchestrator):**
    *   **Responsibilities:** Initializes all modules. Owns the single, authoritative application `state` object. Acts as a message bus, delegating user actions. Triggers the `View.render()` method upon state changes. Listens to the browser's `beforeunload` event to prevent accidental data loss.
*   **`PlaybackController` (Sub-Controller):**
    *   **Responsibilities:** Manages playback logic (Play, Pause, Stop). Manages individual and master volume/mute controls.
    *   **Metronome Logic:** When the metronome is enabled, it dynamically generates an "in-memory" metronome pattern (with an accented sound for the first beat of the measure) and instrument, which are then passed to the `View` and `AudioScheduler`.
    *   **Interacts with:** `AudioScheduler`, `AudioPlayer`.
*   **`ProjectController` (Sub-Controller):**
    *   **Responsibilities:** Manages the project lifecycle.
        *   **Loading State:** Sets `state.isLoading = true` at the beginning of any loading sequence and `state.isLoading = false` only after all assets are successfully loaded.
        *   **Dirty State Handling:** Before executing a destructive action (`loadRhythm`, `createNewRhythm`), it must check if `state.isDirty` is true and trigger a confirmation dialog.
        *   **Data Resolution (Loading):** Orchestrates the multi-step dependency resolution process for loading a rhythm. This is a critical responsibility:
            1.  Fetches the main Rhythm file (`.rthm.yaml`).
            2.  For each entry in the `sound_kit` (e.g., `KCK: "test_kick"`), it determines the required Instrument Definition (`drum_kick.instdef.yaml`) and the required Sound Pack (`KCK.test_kick.sndpack.yaml`) based on the key (`KCK`) and value (`test_kick`).
            3.  Fetches all required Instrument Definition and Sound Pack files.
            4.  Fetches all unique Pattern files listed in the `playback_flow`.
            5.  Assembles a single, deeply "resolved" rhythm object in memory that contains all the loaded data.
            6.  Collects all `.wav` file paths from the loaded Sound Packs and passes the list to the `AudioPlayer`.
            7.  After sounds are loaded, it passes the resolved rhythm object to the `AudioScheduler`.
        *   **New Project Creation:** Contains a `createNewRhythm()` method to generate a default project structure.
    *   **Error Handling:** Implements a master `try...catch` block and performs a logical validation pass on all loaded data.
*   **`EditController` (Sub-Controller):**
    *   **Responsibilities:** Manages all modifications to the rhythm data structure. Upon any modification, it is responsible for updating the state to `{ isDirty: true }`.

### 3.2. The Audio Layer

This layer encapsulates all Web Audio API logic.

*   **`AudioScheduler` (High-Level Conductor):**
    *   **Responsibilities:** A sophisticated state machine for all musical timing. It manages a look-ahead scheduling loop. It is the **sole owner of the playback tick state**, ensuring correct pause and resume functionality. It is responsible for handling looping logic or firing an `onPlaybackEnded` callback.
    *   **Data Interpretation:** It directly consumes the parsed pattern data. The `pattern_data` from the file is received as an array of measure objects. The scheduler's logic iterates through this array to play the measures in sequence. It interprets all musical context properties from the current pattern, including **`metric`, `resolution`**, and all BPM properties, including **static BPM per pattern** and **intra-pattern acceleration**.
    *   **Interface:** `constructor(...)`, `setRhythm(...)`, `play()`, `pause()`, **`resetPosition()`**, `setInstrumentVolume(...)`.
    
*   **`AudioPlayer` (Low-Level Executor):**
    *   **Responsibilities:** The sole facade for the Web Audio API. Manages the `AudioContext` and a master `GainNode` for global volume control. Pre-loads `.wav` files (including the two metronome sounds). Executes timed `play` commands. Implements "choke group" logic.
    *   **Interface:** `loadSounds(...)`, `playAt(...)`, `unloadSounds(...)`, `getAudioClockTime()`, `setMasterVolume(...)`.

### 3.3. The View Layer (UI)

This layer is responsible for all DOM manipulation.

*   **`View` (Main UI Manager):**
    *   **Responsibilities:** Manages all sub-view modules. Implements a smart `render(state)` method. Provides a dedicated `updatePlaybackIndicator(beatIndex)` method.
*   **Sub-View Modules:**
    *   **`TubsGridView`:** Renders the main notation grid, including the **`.svg` image** for each note. Its `updatePlaybackIndicator` method will move the bar according to the position passed to it. **On `pause`, the bar remains in place. On `stop`, the bar is moved to position 0.**
    *   **`PlaybackControlsView`:** Renders shared controls, including a Play/Pause button, a **distinct Stop button**, and the Loop Playback checkbox. It must **disable the global BPM slider** when `state.isPlaying` is true, and **disable Play/Stop buttons** when `state.isLoading` is true.
    *   **`InstrumentMixerView`:** Renders individual instrument controls.
    *   **`RhythmEditorView`:** Renders controls specific to the editing view.
    *   **`AppMenuView`:** Renders the main application menu.
    *   **`ErrorModalView`:** Displays detailed error messages.
    *   **`ConfirmationDialogView`:** Displays a confirmation prompt to prevent data loss.

### 3.4. The Data Access Layer (DAL)

This layer handles fetching remote data and generating files for download.

*   **Responsibilities:** Fetching and parsing `.yaml` files. The parsing methods will be wrapped in `try...catch` blocks to handle syntax errors. Uses third-party libraries (loaded from a CDN) for YAML parsing and ZIP creation.
*   **Interface:** `getInstrument(id)`, `getPattern(id)`, `getRhythm(id)`, `exportRhythmAsZip(...)`.

## 5. Key Architectural Decisions & Tradeoffs

1.  **Framework Choice (Vanilla JS):** We will use Vanilla JS with a disciplined, state-driven architecture. This respects the project's constraints but requires careful implementation of UI rendering logic to ensure maintainability.
2.  **Audio Timing Logic (Dynamic BPM):** The `AudioScheduler` will handle complex intra-pattern acceleration logic. As a direct tradeoff, the global BPM slider will be disabled during playback to prevent conflicting sources of timing changes.
3.  **Data Model (Rhythm-Centric):** The `Rhythm` file is the central point of configuration, mapping abstract instrument categories to concrete instruments. This makes `Pattern` files highly reusable but concentrates the data resolution logic in the `ProjectController`.
4.  **Error Handling & User Safety:** The architecture includes robust, multi-phase validation for data loading and a "dirty state" confirmation system to prevent accidental data loss. A global "loading" state will prevent playback before audio assets are ready.
5.  **Feature Scope:** **Undo/Redo** functionality and **Offline Capability** have been explicitly de-scoped for the initial version to manage complexity.
6.  **Dependency Management (CDN):** All third-party libraries will be loaded from CDNs. This simplifies the development environment at the cost of requiring an internet connection for initial application load.