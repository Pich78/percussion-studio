# Class & Module Reference

This document provides a high-level API reference for the major classes and modules in the application.

## Controller Layer

### `App`
The main orchestrator of the application. It initializes all other classes and manages the central application `state`. It does not have a public API of its own but rather drives the application by calling methods on other modules.

### `PlaybackController`
Handles user intent related to playback.
*   `play()`: Initiates playback.
*   `pause()`: Pauses playback.
*   `stop()`: Stops playback and resets the position.
*   `toggleLoop(isEnabled)`: Sets the looping behavior.
*   `toggleMetronome(isEnabled)`: Enables or disables the metronome.
*   `setInstrumentVolume(id, volume)`: Changes an instrument's volume.
*   `setMasterVolume(volume)`: Changes the global volume.

### `ProjectController`
Handles the project lifecycle.
*   `loadRhythm(id)`: Starts the entire process of loading, resolving, and preparing a rhythm.
*   `createNewRhythm()`: Creates a new, blank project state in memory.
*   `saveProject(filename)`: Initiates the process of generating and exporting the project ZIP file.

### `EditController`
Handles user intent related to modifying the rhythm.
*   `addNote(position)`: Adds a note to the grid.
*   `removeNote(position)`: Removes a note from the grid.
*   `updatePlaybackFlow(newFlow)`: Modifies the sequence of patterns.

## Audio Layer

### `AudioScheduler`
The high-level conductor that manages all musical timing.
*   `constructor(player, onUpdateCallback, onPlaybackEndedCallback)`: Initializes the scheduler with its dependencies.
*   `setRhythm(resolvedRhythmData)`: Provides the full, concrete rhythm data to be played.
*   `play()`: Starts or resumes the scheduling loop.
*   `pause()`: Halts the scheduling loop, saving the current position.
*   `resetPosition()`: Resets the internal playback position to the beginning.
*   `setInstrumentVolume(instrumentId, volume)`: Updates the volume for a specific instrument for future scheduled notes.

### `AudioPlayer`
The low-level facade for the Web Audio API.
*   `loadSounds(soundList)`: Asynchronously loads and decodes all specified audio files. Returns a `Promise`.
*   `playAt(soundId, absoluteTime, options)`: Schedules a specific sound to play at a precise future time on the audio clock.
*   `unloadSounds(soundIds)`: Clears specified sounds from memory.
*   `getAudioClockTime()`: Returns the current, high-precision time of the `AudioContext`.
*   `setMasterVolume(volume)`: Adjusts the master gain node affecting all audio output.

## View Layer

### `View`
The main UI manager.
*   `constructor(callbacks)`: Initializes the view, providing it with all necessary callbacks to the controllers.
*   `render(state)`: The main rendering method. It receives the full application state and delegates rendering to the appropriate sub-views.
*   `updatePlaybackIndicator(beatIndex)`: A dedicated, high-performance method to animate the playback bar.

### View Sub-Modules
All sub-view modules share a common interface: `constructor(callbacks)` to receive event handlers and `render(stateSlice)` to receive the relevant data for drawing. Their specific responsibilities are:

*   **`TubsGridView`**: Renders the main TUBS notation grid, including the SVG image for each note. Manages the visual state of the playback indicator.
*   **`PlaybackControlsView`**: Renders the Play/Pause/Stop buttons, BPM slider, Master Volume, and Loop checkbox. Is responsible for disabling controls based on the application state (e.g., disabling Play when loading).
*   **`InstrumentMixerView`**: Renders the volume and mute controls for each individual instrument track.
*   **`RhythmEditorView`**: Renders the UI specific to the editing mode, primarily for managing the `playback_flow` (adding, removing, reordering patterns).
*   **`AppMenuView`**: Renders the main application menu for high-level actions like Load, Save, and New Project.
*   **`ErrorModalView`**: Renders a modal dialog to display detailed, user-friendly error messages when `state.error` is populated.
*   **`ConfirmationDialogView`**: Renders a modal dialog to confirm destructive actions (like loading a new project when there are unsaved changes) when `state.confirmation` is populated.

## Data Access Layer (DAL)
A module of utility functions for data fetching and generation.
*   `getInstrument(id)`: Fetches and parses an instrument file. Returns a `Promise`.
*   `getPattern(id)`: Fetches and parses a pattern file. Returns a `Promise`.
*   `getRhythm(id)`: Fetches and parses a rhythm file. Returns a `Promise`.
*   `exportRhythmAsZip(rhythmData, patternsData, instrumentsData, filename)`: Creates a ZIP archive in memory and triggers a browser download.