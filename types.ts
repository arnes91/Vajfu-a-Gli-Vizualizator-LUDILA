export interface LyricLine {
  time: number;
  duration?: number;
  text: string;
  style?: 'NORMAL' | 'GLITCH' | 'IMPACT' | 'SOFT';
  emoji?: string;
}

export interface ExportConfig {
  resolution: '1080p' | '4K';
  aspectRatio: '16:9' | '9:16';
}

export interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  type: 'rect' | 'emoji';
  char?: string;
}

export interface TrackMetadata {
  title: string;
  bpm: number;
  key: string;
  style: string;
  distroKidReady: boolean;
}

export type ShaderMode = 'ORGANIC_CONTOUR' | 'CYBER_TUNNEL' | 'DIGITAL_SOUL' | 'GOD_PARTICLE';

export type AudioSourceMode = 'SYNTH' | 'FILE' | 'MIC' | 'TEST';

export interface EvolutionReport {
  version: string;
  timestamp: string;
  telemetrySummary: string;
  appliedAdaptations: string[];
  memoryNodes: number;
  crossModuleSyncScore: number;
}

export interface HypeText {
  id: number;
  text: string;
  color: string;
}

export type ThemeStyle =
  | 'SARAJEVO_SUNSET'
  | 'BALKAN_NEON_CYBER'
  | 'ACID_EMERALD'
  | 'QUANTUM_VIOLET_SUN'
  | 'MONOCHROME_BRUTALIST'
  | 'CYBERPUNK'
  | 'ACID_MATRIX'
  | 'TOKYO_VIOLET'
  | 'MONOCHROME'
  | 'SOLAR_FLARE';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  wave: string;
  matrix: string;
  textGlow: string;
  spectrumGradient: [string, string, string];
}

export interface VisualToggles {
  matrixRain: boolean;
  scanlines: boolean;
  screenShake: boolean;
  oscilloscope: boolean;
  frequencyBars: boolean;
  anaglyphSplit: boolean;
  cssGlitch: boolean;
}

export interface ReactiveSettings {
  sensitivity: number;       // 0.2 to 3.0
  decaySpeed: number;        // Smoothing 0.1 to 0.95
  shakeIntensity: number;    // 0.0 to 2.5
  glitchThreshold: number;   // 0.3 to 0.9
  syncOffset: number;        // -5.0s to +5.0s
  driftMultiplier: number;   // 0.95 to 1.05
}

export interface ViralHookAnalysis {
  hookStart: number;
  hookEnd: number;
  duration: number;
  viralityScore: number;
  hookType: string;
  caption: string;
  retentionTip: string;
  energyCurve: string;
}
