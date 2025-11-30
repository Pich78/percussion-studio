// file: src/js/app.js

// Main application logic
function initializeApp() {
    console.log('Initializing App...');

    // Safety check
    if (typeof AudioPlayer === 'undefined' || typeof AudioScheduler === 'undefined' || typeof SoundGenerator === 'undefined') {
        console.warn('Dependencies not ready. Retrying...');
        setTimeout(initializeApp, 100);
        return;
    }

    // DOM elements
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const bpmSlider = document.getElementById('bpmSlider');
    const bpmValue = document.getElementById('bpmValue');
    const statusMessage = document.getElementById('statusMessage');
    const beatBars = document.querySelectorAll('.beat-bar');

    // Initialize audio components
    const audioPlayer = new AudioPlayer();
    const scheduler = new AudioScheduler(audioPlayer);

    // UI Callbacks
    scheduler.onUpdateCallback = (tickInMeasure, measure) => {
        // Update beat indicator (visualize 4 beats per measure)
        // Assuming 16th note resolution, a beat is every 4 ticks
        const currentBeat = Math.floor(tickInMeasure / 4);

        beatBars.forEach((bar, index) => {
            if (index === currentBeat) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    };

    scheduler.onPlaybackEndedCallback = () => {
        statusMessage.textContent = 'Playback ended';
        beatBars.forEach(bar => bar.classList.remove('active'));
    };

    // Generate Sounds
    const kickUrl = SoundGenerator.generateKickWAV(0.2);
    const snareUrl = SoundGenerator.generateSnareWAV(0.15);
    const highPitchUrl = SoundGenerator.generateBeepWAV(880, 0.05);

    // Rhythm Data
    const rhythmData = {
        global_bpm: 120,
        sound_kit: { KCK: {}, SNR: {}, HIH: {} },
        patterns: {
            main_pattern: {
                metadata: { resolution: 16, metric: '4/4' },
                pattern_data: [{
                    KCK: 'x---x---x---x---',
                    SNR: '----x-------x---',
                    HIH: 'x-x-x-x-x-x-x-x-'
                }]
            }
        },
        playback_flow: [{ pattern: 'main_pattern', repetitions: 4 }] // 4 reps to have time to change BPM
    };

    const soundList = [
        { id: 'KCK_x', path: kickUrl },
        { id: 'SNR_x', path: snareUrl },
        { id: 'HIH_x', path: highPitchUrl }
    ];

    // Initialization Sequence
    async function initializeAudio() {
        try {
            statusMessage.textContent = 'Generating & Loading sounds...';
            await audioPlayer.loadSounds(soundList);
            scheduler.setRhythm(rhythmData);

            // Sync slider to data
            bpmSlider.value = rhythmData.global_bpm;
            bpmValue.textContent = rhythmData.global_bpm;

            statusMessage.textContent = 'Ready';
        } catch (error) {
            statusMessage.textContent = `Error: ${error.message}`;
            console.error(error);
        }
    }

    // Controls
    playBtn.addEventListener('click', () => {
        scheduler.play();
        statusMessage.textContent = `Playing at ${scheduler.bpm} BPM`;
    });

    pauseBtn.addEventListener('click', () => {
        scheduler.pause();
        statusMessage.textContent = 'Paused';
    });

    stopBtn.addEventListener('click', () => {
        scheduler.stop();
        statusMessage.textContent = 'Stopped';
        beatBars.forEach(bar => bar.classList.remove('active'));
    });

    // Real-time BPM Slider
    bpmSlider.addEventListener('input', (e) => {
        const newBPM = parseInt(e.target.value, 10);

        // Update UI
        bpmValue.textContent = newBPM;

        // Update Logic
        scheduler.setBPM(newBPM);

        if (scheduler.isPlaying) {
            statusMessage.textContent = `Playing at ${newBPM} BPM`;
        } else {
            statusMessage.textContent = `BPM set to ${newBPM}`;
        }
    });

    initializeAudio();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}