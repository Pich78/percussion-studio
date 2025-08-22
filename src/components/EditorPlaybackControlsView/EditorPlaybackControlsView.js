// file: src/components/EditorPlaybackControlsView/EditorPlaybackControlsView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class EditorPlaybackControlsView {
    constructor(container, { onTransport, onSettingsChange, initialDisplayText = '' }) {
        this.container = container;
        this.callbacks = { onTransport, onSettingsChange };
        
        this.rootElement = document.createElement('div');
        this.rootElement.className = 'editor-playback-controls';
        this.container.appendChild(this.rootElement);
        
        this.state = {
            status: 'STOPPED', // STOPPED, PLAYING, PAUSED
            isLooping: true,
            volume: 80,
            bpm: 120,
            displayText: initialDisplayText,
        };

        loadCSS('/percussion-studio/src/components/EditorPlaybackControlsView/EditorPlaybackControlsView.css');
        
        this._boundHandleClick = this._handleClick.bind(this);
        this._boundHandleInputChange = this._handleInputChange.bind(this);
        
        this.rootElement.addEventListener('click', this._boundHandleClick);
        this.rootElement.addEventListener('input', this._boundHandleInputChange);

        this.render();
        logEvent('info', 'EditorPlaybackControlsView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render() {
        const { status, isLooping, volume, bpm, displayText } = this.state;

        this.rootElement.innerHTML = `
            <div class="playback-display-text">${displayText}</div>
            <div class="transport-controls">
                <button data-action="play" ${status === 'PLAYING' ? 'disabled' : ''}>Play</button>
                <button data-action="pause" ${status !== 'PLAYING' ? 'disabled' : ''}>Pause</button>
                <button data-action="stop" ${status === 'STOPPED' ? 'disabled' : ''}>Stop</button>
                <button data-action="loop" class="${isLooping ? 'active' : ''}">Loop</button>
            </div>
            <div class="settings-controls">
                <label>BPM: <input type="number" data-control="bpm" value="${bpm}" min="40" max="300" /></label>
                <label>Vol: <input type="range" data-control="volume" value="${volume}" min="0" max="100" /></label>
            </div>
        `;
        logEvent('debug', 'EditorPlaybackControlsView', 'render', 'DOM', 'Playback controls rendered.', this.state);
    }

    updateDisplayText(newText) {
        this.state.displayText = newText;
        const displayElement = this.rootElement.querySelector('.playback-display-text');
        if (displayElement) {
            displayElement.textContent = newText;
        }
        logEvent('info', 'EditorPlaybackControlsView', 'updateDisplayText', 'State', `Display text updated to "${newText}"`);
    }

    _handleClick(event) {
        const actionBtn = event.target.closest('button[data-action]');
        if (!actionBtn) return;
        
        const action = actionBtn.dataset.action;
        logEvent('info', 'EditorPlaybackControlsView', '_handleClick', 'Events', `Action button clicked: ${action}`);
        
        switch (action) {
            case 'play':
                this.state.status = 'PLAYING';
                this.callbacks.onTransport?.({ action: 'play' });
                this.render();
                break;
            case 'pause':
                this.state.status = 'PAUSED';
                this.callbacks.onTransport?.({ action: 'pause' });
                this.render();
                break;
            case 'stop':
                this.state.status = 'STOPPED';
                this.callbacks.onTransport?.({ action: 'stop' });
                this.render();
                break;
            case 'loop':
                this.state.isLooping = !this.state.isLooping;
                this.callbacks.onSettingsChange?.({ isLooping: this.state.isLooping });
                this.render();
                break;
        }
    }

    _handleInputChange(event) {
        const control = event.target.dataset.control;
        if (!control) return;

        let value = parseInt(event.target.value, 10);
        
        switch (control) {
            case 'bpm':
                this.state.bpm = value;
                this.callbacks.onSettingsChange?.({ bpm: this.state.bpm });
                break;
            case 'volume':
                this.state.volume = value;
                this.callbacks.onSettingsChange?.({ volume: this.state.volume });
                break;
        }
        logEvent('info', 'EditorPlaybackControlsView', '_handleInputChange', 'Events', `Setting changed: ${control}=${value}`);
        // No re-render needed as the input value is self-managed by the browser
    }

    destroy() {
        this.rootElement.removeEventListener('click', this._boundHandleClick);
        this.rootElement.removeEventListener('input', this._boundHandleInputChange);
        
        if (this.rootElement.parentElement) {
            this.rootElement.parentElement.removeChild(this.rootElement);
        }

        logEvent('info', 'EditorPlaybackControlsView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}