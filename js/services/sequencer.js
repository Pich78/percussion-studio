/**
 * js/services/sequencer.js
 * 
 * PRECISION SCHEDULER using Web Audio API timing.
 * Implements look-ahead scheduling pattern for sample-accurate playback.
 * 
 * Key concepts:
 * - scheduleAheadTime: How far ahead to schedule notes (100ms)
 * - lookahead: How often to check for notes to schedule (25ms)
 * - Notes are scheduled using audioContext.currentTime (sample-accurate)
 * - setTimeout only controls WHEN to check, not WHEN to play
 */

import { state, playback } from '../store.js';
import { audioEngine } from './audioEngine.js';
import { renderApp, updateVisualStep, scrollToMeasure } from '../ui/renderer.js';

// Scheduling constants
const SCHEDULE_AHEAD_TIME = 0.1;  // Schedule notes 100ms ahead (seconds)
const LOOKAHEAD = 25.0;           // Check every 25ms (milliseconds)

/**
 * Schedule all sounds for the current step at the specified time
 */
const scheduleStep = (section, measureIndex, stepIndex, time) => {
    const measure = section.measures[measureIndex];
    if (!measure) return;

    measure.tracks.forEach(track => {
        if (track.muted || track.volume === 0) return;
        if (stepIndex < track.strokes.length) {
            const stroke = track.strokes[stepIndex];
            // Schedule at the EXACT time (not "now")
            audioEngine.playStroke(track.instrument, stroke, time, track.volume);
        }
    });
};

/**
 * Calculate the duration of one step at the current BPM
 * @param {number} bpm - Current BPM
 * @param {number} subdivision - Steps per beat (4 for 16ths in 4/4, 3 for triplets)
 * @returns {number} Step duration in seconds
 */
const getStepDuration = (bpm, subdivision) => {
    const secondsPerBeat = 60.0 / bpm;
    return secondsPerBeat / subdivision;
};

/**
 * Advance to the next step, handling measure/section transitions
 * Returns the new step duration for timing calculations
 */
const advanceStep = () => {
    const currentToque = state.toque;
    const currentId = playback.activeSectionId;

    let sectionIndex = currentToque.sections.findIndex(s => s.id === currentId);
    if (sectionIndex === -1) sectionIndex = 0;
    let activeSec = currentToque.sections[sectionIndex];

    let nextStep = playback.currentStep + 1;
    let nextMeasure = playback.currentMeasureIndex;
    let sectionChanged = false;

    if (nextStep >= activeSec.steps) {
        // End of current measure - move to next measure or repeat
        nextMeasure += 1;

        if (nextMeasure >= activeSec.measures.length) {
            // End of all measures - check repetitions
            if (playback.repetitionCounter < (activeSec.repetitions || 1)) {
                playback.repetitionCounter += 1;
                nextStep = 0;
                nextMeasure = 0;

                // Apply tempo acceleration
                if (activeSec.tempoAcceleration && activeSec.tempoAcceleration !== 0) {
                    const multiplier = 1 + (activeSec.tempoAcceleration / 100);
                    playback.currentPlayheadBpm = playback.currentPlayheadBpm * multiplier;
                }

                // Update UI elements
                const repEl = document.getElementById('header-rep-count');
                if (repEl) repEl.innerText = playback.repetitionCounter;
                const liveBpmEl = document.getElementById('header-live-bpm');
                if (liveBpmEl) liveBpmEl.innerText = Math.round(playback.currentPlayheadBpm);
            } else {
                // Next Section
                const nextIndex = (sectionIndex + 1) % currentToque.sections.length;
                const nextSection = currentToque.sections[nextIndex];

                // Switch Active Section
                state.activeSectionId = nextSection.id;
                playback.activeSectionId = nextSection.id;
                playback.repetitionCounter = 1;
                playback.currentMeasureIndex = 0;

                if (nextSection.bpm !== undefined) {
                    playback.currentPlayheadBpm = nextSection.bpm;
                }

                nextStep = 0;
                nextMeasure = 0;
                activeSec = nextSection;
                sectionChanged = true;
            }
        } else {
            // Move to next measure in same section
            nextStep = 0;
        }
    }

    playback.currentStep = nextStep;
    playback.currentMeasureIndex = nextMeasure;
    state.currentStep = nextStep;

    return { activeSec, nextStep, nextMeasure, sectionChanged };
};

