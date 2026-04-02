import Phaser from "phaser";

export default class MusicManager {
  constructor(scene, trackKeys = [], config = {}) {
    this.scene = scene;
    this.trackKeys = [...trackKeys];

    this.currentSound = null;
    this.currentTrackKey = null;

    this.volume = config.volume ?? 0.4;
    this.isStarted = false;
  }

  start() {
    if (this.isStarted) {
      return;
    }

    if (!this.trackKeys.length) {
      console.warn("MusicManager: no tracks provided.");
      return;
    }

    this.isStarted = true;
    this.playNextRandomTrack();
  }

  playNextRandomTrack() {
    const nextTrackKey = this.getNextRandomTrackKey();

    if (!nextTrackKey) {
      console.warn("MusicManager: could not find a next track.");
      return;
    }

    this.stopCurrentTrack();

    this.currentTrackKey = nextTrackKey;
    this.currentSound = this.scene.sound.add(nextTrackKey, {
      volume: this.volume
    });

    this.currentSound.once("complete", this.handleTrackComplete, this);
    this.currentSound.play();

    console.log(`Now playing: ${nextTrackKey}`);
  }

  handleTrackComplete() {
    this.playNextRandomTrack();
  }

  getNextRandomTrackKey() {
    if (this.trackKeys.length === 0) {
      return null;
    }

    if (this.trackKeys.length === 1) {
      return this.trackKeys[0];
    }

    const availableTracks = this.trackKeys.filter(
      (key) => key !== this.currentTrackKey
    );

    const randomIndex = Phaser.Math.Between(0, availableTracks.length - 1);
    return availableTracks[randomIndex];
  }

  stopCurrentTrack() {
    if (!this.currentSound) {
      return;
    }

    this.currentSound.off("complete", this.handleTrackComplete, this);
    this.currentSound.stop();
    this.currentSound.destroy();
    this.currentSound = null;
  }

  stop() {
    this.isStarted = false;
    this.stopCurrentTrack();
    this.currentTrackKey = null;
  }

  setVolume(volume) {
    this.volume = Phaser.Math.Clamp(volume, 0, 1);

    if (this.currentSound) {
      this.currentSound.setVolume(this.volume);
    }
  }

  destroy() {
    this.stop();
  }
}