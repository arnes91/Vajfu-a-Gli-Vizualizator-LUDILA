// 142 BPM Cyber-Balkan Hardwave Synthesizer Engine
// Glitch Sevdah 2.0 // Key: D Minor // Built-in Web Audio Core

export class BalkanHardwaveSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private drumGain: GainNode | null = null;
  private synthGain: GainNode | null = null;
  private bassGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  private isRunning: boolean = false;
  private bpm: number = 142;
  private step: number = 0;
  private timerId: number | null = null;
  private nextNoteTime: number = 0;

  // D Minor / Phrygian Dominant Frequencies (Cyber-Sevdah Scale)
  private notes = {
    D3: 146.83,
    Eb3: 155.56,
    Fs3: 185.0,
    G3: 196.0,
    A3: 220.0,
    Bb3: 233.08,
    C4: 261.63,
    D4: 293.66,
    Eb4: 311.13,
    Fs4: 369.99,
    G4: 392.0,
    A4: 440.0,
    Bb4: 466.16,
    C5: 523.25,
    D5: 587.33,
  };

  // 16-step Synth Melody (Balkan Sevdah Glitch Riff in D Minor)
  private synthPattern: (number | null)[] = [
    293.66, null, 369.99, 392.0,  // D4, _, F#4, G4
    440.0, null, 466.16, 440.0,   // A4, _, Bb4, A4
    392.0, 369.99, 311.13, 293.66, // G4, F#4, Eb4, D4
    null, 220.0, 261.63, 293.66,  // _, A3, C4, D4
  ];

  // 16-step 808 Sub-Bass Note Pattern (Sub Drop in D)
  private bassPattern: (number | null)[] = [
    73.42, null, null, null,  // D2 Sub Drop
    null, null, 73.42, null,
    77.78, null, null, null,  // Eb2 Sub Slide
    null, null, 65.41, null,  // C2 Sub
  ];

  constructor() {}

  public init(ctx: AudioContext, destinationNode: AudioNode, analyserNode?: AnalyserNode) {
    this.ctx = ctx;
    this.analyser = analyserNode || null;

    // Master bus
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.85;

    // Sub-buses
    this.drumGain = ctx.createGain();
    this.drumGain.gain.value = 0.9;

    this.synthGain = ctx.createGain();
    this.synthGain.gain.value = 0.45;

    this.bassGain = ctx.createGain();
    this.bassGain.gain.value = 1.0;

    // Connect sub-buses to master
    this.drumGain.connect(this.masterGain);
    this.synthGain.connect(this.masterGain);
    this.bassGain.connect(this.masterGain);

    // Route master to analyser (so visualizer pulses) and to speakers
    if (this.analyser) {
      this.masterGain.connect(this.analyser);
    }
    this.masterGain.connect(destinationNode);
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(100, Math.min(180, newBpm));
  }

  public getBpm(): number {
    return this.bpm;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public start() {
    if (!this.ctx || this.isRunning) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isRunning = true;
    this.step = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.scheduler();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduler = () => {
    if (!this.isRunning || !this.ctx) return;

    // Schedule 16th notes ahead
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.scheduleStep(this.step, this.nextNoteTime);
      this.advanceStep();
    }

    this.timerId = window.setTimeout(this.scheduler, 25);
  };

  private advanceStep() {
    const secondsPerBeat = 60.0 / this.bpm;
    const stepDuration = 0.25 * secondsPerBeat; // 16th note
    this.nextNoteTime += stepDuration;
    this.step = (this.step + 1) % 16;
  }

  private scheduleStep(step: number, time: number) {
    if (!this.ctx) return;

    // 1. Kick & 808 Sub: steps 0, 4, 8, 12 + syncopated step 10 & 14
    if (step === 0 || step === 4 || step === 8 || step === 12 || step === 10) {
      this.triggerKick(time, step === 0 ? 1.0 : 0.85);
    }

    // 2. Glitch Snare: steps 4 and 12 (standard 2 & 4 in 4/4) + glitch ghost on 15
    if (step === 4 || step === 12) {
      this.triggerSnare(time, 0.9);
    } else if (step === 15) {
      this.triggerSnare(time, 0.4, true);
    }

    // 3. Balkan Hi-Hats: 16th note stream with syncopated velocity
    const hatAccent = step % 4 === 2 ? 0.65 : step % 2 === 0 ? 0.4 : 0.25;
    this.triggerHiHat(time, hatAccent, step === 14);

    // 4. 808 Sub-Bass Note
    const bassFreq = this.bassPattern[step];
    if (bassFreq) {
      this.trigger808Bass(time, bassFreq, 0.35);
    }

    // 5. Balkan Folk Synth Lead
    const synthFreq = this.synthPattern[step];
    if (synthFreq) {
      this.triggerSynthLead(time, synthFreq, 0.18);
    }
  }

  // --- SOUND GENERATORS ---

  private triggerKick(time: number, velocity: number) {
    if (!this.ctx || !this.drumGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency pitch drop for punchy 808 kick
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

    gain.gain.setValueAtTime(velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.drumGain);

    osc.start(time);
    osc.stop(time + 0.36);
  }

  private triggerSnare(time: number, velocity: number, isGlitch: boolean = false) {
    if (!this.ctx || !this.drumGain) return;

    // Noise buffer for snare snap
    const bufferSize = this.ctx.sampleRate * 0.15;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = isGlitch ? 'bandpass' : 'highpass';
    filter.frequency.setValueAtTime(isGlitch ? 2800 : 1200, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + (isGlitch ? 0.08 : 0.2));

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.drumGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.21);

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isGlitch ? 320 : 190, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.1);

    oscGain.gain.setValueAtTime(velocity * 0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.drumGain);

    osc.start(time);
    osc.stop(time + 0.11);
  }

  private triggerHiHat(time: number, velocity: number, open: boolean = false) {
    if (!this.ctx || !this.drumGain) return;

    const bufferSize = this.ctx.sampleRate * (open ? 0.12 : 0.04);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.11 : 0.04));

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.drumGain);

    source.start(time);
    source.stop(time + (open ? 0.12 : 0.05));
  }

  private trigger808Bass(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.bassGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.96, time + duration);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.bassGain);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private triggerSynthLead(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.synthGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(freq * 1.005, time); // Subtle detune for wide stereo cyber lead

    // Resonant lowpass filter sweep
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.frequency.exponentialRampToValueAtTime(4500, time + 0.04);
    filter.frequency.exponentialRampToValueAtTime(800, time + duration);
    filter.Q.value = 4.5;

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.synthGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.02);
    osc2.stop(time + duration + 0.02);
  }

  // --- VOLUME CONTROLS ---

  public setMasterVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.02);
    }
  }

  public setSynthVolume(val: number) {
    if (this.synthGain && this.ctx) {
      this.synthGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.02);
    }
  }

  public setBassVolume(val: number) {
    if (this.bassGain && this.ctx) {
      this.bassGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.02);
    }
  }
}
