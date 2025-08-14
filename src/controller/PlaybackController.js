// file: src/controller/PlaybackController.js

export class PlaybackController {
    constructor(audioScheduler, audioPlayer) {
        this.audioScheduler = audioScheduler;
        this.audioPlayer = audioPlayer;
    }

    play() {
        this.audioScheduler.play();
    }

    pause() {
        this.audioScheduler.pause();
    }

    stop() {
        this.audioScheduler.stop();
    }

    toggleLoop(isEnabled) {
        this.audioScheduler.loop = isEnabled;
    }

    setMasterVolume(volume) {
        this.audioPlayer.setMasterVolume(volume);
    }
}