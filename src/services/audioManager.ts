import Sound from 'react-native-sound';

Sound.setCategory('Playback');

export type EffectName = 'feed' | 'play' | 'sleep' | 'hit' | 'levelup';

// Filenames must exist in the NATIVE bundle:
//   Android: android/app/src/main/res/raw/<name>   (lowercase + underscores)
//   iOS:     added to the Xcode target's "Copy Bundle Resources"
const EFFECT_FILES: Record<EffectName, string> = {
  feed: 'sfx_feed.mp3',
  play: 'sfx_play.mp3',
  sleep: 'sfx_sleep.mp3',
  hit: 'sfx_hit.mp3',
  levelup: 'sfx_levelup.mp3',
};

const MAX_EFFECT_MS = 5000; // effects are cut off after 5s; only music loops.

class AudioManager {
  private bgMusic: Sound | null = null;
  private musicPlaying = false;
  private effects: Partial<Record<EffectName, Sound>> = {};
  private effectTimers: Partial<Record<EffectName, ReturnType<typeof setTimeout>>> =
    {};

  startMusic() {
    if (this.bgMusic) {
      return;
    }

    this.musicPlaying = true;
    this.bgMusic = new Sound('bg_music.mp3', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('Failed to load music', error);
        return;
      }

      this.bgMusic?.setNumberOfLoops(-1); // infinite
      // Music sits lower so the (maxed) effects come through louder.
      this.bgMusic?.setVolume(0.2);
      this.playMusicLoop();
    });
  }

  // setNumberOfLoops(-1) is unreliable on some Android builds, so we also
  // restart from the beginning whenever playback finishes on its own.
  private playMusicLoop() {
    this.bgMusic?.play(success => {
      if (success && this.musicPlaying && this.bgMusic) {
        this.bgMusic.setCurrentTime(0);
        this.playMusicLoop();
      }
    });
  }

  stopMusic() {
    this.musicPlaying = false;
    this.bgMusic?.stop();
    this.bgMusic?.release();
    this.bgMusic = null;
  }

  /** Load all effect clips once (e.g. on screen mount) so playback is instant. */
  preloadEffects() {
    (Object.keys(EFFECT_FILES) as EffectName[]).forEach(name => {
      if (this.effects[name]) {
        return;
      }
      const sound = new Sound(EFFECT_FILES[name], Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log(`Failed to load effect "${name}"`, error);
        }
      });
      this.effects[name] = sound;
    });
  }

  /**
   * Play a one-shot effect (restarting if already playing). The clip is forced
   * to stop after MAX_EFFECT_MS so long files never play in full — only the
   * background music is allowed to loop.
   */
  playEffect(name: EffectName) {
    const sound = this.effects[name];
    if (!sound) {
      return;
    }

    const existingTimer = this.effectTimers[name];
    if (existingTimer) {
      clearTimeout(existingTimer);
      delete this.effectTimers[name];
    }

    sound.stop(() => {
      sound.setVolume(1.0);
      sound.play();
      this.effectTimers[name] = setTimeout(() => {
        sound.stop();
        delete this.effectTimers[name];
      }, MAX_EFFECT_MS);
    });
  }

  /** Release everything (call on unmount). */
  release() {
    this.stopMusic();
    (Object.keys(this.effectTimers) as EffectName[]).forEach(name => {
      const timer = this.effectTimers[name];
      if (timer) {
        clearTimeout(timer);
      }
    });
    this.effectTimers = {};
    (Object.keys(this.effects) as EffectName[]).forEach(name => {
      this.effects[name]?.release();
    });
    this.effects = {};
  }
}

export default new AudioManager();
