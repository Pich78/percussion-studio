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
 * Play a synthesized click sound at a specific time.
 * Uses a short sine wave burst for a clean metronome sound.
 * @param {number} time - Absolute AudioContext time to play
 * @param {boolean} isAccent - If true, plays louder/higher pitch (first beat)
 */
const playCountInClick = (time, isAccent = false) => {
    const ctx = audioEngine.ctx;
    if (!ctx) return;

    // Create oscillator for click tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Accent beat is higher pitch and louder
    osc.frequency.value = isAccent ? 1200 : 800;
    osc.type = 'sine';

    // Very short envelope for a "click" sound
    const clickDuration = 0.03;
    gain.gain.setValueAtTime(isAccent ? 0.5 : 0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + clickDuration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + clickDuration);
};

/**
 * Get the number of count-in beats based on the first section's subdivision.
 * @returns {number} 4 for 4/4 time, 6 for 6/8 or 12/8 time
 */
const getCountInBeats = () => {
    const section = state.toque.sections[0];
    const subdivision = section?.subdivision || 4;
    // 3 = triplet feel (6/8, 12/8) → 6 beats (two groups of 3)
    // 4 = straight feel (4/4) → 4 beats
    return subdivision === 3 ? 6 : 4;
};

/**
 * Get the duration of one count-in beat (one quarter note)
 * @param {number} bpm - Current BPM
 * @param {number} subdivision - Steps per beat
 * @returns {number} Beat duration in seconds
 */
const getCountInBeatDuration = (bpm, subdivision) => {
    // For subdivision 4: one beat = 4 steps
    // For subdivision 3: one beat = 3 steps (one "pulse" in 6/8)
    const stepDuration = getStepDuration(bpm, subdivision);
    return stepDuration * subdivision;
};

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
    playback.isCountingIn = false;
    playback.countInStep = 0;

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
        playback.isCountingIn = false;
        clearTimeout(playback.timeoutId);
        playback.timeoutId = null;
        renderApp();
    } else {
        // Play
        state.isPlaying = true;
        audioEngine.resume();

        // Initialize timing - start scheduling from "now"
        // Add a small buffer to ensure first note isn't in the past
        let startTime = audioEngine.getCurrentTime() + 0.05;

        // If stopped (step -1), start from beginning with count-in
        if (playback.currentStep < 0) {
            playback.currentStep = 0;
            playback.currentMeasureIndex = 0;
            state.currentStep = 0;

            // Schedule count-in if enabled
            if (state.countInEnabled) {
                const firstSection = state.toque.sections[0];
                const subdivision = firstSection?.subdivision || 4;
                const bpm = playback.currentPlayheadBpm || firstSection?.bpm || state.toque.globalBpm;
                const countInBeats = getCountInBeats();
                const beatDuration = getCountInBeatDuration(bpm, subdivision);

                // Update playback state for UI feedback
                playback.isCountingIn = true;
                playback.countInTotal = countInBeats;
                playback.countInStep = 0;

                // Schedule all count-in clicks
                let clickTime = startTime;
                for (let i = 0; i < countInBeats; i++) {
                    const isAccent = (subdivision === 3) ? (i % 3 === 0) : (i === 0);
                    playCountInClick(clickTime, isAccent);

                    // Schedule visual update for count-in beat
                    const beatIndex = i;
                    const timeUntilClick = (clickTime - audioEngine.getCurrentTime()) * 1000;
                    setTimeout(() => {
                        if (state.isPlaying && playback.isCountingIn) {
                            playback.countInStep = beatIndex + 1;
                            renderApp();
                        }
                    }, Math.max(0, timeUntilClick));

                    clickTime += beatDuration;
                }

                // Rhythm starts after count-in completes
                startTime = clickTime;

                // Schedule end of count-in phase
                const countInDuration = countInBeats * beatDuration * 1000;
                setTimeout(() => {
                    if (state.isPlaying) {
                        playback.isCountingIn = false;
                        playback.countInStep = 0;
                        renderApp();
                    }
                }, Math.max(0, countInDuration));
            }
        }

        playback.nextNoteTime = startTime;
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