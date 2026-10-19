// Simple Web Audio ambient + SFX. No external assets — everything is
// synthesized so there are no files to load. All sounds are soft; nothing
// sudden or loud. Respect the muted flag at all times.

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientNodes: OscillatorNode[] = [];
  private muted = false;
  private started = false;

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.6, this.now(), 0.1);
    }
  }

  private now() {
    return this.ctx?.currentTime ?? 0;
  }

  // Must be called from a user gesture (click) to satisfy autoplay policies.
  start() {
    if (this.started) {
      this.resume();
      return;
    }
    this.started = true;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new Ctor();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 0.6;
    this.masterGain.connect(this.ctx.destination);

    // Ambient drone: two low oscillators + slow LFO on a filter.
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.12;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    this.ambientGain.connect(this.masterGain);
    filter.connect(this.ambientGain);

    const freqs = [55, 82.5, 110];
    for (const f of freqs) {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.value = 0.33;
      osc.connect(g);
      g.connect(filter);
      osc.start();
      this.ambientNodes.push(osc);
    }

    // slow LFO to wobble the filter for movement
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    this.ambientNodes.push(lfo);
  }

  resume() {
    if (this.ctx?.state === "suspended") this.ctx.resume();
  }

  stop() {
    for (const n of this.ambientNodes) {
      try {
        n.stop();
      } catch {
        // already stopped
      }
    }
    this.ambientNodes = [];
  }

  // soft chime when discovering a milestone
  playDiscover() {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const t = this.now();
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = f;
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0, t + i * 0.08);
      g.gain.linearRampToValueAtTime(0.12, t + i * 0.08 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.08 + 1.2);
      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 1.3);
    });
  }

  // subtle blip on interaction prompt open
  playBlip() {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const t = this.now();
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 330;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // footstep-ish soft noise tick
  playStep() {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const t = this.now();
    const buffer = this.ctx.createBuffer(1, 2200, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.value = 0.04;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 320;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);
    src.start(t);
  }
}
