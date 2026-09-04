// AI DJ Voice Engine & Voice-Synced Audio Router
// Provides high-octane DJ shoutouts, Gemini interaction & real-time audio visualization sync

import { GoogleGenAI } from '@google/genai';

export interface DJVoiceOptions {
  bpm?: number;
  style?: string;
  artist?: string;
}

export class AIDJVoiceEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private destination: AudioNode | null = null;
  private voiceGain: GainNode | null = null;
  private envelopeTimer: number | null = null;

  constructor() {}

  public init(ctx: AudioContext, destination: AudioNode, analyser?: AnalyserNode) {
    this.ctx = ctx;
    this.destination = destination;
    this.analyser = analyser || null;

    this.voiceGain = ctx.createGain();
    this.voiceGain.gain.value = 0.95;

    if (this.analyser) {
      this.voiceGain.connect(this.analyser);
    }
    this.voiceGain.connect(destination);
  }

  // Pre-configured Balkan Cyberpunk DJ Drops
  public static DJ_DROPS = [
    "SARAJEVO SUB-BASS ENGAGED! BRZI ARZI ON THE MASTER DECK!",
    "GLITCH SEVDAH 2.0 PROTOCOL ACTIVATED. 142 BPM. PURE SOVEREIGNTY.",
    "HAJMO SVI! BALKAN BEAST MODE: ONLINE!",
    "CLARITAS EX FRACTA — NOISE CONVERTED TO SIGNAL!",
    "BRZI STUDIO SPINE LOCKED. AUTONOMOUS EVOLUTION CYCLE COMMENCING.",
    "BASS OVERLOAD IN D MINOR. WITNESS THE GLITCH REVOLUTION.",
    "ADMIN PC IS SINGLE SOURCE OF TRUTH. SIGNAL REIGNS.",
  ];

  // Vocalize speech and sync with Web Audio Analyser
  public async speakText(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    if (!text.trim()) return;

    // Resume AudioContext if suspended
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    onStart?.();

    // Check if SpeechSynthesis is available
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.12;
      utterance.pitch = 0.95;

      // Select cyber / energetic voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.name.includes('Google') && v.lang.startsWith('en')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Synthesize audio pulse envelope into AnalyserNode so the visualizer ripples to voice
      const stopPulse = this.simulateVoicePulse(text.length * 75);

      utterance.onend = () => {
        stopPulse();
        onEnd?.();
      };

      utterance.onerror = () => {
        stopPulse();
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback: visual envelope only
      const stopPulse = this.simulateVoicePulse(text.length * 80);
      setTimeout(() => {
        stopPulse();
        onEnd?.();
      }, text.length * 80);
    }
  }

  // Simulates harmonic vocal modulation directly into the AnalyserNode
  private simulateVoicePulse(durationMs: number): () => void {
    if (!this.ctx || !this.analyser) return () => {};

    // Create a formant-filtered harmonic oscillator to excite vocal frequencies in the spectrum (300Hz - 3400Hz)
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime); // Vocal pitch fundamental

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.value = 3.0;

    // Modulate gain rhythmically to speech syllables
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    const totalSeconds = durationMs / 1000;
    const syllableCount = Math.max(3, Math.floor(durationMs / 140));

    for (let i = 0; i < syllableCount; i++) {
      const sylTime = now + (i * totalSeconds) / syllableCount;
      const peak = 0.25 + Math.random() * 0.25;
      gain.gain.setValueAtTime(0.05, sylTime);
      gain.gain.linearRampToValueAtTime(peak, sylTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, sylTime + totalSeconds / syllableCount * 0.85);

      // Formant shift
      filter.frequency.setValueAtTime(600 + Math.random() * 1800, sylTime);
    }

    osc.connect(filter);
    filter.connect(gain);
    // Connect ONLY to analyser so it doesn't double-produce harsh audio, but drives the visualizer!
    gain.connect(this.analyser);

    osc.start(now);
    osc.stop(now + totalSeconds);

    return () => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    };
  }

  // Request intelligent AI DJ shoutout or commentary using Gemini
  public async generateDJCommentary(promptType: 'DROP' | 'EVOLUTION' | 'ANALYSIS' | 'SEVDAH'): Promise<string> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return AIDJVoiceEngine.DJ_DROPS[Math.floor(Math.random() * AIDJVoiceEngine.DJ_DROPS.length)];
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        You are the high-octane AI DJ and System Voice of BRZI_STUDIO for artist "Brzi Arzi" (track: "Glitch Sevdah 2.0", 142 BPM, Cyber-Balkan Hardwave).
        Generate a SINGLE energetic, punchy DJ hype drop or system notification (1 to 2 short sentences).
        Style: Cyberpunk rap, Balkan electronic hardwave, glitch aesthetics, high intensity, English mixed with Balkan cyber flavor.
        Prompt Type: ${promptType}.
        Do NOT use quotation marks. Output plain text only.
      `;

      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return res.text?.trim() || AIDJVoiceEngine.DJ_DROPS[0];
    } catch (e) {
      console.warn('Gemini DJ generation fallback:', e);
      return AIDJVoiceEngine.DJ_DROPS[Math.floor(Math.random() * AIDJVoiceEngine.DJ_DROPS.length)];
    }
  }
}
