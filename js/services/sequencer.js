import { state, playback } from '../store.js';
import { audioEngine } from './audioEngine.js';
import { renderApp, updateVisualStep } from '../ui/renderer.js';

const playSectionStep = (section, measureIndex, stepIndex) => {
    const measure = section.measures[measureIndex];
    if (!measure) return;

    measure.tracks.forEach(track => {
        if (track.muted) return;
        if (stepIndex < track.strokes.length) {
            const stroke = track.strokes[stepIndex];
            audioEngine.playStroke(track.instrument, stroke, 0, track.volume);
        }
    });
};

export const tick = () => {
    const currentToque = state.toque;
    const currentId = playback.activeSectionId;

    let sectionIndex = currentToque.sections.findIndex(s => s.id === currentId);
    if (sectionIndex === -1) sectionIndex = 0;
    let activeSec = currentToque.sections[sectionIndex];

    let nextStep = playback.currentStep + 1;
    let nextMeasure = playback.currentMeasureIndex;
    const effectiveBpm = playback.currentPlayheadBpm;

    if (nextStep >= activeSec.steps) {
        // End of current measure - move to next measure or repeat
        nextMeasure += 1;

        if (nextMeasure >= activeSec.measures.length) {
            // End of all measures - check repetitions
            if (playback.repetitionCounter < (activeSec.repetitions || 1)) {
                playback.repetitionCounter += 1;
                nextStep = 0;
                nextMeasure = 0;
                if (activeSec.tempoAcceleration && activeSec.tempoAcceleration !== 0) {
                    const multiplier = 1 + (activeSec.tempoAcceleration / 100);
                    playback.currentPlayheadBpm = playback.currentPlayheadBpm * multiplier;
                }
                const repEl = document.getElementById('header-rep-count');
                if (repEl) repEl.innerText = playback.repetitionCounter;
                playSectionStep(activeSec, 0, 0);
            } else {
                // Next Section
                const nextIndex = (sectionIndex + 1) % currentToque.sections.length;
                const nextSection = currentToque.sections[nextIndex];

                // Switch Active Section
                state.activeSectionId = nextSection.id;
                playback.activeSectionId = nextSection.id;
                playback.repetitionCounter = 1;
                playback.currentMeasureIndex = 0;
                renderApp(); // Visual Update for Section Switch

                nextStep = 0;
                nextMeasure = 0;
                activeSec = nextSection;
                if (nextSection.bpm !== undefined) {
                    playback.currentPlayheadBpm = nextSection.bpm;
                }
                playSectionStep(activeSec, 0, 0);
            }
        } else {
            // Move to next measure in same section
            nextStep = 0;
            playSectionStep(activeSec, nextMeasure, 0);
        }
    } else {
        playSectionStep(activeSec, nextMeasure, nextStep);
    }

    playback.currentStep = nextStep;
    playback.currentMeasureIndex = nextMeasure;
    state.currentStep = nextStep;

    updateVisualStep(nextStep, nextMeasure);

    // Auto-scroll to current measure
    scrollToMeasure(nextMeasure);

    const stepsPerBeat = activeSec.subdivision || 4;
    const secondsPerBeat = 60.0 / effectiveBpm;
    const intervalMs = (secondsPerBeat / stepsPerBeat) * 1000;
    playback.timeoutId = setTimeout(tick, intervalMs);
};

// Scroll the current measure to the center of the viewport
const scrollToMeasure = (measureIndex) => {
    const scrollContainer = document.getElementById('tubs-scroll-container');
    if (!scrollContainer) return;

    const measureElement = document.querySelector(`[data-measure-index="${measureIndex}"]`);
    if (!measureElement) return;

    // Calculate position to center the measure
    const containerHeight = scrollContainer.clientHeight;
    const measureTop = measureElement.offsetTop;
    const measureHeight = measureElement.offsetHeight;

    // Scroll to center the measure
    const scrollTo = measureTop - (containerHeight / 2) + (measureHeight / 2);

    scrollContainer.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
    });
};

export const stopPlayback = () => {
    state.isPlaying = false;
    clearTimeout(playback.timeoutId);
    playback.currentStep = -1;
    playback.currentMeasureIndex = 0;
    state.currentStep = -1;
    playback.repetitionCounter = 1;

    if (state.toque && state.toque.sections && state.toque.sections.length > 0) {
        const first = state.toque.sections[0];
        state.activeSectionId = first.id;
        playback.activeSectionId = first.id;
        playback.currentPlayheadBpm = first.bpm ?? state.toque.globalBpm;
    }
    renderApp();
};

export const togglePlay = () => {
    if (state.isPlaying) {
        state.isPlaying = false;
        clearTimeout(playback.timeoutId);
        renderApp();
    } else {
        state.isPlaying = true;
        audioEngine.resume();
        renderApp();
        tick();
    }
};