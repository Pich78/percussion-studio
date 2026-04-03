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
 * 
 * REFACTORED: State mutations flow through commit(), advanceStep() is pure,
 * DOM manipulation removed (renderer handles all visual updates).
 */

import { state, playback, commit } from '../store.js';
import { audioEngine } from './audioEngine.js';
import { eventBus } from './eventBus.js';
import { trackMixer } from './trackMixer.js';

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
 * Handles per-track subdivision by mapping global step to track step
 */
const scheduleStep = (section, measureIndex, stepIndex, time) => {
    const measure = section.measures[measureIndex];
    if (!measure) return;

    const soloTrack = trackMixer.getSoloTrack();

    measure.tracks.forEach((track, trackIdx) => {
        // Check mute state using trackMixer
        if (trackMixer.isTrackMuted(trackIdx, track)) return;

        // If there's a solo track, only the soloed track plays
        if (soloTrack !== undefined && soloTrack !== null && soloTrack !== trackIdx) return;

        // Always use full resolution for playback
        // The track.trackSteps property is now strictly visual
        const trackStepIndex = stepIndex;
        const isFirstStepOfTrackStep = true;

        if (isFirstStepOfTrackStep && trackStepIndex < track.strokes.length) {
            const stroke = track.strokes[trackStepIndex];
            const dynamic = track.dynamics ? track.dynamics[trackStepIndex] : '-';
            // Schedule at the EXACT time (not "now")
            audioEngine.playStroke(track.instrument, stroke, time, track.volume, dynamic);
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
 * Resolve effective repetition count for a section.
 * Handles skip, playMode, and randomRepetitions.
 * @param {object} section - Section object
 * @returns {number} Resolved repetition count (0 = skip, 1+ = play N times)
 */
const resolveEffectiveRepetitions = (section) => {
    const playMode = section.playMode || 'loop';
    const reps = section.repetitions || 1;
    
    // Skip: never play
    if (section.skip) {
        return 0;
    }
    
    // Adlib: repeat forever (return special marker)
    if (playMode === 'adlib') {
        return -1; // Special marker for infinite
    }
    
    // Once: play once, then skip for rest of session
    if (playMode === 'once') {
        if (section._playedOnce) {
            return 0; // Already played, skip
        }
        return 1;
    }
    
    // Loop mode (default): use repetitions value
    if (section.randomRepetitions && reps > 1) {
        return Math.floor(Math.random() * reps) + 1;
    }
    return reps;
};

/**
 * PURE FUNCTION: Compute the next step, handling measure/section transitions.
 * Does NOT mutate any state — returns a result object.
 * 
 * @param {object} toque - The current toque (rhythm) data
 * @param {object} pb - Snapshot of current playback state
 * @returns {object} Next state: { nextStep, nextMeasure, nextSectionId, nextBpm, 
 *                    nextRepetition, nextEffectiveRepetitions, sectionChanged, activeSec, tempoAccelerated }
 */
const computeNextStep = (toque, pb) => {
    let sectionIndex = toque.sections.findIndex(s => s.id === pb.activeSectionId);
    if (sectionIndex === -1) sectionIndex = 0;
    let activeSec = toque.sections[sectionIndex];

    let nextStep = pb.currentStep + 1;
    let nextMeasure = pb.currentMeasureIndex;
    let nextSectionId = pb.activeSectionId;
    let nextBpm = pb.currentPlayheadBpm;
    let nextRepetition = pb.repetitionCounter;
    let nextEffectiveRepetitions = pb.effectiveRepetitions;
    let sectionChanged = false;
    let tempoAccelerated = false;

    // Resolve effective repetitions if not yet set (first entry into section)
    if (nextEffectiveRepetitions == null) {
        nextEffectiveRepetitions = resolveEffectiveRepetitions(activeSec);
    }

    if (nextStep >= activeSec.steps) {
        // End of current measure - move to next measure or repeat
        nextMeasure += 1;

        if (nextMeasure >= activeSec.measures.length) {
            // End of all measures - check repetitions against effective count
            // Adlib (-1) means infinite, always repeat
            if (nextEffectiveRepetitions === -1 || nextRepetition < nextEffectiveRepetitions) {
                nextRepetition += 1;
                nextStep = 0;
                nextMeasure = 0;

                // Apply tempo acceleration
                if (activeSec.tempoAcceleration && activeSec.tempoAcceleration !== 0) {
                    const multiplier = 1 + (activeSec.tempoAcceleration / 100);
                    nextBpm = nextBpm * multiplier;
                    tempoAccelerated = true;
                }
            } else {
                // Next Section - check if current section was "play once"
                if (activeSec.playMode === 'once' && nextEffectiveRepetitions > 0) {
                    activeSec._playedOnce = true;
                }
                
                const nextIndex = (sectionIndex + 1) % toque.sections.length;
                const nextSection = toque.sections[nextIndex];

                nextSectionId = nextSection.id;
                nextRepetition = 1;
                nextMeasure = 0;
                nextStep = 0;
                activeSec = nextSection;
                sectionChanged = true;

                // Resolve effective repetitions for the new section
                nextEffectiveRepetitions = resolveEffectiveRepetitions(nextSection);

                // If new section should be skipped (0 reps), find next available section
                if (nextEffectiveRepetitions === 0) {
                    let searchIndex = nextIndex;
                    let attempts = 0;
                    while (attempts < toque.sections.length) {
                        searchIndex = (searchIndex + 1) % toque.sections.length;
                        const checkSection = toque.sections[searchIndex];
                        const checkReps = resolveEffectiveRepetitions(checkSection);
                        if (checkReps !== 0) {
                            // Found a playable section
                            nextIndex = searchIndex;
                            nextSection = checkSection;
                            nextSectionId = nextSection.id;
                            activeSec = nextSection;
                            nextEffectiveRepetitions = checkReps;
                            break;
                        }
                        attempts++;
                    }
                }

                if (nextSection.bpm !== undefined) {
                    nextBpm = nextSection.bpm;
                }
            }
        } else {
            // Move to next measure in same section
            nextStep = 0;
        }
    }

    return {
        nextStep, nextMeasure, nextSectionId, nextBpm,
        nextRepetition, nextEffectiveRepetitions, sectionChanged, activeSec, tempoAccelerated
    };
};

/**
 * Apply the computed step result to the mutable playback state.
 * Separated from computation to keep advanceStep pure.
 * @param {object} result - Output of computeNextStep()
 */
const applyStepResult = (result) => {
    playback.currentStep = result.nextStep;
    playback.currentMeasureIndex = result.nextMeasure;
    playback.currentPlayheadBpm = result.nextBpm;
    playback.repetitionCounter = result.nextRepetition;
    playback.effectiveRepetitions = result.nextEffectiveRepetitions;
    commit('setCurrentStep', { step: result.nextStep });

    if (result.sectionChanged) {
        commit('setActiveSectionId', { id: result.nextSectionId });
        playback.activeSectionId = result.nextSectionId;
        playback.currentMeasureIndex = 0;
        playback.effectiveRepetitions = null;
    }
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
        const repToShow = playback.repetitionCounter;
        const timeUntilNote = (playback.nextNoteTime - currentTime) * 1000;

        setTimeout(() => {
            if (state.isPlaying) {
                eventBus.emit('step', { step: stepToShow, measure: measureToShow, rep: repToShow });
            }
        }, Math.max(0, timeUntilNote));

        // Advance to next step (pure computation + apply)
        const result = computeNextStep(currentToque, playback);
        applyStepResult(result);
        activeSec = result.activeSec;

        // If section changed, schedule a re-render
        if (result.sectionChanged) {
            setTimeout(() => {
                if (state.isPlaying) eventBus.emit('render');
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
    clearTimeout(playback.timeoutId);
    playback.timeoutId = null;
    playback.currentStep = -1;
    playback.currentMeasureIndex = 0;
    playback.repetitionCounter = 1;
    playback.effectiveRepetitions = null;
    playback.nextNoteTime = 0;
    playback.isCountingIn = false;
    playback.countInStep = 0;

    // Reset _playedOnce on all sections
    if (state.toque && state.toque.sections) {
        state.toque.sections.forEach(s => {
            if (s._playedOnce) s._playedOnce = false;
        });
    }

    if (state.toque && state.toque.sections && state.toque.sections.length > 0) {
        const first = state.toque.sections[0];
        commit('resetPlayback', { sectionId: first.id });
        playback.activeSectionId = first.id;
        playback.currentPlayheadBpm = first.bpm ?? state.toque.globalBpm;
    } else {
        commit('setPlaying', { isPlaying: false });
        commit('setCurrentStep', { step: -1 });
    }
    eventBus.emit('render');
};

/**
 * Toggle play/pause
 */
export const togglePlay = () => {
    if (state.isPlaying) {
        // Pause
        commit('setPlaying', { isPlaying: false });
        playback.isCountingIn = false;
        clearTimeout(playback.timeoutId);
        playback.timeoutId = null;
        eventBus.emit('render');
    } else {
        // Play
        commit('setPlaying', { isPlaying: true });
        audioEngine.resume();

        // Initialize timing - start scheduling from "now"
        // Add a small buffer to ensure first note isn't in the past
        let startTime = audioEngine.getCurrentTime() + 0.05;

        // If stopped (step -1), start from beginning with count-in
        if (playback.currentStep < 0) {
            playback.currentStep = 0;
            playback.currentMeasureIndex = 0;
            // Resolve effective repetitions for the starting section
            const startSection = state.toque.sections.find(s => s.id === playback.activeSectionId) || state.toque.sections[0];
            playback.effectiveRepetitions = resolveEffectiveRepetitions(startSection);
            // Don't set state.currentStep yet - scheduler will update it when the first note plays
            // This prevents the highlight from appearing before the music starts

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
                            eventBus.emit('render');
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
                        eventBus.emit('render');
                    }
                }, Math.max(0, countInDuration));
            }
        }

        playback.nextNoteTime = startTime;
        eventBus.emit('render');
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