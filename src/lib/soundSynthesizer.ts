// Web Audio API procedural sound synthesizer for ambient audio and game FX

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundNodes: Map<string, { gain: GainNode; stop: () => void }> = new Map();

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getMaster(): GainNode {
    const ctx = this.getContext();
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  public setMasterVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  // Generate buffer for Pink/White/Brown noise
  private createNoiseBuffer(type: 'white' | 'pink' | 'brown', durationSeconds = 5): AudioBuffer {
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'white') {
        output[i] = white * 0.1;
      } else if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.02;
        b6 = white * 0.115926;
      } else {
        // Brown noise
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 0.15;
      }
    }
    return buffer;
  }

  // --- AMBIENT SOUNDTRACKS ---

  public startRain(trackId: string, volume: number) {
    this.stopSound(trackId);
    const ctx = this.getContext();
    const master = this.getMaster();

    const noiseBuffer = this.createNoiseBuffer('white', 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter for rain sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    const trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(volume * 0.6, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(trackGain);
    trackGain.connect(master);

    noiseSource.start();

    // Random drip interval
    const dripInterval = setInterval(() => {
      if (!this.soundNodes.has(trackId)) {
        clearInterval(dripInterval);
        return;
      }
      if (Math.random() > 0.4) {
        this.playDripSound(volume);
      }
    }, 250);

    this.soundNodes.set(trackId, {
      gain: trackGain,
      stop: () => {
        clearInterval(dripInterval);
        try { noiseSource.stop(); } catch { /* ignore */ }
      }
    });
  }

  private playDripSound(vol: number) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = 600 + Math.random() * 800;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(vol * 0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.getMaster());

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio context might be suspended
    }
  }

  public startWind(trackId: string, volume: number) {
    this.stopSound(trackId);
    const ctx = this.getContext();
    const master = this.getMaster();

    const noiseBuffer = this.createNoiseBuffer('pink', 5);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    // LFO to modulate wind gusting
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, ctx.currentTime); // slow swell
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(250, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(volume * 0.8, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(trackGain);
    trackGain.connect(master);

    noiseSource.start();
    lfo.start();

    this.soundNodes.set(trackId, {
      gain: trackGain,
      stop: () => {
        try { noiseSource.stop(); lfo.stop(); } catch { /* ignore */ }
      }
    });
  }

  public startBrownNoise(trackId: string, volume: number) {
    this.stopSound(trackId);
    const ctx = this.getContext();
    const master = this.getMaster();

    const noiseBuffer = this.createNoiseBuffer('brown', 5);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);

    const trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(volume * 0.9, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(trackGain);
    trackGain.connect(master);

    noiseSource.start();

    this.soundNodes.set(trackId, {
      gain: trackGain,
      stop: () => {
        try { noiseSource.stop(); } catch { /* ignore */ }
      }
    });
  }

  public startOcean(trackId: string, volume: number) {
    this.stopSound(trackId);
    const ctx = this.getContext();
    const master = this.getMaster();

    const noiseBuffer = this.createNoiseBuffer('pink', 6);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);

    // LFO for wave surges (about 8-second wave cycles)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.4, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.3, ctx.currentTime);

    lfo.connect(waveGain.gain);

    const trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(volume * 0.85, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(trackGain);
    trackGain.connect(master);

    noiseSource.start();
    lfo.start();

    this.soundNodes.set(trackId, {
      gain: trackGain,
      stop: () => {
        try { noiseSource.stop(); lfo.stop(); } catch { /* ignore */ }
      }
    });
  }

  public updateVolume(trackId: string, volume: number) {
    const node = this.soundNodes.get(trackId);
    if (node && this.ctx) {
      node.gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stopSound(trackId: string) {
    const node = this.soundNodes.get(trackId);
    if (node) {
      node.stop();
      this.soundNodes.delete(trackId);
    }
  }

  public stopAll() {
    this.soundNodes.forEach(node => node.stop());
    this.soundNodes.clear();
  }

  // --- GAME & UI SFX ---

  public playBubblePop() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 300 + Math.random() * 400;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.getMaster());

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch { /* ignore */ }
  }

  public playTileFlip() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.getMaster());

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch { /* ignore */ }
  }

  public playChimeSuccess() {
    try {
      const ctx = this.getContext();
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(this.getMaster());

        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.52);
      });
    } catch { /* ignore */ }
  }

  public playBreathingTone(type: 'inhale' | 'hold' | 'exhale') {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const startFreq = type === 'inhale' ? 220 : type === 'hold' ? 330 : 220;
      const endFreq = type === 'inhale' ? 330 : type === 'hold' ? 330 : 165;

      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 1.5);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.75);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(this.getMaster());

      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch { /* ignore */ }
  }
}

export const soundSynth = new SoundSynthesizer();
