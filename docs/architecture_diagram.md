# Architecture Diagram

This diagram illustrates the relationships and data flow between the major components of the application.

```mermaid
graph TD
    subgraph User Interaction
        User
    end

    subgraph "External Resources"
        Server["File Server \n (YAML, WAV, SVG)"]
        CDN["Third-Party CDNs \n (JS-YAML, JSZip)"]
    end

    subgraph "View Layer (UI)"
        direction LR
        ViewManager[View Manager]
        AppMenu[AppMenuView]
        Controls[PlaybackControlsView]
        Grid[TubsGridView]
        Mixer[InstrumentMixerView]
        Editor[RhythmEditorView]
        Modals[Error/Confirmation Modals]
        ViewManager --- AppMenu & Controls & Grid & Mixer & Editor & Modals
    end

    subgraph "Controller Layer"
        direction LR
        App[App Orchestrator]
        PlaybackCtrl[PlaybackController]
        ProjectCtrl[ProjectController]
        EditCtrl[EditController]
        App --- PlaybackCtrl & ProjectCtrl & EditCtrl
    end

    subgraph "Audio Layer"
        direction LR
        Scheduler[AudioScheduler]
        Player[AudioPlayer]
        Scheduler -->|Schedules Notes| Player
        Player -->|"getAudioClockTime()"| Scheduler
    end

    subgraph "Data Layer"
        DAL[DataAccessLayer]
    end

    State[(Application State)]

    %% Main User Interaction Flow
    User -- Clicks --> ViewManager
    ViewManager -- User Events (Callbacks) --> App

    %% State Management Loop
    App -- Delegates Action --> PlaybackCtrl & ProjectCtrl & EditCtrl
    PlaybackCtrl & ProjectCtrl & EditCtrl -- Returns New State --> App
    App -- Updates --> State
    State -- Triggers Re-render --> ViewManager

    %% Service Interactions
    PlaybackCtrl -- Controls Playback --> Scheduler
    ProjectCtrl -- Loads Sounds --> Player
    ProjectCtrl -- Fetches Project Data --> DAL
    DAL -- Reads From --> Server
    DAL -- Uses Library From --> CDN

    %% Styling
    style App fill:#f9f,stroke:#333,stroke-width:2px
    style State fill:#bbf,stroke:#333,stroke-width:2px