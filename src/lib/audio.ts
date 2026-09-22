// Web Audio API Synthesizer for Aviator 100x Game
class AudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private flightOscillator: OscillatorNode | null = null;
  private flightOscillator2: OscillatorNode | null = null; // Whistle voice
  private flightGain: GainNode | null = null;
  private musicInterval: any = null;

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn('AudioContext not supported:', e);
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled && this.flightOscillator) {
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

  playTick() {
    this.init();
    if (!this.ctx || !this.soundEnabled) return;
    this.resumeContext();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // Ignore audio glitches
    }
  }

  startFlightSound(multiplier: number) {
    this.init();
    if (!this.ctx || !this.soundEnabled) return;
    this.resumeContext();

    try {
      if (this.flightOscillator || this.flightOscillator2) {
        this.stopFlightSound();
      }

      const osc1 = this.ctx.createOscillator(); // low engine rumble
      const osc2 = this.ctx.createOscillator(); // high jet engine whistle
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      // Base engine rumble frequency
      const freq1 = 55 + Math.min(multiplier * 20, 180);
      osc1.frequency.setValueAtTime(freq1, this.ctx.currentTime);

      osc2.type = 'sine';
      // Whistle frequency
      const freq2 = 180 + Math.min(multiplier * 110, 800);
      osc2.frequency.setValueAtTime(freq2, this.ctx.currentTime);

      // Lowpass/Bandpass filters for rich engine roar
      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(280, this.ctx.currentTime);

      const filter2 = this.ctx.createBiquadFilter();
      filter2.type = 'peaking';
      filter2.frequency.setValueAtTime(freq2, this.ctx.currentTime);
      filter2.Q.setValueAtTime(1.5, this.ctx.currentTime);
      filter2.gain.setValueAtTime(5, this.ctx.currentTime);

      // Tremolo/Engine shake LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(12, this.ctx.currentTime); // 12Hz rumble shake
      lfoGain.gain.setValueAtTime(0.006, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      gain.gain.setValueAtTime(0.018, this.ctx.currentTime);

      osc1.connect(filter1);
      filter1.connect(gain);

      osc2.connect(filter2);
      filter2.connect(gain);

      gain.connect(this.ctx.destination);

      lfo.start();
      osc1.start();
      osc2.start();

      this.flightOscillator = osc1;
      this.flightOscillator2 = osc2;
      this.flightGain = gain;
    } catch (e) {
      // ignore
    }
  }

  updateFlightSound(multiplier: number) {
    if (!this.ctx || !this.soundEnabled) return;
    try {
      // Elevate the jet sound exponentially with speed
      if (this.flightOscillator) {
        const freq1 = 55 + Math.min(multiplier * 24, 250);
        this.flightOscillator.frequency.setTargetAtTime(freq1, this.ctx.currentTime, 0.15);
      }
      if (this.flightOscillator2) {
        const freq2 = 180 + Math.min(multiplier * 140, 1400);
        this.flightOscillator2.frequency.setTargetAtTime(freq2, this.ctx.currentTime, 0.12);
      }
    } catch (e) {
      // ignore
    }
  }

  stopFlightSound() {
    if (this.flightOscillator) {
      try {
        this.flightOscillator.stop();
        this.flightOscillator.disconnect();
      } catch (e) {}
      this.flightOscillator = null;
    }
    if (this.flightOscillator2) {
      try {
        this.flightOscillator2.stop();
        this.flightOscillator2.disconnect();
      } catch (e) {}
      this.flightOscillator2 = null;
    }
    if (this.flightGain) {
      try {
        this.flightGain.disconnect();
      } catch (e) {}
      this.flightGain = null;
    }
  }

  playCashout() {
    this.init();
    if (!this.ctx || !this.soundEnabled) return;
    this.resumeContext();

    try {
      const t = this.ctx.currentTime;
      // High quality cascading jackpot pentatonic chimes
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1318.51]; // C5, D5, E5, G5, A5, C6, E6
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const oscDetune = this.ctx!.createOscillator(); // Detuned extra voice for beautiful chorus
        const gain = this.ctx!.createGain();

        // Bell instrument settings
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        oscDetune.type = 'triangle';
        oscDetune.frequency.setValueAtTime(freq + 3, t + idx * 0.05); // slightly detuned

        gain.gain.setValueAtTime(0, t);
        gain.gain.setValueAtTime(0.07, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.35);

        osc.connect(gain);
        oscDetune.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.05);
        oscDetune.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.4);
        oscDetune.stop(t + idx * 0.05 + 0.4);
      });
    } catch (e) {}
  }

  playCrash() {
    this.init();
    if (!this.ctx || !this.soundEnabled) return;
    this.resumeContext();

    this.stopFlightSound();

    try {
      const t = this.ctx.currentTime;
      // Synthesized retro arcade explosion/noise thud
      const osc1 = this.ctx.createOscillator(); // low bass impact
      const osc2 = this.ctx.createOscillator(); // abrasive metallic crash
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(140, t);
      osc1.frequency.exponentialRampToValueAtTime(20, t + 0.6);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(280, t);
      osc2.frequency.exponentialRampToValueAtTime(60, t + 0.35);

      // Low pass filter for heavy boom
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, t);

      gain1.gain.setValueAtTime(0.12, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      gain2.gain.setValueAtTime(0.08, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc1.connect(filter);
      filter.connect(gain1);

      osc2.connect(gain2);

      gain1.connect(this.ctx.destination);
      gain2.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.7);
      osc2.stop(t + 0.4);
    } catch (e) {}
  }

  private startMusic() {
    this.init();
    if (!this.ctx || !this.musicEnabled) return;
    this.resumeContext();

    this.stopMusic();

    let beat = 0;
    // Cool retro 80s synthwave beat loop
    const playMusicBeat = () => {
      if (!this.musicEnabled || !this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // Pulse wave bass line (A, C, G, D progression)
        const progression = [
          110.00, 110.00, 110.00, 110.00, // A2
          130.81, 130.81, 146.83, 146.83, // C3, D3
          97.99,  97.99,  97.99,  97.99,  // G2
          110.00, 110.00, 123.47, 123.47  // A2, B2
        ];
        const freq = progression[beat % progression.length];

        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(freq / 2, t); // Drop 1 octave for deep synth bass

        bassGain.gain.setValueAtTime(0.024, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(t);
        bassOsc.stop(t + 0.4);

        // Techno Snare / clap effect on alternate heavy beats
        if (beat % 4 === 2) {
          const snareOsc = this.ctx.createOscillator();
          const snareGain = this.ctx.createGain();
          snareOsc.type = 'sawtooth';
          snareOsc.frequency.setValueAtTime(180, t);
          snareOsc.frequency.exponentialRampToValueAtTime(1000, t + 0.12);

          snareGain.gain.setValueAtTime(0.006, t);
          snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

          snareOsc.connect(snareGain);
          snareGain.connect(this.ctx.destination);
          snareOsc.start(t);
          snareOsc.stop(t + 0.13);
        }

        // Fast hi-hat ticks on every beat
        const hatOsc = this.ctx.createOscillator();
        const hatGain = this.ctx.createGain();
        hatOsc.type = 'sine';
        hatOsc.frequency.setValueAtTime(9000, t);
        hatGain.gain.setValueAtTime(0.004, t);
        hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        hatOsc.connect(hatGain);
        hatGain.connect(this.ctx.destination);
        hatOsc.start(t);
        hatOsc.stop(t + 0.05);

        beat++;
      } catch (e) {}
    };

    // Upbeat 140 BPM rhythm (approx 428ms interval)
    this.musicInterval = setInterval(playMusicBeat, 428);
  }

  private stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }
}

export const audio = new AudioEngine();
