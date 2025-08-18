percussion-studio/
│
├── css/
│ └── global.css
│
├── data/
│ ├── instruments/
│ │ ├── drum_kick.instdef.yaml
│ │ ├── drum_snare.instdef.yaml
│ │ ├── open.svg
│ │ └── presionado.svg
│ │
│ ├── patterns/
│ │ ├── test_multi_measure.patt.yaml
│ │ └── test_pattern.patt.yaml
│ │
│ ├── rhythms/
│ │ └── test_rhythm.rthm.yaml
│ │
│ └── sounds/
│ ├── test_kick/
│ │ ├── KCK.test_kick.sndpack.yaml
│ │ ├── test_kick.normal.wav
│ │ └── test_kick.stopped.wav
│ │
│ └── test_snare/
│ ├── SNR.test_snare.sndpack.yaml
│ ├── test_snare.normal.wav
│ └── test_snare.stopped.wav
│
├── docs/
│ ├── architecture.md
│ └── Requirements.md
│
├── lib/
│ ├── dom.js
│ ├── MockLogger.js
│ ├── TestRunner.js
│ └── TubsGridRenderer.js
│
├── src/
│ │
│ ├── App/
│ │ ├── App.html
│ │ ├── App.js
│ │ ├── App.test.js
│ │ ├── MockEditingApp.js
│ │ └── MockPlaybackApp.js
│ │
│ ├── EditingApp/
│ │ ├── EditingApp.html
│ │ ├── EditingApp.js
│ │ ├── EditingApp.test.js
│ │ └── MockRhythmEditorView.js
│ │
│ ├── PlaybackApp/
│ │ ├── MockInstrumentMixerView.js
│ │ ├── MockPlaybackControlsView.js
│ │ ├── MockPlaybackGridView.js
│ │ ├── PlaybackApp.html
│ │ ├── PlaybackApp.js
│ │ └── PlaybackApp.test.js
│ │
│ ├── components/
│ │ ├── AppMenuView/
│ │ │ ├── AppMenuView.css
│ │ │ ├── AppMenuView.html
│ │ │ ├── AppMenuView.js
│ │ │ └── AppMenuView.test.js
│ │ ├── ConfirmationDialogView/
│ │ │ ├── ConfirmationDialogView.css
│ │ │ ├── ConfirmationDialogView.html
│ │ │ ├── ConfirmationDialogView.js
│ │ │ └── ConfirmationDialogView.test.js
│ │ ├── EditingGridView/
│ │ │ ├── EditingGridView.css
│ │ │ ├── EditingGridView.html
│ │ │ ├── EditingGridView.js
│ │ │ └── EditingGridView.test.js
│ │ ├── ErrorModalView/
│ │ │ ├── ErrorModalView.css
│ │ │ ├── ErrorModalView.html
│ │ │ ├── ErrorModalView.js
│ │ │ └── ErrorModalView.test.js
│ │ ├── InstrumentMixerView/
│ │ │ ├── InstrumentMixerView.css
│ │ │ ├── InstrumentMixerView.html
│ │ │ ├── InstrumentMixerView.js
│ │ │ └── InstrumentMixerView.test.js
│ │ ├── InstrumentSelectionModalView/
│ │ │ ├── InstrumentSelectionModalView.css
│ │ │ ├── InstrumentSelectionModalView.html
│ │ │ ├── InstrumentSelectionModalView.js
│ │ │ └── InstrumentSelectionModalView.test.js
│ │ ├── PlaybackControlsView/
│ │ │ ├── PlaybackControlsView.css
│ │ │ ├── PlaybackControlsView.html
│ │ │ ├── PlaybackControlsView.js
│ │ │ └── PlaybackControlsView.test.js
│ │ ├── PlaybackGridView/
│ │ │ ├── PlaybackGridView.css
│ │ │ ├── PlaybackGridView.html
│ │ │ ├── PlaybackGridView.js
│ │ │ └── PlaybackGridView.test.js
│ │ └── RhythmEditorView/
│ │ ├── FlowPanel/
│ │ │ ├── FlowPanel.css
│ │ │ ├── FlowPanel.html
│ │ │ ├── FlowPanel.js
│ │ │ └── FlowPanel.test.js
│ │ ├── RhythmEditorView.integration.html
│ │ ├── RhythmEditorView.css
│ │ ├── RhythmEditorView.html
│ │ ├── RhythmEditorView.js
│ │ └── RhythmEditorView.test.js
│ │
│ └── services/
│ ├── AudioPlayer/
│ │ ├── AudioPlayer.html
│ │ ├── AudioPlayer.js
│ │ └── AudioPlayer.test.js
│ ├── AudioScheduler/
│ │ ├── AudioScheduler.html
│ │ ├── AudioScheduler.js
│ │ └── AudioScheduler.test.js
│ ├── DataAccessLayer/
│ │ ├── DataAccessLayer.html
│ │ ├── DataAccessLayer.js
│ │ └── DataAccessLayer.test.js
│ ├── EditController/
│ │ ├── EditController.html
│ │ ├── EditController.js
│ │ └── EditController.test.js
│ ├── PlaybackController/
│ │ ├── PlaybackController.html
│ │ ├── PlaybackController.js
│ │ └── PlaybackController.test.js
│ └── ProjectController/
│ ├── ProjectController.html
│ ├── ProjectController.js
│ └── ProjectController.test.js
│
├── index.html
└── manifest.json