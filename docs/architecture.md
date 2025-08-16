Final Architecture & Design Document

1. Introduction

This document outlines the final software architecture for the Percussion Practice Application. It is a complete blueprint for implementation, incorporating all functional and technical requirements. The architecture prioritizes modularity, maintainability, and performance within the specified technology stack.

2. High-Level Architecture & Principles

The application is built on an Application Shell Architecture. This model separates global concerns from feature-specific logic by using a main "Shell" that loads and manages independent "Sub-Applications."

The core principles of this architecture are:

Centralized Ownership: A single Application Shell (App.js) owns all shared services (like the AudioPlayer and ProjectController) and the master copy of the application's data (the currently loaded rhythm).

Independent Sub-Applications: The primary features of the application, "Playing" (PlaybackApp.js) and "Editing" (EditingApp.js), are encapsulated in their own classes. Each sub-app is a self-contained module with its own state, controllers, and views.

One-Way Data Flow (Hierarchical): A strict one-way data flow is maintained at two levels:

Shell-to-Sub-App: The Shell passes shared services and the master data down to the active sub-app as "props" during instantiation.

Within each Sub-App: Each sub-app implements its own internal state-driven, one-way data flow to manage its UI and logic, just as the original architecture did.

The Application Shell's state object will be simplified to manage only the highest-level concerns: { appView: 'playing' | 'editing', currentRhythm: object | null, isLoading: boolean, error: object | null, confirmation: object | null }.

3. Core Modules & Components

The application is now divided into three primary layers: The Application Shell, Shared Services, and The Sub-Applications.

3.1. The Application Shell (App.js)

This class is the main orchestrator and the application's entry point.

Responsibilities:

Initializes all Shared Services (AudioPlayer, ProjectController, DataAccessLayer).

Owns the master  It is the single source of truth for the loaded project data.

Manages Top-Level View State: Controls which sub-application is currently active based on state.appView.

Acts as a Router: When the view changes, it is responsible for destroying the old sub-app instance and creating a new one, injecting the necessary data and services.

Handles Global Concerns: Listens to the browser's beforeunload event and manages global keyboard shortcuts. It also orchestrates the initial project loading sequence.

3.2. Shared Services

These are singleton instances created by the App shell and passed down to the active sub-app.

: Its responsibilities are unchanged. It manages the project lifecycle (loading, saving, data resolution). It is now instantiated once by the Shell.

: Its responsibilities are unchanged. It remains the sole facade for the Web Audio API, managing the AudioContext and pre-loading sounds.

 (DAL): Its responsibilities are unchanged. It handles all fetching and parsing of remote data files.

3.3. The Sub-Applications

These are self-contained modules that manage a major feature of the application.

3.3.1. PlaybackApp.js (Sub-App)

Scope: Manages the entire "Playing View" experience.

Initialization: Is instantiated by the App shell. Its constructor receives the currentRhythm data and instances of the AudioPlayer and ProjectController.

Owns Playback State: Manages its own focused state object, e.g., { isPlaying: boolean, loopPlayback: boolean, currentMeasureIndex: 0, masterVolume: 1.0 }.

Owns Playback Controllers: Instantiates its own PlaybackController and AudioScheduler.

Owns Playback Views: Instantiates and manages all views related to playback: TubsGridView, PlaybackControlsView, and InstrumentMixerView.

3.3.2. EditingApp.js (Sub-App)

Scope: Manages the entire "Editing View" experience.

Initialization: Is instantiated by the App shell. Its constructor receives the currentRhythm data and a callback to notify the Shell of changes (onRhythmUpdate).

Owns Editing State: Manages its own focused state object, e.g., { isDirty: boolean, selectedPatternId: string, activeNoteSymbol: string }.

Owns Editing Controllers: Instantiates and manages its own EditController.

Owns Editing Views: Instantiates and manages the RhythmEditorView and all its child components (Flow Panel, Grid, Palette).

Data Synchronization: When a user's edits modify the rhythm, it holds the changes in its local state. Upon saving or navigating away, it uses the onRhythmUpdate callback to pass the new, modified rhythm object back up to the App shell.

5. Key Architectural Decisions & Tradeoffs

Application Shell Architecture: We have explicitly chosen a Shell architecture over a single monolithic app.

Benefit: This provides a strong separation of concerns, allowing the playback and editing features to be developed and debugged independently. It simplifies state management within each context and makes the application more scalable.

Tradeoff: This introduces a small amount of complexity in managing the lifecycle of the sub-apps and ensuring data is passed correctly between the Shell and the active sub-app.

Framework Choice (Vanilla JS): We will continue to use Vanilla JS with a disciplined, state-driven architecture within each sub-application.

Audio Timing Logic (Dynamic BPM): The AudioScheduler (now owned by the PlaybackApp) will handle complex intra-pattern acceleration logic. The global BPM slider will be disabled during playback to prevent conflicting timing sources.

Data Model (Rhythm-Centric): The Rhythm file remains the central point of configuration. The data resolution logic remains concentrated in the ProjectController (now a shared service).

Error Handling & User Safety: The architecture continues to include robust data loading validation and a "dirty state" confirmation system to prevent accidental data loss.

Feature Scope: Undo/Redo functionality and Offline Capability remain de-scoped for the initial version.

Dependency Management (CDN): All third-party libraries will be loaded from CDNs.