/**
 * Main scheduler loop - the heart of precision timing.
 * 
 * This runs via setTimeout but does NOT trigger sounds directly.
 * Instead, it schedules sounds ahead of time using audioContext.currentTime.
 */
const scheduler = () => {
    if (!state.isPlaying) return;

    const currentTime = audioEngine.getCurrentTime();
    const currentToque = state.toque;

    let sectionIndex = currentToque.sections.findIndex(s => s.id === playback.activeSectionId);
    if (sectionIndex === -1) sectionIndex = 0;
    let activeSec = currentToque.sections[sectionIndex];

    // Schedule all notes that fall within the look-ahead window
    while (playback.nextNoteTime < currentTime + SCHEDULE_AHEAD_TIME) {
        // Schedule the current step
        scheduleStep(
            activeSec,
            playback.currentMeasureIndex,
            playback.currentStep,
            playback.nextNoteTime
        );

        // Calculate step duration based on CURRENT BPM (allows real-time changes)
        const stepsPerBeat = activeSec.subdivision || 4;
        const stepDuration = getStepDuration(playback.currentPlayheadBpm, stepsPerBeat);

        // Queue visual update (will fire at approximately the right time)
        // We use setTimeout here because visual updates don't need sample accuracy
        const stepToShow = playback.currentStep;
        const measureToShow = playback.currentMeasureIndex;
        const timeUntilNote = (playback.nextNoteTime - currentTime) * 1000;

        setTimeout(() => {
            if (state.isPlaying) {
                updateVisualStep(stepToShow, measureToShow);
                scrollToMeasure(measureToShow);
            }
        }, Math.max(0, timeUntilNote));

        // Advance to next step
        const advanceResult = advanceStep();
        activeSec = advanceResult.activeSec;

        // If section changed, we need to re-render
        if (advanceResult.sectionChanged) {
            setTimeout(() => {
                if (state.isPlaying) renderApp();
            }, Math.max(0, timeUntilNote));
        }

        // Advance the note time
        playback.nextNoteTime += stepDuration;
    }

    // Schedule next check
    playback.timeoutId = setTimeout(scheduler, LOOKAHEAD);
};

/**
 * Stop playback and reset state
 */
export const stopPlayback = () => {
    state.isPlaying = false;
    clearTimeout(playback.timeoutId);
    playback.timeoutId = null;
    playback.currentStep = -1;
    playback.currentMeasureIndex = 0;
    state.currentStep = -1;
    playback.repetitionCounter = 1;
    playback.nextNoteTime = 0;

    if (state.toque && state.toque.sections && state.toque.sections.length > 0) {
        const first = state.toque.sections[0];
        state.activeSectionId = first.id;
        playback.activeSectionId = first.id;
        playback.currentPlayheadBpm = first.bpm ?? state.toque.globalBpm;
    }
    renderApp();
};

/**
 * Toggle play/pause
 */
export const togglePlay = () => {
    if (state.isPlaying) {
        // Pause
        state.isPlaying = false;
        clearTimeout(playback.timeoutId);
        playback.timeoutId = null;
        renderApp();
    } else {
        // Play
        state.isPlaying = true;
        audioEngine.resume();

        // Initialize timing - start scheduling from "now"
        // Add a small buffer to ensure first note isn't in the past
        playback.nextNoteTime = audioEngine.getCurrentTime() + 0.05;

        // If stopped (step -1), start from beginning
        if (playback.currentStep < 0) {
            playback.currentStep = 0;
            playback.currentMeasureIndex = 0;
            state.currentStep = 0;
        }

        renderApp();
        scheduler();
    }
};

/**
 * Set BPM in real-time (affects next scheduled note)
 * @param {number} bpm - New BPM value
 */
export const setPlaybackBpm = (bpm) => {
    playback.currentPlayheadBpm = bpm;
    // No need to rebuild anything - next scheduler() call will use new BPM
};