// Web Audio API Synthesizer for Aviator 100x Game
// Specially engineered and optimized for mobile devices (iOS Safari, Android Chrome) and desktop

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private flightOscillator: OscillatorNode | null = null;
  private flightOscillator2: OscillatorNode | null = null;
  private flightOscillator3: OscillatorNode | null = null;
  private flightGain: GainNode | null = null;
  private musicInterval: any = null;

  constructor() {
    // Automatically attach mobile touch and pointer unlock listeners
    if (typeof window !== 'undefined') {
      const unlockEvents = ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'];
      const handleUserGesture = () => {
        this.unlock();
      };
      unlockEvents.forEach((ev) => {
        window.addEventListener(ev, handleUserGesture, { passive: true });
        document.addEventListener(ev, handleUserGesture, { passive: true });
      });
    }
  }

  /**
   * Initialize AudioContext with webkit fallback
   */
  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn('AudioContext not supported in this browser:', e);
    }
  }

  /**
   * Unlock Web Audio API on iOS and Android devices.
   * Required due to mobile browser autoplay policy.
   */
  unlock(): boolean {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.isUnlocked) {
      try {
        // Create a 1-sample silent buffer to unlock iOS Safari WebKit audio pipeline
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
        this.isUnlocked = true;
      } catch (e) {
        // Fallback or already unlocked
      }
    }

    return true;
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled && (this.flightOscillator || this.flightGain)) {
      this.stopFlightSound();
    }
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  /**
   * Instant feedback confirmation chime when user taps the Sound toggle on their phone
   */
  playTestChime() {
    this.unlock();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // Bright double-tone ding (C6 -> G6)
      const notes = [1046.50, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        gain.gain.setValueAtTime(0, t);
        gain.gain.setValueAtTime(0.25, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.25);
      });
    } catch (e) {
      // ignore
    }
  }

  /**
   * Countdown tick sound (Audible on mobile speakers)
   */
  playTick() {
    this.unlock();
    if (!this.ctx || !this.soundEnabled) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      // Crisp 1200Hz woodblock-like click, highly audible on phone speakers
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1250, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Airplane Flight Jet Engine Sound
   * Designed with frequencies (280Hz - 1200Hz) that easily cut through tiny mobile phone speakers
   */
  startFlightSound(multiplier: number) {
    this.unlock();
    if (!this.ctx || !this.soundEnabled) return;

    try {
      if (this.flightOscillator || this.flightGain) {
        this.stopFlightSound();
      }

      const t = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.15, t); // Strong, clear mobile volume
      masterGain.connect(this.ctx.destination);

      // 1. Low-mid engine propeller/turbine tone
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      const freq1 = 220 + Math.min(multiplier * 25, 380);
      osc1.frequency.setValueAtTime(freq1, t);
      gain1.gain.setValueAtTime(0.10, t);
      osc1.connect(gain1);
      gain1.connect(masterGain);

      // 2. High jet turbine whistle (essential for mobile audibility)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      const freq2 = 520 + Math.min(multiplier * 90, 1400);
      osc2.frequency.setValueAtTime(freq2, t);
      gain2.gain.setValueAtTime(0.08, t);
      osc2.connect(gain2);
      gain2.connect(masterGain);

      // 3. Engine harmonic buzz (sawtooth bandpass)
      const osc3 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain3 = this.ctx.createGain();
      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(140, t);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, t);
      filter.Q.setValueAtTime(2.0, t);
      gain3.gain.setValueAtTime(0.06, t);
      osc3.connect(filter);
      filter.connect(gain3);
      gain3.connect(masterGain);

      osc1.start(t);
      osc2.start(t);
      osc3.start(t);

      this.flightOscillator = osc1;
      this.flightOscillator2 = osc2;
      this.flightOscillator3 = osc3;
      this.flightGain = masterGain;
    } catch (e) {
      // ignore
    }
  }

  /**
   * Dynamic pitch elevation as multiplier climbs
   */
  updateFlightSound(multiplier: number) {
    if (!this.ctx || !this.soundEnabled) return;
    try {
      const t = this.ctx.currentTime;
      if (this.flightOscillator) {
        const freq1 = 220 + Math.min(multiplier * 30, 480);
        this.flightOscillator.frequency.setTargetAtTime(freq1, t, 0.12);
      }
      if (this.flightOscillator2) {
        const freq2 = 520 + Math.min(multiplier * 110, 1600);
        this.flightOscillator2.frequency.setTargetAtTime(freq2, t, 0.10);
      }
      if (this.flightGain) {
        // Gently increase volume as multiplier reaches stratospheric levels
        const vol = Math.min(0.25, 0.14 + (multiplier > 10 ? 0.05 : 0.02));
        this.flightGain.gain.setTargetAtTime(vol, t, 0.2);
      }
    } catch (e) {
      // ignore
    }
  }

  stopFlightSound() {
    try {
      if (this.flightOscillator) {
        this.flightOscillator.stop();
        this.flightOscillator.disconnect();
        this.flightOscillator = null;
      }
      if (this.flightOscillator2) {
        this.flightOscillator2.stop();
        this.flightOscillator2.disconnect();
        this.flightOscillator2 = null;
      }
      if (this.flightOscillator3) {
        this.flightOscillator3.stop();
        this.flightOscillator3.disconnect();
        this.flightOscillator3 = null;
      }
      if (this.flightGain) {
        this.flightGain.disconnect();
        this.flightGain = null;
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Cashout Sound: Cascading golden crystal bells
   */
  playCashout() {
    this.unlock();
    if (!this.ctx || !this.soundEnabled) return;

    try {
      const t = this.ctx.currentTime;
      // High bright pentatonic notes: C5, E5, G5, C6, E6, G6
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);

        gain.gain.setValueAtTime(0, t);
        gain.gain.setValueAtTime(0.22, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.4);
      });
    } catch (e) {
      // ignore
    }
  }

  /**
   * Plane Flew Away / Crash sound
   * Uses punchy noise and downward sweep audible on mobile speakers
   */
  playCrash() {
    this.unlock();
    if (!this.ctx || !this.soundEnabled) return;

    this.stopFlightSound();

    try {
      const t = this.ctx.currentTime;

      // 1. Descending crash sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.4);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);

      // 2. Punchy impact thud
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(260, t);
      thud.frequency.exponentialRampToValueAtTime(60, t + 0.3);

      thudGain.gain.setValueAtTime(0.28, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      thud.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thud.start(t);
      thud.stop(t + 0.35);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Upbeat background rhythm
   */
  private startMusic() {
    this.unlock();
    if (!this.ctx || !this.musicEnabled) return;

    this.stopMusic();

    let beat = 0;
    const playMusicBeat = () => {
      if (!this.musicEnabled || !this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // Harmonic progression audible on mobile: A3, C4, G3, D4
        const progression = [220.00, 220.00, 261.63, 293.66, 196.00, 196.00, 220.00, 246.94];
        const freq = progression[beat % progression.length];

        // Melodic bass pop
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(freq, t);

        bassGain.gain.setValueAtTime(0.09, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(t);
        bassOsc.stop(t + 0.3);

        // Hi-hat tick
        const hatOsc = this.ctx.createOscillator();
        const hatGain = this.ctx.createGain();
        hatOsc.type = 'sine';
        hatOsc.frequency.setValueAtTime(3200, t);
        hatGain.gain.setValueAtTime(0.05, t);
        hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        hatOsc.connect(hatGain);
        hatGain.connect(this.ctx.destination);
        hatOsc.start(t);
        hatOsc.stop(t + 0.06);

        beat++;
      } catch (e) {
        // ignore
      }
    };

    this.musicInterval = setInterval(playMusicBeat, 440);
  }

  private stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new AudioEngine();
