// Web Audio API Synthesizer - 100% Offline, Zero-Latency, Pure Native Audio

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicInterval = null;
    this.musicStep = 0;

    // Load persisted preferences
    const storedSound = localStorage.getItem('bubble_sound_enabled');
    const storedMusic = localStorage.getItem('bubble_music_enabled');
    if (storedSound !== null) this.soundEnabled = storedSound === 'true';
    if (storedMusic !== null) this.musicEnabled = storedMusic === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.soundEnabled ? 0.35 : 0, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.15 : 0, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    localStorage.setItem('bubble_sound_enabled', enabled ? 'true' : 'false');
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(enabled ? 0.35 : 0, this.ctx.currentTime);
    }
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    localStorage.setItem('bubble_music_enabled', enabled ? 'true' : 'false');
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(enabled ? 0.15 : 0, this.ctx.currentTime);
    }
    if (!enabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  // --- SOUND EFFECTS ---
  playTone(freq, duration, type = 'sine', slideTo = null, gainMult = 1) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
      }

      gain.gain.setValueAtTime(0.3 * gainMult, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Audio context error safeguard
    }
  }

  playButtonClick() {
    this.playTone(600, 0.08, 'triangle', 400);
  }

  playSwap() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.playTone(480, 0.1, 'sine', 840, 0.7);
    setTimeout(() => {
      this.playTone(840, 0.08, 'triangle', 1050, 0.5);
    }, 40);
  }

  playBubbleSelect() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.playTone(520, 0.1, 'sine', 740, 0.7);
  }

  playAim() {
    this.playTone(320, 0.05, 'sine', 340, 0.2);
  }

  playLaunch() {
    this.playTone(280, 0.18, 'sine', 750, 0.8);
  }

  playCollision() {
    this.playTone(180, 0.1, 'triangle', 90, 0.6);
  }

  playPop(combo = 1) {
    const pitch = Math.min(1200, 420 + combo * 100);
    this.playTone(pitch, 0.14, 'sine', pitch * 1.5, 0.9);
  }

  playMultiPop(count = 3) {
    for (let i = 0; i < Math.min(count, 5); i++) {
      setTimeout(() => {
        this.playPop(i + 1);
      }, i * 45);
    }
  }

  playFallingBubble() {
    this.playTone(450, 0.25, 'triangle', 120, 0.5);
  }

  playCombo(comboLevel) {
    const baseFreq = 523.25; // C5
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 1.8];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.12, 'sine', null, 0.7);
      }, idx * 60);
    });
  }

  playBooster() {
    this.playTone(350, 0.3, 'sawtooth', 880, 0.4);
  }

  playBomb() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    // Low rumble boom
    this.playTone(150, 0.4, 'triangle', 40, 1.2);
  }

  playRainbow() {
    const freqs = [440, 554, 659, 880, 1108];
    freqs.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.12, 'sine', null, 0.6), i * 50);
    });
  }

  playRescue() {
    const notes = [587, 740, 880, 1175];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.2, 'sine', f * 1.1, 0.8), i * 70);
    });
  }

  playStarAward(starIndex = 1) {
    const starNotes = [523.25, 659.25, 783.99]; // C, E, G
    const freq = starNotes[starIndex - 1] || 880;
    this.playTone(freq, 0.3, 'triangle', freq * 1.2, 0.9);
  }

  playLevelComplete() {
    const fanfare = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C
    fanfare.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.35, 'triangle', null, 0.9), i * 110);
    });
  }

  playLevelFailed() {
    const failNotes = [400, 360, 320, 260];
    failNotes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.28, 'sawtooth', f * 0.8, 0.5), i * 120);
    });
  }

  playHighScore() {
    const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    arpeggio.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.22, 'sine', null, 0.8), i * 65);
    });
  }

  // --- BACKGROUND MUSIC GENERATOR ---
  startMusic() {
    if (!this.musicEnabled) return;
    this.init();
    if (this.musicInterval) return;

    // Upbeat, gentle pentatonic arpeggio sequence
    const chords = [
      [261.63, 329.63, 392.00], // C
      [293.66, 349.23, 440.00], // Dm
      [329.63, 392.00, 493.88], // Em
      [349.23, 440.00, 523.25]  // F
    ];

    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;
      try {
        const chordIndex = Math.floor(this.musicStep / 4) % chords.length;
        const noteIndex = this.musicStep % 3;
        const noteFreq = chords[chordIndex][noteIndex] * (this.musicStep % 8 === 0 ? 1 : 2);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 0.3);

        this.musicStep = (this.musicStep + 1) % 16;
      } catch (e) {}
    }, 380);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
